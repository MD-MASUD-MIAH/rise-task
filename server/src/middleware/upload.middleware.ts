import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_MODE = process.env.STORAGE_MODE ?? 'local';  // 'local' | 'cloudinary'
const LOCAL_UPLOAD_DIR = process.env.VERCEL
  ? '/tmp/uploads'
  : path.resolve(process.cwd(), 'uploads');
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── File Filter ──────────────────────────────────────────────────────────────

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`));
  }
};

// ─── Storage: Local (dev mode) ────────────────────────────────────────────────

const buildLocalStorage = (): StorageEngine => {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, LOCAL_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safeName = file.fieldname.replace(/[^a-z0-9]/gi, '_');
      cb(null, `${safeName}_${timestamp}${ext}`);
    },
  });
};

// ─── Storage: Cloudinary (production) ─────────────────────────────────────────

const buildCloudinaryStorage = (): StorageEngine => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
      folder: 'rise-poster/uploads',
      public_id: `${file.fieldname}_${Date.now()}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto:best', fetch_format: 'auto' }],
    }),
  });
};

// ─── Multer Instances ─────────────────────────────────────────────────────────

const storage = UPLOAD_MODE === 'cloudinary' ? buildCloudinaryStorage() : buildLocalStorage();

const baseOptions: multer.Options = {
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
};

/**
 * Upload up to 3 leader photos for poster generation.
 * Field name: `leaderPhotos`
 */
export const uploadLeaderPhotos = multer(baseOptions).array('leaderPhotos', 3);

/**
 * Upload a single file (e.g. party logo or background image).
 * Field name: `image`
 */
export const uploadSingle = multer(baseOptions).single('image');

// ─── URL Helper ───────────────────────────────────────────────────────────────

/**
 * Returns the public URL of an uploaded file.
 * In Cloudinary mode, multer-storage-cloudinary sets `file.path` to the CDN URL.
 * In local mode, we construct a localhost URL.
 */
export const getUploadedFileUrl = (file: Express.Multer.File): string => {
  if (UPLOAD_MODE === 'cloudinary') {
    // multer-storage-cloudinary stores the URL in file.path
    return file.path;
  }
  const baseUrl =
    process.env.API_BASE_URL ||
    (process.env.VERCEL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'server-delta-six-13.vercel.app'}`
      : `http://localhost:${process.env.PORT ?? 5000}`);
  return `${baseUrl}/uploads/${file.filename}`;
};
