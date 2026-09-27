import type { PosterRenderOptions, RenderResult } from '../types/poster.types';

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const generatePosterSvg = (opts: PosterRenderOptions): string => {
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;
  const primary = opts.primaryColor || '#0a3318';
  const accent = opts.accentColor || '#FFD700';

  // Calculate dynamic headline font size
  const hlLen = opts.headline.length;
  const headlineFontSize = hlLen <= 10 ? 84 : hlLen <= 18 ? 68 : hlLen <= 26 ? 56 : 46;

  // Leaders positioning
  const count = Math.min(opts.leaders.length, 3);
  let leaderElements = '';

  if (count > 0) {
    const leaderConfig =
      count === 1
        ? [{ cx: 600, cy: 500, r: 130 }]
        : count === 2
        ? [
            { cx: 430, cy: 500, r: 115 },
            { cx: 770, cy: 500, r: 115 },
          ]
        : [
            { cx: 330, cy: 500, r: 100 },
            { cx: 600, cy: 490, r: 110 },
            { cx: 870, cy: 500, r: 100 },
          ];

    leaderElements = leaderConfig
      .map((cfg, i) => {
        const leader = opts.leaders[i];
        if (!leader) return '';
        const clipId = `leader-clip-${i}`;
        const x = cfg.cx - cfg.r;
        const y = cfg.cy - cfg.r;
        const d = cfg.r * 2;

        return `
    <!-- Leader ${i + 1} -->
    <g class="leader-node">
      <defs>
        <clipPath id="${clipId}">
          <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" />
        </clipPath>
      </defs>
      <!-- Shadow & Glow -->
      <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 8}" fill="none" stroke="${accent}" stroke-width="4" filter="url(#drop-shadow)" opacity="0.9" />
      <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 4}" fill="#113d1e" />
      
      <!-- Photo -->
      ${
        leader.url
          ? `<image href="${escapeXml(leader.url)}" x="${x}" y="${y}" width="${d}" height="${d}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`
          : `<circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="#185229" clip-path="url(#${clipId})" />`
      }
      
      <!-- Inner Ring Border -->
      <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="none" stroke="${accent}" stroke-width="5" />
      
      <!-- Leader Name Tag -->
      <rect x="${cfg.cx - 120}" y="${cfg.cy + cfg.r + 14}" width="240" height="36" rx="8" fill="#041207" stroke="${accent}" stroke-width="1.5" opacity="0.92" />
      <text x="${cfg.cx}" y="${cfg.cy + cfg.r + 38}" font-size="20" font-weight="700" fill="${accent}" text-anchor="middle">${escapeXml(leader.name || `নেতা ${i + 1}`)}</text>
      ${
        leader.designation
          ? `<text x="${cfg.cx}" y="${cfg.cy + cfg.r + 66}" font-size="16" font-weight="500" fill="#ffffff" opacity="0.88" text-anchor="middle">${escapeXml(leader.designation)}</text>`
          : ''
      }
    </g>`;
      })
      .join('\n');
  }

  // Top header text
  const topText = opts.partyName ? escapeXml(opts.partyName) : 'বিসমিল্লাহির রাহমানির রাহিম';

  // Subheadline & date text
  const subHeadlineSvg = opts.subHeadline
    ? `<text x="600" y="850" font-size="34" font-weight="600" fill="#f8fafc" text-anchor="middle" filter="url(#drop-shadow)">${escapeXml(opts.subHeadline)}</text>`
    : '';

  const dateLineSvg = opts.dateLine
    ? `<g transform="translate(600, 920)">
        <rect x="-180" y="-24" width="360" height="42" rx="21" fill="rgba(0,0,0,0.4)" stroke="${accent}" stroke-width="1.5" />
        <text x="0" y="5" font-size="22" font-weight="700" fill="${accent}" text-anchor="middle">${escapeXml(opts.dateLine)}</text>
      </g>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800;900&amp;family=Noto+Sans+Bengali:wght@500;700;900&amp;display=swap');
      text {
        font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', -apple-system, sans-serif;
      }
    </style>
    
    <!-- Background Radial Gradient -->
    <radialGradient id="bg-radial" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#1e7a35" />
      <stop offset="50%" stop-color="${primary}" />
      <stop offset="100%" stop-color="#030c06" />
    </radialGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="gold-text-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="45%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#c98a0c" />
    </linearGradient>

    <!-- Ribbon Gradient -->
    <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="15%" stop-color="#8a6508" />
      <stop offset="50%" stop-color="${accent}" />
      <stop offset="85%" stop-color="#8a6508" />
      <stop offset="100%" stop-color="transparent" />
    </linearGradient>

    <!-- Bottom Banner Gradient -->
    <linearGradient id="bottom-banner-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1f10" />
      <stop offset="100%" stop-color="#020804" />
    </linearGradient>

    <!-- Filters -->
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.8" />
    </filter>

    <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Decorative Corner Pattern -->
    <g id="corner-ornament">
      <path d="M 0 0 L 0 70 Q 0 110 40 110 L 110 110" fill="none" stroke="${accent}" stroke-width="3" />
      <path d="M 0 0 L 0 50 Q 0 90 40 90 L 110 90" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5" />
      <circle cx="6" cy="6" r="6" fill="${accent}" />
      <circle cx="110" cy="110" r="4" fill="${accent}" opacity="0.7" />
    </g>
  </defs>

  <!-- Base Background -->
  <rect width="${width}" height="${height}" fill="url(#bg-radial)" />

  <!-- Subtle Decorative Grid Lines -->
  <g opacity="0.08" stroke="${accent}" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="${height}" />
    <line x1="300" y1="0" x2="300" y2="${height}" />
    <line x1="600" y1="0" x2="600" y2="${height}" />
    <line x1="900" y1="0" x2="900" y2="${height}" />
    <line x1="1100" y1="0" x2="1100" y2="${height}" />
    <line x1="0" y1="200" x2="${width}" y2="200" />
    <line x1="0" y1="500" x2="${width}" y2="500" />
    <line x1="0" y1="900" x2="${width}" y2="900" />
    <line x1="0" y1="1200" x2="${width}" y2="1200" />
  </g>

  <!-- Borders -->
  <rect x="25" y="25" width="1150" height="1550" rx="16" fill="none" stroke="${accent}" stroke-width="3.5" opacity="0.8" />
  <rect x="36" y="36" width="1128" height="1528" rx="12" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="12 6" opacity="0.5" />

  <!-- 4 Corners -->
  <use href="#corner-ornament" x="42" y="42" />
  <use href="#corner-ornament" transform="translate(1158, 42) scale(-1, 1)" />
  <use href="#corner-ornament" transform="translate(42, 1558) scale(1, -1)" />
  <use href="#corner-ornament" transform="translate(1158, 1558) scale(-1, -1)" />

  <!-- TOP RIBBON -->
  <polygon points="60,65 1140,65 1100,120 100,120" fill="url(#ribbon-grad)" />
  <text x="600" y="102" font-size="28" font-weight="800" fill="#082611" text-anchor="middle" letter-spacing="1">
    ${topText}
  </text>

  <!-- LEADERS -->
  ${leaderElements}

  <!-- OCCASION / MAIN HEADLINE -->
  <g transform="translate(600, 770)" filter="url(#drop-shadow)">
    <text x="0" y="0" font-size="${headlineFontSize}" font-weight="900" fill="url(#gold-text-grad)" text-anchor="middle" letter-spacing="1.5">
      ${escapeXml(opts.headline)}
    </text>
  </g>

  <!-- SUBHEADLINE & DATE -->
  ${subHeadlineSvg}
  ${dateLineSvg}

  <!-- CENTER DIVIDER -->
  <g transform="translate(600, 1020)" opacity="0.75">
    <line x1="-300" y1="0" x2="300" y2="0" stroke="${accent}" stroke-width="2" />
    <polygon points="0,-8 8,0 0,8 -8,0" fill="${accent}" />
    <circle cx="-150" cy="0" r="4" fill="${accent}" />
    <circle cx="150" cy="0" r="4" fill="${accent}" />
  </g>

  <!-- BOTTOM PROMOTER FOOTER -->
  <g transform="translate(0, 1260)">
    <!-- Footer card background -->
    <rect x="60" y="0" width="1080" height="260" rx="20" fill="url(#bottom-banner-grad)" stroke="${accent}" stroke-width="2.5" filter="url(#drop-shadow)" />
    
    <!-- Top accent border of footer -->
    <line x1="80" y1="2" x2="1120" y2="2" stroke="${accent}" stroke-width="4" stroke-linecap="round" />

    <!-- Promoter Label -->
    <text x="600" y="48" font-size="20" font-weight="600" fill="#cbd5e1" text-anchor="middle" letter-spacing="2">
      সৌজন্যে / প্রচারে:
    </text>

    <!-- Promoter Name -->
    <text x="600" y="104" font-size="44" font-weight="900" fill="url(#gold-text-grad)" text-anchor="middle">
      ${escapeXml(opts.promoterName)}
    </text>

    <!-- Promoter Designation & Area -->
    <text x="600" y="152" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle">
      ${escapeXml(opts.promoterDesignation)} · ${escapeXml(opts.promoterArea)}
    </text>

    ${
      opts.promoterContact
        ? `<text x="600" y="196" font-size="20" font-weight="600" fill="${accent}" text-anchor="middle">
            যোগাযোগ: ${escapeXml(opts.promoterContact)}
          </text>`
        : ''
    }

    <!-- RISE Watermark / Credit -->
    <text x="600" y="235" font-size="14" font-weight="500" fill="rgba(255,255,255,0.4)" text-anchor="middle">
      Generated with RISE Poster Engine
    </text>
  </g>

</svg>`;
};

export const renderPosterSvgResult = (opts: PosterRenderOptions): RenderResult => {
  const t0 = Date.now();
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;
  const svg = generatePosterSvg(opts);
  const buffer = Buffer.from(svg, 'utf-8');

  return {
    buffer,
    width,
    height,
    renderTimeMs: Math.max(1, Date.now() - t0),
  };
};
