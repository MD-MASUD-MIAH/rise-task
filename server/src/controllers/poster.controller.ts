import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Poster } from '../models/Poster';
import { Template } from '../models/Template';
import { renderPoster } from '../services/posterRenderer';
import { getGeminiEnhancements } from '../services/geminiService';
import { savePosterBuffer } from '../services/storageService';
import { getUploadedFileUrl } from '../middleware/upload.middleware';
import type { PosterRenderOptions, LeaderPhoto } from '../types/poster.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderDataEntry {
  name: string;
  designation?: string;
}

interface CreatePosterBody {
  templateId?: string;
  occasionType?: string;
  headline?: string;
  subHeadline?: string;
  dateLine?: string;
  partyName?: string;
  primaryColor?: string;
  accentColor?: string;
  promoterName?: string;
  promoterDesignation?: string;
  promoterArea?: string;
  promoterContact?: string;
  enhanceWithGemini?: string;    // 'true' | 'false' (multipart sends strings)
  leaderData?: string;           // JSON string of LeaderDataEntry[]
}

// ─── POST /api/posters ────────────────────────────────────────────────────────

/**
 * Full poster generation pipeline:
 *  1. Validate request
 *  2. Process uploaded leader photos → URLs
 *  3. (Optional) Fetch template layout from MongoDB
 *  4. (Optional) Call Gemini for AI enhancements
 *  5. Build PosterRenderOptions
 *  6. Render PNG via Puppeteer
 *  7. Persist image (local / Cloudinary)
 *  8. Save Poster record to MongoDB
 *  9. Return poster data + image URL
 */
