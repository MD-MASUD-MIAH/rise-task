/**
 * Shared type definitions for the poster rendering pipeline.
 */

export interface LeaderPhoto {
  /** Public URL or base64 data URI (data:image/jpeg;base64,...) */
  url: string;
  /** Leader's name in Bangla */
  name: string;
  /** e.g. 'সভাপতি', 'সাধারণ সম্পাদক' */
  designation?: string;
}

export interface PosterRenderOptions {
  // ── Canvas ─────────────────────────────────────────────────────────────────
  /** Canvas width in px. Default: 1200 */
  width?: number;
  /** Canvas height in px. Default: 1600 */
  height?: number;

  // ── Content ────────────────────────────────────────────────────────────────
  /** Main headline in Bangla — e.g. 'মহান বিজয় দিবস' */
  headline: string;
  /** Secondary line below headline — e.g. 'উপলক্ষে আন্তরিক শুভেচ্ছা' */
  subHeadline?: string;
  /** Date / venue line — e.g. '১৬ই ডিসেম্বর, ২০২৪' */
  dateLine?: string;
  /** 1–3 leader photos */
  leaders: LeaderPhoto[];

  // ── Party / Event ──────────────────────────────────────────────────────────
  partyName?: string;
  partyLogoUrl?: string;

  // ── Theme ──────────────────────────────────────────────────────────────────
  /** Primary background color (CSS). Default: '#0d3d18' */
  primaryColor?: string;
  /** Accent / highlight color (CSS). Default: '#FFD700' */
  accentColor?: string;
  /** Optional full-bleed background image URL */
  backgroundImageUrl?: string;
  /** Overlay opacity (0–1) when backgroundImageUrl is set. Default: 0.55 */
  overlayOpacity?: number;

  // ── Bottom Promotional Banner ──────────────────────────────────────────────
  promoterName: string;
  promoterDesignation: string;
  promoterArea: string;
  /** Extra line in the banner — e.g. phone number */
  promoterContact?: string;
}

export interface RenderResult {
  /** Raw PNG buffer */
  buffer: Buffer;
  width: number;
  height: number;
  /** Wall-clock render time in ms */
  renderTimeMs: number;
}
