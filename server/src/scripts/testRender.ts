/**
 * testRender.ts
 *
 * Standalone script that renders a mock political poster and saves it to disk.
 *
 * Usage:
 *   npx ts-node-dev --transpile-only src/scripts/testRender.ts
 *   # — or —
 *   npx ts-node src/scripts/testRender.ts
 *
 * Output:  server/output/test-poster.png
 */

import * as fs from 'fs';
import * as path from 'path';
import { renderPoster, closeBrowser } from '../services/posterRenderer';
import type { PosterRenderOptions } from '../types/poster.types';

// ─── Output directory ─────────────────────────────────────────────────────────

const OUTPUT_DIR = path.resolve(__dirname, '../../output');

// ─── Mock Data ────────────────────────────────────────────────────────────────

/**
 * Using real, publicly accessible portrait photos from Unsplash.
 * These are CC0-licensed and load reliably in headless Chrome.
 * Replace with real leader photo URLs or base64 data URIs in production.
 */
const mockOptions: PosterRenderOptions = {
  // Canvas (min 1200×1600 as required)
  width: 1200,
  height: 1600,

  // Bangla headline
  headline: 'মহান বিজয় দিবস',
  subHeadline: 'উপলক্ষে আন্তরিক শুভেচ্ছা ও অভিনন্দন',
  dateLine: '১৬ই ডিসেম্বর, ২০২৪',

  // Party info
  partyName: '✦ জনগণের সেবায় অঙ্গীকারবদ্ধ ✦',

  // Theme — deep emerald green + gold accent
  primaryColor: '#0a3318',
  accentColor: '#FFD700',

  // Leaders (3 circular portrait photos)
  leaders: [
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      name: 'আব্দুল করিম',
      designation: 'সভাপতি',
    },
    {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      name: 'মোহাম্মদ রহিম',
      designation: 'সাধারণ সম্পাদক',
    },
    {
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      name: 'জহিরুল ইসলাম',
      designation: 'সাংগঠনিক সম্পাদক',
    },
  ],

  // Bottom promotional banner
  promoterName: 'মোঃ সাইফুল ইসলাম',
  promoterDesignation: 'সহ-সভাপতি, ঢাকা মহানগর উত্তর',
  promoterArea: 'ঢাকা-১৭, মিরপুর',
  promoterContact: '📞 ০১৭XX-XXXXXX',
};

// ─── Additional test variants ─────────────────────────────────────────────────

const singleLeaderOptions: PosterRenderOptions = {
  ...mockOptions,
  width: 1200,
  height: 1600,
  headline: 'জাতীয় নির্বাচন ২০২৪',
  subHeadline: 'ভোট দিন, পরিবর্তন আনুন',
  dateLine: '৭ই জানুয়ারি, ২০২৪',
  primaryColor: '#1a0a3d',  // deep purple
  accentColor: '#00CFFF',   // cyan accent
  partyName: '✦ গণতন্ত্রের পথে এগিয়ে চলি ✦',
  leaders: [
    {
      url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      name: 'মোহাম্মদ সালাউদ্দিন',
      designation: 'প্রার্থী, ঢাকা-১৭',
    },
  ],
  promoterName: 'মোঃ সাইফুল ইসলাম',
  promoterDesignation: 'প্রধান নির্বাচন সমন্বয়কারী',
  promoterArea: 'মিরপুর, ঢাকা',
};

// ─── Runner ───────────────────────────────────────────────────────────────────

const run = async (): Promise<void> => {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  Political Poster Render — Test Script    ');
  console.log('═══════════════════════════════════════════\n');

  // ── Render #1: Three-leader victory day poster ────────────────────────────
  console.log('📌 Rendering Test #1 — Three-leader Victory Day poster…');
  const result1 = await renderPoster(mockOptions);
  const file1 = path.join(OUTPUT_DIR, 'test-poster.png');
  fs.writeFileSync(file1, result1.buffer);

  console.log(`   ✅ Saved → ${file1}`);
  console.log(`   📐 Size:  ${result1.width} × ${result1.height} px`);
  console.log(`   📦 File:  ${(result1.buffer.length / 1024).toFixed(1)} KB`);
  console.log(`   ⏱  Time:  ${result1.renderTimeMs} ms\n`);

  // ── Render #2: Single-leader election poster (different theme) ────────────
  console.log('📌 Rendering Test #2 — Single-leader Election poster…');
  const result2 = await renderPoster(singleLeaderOptions);
  const file2 = path.join(OUTPUT_DIR, 'test-poster-election.png');
  fs.writeFileSync(file2, result2.buffer);

  console.log(`   ✅ Saved → ${file2}`);
  console.log(`   📐 Size:  ${result2.width} × ${result2.height} px`);
  console.log(`   📦 File:  ${(result2.buffer.length / 1024).toFixed(1)} KB`);
  console.log(`   ⏱  Time:  ${result2.renderTimeMs} ms\n`);

  console.log('═══════════════════════════════════════════');
  console.log('  All renders complete!');
  console.log(`  Open the output folder to inspect:`);
  console.log(`  ${OUTPUT_DIR}`);
  console.log('═══════════════════════════════════════════\n');
};

// ─── Bootstrap with graceful shutdown ─────────────────────────────────────────

run()
  .catch((err: unknown) => {
    console.error('\n❌ Render failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeBrowser();
    process.exit(process.exitCode ?? 0);
  });
