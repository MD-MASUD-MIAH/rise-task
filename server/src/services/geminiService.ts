/**
 * geminiService.ts
 *
 * Integrates Google Gemini AI to provide intelligent poster enhancements:
 *  - Bangla slogan variations for the selected occasion
 *  - Recommended color themes
 *  - Layout suggestions (photo style, decorative motifs)
 *  - Bottom-banner caption alternatives
 *
 * Degrades gracefully — if the API key is missing or Gemini returns
 * malformed JSON, it returns a rich set of static fallbacks so poster
 * generation is never blocked.
 */

import { GoogleGenAI } from '@google/genai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiColorTheme {
  name: string;          // Bangla theme name, e.g. "বিজয়ের সবুজ"
  primary: string;       // hex
  accent: string;        // hex
  description: string;   // short Bangla description
}

export interface GeminiLayoutSuggestion {
  leaderPhotoStyle: 'circular' | 'rounded' | 'square';
  decorativeMotif: 'sunburst' | 'geometric' | 'floral' | 'minimal' | 'stars';
  headlineStyle: 'bold' | 'elegant' | 'traditional';
}

export interface GeminiEnhancements {
  slogans: string[];              // 3 Bangla slogan alternatives
  colorThemes: GeminiColorTheme[];
  layoutSuggestion: GeminiLayoutSuggestion;
  captionSuggestions: string[];   // 2–3 bottom-banner alternatives
  /** True when enhancements came from Gemini; false when fallback was used */
  aiGenerated: boolean;
}

export interface GeminiRequestContext {
  occasionType: string;   // e.g. "মহান বিজয় দিবস"
  partyName?: string;
  headline: string;
  primaryColor?: string;
  accentColor?: string;
  promoterArea?: string;
}

// ─── Static Fallbacks ─────────────────────────────────────────────────────────

const FALLBACK_ENHANCEMENTS: GeminiEnhancements = {
  slogans: [
    'বিজয়ের পথে আমরা একসাথে',
    'জনগণের সেবায় আমরা প্রতিশ্রুতিবদ্ধ',
    'উন্নত বাংলাদেশ, সুখী জনগণ',
  ],
  colorThemes: [
    {
      name: 'বিজয়ের সবুজ',
      primary: '#0a3318',
      accent: '#FFD700',
      description: 'গাঢ় সবুজ ও সোনালি — দেশপ্রেম ও সমৃদ্ধির প্রতীক',
    },
    {
      name: 'রাজকীয় নীল',
      primary: '#0a1a3d',
      accent: '#4FC3F7',
      description: 'গভীর নীল ও আকাশি — আস্থা ও স্থিতিশীলতার প্রতীক',
    },
    {
      name: 'বিপ্লবী লাল',
      primary: '#3b0a0a',
      accent: '#FF6B35',
      description: 'লাল ও কমলা — সংগ্রাম ও শক্তির প্রতীক',
    },
  ],
  layoutSuggestion: {
    leaderPhotoStyle: 'circular',
    decorativeMotif: 'sunburst',
    headlineStyle: 'bold',
  },
  captionSuggestions: [
    'জনগণের সেবায় আমরা সদা প্রস্তুত',
    'উন্নয়নের ধারা অব্যাহত রাখতে আমাদের সাথে থাকুন',
  ],
  aiGenerated: false,
};

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildPrompt = (ctx: GeminiRequestContext): string => `
You are an expert political poster designer specializing in Bangladeshi politics and Bangla typography.

A user is creating a political poster for the following occasion:
- Occasion: ${ctx.occasionType}
- Headline: ${ctx.headline}
${ctx.partyName ? `- Party/Organization: ${ctx.partyName}` : ''}
${ctx.promoterArea ? `- Area: ${ctx.promoterArea}` : ''}
${ctx.primaryColor ? `- Current primary color: ${ctx.primaryColor}` : ''}
${ctx.accentColor ? `- Current accent color: ${ctx.accentColor}` : ''}

Provide creative poster design enhancements. ALL text suggestions MUST be in Bangla (Bengali script).
Respond with ONLY a valid JSON object — no markdown fences, no explanation.

JSON schema:
{
  "slogans": ["<bangla slogan 1>", "<bangla slogan 2>", "<bangla slogan 3>"],
  "colorThemes": [
    {
      "name": "<bangla theme name>",
      "primary": "<hex color>",
      "accent": "<hex color>",
      "description": "<bangla description, max 15 words>"
    }
  ],
  "layoutSuggestion": {
    "leaderPhotoStyle": "circular",
    "decorativeMotif": "sunburst",
    "headlineStyle": "bold"
  },
  "captionSuggestions": ["<bangla caption 1>", "<bangla caption 2>"]
}

Rules:
- Return exactly 3 slogans
- Return exactly 3 color themes. Choose colors that are culturally appropriate for Bangladeshi political posters
- leaderPhotoStyle must be one of: circular, rounded, square
- decorativeMotif must be one of: sunburst, geometric, floral, minimal, stars
- headlineStyle must be one of: bold, elegant, traditional
- Return exactly 2 captionSuggestions
`.trim();

// ─── Gemini Client ────────────────────────────────────────────────────────────

let _aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  GOOGLE_GEMINI_API_KEY not set — Gemini enhancements disabled.');
    return null;
  }
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({ apiKey });
  }
  return _aiClient;
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Calls Gemini to generate poster enhancements for the given context.
 * Falls back to a rich static set if the API key is missing or the call fails.
 */
export const getGeminiEnhancements = async (
  ctx: GeminiRequestContext
): Promise<GeminiEnhancements> => {
  const client = getAiClient();

  if (!client) {
    return FALLBACK_ENHANCEMENTS;
  }

  try {
    console.log('🤖 Calling Gemini for poster enhancements…');
    const t0 = Date.now();

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: buildPrompt(ctx),
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const rawText = response.text ?? '';
    // Strip potential markdown fences Gemini sometimes adds
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(jsonText) as Partial<GeminiEnhancements>;

    // Validate and merge with fallbacks for missing keys
    const enhancements: GeminiEnhancements = {
      slogans: Array.isArray(parsed.slogans) && parsed.slogans.length > 0
        ? parsed.slogans
        : FALLBACK_ENHANCEMENTS.slogans,
      colorThemes: Array.isArray(parsed.colorThemes) && parsed.colorThemes.length > 0
        ? parsed.colorThemes
        : FALLBACK_ENHANCEMENTS.colorThemes,
      layoutSuggestion: parsed.layoutSuggestion ?? FALLBACK_ENHANCEMENTS.layoutSuggestion,
      captionSuggestions: Array.isArray(parsed.captionSuggestions) && parsed.captionSuggestions.length > 0
        ? parsed.captionSuggestions
        : FALLBACK_ENHANCEMENTS.captionSuggestions,
      aiGenerated: true,
    };

    console.log(`✅ Gemini enhancements ready (${Date.now() - t0} ms)`);
    return enhancements;
  } catch (err) {
    console.error('❌ Gemini API error:', err instanceof Error ? err.message : err);
    return { ...FALLBACK_ENHANCEMENTS, aiGenerated: false };
  }
};