export const createPoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreatePosterBody;
    const files = req.files as Express.Multer.File[] | undefined;

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!body.headline?.trim()) {
      res.status(400).json({ success: false, message: 'Headline (হেডলাইন) is required.' });
      return;
    }
    if (!body.promoterName?.trim() || !body.promoterDesignation?.trim() || !body.promoterArea?.trim()) {
      res.status(400).json({
        success: false,
        message: 'promoterName, promoterDesignation, and promoterArea are all required.',
      });
      return;
    }

    // ── 2. Process uploaded photos → public URLs ──────────────────────────────
    const uploadedPhotoUrls: string[] = (files ?? []).map(getUploadedFileUrl);

    // Parse leader metadata (name / designation) sent as JSON string
    let leaderMeta: LeaderDataEntry[] = [];
    if (body.leaderData) {
      try {
        leaderMeta = JSON.parse(body.leaderData) as LeaderDataEntry[];
      } catch {
        // silently ignore malformed leaderData
      }
    }

    // Zip photo URLs with their metadata
    const leaders: LeaderPhoto[] = uploadedPhotoUrls.map((url, i) => ({
      url,
      name: leaderMeta[i]?.name ?? `নেতা ${i + 1}`,
      designation: leaderMeta[i]?.designation,
    }));

    // ── 3. Fetch template (optional) ──────────────────────────────────────────
    let templateColors: { primary?: string; accent?: string } = {};
    if (body.templateId && Types.ObjectId.isValid(body.templateId)) {
      const template = await Template.findById(body.templateId);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found.' });
        return;
      }
      // Extract colors from template's layoutConfig if stored there
      const cfg = template.layoutConfig as unknown as Record<string, unknown>;
      templateColors = {
        primary: typeof cfg.primaryColor === 'string' ? cfg.primaryColor : undefined,
        accent: typeof cfg.accentColor === 'string' ? cfg.accentColor : undefined,
      };
    }

    // ── 4. Gemini enhancement (optional) ─────────────────────────────────────
    const useGemini = body.enhanceWithGemini === 'true';
    let geminiData = null;

    if (useGemini) {
      geminiData = await getGeminiEnhancements({
        occasionType: body.occasionType ?? body.headline ?? '',
        partyName: body.partyName,
        headline: body.headline,
        primaryColor: body.primaryColor ?? templateColors.primary,
        accentColor: body.accentColor ?? templateColors.accent,
        promoterArea: body.promoterArea,
      });
    }

    // ── 5. Build PosterRenderOptions ──────────────────────────────────────────
    // Priority: explicit body fields > Gemini theme > template > defaults
    const activePrimary =
      body.primaryColor ??
      (geminiData ? geminiData.colorThemes[0]?.primary : undefined) ??
      templateColors.primary;

    const activeAccent =
      body.accentColor ??
      (geminiData ? geminiData.colorThemes[0]?.accent : undefined) ??
      templateColors.accent;

    const activeSubHeadline =
      body.subHeadline ??
      (geminiData ? geminiData.slogans[0] : undefined);

    const activePromoterDesignation =
      body.promoterDesignation ??
      (geminiData ? geminiData.captionSuggestions[0] : undefined) ??
      '';

    const renderOptions: PosterRenderOptions = {
      width: 1200,
      height: 1600,
      occasionType: body.occasionType,
      headline: body.headline,
      subHeadline: activeSubHeadline,
      dateLine: body.dateLine,
      partyName: body.partyName,
      primaryColor: activePrimary,
      accentColor: activeAccent,
      leaders,
      promoterName: body.promoterName,
      promoterDesignation: activePromoterDesignation,
      promoterArea: body.promoterArea,
      promoterContact: body.promoterContact,
    };

    // ── 6. Render poster ──────────────────────────────────────────────────────
    console.log(`🖼️  Rendering poster for user ${req.user?.userId ?? 'anonymous'}…`);
    const renderResult = await renderPoster(renderOptions);

    // ── 7. Save image ─────────────────────────────────────────────────────────
    // Create a temporary ObjectId to use as the filename before DB save
    const tempId = new Types.ObjectId();
    const generatedImageUrl = await savePosterBuffer(renderResult.buffer, tempId.toString());

    // ── 8. Save Poster record to MongoDB ──────────────────────────────────────
    const formDataRecord: Record<string, string> = {
      headline: body.headline,
      occasionType: body.occasionType ?? '',
      subHeadline: activeSubHeadline ?? '',
      dateLine: body.dateLine ?? '',
      partyName: body.partyName ?? '',
    };

    const poster = await Poster.create({
      _id: tempId,
      userId: req.user?.userId
        ? new Types.ObjectId(req.user.userId)
        : new Types.ObjectId(),  // anonymous (replace with auth guard in prod)
      templateId: body.templateId
        ? new Types.ObjectId(body.templateId)
        : new Types.ObjectId(),  // placeholder — template is optional
      formData: formDataRecord,
      uploadedPhotoUrls,
      generatedImageUrl,
      status: 'ready',
    });

    // ── 9. Response ───────────────────────────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Poster generated successfully.',
      data: {
        posterId: poster.id as string,
        status: poster.status,
        imageUrl: generatedImageUrl,
        renderTimeMs: renderResult.renderTimeMs,
        dimensions: { width: renderResult.width, height: renderResult.height },
        uploadedPhotos: uploadedPhotoUrls,
        geminiEnhancements: geminiData
          ? {
              aiGenerated: geminiData.aiGenerated,
              slogansOffered: geminiData.slogans,
              colorThemesOffered: geminiData.colorThemes,
              appliedTheme: geminiData.colorThemes[0],
            }
          : null,
        createdAt: poster.createdAt,
      },
    });
  } catch (err) {
    console.error('Create poster error:', err);
    res.status(500).json({
      success: false,
      message: 'Poster generation failed.',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── GET /api/posters ─────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's poster history (newest first).
 */
export const getMyPosters = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query['page'] as string) ?? '1', 10));
    const limit = Math.min(50, parseInt((req.query['limit'] as string) ?? '10', 10));
    const skip = (page - 1) * limit;

    const userId = new Types.ObjectId(req.user?.userId);

    const [posters, total] = await Promise.all([
      Poster.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Poster.countDocuments({ userId }),
    ]);

    res.status(200).json({
      success: true,
      data: { posters, total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get posters error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posters.' });
  }
};

// ─── GET /api/posters/:id ─────────────────────────────────────────────────────

export const getPosterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid poster ID.' });
      return;
    }

    const poster = await Poster.findOne({
      _id: id,
      userId: req.user?.userId,
    });

    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found.' });
      return;
    }

    res.status(200).json({ success: true, data: poster });
  } catch (err) {
    console.error('Get poster by id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch poster.' });
  }
};
