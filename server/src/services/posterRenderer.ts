/**
 * posterRenderer.ts
 *
 * High-resolution poster rendering engine.
 * Supports Puppeteer / Chrome where available, with automatic
 * resilient fallback to high-resolution vector SVG renderer.
 */

import type { Browser, Page } from 'puppeteer';
import { generatePosterHtml } from '../templates/posterTemplate';
import type { PosterRenderOptions, RenderResult } from '../types/poster.types';
import { renderPosterSvgResult } from './svgPosterRenderer';

// ─── Browser Singleton ────────────────────────────────────────────────────────

let _browser: Browser | null = null;

/**
 * Returns a shared Browser instance, or null if Chromium is unavailable.
 */
const getBrowser = async (): Promise<Browser | null> => {
  if (process.env.VERCEL) {
    // Vercel Serverless environment lacks system Chromium
    return null;
  }
  if (_browser?.connected) return _browser;

  try {
    console.log('🌐 Launching Chromium for poster rendering…');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteer = require('puppeteer');
    _browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--disable-background-networking',
        '--disable-extensions',
        '--mute-audio',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-web-security',
      ],
      defaultViewport: null,
    });

    _browser?.on('disconnected', () => {
      console.warn('⚠️  Chromium disconnected — will relaunch on next render.');
      _browser = null;
    });

    console.log('✅ Chromium ready.');
    return _browser;
  } catch (err) {
    console.warn('⚠️  Chromium launch unavailable, using vector SVG renderer:', err);
    return null;
  }
};

// ─── Font Wait Utility ────────────────────────────────────────────────────────

const waitForFonts = async (page: Page, timeoutMs = 8000): Promise<void> => {
  try {
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
    console.warn('⚠️  Font wait timed out — rendering with available fonts.');
  }
};

// ─── Main Render Function ─────────────────────────────────────────────────────

export const renderPoster = async (opts: PosterRenderOptions): Promise<RenderResult> => {
  const browser = await getBrowser();
  if (!browser) {
    console.log('✨ Rendering high-quality vector SVG poster…');
    return renderPosterSvgResult(opts);
  }

  const t0 = Date.now();
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;

  let page: Page | null = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['document', 'stylesheet', 'font', 'image'].includes(type)) {
        req.continue();
      } else {
        req.abort();
      }
    });

    const html = generatePosterHtml(opts);
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 45_000,
    });

    await waitForFonts(page, 8_000);
    await new Promise<void>((r) => setTimeout(r, 400));

    const rawBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });

    const buffer = Buffer.isBuffer(rawBuffer)
      ? rawBuffer
      : Buffer.from(rawBuffer as Uint8Array);

    const renderTimeMs = Date.now() - t0;
    console.log(
      `🖼️  Poster rendered ${width}×${height}px | ${(buffer.length / 1024).toFixed(0)} KB | ${renderTimeMs} ms`
    );

    return { buffer, width, height, renderTimeMs };
  } catch (err) {
    console.warn('⚠️  Puppeteer render error, falling back to SVG renderer:', err);
    return renderPosterSvgResult(opts);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // ignore
      }
    }
  }
};

export const warmupBrowser = async (): Promise<void> => {
  try {
    await getBrowser();
  } catch {
    // Non-fatal if browser warmup fails
  }
};

export const closeBrowser = async (): Promise<void> => {
  if (_browser) {
    try {
      await _browser.close();
    } catch {
      // ignore
    }
    _browser = null;
  }
};
