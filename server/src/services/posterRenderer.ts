/**
 * posterRenderer.ts
 *
 * High-resolution poster rendering engine powered by Puppeteer / Chrome.
 *
 * Features:
 *  - Singleton browser instance (reused across renders, ~2x faster after first)
 *  - Configurable canvas size (default 1200×1600 px)
 *  - Bangla UTF-8 font rendering via Google Fonts (Hind Siliguri + Noto Sans Bengali)
 *  - Graceful browser reconnection if Chromium crashes
 *  - Full render timing metrics
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import { generatePosterHtml } from '../templates/posterTemplate';
import type { PosterRenderOptions, RenderResult } from '../types/poster.types';

// ─── Browser Singleton ────────────────────────────────────────────────────────

let _browser: Browser | null = null;

/**
 * Returns a shared Browser instance, launching one if none exists or the
 * previous instance has disconnected.
 */
const getBrowser = async (): Promise<Browser> => {
  if (_browser?.connected) return _browser;

  console.log('🌐 Launching Chromium for poster rendering…');

  _browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',           // avoid /dev/shm OOM on Linux
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-background-networking',
      '--disable-extensions',
      '--mute-audio',
      // Better sub-pixel font rendering for Bangla
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning',
      // Allow Google Fonts to load
      '--disable-web-security',
    ],
    defaultViewport: null, // we set per-page
  });

  _browser.on('disconnected', () => {
    console.warn('⚠️  Chromium disconnected — will relaunch on next render.');
    _browser = null;
  });

  console.log('✅ Chromium ready.');
  return _browser;
};

// ─── Font Wait Utility ────────────────────────────────────────────────────────

/**
 * Waits for all @font-face fonts declared on the page to finish loading.
 * Times out gracefully after `timeoutMs` milliseconds.
 */
const waitForFonts = async (page: Page, timeoutMs = 8000): Promise<void> => {
  try {
    // We pass a JS string so TypeScript doesn't type-check DOM globals
    // (document, FontFaceSet) that don't exist in our Node tsconfig.
    await page.evaluate(
      new Function(
        'ms',
        `return Promise.race([
          document.fonts.ready,
          new Promise(function(resolve){ setTimeout(resolve, ms); })
        ]);`
      ) as (ms: number) => Promise<void>,
      timeoutMs
    );
  } catch {
    // Non-fatal — continue with whatever fonts loaded
    console.warn('⚠️  Font wait timed out — rendering with available fonts.');
  }
};

// ─── Main Render Function ─────────────────────────────────────────────────────

/**
 * Renders a political poster to a PNG Buffer.
 *
 * @param opts  Poster content and theme options
 * @returns     RenderResult containing the PNG buffer and timing metrics
 *
 * @example
 * ```ts
 * const result = await renderPoster({
 *   headline: 'মহান বিজয় দিবস',
 *   leaders: [{ url: '...', name: 'নেতার নাম', designation: 'সভাপতি' }],
 *   promoterName: 'মোহাম্মদ আলী',
 *   promoterDesignation: 'সাধারণ সম্পাদক',
 *   promoterArea: 'ঢাকা-১৭',
 * });
 * await fs.writeFile('poster.png', result.buffer);
 * ```
 */
export const renderPoster = async (opts: PosterRenderOptions): Promise<RenderResult> => {
  const t0 = Date.now();
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // ── Viewport ────────────────────────────────────────────────────────────
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    // ── Intercept & block unnecessary network calls ─────────────────────────
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      // Allow: document, stylesheet (Google Fonts CSS), font, image
      if (['document', 'stylesheet', 'font', 'image'].includes(type)) {
        req.continue();
      } else {
        req.abort();
      }
    });

    // ── Inject HTML ─────────────────────────────────────────────────────────
    const html = generatePosterHtml(opts);

    await page.setContent(html, {
      // 'load' fires after all subresources (fonts, images) finish
      waitUntil: 'load',
      timeout: 45_000,
    });

    // ── Wait for Bangla fonts ───────────────────────────────────────────────
    await waitForFonts(page, 8_000);

    // ── Extra settle time (CSS animations, layout reflow) ──────────────────
    await new Promise<void>((r) => setTimeout(r, 400));

    // ── Screenshot ─────────────────────────────────────────────────────────
    const rawBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });

    // Puppeteer ≥ v22 returns Uint8Array | Buffer — normalise to Buffer
    const buffer = Buffer.isBuffer(rawBuffer)
      ? rawBuffer
      : Buffer.from(rawBuffer as Uint8Array);

    const renderTimeMs = Date.now() - t0;

    console.log(
      `🖼️  Poster rendered  ${width}×${height}px  |  ${(buffer.length / 1024).toFixed(0)} KB  |  ${renderTimeMs} ms`
    );

    return { buffer, width, height, renderTimeMs };
  } finally {
    await page.close();
  }
};

// ─── Lifecycle Helpers ────────────────────────────────────────────────────────

/**
 * Gracefully closes the shared Chromium instance.
 * Call this on process exit / SIGTERM.
 */
export const closeBrowser = async (): Promise<void> => {
  if (_browser) {
    await _browser.close();
    _browser = null;
    console.log('🔌 Chromium browser closed.');
  }
};

/**
 * Pre-warms the browser singleton so the first real render is faster.
 * Call this at server startup.
 */
export const warmupBrowser = async (): Promise<void> => {
  await getBrowser();
};
