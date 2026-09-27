import { Router, Request, Response, NextFunction } from 'express';
import { createPoster, getMyPosters, getPosterById } from '../controllers/poster.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { uploadLeaderPhotos } from '../middleware/upload.middleware';

const router = Router();

/**
 * Wraps Multer's callback-based middleware to properly handle its errors
 * (e.g. file-type rejection, size limit) as JSON 400 responses.
 */
const withUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploadLeaderPhotos(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'File upload error.';
      res.status(400).json({ success: false, message });
      return;
    }
    next();
  });
};

/**
 * POST /api/posters
 *
 * Multipart form-data fields:
 *   headline*          - Bangla headline text
 *   subHeadline        - Secondary text (or Gemini will suggest one)
 *   dateLine           - Date string in Bangla
 *   occasionType       - e.g. "victory_day"
 *   partyName          - Party or organisation name
 *   templateId         - Optional MongoDB ObjectId of a saved Template
 *   primaryColor       - Optional hex (e.g. "#0a3318")
 *   accentColor        - Optional hex (e.g. "#FFD700")
 *   promoterName*      - প্রচারকের নাম
 *   promoterDesignation* - পদবি
 *   promoterArea*      - এলাকা
 *   promoterContact    - ফোন / যোগাযোগ
 *   enhanceWithGemini  - "true" | "false"
 *   leaderData         - JSON string: [{"name":"...","designation":"..."}]
 *
 * Files (multipart):
 *   leaderPhotos       - Up to 3 image files (JPEG / PNG / WebP)
 */
router.post('/', verifyToken, withUpload, (req, res) => {
  void createPoster(req, res);
});

/**
 * GET /api/posters
 * Query: ?page=1&limit=10
 * Returns paginated list of the authenticated user's posters.
 */
router.get('/', verifyToken, (req, res) => {
  void getMyPosters(req, res);
});

/**
 * GET /api/posters/:id
 * Returns a single poster (must belong to the authenticated user).
 */
router.get('/:id', verifyToken, (req, res) => {
  void getPosterById(req, res);
});

export default router;
