/**
 * storageService.ts
 *
 * Abstracts poster image persistence.
 *
 * STORAGE_MODE=local      → saves buffer to server/output/, returns localhost URL
 * STORAGE_MODE=cloudinary → uploads buffer to Cloudinary, returns CDN URL
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const OUTPUT_DIR = process.env.VERCEL
  ? '/tmp/output'
  : path.resolve(process.cwd(), 'output');
const STORAGE_MODE = process.env.STORAGE_MODE ?? 'local';

// ─── Cloudinary init (lazy) ───────────────────────────────────────────────────

let _cloudinaryConfigured = false;
const ensureCloudinary = (): void => {
  if (_cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  _cloudinaryConfigured = true;
};

// ─── Local storage ────────────────────────────────────────────────────────────

const saveLocally = async (buffer: Buffer, filename: string): Promise<string> => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  const base =
    process.env.API_BASE_URL ||
    'https://server-delta-six-13.vercel.app';
  return `${base}/output/${filename}`;
};

// ─── Cloudinary storage ───────────────────────────────────────────────────────

const uploadToCloudinary = (buffer: Buffer, publicId: string): Promise<string> => {
  ensureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rise-poster/generated',
        public_id: publicId,
        resource_type: 'image',
        format: 'png',
        transformation: [{ quality: 'auto:best' }],
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error('Cloudinary upload returned no result'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const savePosterBuffer = async (buffer: Buffer, posterId: string): Promise<string> => {
  const isSvg = buffer.slice(0, 100).toString('utf-8').includes('<svg');
  const ext = isSvg ? 'svg' : 'png';
  const filename = `poster-${posterId}.${ext}`;

  if (STORAGE_MODE === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      return await uploadToCloudinary(buffer, `poster-${posterId}`);
    } catch (err) {
      console.warn('⚠️ Cloudinary upload failed, falling back to data URL:', err);
    }
  }

  // On Vercel serverless, ephemeral /tmp is isolated per request container.
  // Returning a self-contained data URL guarantees the image always renders immediately!
  if (process.env.VERCEL) {
    const mime = isSvg ? 'image/svg+xml;charset=utf-8' : 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  return saveLocally(buffer, filename);
};
