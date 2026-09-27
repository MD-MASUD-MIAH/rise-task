import type { PosterRenderOptions, RenderResult } from '../types/poster.types';

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ─── Shared SVG Defs ──────────────────────────────────────────────────────────

const getSharedStyles = () => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800;900&amp;family=Noto+Sans+Bengali:wght@500;700;900&amp;display=swap');
    text {
      font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', -apple-system, sans-serif;
    }
  </style>

  <!-- Grayscale Filter for Memorial Black-and-White Leader -->
  <filter id="bw-filter">
    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
    <feComponentTransfer>
      <feFuncR type="linear" slope="1.1" intercept="-0.05" />
      <feFuncG type="linear" slope="1.1" intercept="-0.05" />
      <feFuncB type="linear" slope="1.1" intercept="-0.05" />
    </feComponentTransfer>
  </filter>

  <!-- Common Filters -->
  <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.85" />
  </filter>

  <filter id="soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
    <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.6" />
  </filter>

  <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="8" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
`;

// ─── Category 1: Victory Day (মহান বিজয় দিবস) ────────────────────────────────

const renderVictoryDay = (opts: PosterRenderOptions, width: number, height: number): string => {
  const accent = opts.accentColor || '#FFD700';
  const headline = opts.headline || 'মহান বিজয় দিবস';
  const subHeadline = opts.subHeadline || '১৬ই ডিসেম্বর স্বাধীনতার রক্তিম শুভেচ্ছা';
  const hlLen = headline.length;
  const headlineSize = hlLen <= 10 ? 88 : hlLen <= 16 ? 74 : hlLen <= 22 ? 62 : 50;

  // Leaders (up to 3 horizontal across upper-mid)
  const count = Math.min(opts.leaders.length, 3);
  const leaderConfig =
    count === 1
      ? [{ cx: 600, cy: 450, r: 125 }]
      : count === 2
      ? [{ cx: 420, cy: 450, r: 110 }, { cx: 780, cy: 450, r: 110 }]
      : [{ cx: 330, cy: 450, r: 95 }, { cx: 600, cy: 435, r: 105 }, { cx: 870, cy: 450, r: 95 }];

  const leaderSvg = leaderConfig
    .map((cfg, i) => {
      const leader = opts.leaders[i];
      if (!leader) return '';
      const clipId = `v-leader-clip-${i}`;
      return `
      <g class="leader-node" filter="url(#drop-shadow)">
        <defs>
          <clipPath id="${clipId}"><circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" /></clipPath>
        </defs>
        <!-- Golden Frame with Floral Ring -->
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 9}" fill="none" stroke="${accent}" stroke-width="4.5" />
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 3}" fill="#052814" />
        ${
          leader.url
            ? `<image href="${escapeXml(leader.url)}" x="${cfg.cx - cfg.r}" y="${cfg.cy - cfg.r}" width="${cfg.r * 2}" height="${cfg.r * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`
            : `<circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="#09381c" clip-path="url(#${clipId})" />`
        }
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="none" stroke="${accent}" stroke-width="3" />
        <!-- Name Badge -->
        <rect x="${cfg.cx - 110}" y="${cfg.cy + cfg.r + 10}" width="220" height="34" rx="8" fill="#031b0c" stroke="${accent}" stroke-width="1.5" />
        <text x="${cfg.cx}" y="${cfg.cy + cfg.r + 33}" font-size="19" font-weight="800" fill="${accent}" text-anchor="middle">${escapeXml(leader.name || `নেতা ${i + 1}`)}</text>
        ${leader.designation ? `<text x="${cfg.cx}" y="${cfg.cy + cfg.r + 60}" font-size="15" font-weight="600" fill="#ffffff" opacity="0.9" text-anchor="middle">${escapeXml(leader.designation)}</text>` : ''}
      </g>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${getSharedStyles()}

    <!-- Deep Green Radial Gradient -->
    <radialGradient id="v-bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#0a4d22" />
      <stop offset="60%" stop-color="#052813" />
      <stop offset="100%" stop-color="#021208" />
    </radialGradient>

    <!-- Bright Red Bangladesh Sun -->
    <radialGradient id="v-red-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff3b53" />
      <stop offset="70%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </radialGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="v-gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#ffe270" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Smriti Soudho Gradient -->
    <linearGradient id="v-soudho" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.38" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.15" />
    </linearGradient>

    <!-- Floral Corner Motif -->
    <g id="v-corner">
      <path d="M 0 0 L 0 80 Q 0 120 40 120 L 120 120" fill="none" stroke="${accent}" stroke-width="3" />
      <path d="M 0 0 L 0 60 Q 0 100 40 100 L 120 100" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6" />
      <path d="M 15 15 Q 40 40 15 65 Q 40 40 65 15" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.7" />
      <circle cx="8" cy="8" r="6" fill="${accent}" />
      <circle cx="120" cy="120" r="4" fill="${accent}" />
    </g>
  </defs>

  <!-- Deep Green Base -->
  <rect width="${width}" height="${height}" fill="url(#v-bg)" />

  <!-- Traditional Pattern Texture -->
  <g opacity="0.06" stroke="${accent}" stroke-width="1">
    <pattern id="v-pat" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="20" fill="none" stroke="${accent}" stroke-width="0.8" />
      <polygon points="30,10 40,30 30,50 20,30" fill="none" stroke="${accent}" stroke-width="0.8" />
    </pattern>
    <rect width="${width}" height="${height}" fill="url(#v-pat)" />
  </g>

  <!-- LARGE BRIGHT RED CIRCLE (Bangladesh Flag Sun) -->
  <circle cx="600" cy="510" r="280" fill="url(#v-red-sun)" opacity="0.92" filter="url(#drop-shadow)" />

  <!-- JATIYA SMRITI SOUDHO SILHOUETTE (National Monument) -->
  <g transform="translate(600, 770)" opacity="0.35">
    <!-- 7 Triangular Pairs -->
    <polygon points="0,-450 20,0 -20,0" fill="url(#v-soudho)" />
    <polygon points="-12,-380 -55,0 -20,0" fill="url(#v-soudho)" />
    <polygon points="12,-380 55,0 20,0" fill="url(#v-soudho)" />
    <polygon points="-22,-320 -95,0 -50,0" fill="url(#v-soudho)" />
    <polygon points="22,-320 95,0 50,0" fill="url(#v-soudho)" />
    <polygon points="-32,-260 -140,0 -90,0" fill="url(#v-soudho)" />
    <polygon points="32,-260 140,0 90,0" fill="url(#v-soudho)" />
    <polygon points="-42,-200 -190,0 -135,0" fill="url(#v-soudho)" />
    <polygon points="42,-200 190,0 135,0" fill="url(#v-soudho)" />
    <polygon points="-52,-140 -245,0 -185,0" fill="url(#v-soudho)" />
    <polygon points="52,-140 245,0 185,0" fill="url(#v-soudho)" />
    <polygon points="-62,-80 -300,0 -240,0" fill="url(#v-soudho)" />
    <polygon points="62,-80 300,0 240,0" fill="url(#v-soudho)" />
  </g>

  <!-- FREEDOM FIGHTERS SILHOUETTE -->
  <g transform="translate(600, 750)" opacity="0.45" fill="#011408">
    <!-- Hill Horizon -->
    <path d="M -600 20 Q -250 -15 0 10 Q 250 -15 600 20 L 600 50 L -600 50 Z" />
    <!-- Fighter 1 with Raised Rifle -->
    <circle cx="-120" cy="-60" r="10" />
    <path d="M -125 -50 L -120 0 L -115 0 L -110 -35 L -85 -55 L -90 -62 L -115 -42 Z" />
    <line x1="-105" y1="-75" x2="-80" y2="-40" stroke="#011408" stroke-width="4" />
    <!-- Fighter 2 with Flag Staff -->
    <circle cx="-20" cy="-80" r="12" />
    <path d="M -25 -68 L -20 5 L -10 5 L -5 -40 L 15 -60 L 10 -65 L -15 -52 Z" />
    <line x1="-5" y1="-140" x2="-20" y2="5" stroke="#011408" stroke-width="5" />
    <!-- Fluttering Flag -->
    <path d="M -5 -140 Q 35 -155 70 -135 Q 35 -115 -5 -115 Z" fill="#011408" />
    <!-- Fighter 3 Advancing -->
    <circle cx="90" cy="-65" r="10" />
    <path d="M 85 -55 L 90 5 L 100 5 L 100 -30 L 130 -45 L 125 -52 L 95 -40 Z" />
    <line x1="85" y1="-70" x2="140" y2="-45" stroke="#011408" stroke-width="4" />
  </g>

  <!-- Golden Borders & Traditional Floral Corners -->
  <rect x="25" y="25" width="1150" height="1550" rx="16" fill="none" stroke="${accent}" stroke-width="3.5" opacity="0.85" />
  <rect x="36" y="36" width="1128" height="1528" rx="12" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="14 7" opacity="0.6" />
  <use href="#v-corner" x="42" y="42" />
  <use href="#v-corner" transform="translate(1158, 42) scale(-1, 1)" />
  <use href="#v-corner" transform="translate(42, 1558) scale(1, -1)" />
  <use href="#v-corner" transform="translate(1158, 1558) scale(-1, -1)" />

  <!-- TOP BANNER -->
  <polygon points="80,60 1120,60 1070,115 130,115" fill="linear-gradient(90deg, transparent, #b45309, ${accent}, #b45309, transparent)" />
  <text x="600" y="98" font-size="28" font-weight="900" fill="#03200d" text-anchor="middle" letter-spacing="1">
    ${opts.partyName ? escapeXml(opts.partyName) : 'বিসমিল্লাহির রাহমানির রাহিম'}
  </text>

  <!-- LEADERS CUTOUTS -->
  ${leaderSvg}

  <!-- MAIN HEADLINE: মহান বিজয় দিবস -->
  <g transform="translate(600, 830)" filter="url(#drop-shadow)">
    <text x="0" y="0" font-size="${headlineSize}" font-weight="900" fill="url(#v-gold)" text-anchor="middle" letter-spacing="2">
      ${escapeXml(headline)}
    </text>
  </g>

  <!-- SUBHEADLINE & DATE -->
  <text x="600" y="900" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" filter="url(#drop-shadow)">
    ${escapeXml(subHeadline)}
  </text>
  ${
    opts.dateLine
      ? `<g transform="translate(600, 960)">
          <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#031b0c" stroke="${accent}" stroke-width="2" />
          <text x="0" y="8" font-size="22" font-weight="800" fill="${accent}" text-anchor="middle">${escapeXml(opts.dateLine)}</text>
        </g>`
      : ''
  }

  <!-- DIVIDER -->
  <g transform="translate(600, 1030)" opacity="0.8">
    <line x1="-320" y1="0" x2="320" y2="0" stroke="${accent}" stroke-width="2" />
    <polygon points="0,-9 9,0 0,9 -9,0" fill="${accent}" />
    <circle cx="-160" cy="0" r="5" fill="${accent}" />
    <circle cx="160" cy="0" r="5" fill="${accent}" />
  </g>

  <!-- DISTINCTIVE PROMOTER BANNER (Clean Light Gold / White Banner) -->
  <g transform="translate(0, 1260)">
    <!-- Light Gold / Ivory Card -->
    <rect x="60" y="0" width="1080" height="260" rx="20" fill="#fffdf2" stroke="${accent}" stroke-width="3" filter="url(#drop-shadow)" />
    <line x1="80" y1="3" x2="1120" y2="3" stroke="#15803d" stroke-width="4" stroke-linecap="round" />

    <!-- Credit Line: প্রচারে / সৌজন্যে -->
    <text x="600" y="48" font-size="22" font-weight="700" fill="#15803d" text-anchor="middle" letter-spacing="3">
      — প্রচারে ও সৌজন্যে —
    </text>

    <!-- Promoter Name (Deep Green & Gold) -->
    <text x="600" y="106" font-size="46" font-weight="900" fill="#042813" text-anchor="middle">
      ${escapeXml(opts.promoterName)}
    </text>

    <!-- Designation & Area -->
    <text x="600" y="156" font-size="26" font-weight="800" fill="#b45309" text-anchor="middle">
      ${escapeXml(opts.promoterDesignation)} · ${escapeXml(opts.promoterArea)}
    </text>

    ${
      opts.promoterContact
        ? `<text x="600" y="200" font-size="20" font-weight="600" fill="#1e293b" text-anchor="middle">
            যোগাযোগ: ${escapeXml(opts.promoterContact)}
          </text>`
        : ''
    }

    <text x="600" y="240" font-size="14" font-weight="600" fill="#64748b" text-anchor="middle">
      জাতীয় শোক ও গৌরবগাথা · RISE Poster Engine
    </text>
  </g>
</svg>`;
};

// ─── Category 2: Election Campaign (নির্বাচনী প্রচার) ─────────────────────────

const renderElection = (opts: PosterRenderOptions, width: number, height: number): string => {
  const headline = opts.headline || 'টেক ব্যাক বাংলাদেশ';
  const subHeadline = opts.subHeadline || 'উন্নয়ন ও জনগণের ভোটাধিকার রক্ষায়';
  const hlLen = headline.length;
  const headlineSize = hlLen <= 10 ? 84 : hlLen <= 18 ? 68 : hlLen <= 26 ? 54 : 44;

  // Hierarchical Leader & Candidate Arrangement:
  // Top tier: 2 central leaders
  // Mid tier: 1 PROMINENT candidate spotlight
  const leader1 = opts.leaders[0];
  const leader2 = opts.leaders[1];
  const candidate = opts.leaders[2] || { url: '', name: opts.promoterName, designation: 'মনোনীত প্রার্থী' };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${getSharedStyles()}

    <!-- Deep Blue Dynamic Gradient -->
    <radialGradient id="e-bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="45%" stop-color="#0f2b66" />
      <stop offset="100%" stop-color="#050e26" />
    </radialGradient>

    <!-- Rayburst Gradient -->
    <linearGradient id="e-rays" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0" />
    </linearGradient>

    <!-- White / Gold Text Gradient -->
    <linearGradient id="e-gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>

    <!-- Candidate Frame Gradient -->
    <linearGradient id="e-cand-frame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>

  <!-- Deep Blue Background -->
  <rect width="${width}" height="${height}" fill="url(#e-bg)" />

  <!-- DYNAMIC RAYS & DIAGONAL MOTIFS -->
  <g opacity="0.12" fill="white">
    <polygon points="600,0 480,1600 520,1600" />
    <polygon points="600,0 680,1600 720,1600" />
    <polygon points="600,0 1200,600 1200,700" />
    <polygon points="600,0 0,600 0,700" />
    <polygon points="600,0 1200,200 1200,300" />
    <polygon points="600,0 0,200 0,300" />
  </g>

  <!-- STYLIZED BANGLADESH MAP OUTLINE (Watermark) -->
  <g transform="translate(600, 520) scale(1.1)" opacity="0.14" stroke="#38bdf8" stroke-width="3" fill="none">
    <path d="M -10 -250 Q 80 -230 110 -150 Q 180 -100 190 -30 Q 240 20 220 120 Q 200 200 140 250 Q 50 290 0 310 Q -80 300 -140 240 Q -190 180 -210 100 Q -230 10 -180 -80 Q -140 -160 -80 -220 Z" />
  </g>

  <!-- Modern Borders -->
  <rect x="25" y="25" width="1150" height="1550" rx="16" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.7" />
  <rect x="36" y="36" width="1128" height="1528" rx="12" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="16 8" opacity="0.4" />

  <!-- TOP BANNER -->
  <rect x="100" y="55" width="1000" height="55" rx="28" fill="#0c1f4a" stroke="#38bdf8" stroke-width="2" />
  <text x="600" y="92" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    ${opts.partyName ? escapeXml(opts.partyName) : 'গণপ্রজাতন্ত্রী বাংলাদেশ · জাতীয় নির্বাচন'}
  </text>

  <!-- TOP TIER: 2 CENTRAL LEADERS -->
  <g transform="translate(0, 0)">
    <!-- Leader 1 -->
    <g class="leader-node" filter="url(#drop-shadow)">
      <defs><clipPath id="e-lead1-clip"><circle cx="430" cy="270" r="95" /></clipPath></defs>
      <circle cx="430" cy="270" r="102" fill="none" stroke="#ffffff" stroke-width="4" />
      <circle cx="430" cy="270" r="97" fill="#081b40" />
      ${
        leader1?.url
          ? `<image href="${escapeXml(leader1.url)}" x="335" y="175" width="190" height="190" preserveAspectRatio="xMidYMid slice" clip-path="url(#e-lead1-clip)" />`
          : `<circle cx="430" cy="270" r="95" fill="#143472" clip-path="url(#e-lead1-clip)" />`
      }
      <rect x="330" y="375" width="200" height="30" rx="6" fill="#061633" stroke="#38bdf8" stroke-width="1.5" />
      <text x="430" y="396" font-size="17" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(leader1?.name || 'শীর্ষ নেতৃত্ব')}</text>
    </g>

    <!-- Leader 2 -->
    <g class="leader-node" filter="url(#drop-shadow)">
      <defs><clipPath id="e-lead2-clip"><circle cx="770" cy="270" r="95" /></clipPath></defs>
      <circle cx="770" cy="270" r="102" fill="none" stroke="#ffffff" stroke-width="4" />
      <circle cx="770" cy="270" r="97" fill="#081b40" />
      ${
        leader2?.url
          ? `<image href="${escapeXml(leader2.url)}" x="675" y="175" width="190" height="190" preserveAspectRatio="xMidYMid slice" clip-path="url(#e-lead2-clip)" />`
          : `<circle cx="770" cy="270" r="95" fill="#143472" clip-path="url(#e-lead2-clip)" />`
      }
      <rect x="670" y="375" width="200" height="30" rx="6" fill="#061633" stroke="#38bdf8" stroke-width="1.5" />
      <text x="770" y="396" font-size="17" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(leader2?.name || 'শীর্ষ নেতৃত্ব')}</text>
    </g>
  </g>

  <!-- PROMINENT CANDIDATE SPOTLIGHT (Centerpiece) -->
  <g class="candidate-spotlight" transform="translate(600, 560)" filter="url(#drop-shadow)">
    <defs>
      <clipPath id="e-cand-clip"><circle cx="0" cy="0" r="140" /></clipPath>
    </defs>
    <!-- Radiant Halo -->
    <circle cx="0" cy="0" r="154" fill="none" stroke="url(#e-cand-frame)" stroke-width="7" />
    <circle cx="0" cy="0" r="144" fill="#0b245c" />
    ${
      candidate.url
        ? `<image href="${escapeXml(candidate.url)}" x="-140" y="-140" width="280" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#e-cand-clip)" />`
        : `<circle cx="0" cy="0" r="140" fill="#173e87" clip-path="url(#e-cand-clip)" />`
    }
    <circle cx="0" cy="0" r="140" fill="none" stroke="#ffffff" stroke-width="3" />

    <!-- Candidate Badge Ribbon -->
    <rect x="-150" y="150" width="300" height="42" rx="10" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
    <text x="0" y="178" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ★ মনোনীত প্রার্থী ★
    </text>
  </g>

  <!-- BOLD CAMPAIGN HEADLINE: টেক ব্যাক বাংলাদেশ -->
  <g transform="translate(600, 830)" filter="url(#drop-shadow)">
    <text x="0" y="0" font-size="${headlineSize}" font-weight="900" fill="url(#e-gold)" text-anchor="middle" letter-spacing="2">
      ${escapeXml(headline)}
    </text>
  </g>

  <!-- SUBHEADLINE -->
  <text x="600" y="900" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" filter="url(#drop-shadow)">
    ${escapeXml(subHeadline)}
  </text>

  <!-- VOTE FOR / ভোট দিন CALL TO ACTION (Distinct Red Banner) -->
  <g transform="translate(600, 990)" filter="url(#drop-shadow)">
    <rect x="-240" y="-36" width="480" height="72" rx="36" fill="#dc2626" stroke="#ffffff" stroke-width="3" />
    <circle cx="-180" cy="0" r="24" fill="#ffffff" />
    <path d="M -192 -2 L -184 8 L -168 -10" fill="none" stroke="#dc2626" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <text x="20" y="12" font-size="40" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">
      ভোট দিন
    </text>
  </g>

  <!-- CANDIDATE & PROMOTER CREDIT SECTION -->
  <g transform="translate(0, 1260)">
    <rect x="60" y="0" width="1080" height="260" rx="20" fill="#07183d" stroke="#38bdf8" stroke-width="2.5" filter="url(#drop-shadow)" />
    <line x1="80" y1="2" x2="1120" y2="2" stroke="#dc2626" stroke-width="5" stroke-linecap="round" />

    <text x="600" y="48" font-size="20" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">
      প্রচারণায় ও সমর্থনে:
    </text>

    <!-- Candidate / Promoter Name -->
    <text x="600" y="106" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">
      ${escapeXml(opts.promoterName)}
    </text>

    <text x="600" y="154" font-size="26" font-weight="800" fill="#38bdf8" text-anchor="middle">
      ${escapeXml(opts.promoterDesignation)} · ${escapeXml(opts.promoterArea)}
    </text>

    ${
      opts.promoterContact
        ? `<text x="600" y="196" font-size="20" font-weight="600" fill="#fef08a" text-anchor="middle">
            নির্বাচনী কার্যালয় / যোগাযোগ: ${escapeXml(opts.promoterContact)}
          </text>`
        : ''
    }

    <text x="600" y="236" font-size="14" font-weight="600" fill="#64748b" text-anchor="middle">
      জনগণের শক্তি · গণতন্ত্র পুনরুদ্ধার · RISE Poster Engine
    </text>
  </g>
</svg>`;
};

// ─── Category 3: Memorial (শোক / স্মরণ) ────────────────────────────────────────

const renderMemorial = (opts: PosterRenderOptions, width: number, height: number): string => {
  const headline = opts.headline || 'শোকাবহ আগস্ট';
  const subHeadline = opts.subHeadline || 'শ্রদ্ধাঞ্জলি ও স্মরণ অনুষ্ঠান';
  const hlLen = headline.length;
  const headlineSize = hlLen <= 10 ? 82 : hlLen <= 18 ? 68 : hlLen <= 26 ? 54 : 44;

  const centralLeader = opts.leaders[0];
  const sideLeader1 = opts.leaders[1];
  const sideLeader2 = opts.leaders[2];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${getSharedStyles()}

    <!-- Dark Charcoal & Midnight Navy Gradient -->
    <radialGradient id="m-bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#141a29" />
      <stop offset="50%" stop-color="#0a0d14" />
      <stop offset="100%" stop-color="#030406" />
    </radialGradient>

    <!-- Muted Elegant Red Gradient -->
    <linearGradient id="m-red" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fca5a5" />
      <stop offset="50%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <!-- Silver Frame Gradient -->
    <linearGradient id="m-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>

    <!-- White Dove Motif -->
    <g id="m-dove" fill="#ffffff" opacity="0.6">
      <path d="M 0 0 C 15 -18 35 -25 50 -20 C 35 -10 25 5 22 15 C 32 12 45 10 55 12 C 40 22 25 25 15 22 C 10 28 0 35 -15 32 C -5 20 -2 10 0 0 Z" />
    </g>

    <!-- White Rajanigandha / Lily Garland Motif -->
    <g id="m-flower" fill="#ffffff" opacity="0.5">
      <circle cx="0" cy="0" r="4" fill="#fbbf24" />
      <circle cx="0" cy="-10" r="5" />
      <circle cx="9" cy="-4" r="5" />
      <circle cx="6" cy="8" r="5" />
      <circle cx="-6" cy="8" r="5" />
      <circle cx="-9" cy="-4" r="5" />
    </g>
  </defs>

  <!-- Dark Solemn Background -->
  <rect width="${width}" height="${height}" fill="url(#m-bg)" />

  <!-- Soft Vignette Lighting Effect -->
  <circle cx="600" cy="460" r="450" fill="radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" />

  <!-- Subtle Borders -->
  <rect x="25" y="25" width="1150" height="1550" rx="14" fill="none" stroke="#475569" stroke-width="2" opacity="0.6" />
  <rect x="35" y="35" width="1130" height="1530" rx="10" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="10 6" opacity="0.4" />

  <!-- TOP MEMORIAL RIBBON & FLAG WITH BLACK RIBBON -->
  <g transform="translate(600, 85)">
    <!-- Tiny National Flag with Black Mourning Ribbon -->
    <g transform="translate(-160, -18) scale(0.65)">
      <rect x="0" y="0" width="80" height="48" rx="4" fill="#006a4e" />
      <circle cx="36" cy="24" r="16" fill="#f42a41" />
      <!-- Black ribbon overlay across corner -->
      <polygon points="0,0 24,0 0,24" fill="#000000" />
      <line x1="0" y1="0" x2="30" y2="30" stroke="#000000" stroke-width="4" />
    </g>

    <!-- Top Text -->
    <text x="30" y="10" font-size="26" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="3">
      বিনম্র শ্রদ্ধা ও চিরন্তন স্মরণ
    </text>
  </g>

  <!-- FLYING WHITE DOVES (শান্তির প্রতীক পায়রা) -->
  <use href="#m-dove" transform="translate(240, 260) scale(0.9)" />
  <use href="#m-dove" transform="translate(930, 290) scale(-0.75, 0.75)" />

  <!-- MEMORIAL PORTRAITS: 1 Large B&W Central Leader + 2 Smaller Flanking -->
  <g transform="translate(0, 0)">
    <!-- Side Leader 1 (Left) -->
    ${
      sideLeader1
        ? `<g class="side-leader-1" filter="url(#soft-shadow)">
            <defs><clipPath id="m-side1-clip"><circle cx="350" cy="480" r="90" /></clipPath></defs>
            <circle cx="350" cy="480" r="95" fill="none" stroke="#64748b" stroke-width="2.5" />
            <circle cx="350" cy="480" r="90" fill="#0b0e14" />
            ${
              sideLeader1.url
                ? `<image href="${escapeXml(sideLeader1.url)}" x="260" y="390" width="180" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#m-side1-clip)" />`
                : `<circle cx="350" cy="480" r="90" fill="#1e293b" clip-path="url(#m-side1-clip)" />`
            }
            <text x="350" y="598" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle">${escapeXml(sideLeader1.name)}</text>
          </g>`
        : ''
    }

    <!-- Side Leader 2 (Right) -->
    ${
      sideLeader2
        ? `<g class="side-leader-2" filter="url(#soft-shadow)">
            <defs><clipPath id="m-side2-clip"><circle cx="850" cy="480" r="90" /></clipPath></defs>
            <circle cx="850" cy="480" r="95" fill="none" stroke="#64748b" stroke-width="2.5" />
            <circle cx="850" cy="480" r="90" fill="#0b0e14" />
            ${
              sideLeader2.url
                ? `<image href="${escapeXml(sideLeader2.url)}" x="760" y="390" width="180" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#m-side2-clip)" />`
                : `<circle cx="850" cy="480" r="90" fill="#1e293b" clip-path="url(#m-side2-clip)" />`
            }
            <text x="850" y="598" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle">${escapeXml(sideLeader2.name)}</text>
          </g>`
        : ''
    }

    <!-- CENTRAL LEADER (Single Large Black & White Portrait) -->
    <g class="central-bw-leader" filter="url(#drop-shadow)">
      <defs>
        <clipPath id="m-center-clip"><circle cx="600" cy="460" r="140" /></clipPath>
      </defs>
      <!-- Dignified Silver & Charcoal Ring -->
      <circle cx="600" cy="460" r="148" fill="none" stroke="url(#m-silver)" stroke-width="4.5" />
      <circle cx="600" cy="460" r="140" fill="#0b0e14" />
      ${
        centralLeader?.url
          ? `<image href="${escapeXml(centralLeader.url)}" x="460" y="320" width="280" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#m-center-clip)" filter="url(#bw-filter)" />`
          : `<circle cx="600" cy="460" r="140" fill="#1e293b" clip-path="url(#m-center-clip)" />`
      }
      <circle cx="600" cy="460" r="140" fill="none" stroke="#000000" stroke-width="2" />
      <!-- Black Ribbon Badge at Bottom of Portrait -->
      <rect x="470" y="618" width="260" height="36" rx="8" fill="#000000" stroke="#64748b" stroke-width="1.5" />
      <text x="600" y="642" font-size="19" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(centralLeader?.name || 'চিরস্মরণীয় নেতা')}</text>
      ${centralLeader?.designation ? `<text x="600" y="674" font-size="15" font-weight="500" fill="#94a3b8" text-anchor="middle">${escapeXml(centralLeader.designation)}</text>` : ''}
    </g>
  </g>

  <!-- WHITE FLORAL GARLAND (রজনীগন্ধা / সাদা ফুল) -->
  <g transform="translate(600, 715)">
    <use href="#m-flower" x="-120" y="0" />
    <use href="#m-flower" x="-60" y="5" />
    <use href="#m-flower" x="0" y="8" />
    <use href="#m-flower" x="60" y="5" />
    <use href="#m-flower" x="120" y="0" />
    <line x1="-160" y1="0" x2="160" y2="0" stroke="#ffffff" stroke-width="1" opacity="0.3" />
  </g>

  <!-- MUTED ELEGANT RED HEADLINE: শোকাবহ আগস্ট / বিনম্র শ্রদ্ধাঞ্জলি -->
  <g transform="translate(600, 830)" filter="url(#drop-shadow)">
    <text x="0" y="0" font-size="${headlineSize}" font-weight="900" fill="url(#m-red)" text-anchor="middle" letter-spacing="2">
      ${escapeXml(headline)}
    </text>
  </g>

  <!-- SUBHEADLINE -->
  <text x="600" y="900" font-size="32" font-weight="600" fill="#e2e8f0" text-anchor="middle" opacity="0.95">
    ${escapeXml(subHeadline)}
  </text>
  ${
    opts.dateLine
      ? `<text x="600" y="955" font-size="22" font-weight="700" fill="#94a3b8" text-anchor="middle">
          ${escapeXml(opts.dateLine)}
        </text>`
      : ''
  }

  <!-- SOLEMN DIVIDER -->
  <g transform="translate(600, 1020)" opacity="0.4">
    <line x1="-250" y1="0" x2="250" y2="0" stroke="#94a3b8" stroke-width="1.5" />
    <circle cx="0" cy="0" r="4" fill="#94a3b8" />
  </g>

  <!-- REFINED, SIMPLE CREDIT LINE (Understated, respectful) -->
  <g transform="translate(0, 1280)">
    <rect x="80" y="0" width="1040" height="230" rx="16" fill="#080b11" stroke="#334155" stroke-width="1.5" filter="url(#drop-shadow)" />
    <line x1="100" y1="2" x2="1100" y2="2" stroke="#ef4444" stroke-width="3" opacity="0.8" />

    <text x="600" y="44" font-size="18" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="2">
      শ্রদ্ধাবনত চিত্তে:
    </text>

    <!-- Promoter Name -->
    <text x="600" y="100" font-size="40" font-weight="800" fill="#f8fafc" text-anchor="middle">
      ${escapeXml(opts.promoterName)}
    </text>

    <text x="600" y="146" font-size="24" font-weight="600" fill="#cbd5e1" text-anchor="middle">
      ${escapeXml(opts.promoterDesignation)} · ${escapeXml(opts.promoterArea)}
    </text>

    ${
      opts.promoterContact
        ? `<text x="600" y="186" font-size="18" font-weight="400" fill="#64748b" text-anchor="middle">
            ${escapeXml(opts.promoterContact)}
          </text>`
        : ''
    }

    <text x="600" y="215" font-size="13" font-weight="400" fill="#475569" text-anchor="middle">
      চির জাগ্রত স্মৃতি · বিনম্র শ্রদ্ধাঞ্জলি · RISE Poster Engine
    </text>
  </g>
</svg>`;
};

// ─── Category 4: Greetings (শুভেচ্ছা) ──────────────────────────────────────────

const renderGreetings = (opts: PosterRenderOptions, width: number, height: number): string => {
  const accent = opts.accentColor || '#fbbf24';
  const headline = opts.headline || 'ঈদ মোবারক';
  const subHeadline = opts.subHeadline || 'উৎসব ও বিশেষ দিনের শুভেচ্ছা বার্তা';
  const hlLen = headline.length;
  const headlineSize = hlLen <= 8 ? 92 : hlLen <= 14 ? 76 : hlLen <= 22 ? 62 : 48;

  // 3 Smiling Cutout Portraits
  const count = Math.min(opts.leaders.length, 3);
  const leaderConfig =
    count === 1
      ? [{ cx: 600, cy: 450, r: 130 }]
      : count === 2
      ? [{ cx: 430, cy: 450, r: 115 }, { cx: 770, cy: 450, r: 115 }]
      : [{ cx: 330, cy: 450, r: 100 }, { cx: 600, cy: 435, r: 110 }, { cx: 870, cy: 450, r: 100 }];

  const leaderSvg = leaderConfig
    .map((cfg, i) => {
      const leader = opts.leaders[i];
      if (!leader) return '';
      const clipId = `g-leader-clip-${i}`;
      return `
      <g class="leader-node" filter="url(#drop-shadow)">
        <defs><clipPath id="${clipId}"><circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" /></clipPath></defs>
        <!-- Festive Illuminated Ring -->
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 9}" fill="none" stroke="${accent}" stroke-width="4.5" />
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r + 4}" fill="#381005" />
        ${
          leader.url
            ? `<image href="${escapeXml(leader.url)}" x="${cfg.cx - cfg.r}" y="${cfg.cy - cfg.r}" width="${cfg.r * 2}" height="${cfg.r * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`
            : `<circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="#631b07" clip-path="url(#${clipId})" />`
        }
        <circle cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}" fill="none" stroke="#fde047" stroke-width="2.5" />
        <rect x="${cfg.cx - 110}" y="${cfg.cy + cfg.r + 10}" width="220" height="34" rx="8" fill="#200802" stroke="${accent}" stroke-width="1.5" />
        <text x="${cfg.cx}" y="${cfg.cy + cfg.r + 33}" font-size="19" font-weight="800" fill="${accent}" text-anchor="middle">${escapeXml(leader.name || `নেতা ${i + 1}`)}</text>
        ${leader.designation ? `<text x="${cfg.cx}" y="${cfg.cy + cfg.r + 60}" font-size="15" font-weight="600" fill="#ffffff" opacity="0.9" text-anchor="middle">${escapeXml(leader.designation)}</text>` : ''}
      </g>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${getSharedStyles()}

    <!-- Rich Warm Orange / Amber / Golden Brown Gradient -->
    <radialGradient id="g-bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="45%" stop-color="#9a3412" />
      <stop offset="85%" stop-color="#451a03" />
      <stop offset="100%" stop-color="#1f0902" />
    </radialGradient>

    <!-- Festive Gold Typography Gradient -->
    <linearGradient id="g-gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Traditional Alpona Mandala Pattern -->
    <g id="g-mandala" stroke="${accent}" stroke-width="1.2" fill="none" opacity="0.16">
      <circle cx="0" cy="0" r="180" />
      <circle cx="0" cy="0" r="140" stroke-dasharray="8 6" />
      <circle cx="0" cy="0" r="100" />
      <circle cx="0" cy="0" r="60" />
      <!-- Petals -->
      <path d="M 0 -180 C 40 -120 40 -60 0 0 C -40 -60 -40 -120 0 -180 Z" />
      <path d="M 0 180 C 40 120 40 60 0 0 C -40 60 -40 120 0 180 Z" />
      <path d="M -180 0 C -120 40 -60 40 0 0 C -60 -40 -120 -40 -180 0 Z" />
      <path d="M 180 0 C 120 40 60 40 0 0 C 60 -40 120 -40 180 0 Z" />
      <path d="M -127 -127 C -85 -55 -40 -30 0 0 C -30 -40 -55 -85 -127 -127 Z" />
      <path d="M 127 127 C 85 55 40 30 0 0 C 30 40 55 85 127 127 Z" />
      <path d="M -127 127 C -85 55 -40 30 0 0 C -30 40 -55 85 -127 127 Z" />
      <path d="M 127 -127 C 85 -55 40 -30 0 0 C 30 -40 55 -85 127 -127 Z" />
    </g>

    <!-- Crescent Moon & Star Motif (চাঁদ-তারা) -->
    <g id="g-crescent" fill="${accent}" opacity="0.85">
      <path d="M 0 -35 A 35 35 0 1 0 32 18 A 30 30 0 1 1 -2 -22 Z" />
      <!-- Star -->
      <polygon points="18,-18 22,-8 32,-8 24,-2 27,8 18,2 10,8 13,-2 5,-8 15,-8" />
    </g>

    <!-- Festive Sparkle Star -->
    <g id="g-sparkle" fill="${accent}">
      <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" />
    </g>
  </defs>

  <!-- Rich Warm Base -->
  <rect width="${width}" height="${height}" fill="url(#g-bg)" />

  <!-- Radiating Alpona Mandala Texture -->
  <use href="#g-mandala" x="600" y="460" transform="scale(1.4)" />

  <!-- Crescent Moons & Stars in Upper Corners -->
  <use href="#g-crescent" transform="translate(180, 190) scale(1.1)" filter="url(#gold-glow)" />
  <use href="#g-crescent" transform="translate(1020, 190) scale(-1.1, 1.1)" filter="url(#gold-glow)" />

  <!-- Festive Sparkles -->
  <use href="#g-sparkle" transform="translate(300, 310) scale(1.2)" />
  <use href="#g-sparkle" transform="translate(900, 320) scale(1.3)" />
  <use href="#g-sparkle" transform="translate(180, 750) scale(0.9)" />
  <use href="#g-sparkle" transform="translate(1020, 750) scale(1.1)" />
  <use href="#g-sparkle" transform="translate(600, 750) scale(1.5)" />

  <!-- Traditional Decorative Borders -->
  <rect x="25" y="25" width="1150" height="1550" rx="16" fill="none" stroke="${accent}" stroke-width="3.5" opacity="0.85" />
  <rect x="36" y="36" width="1128" height="1528" rx="12" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="14 7" opacity="0.5" />

  <!-- TOP RIBBON -->
  <polygon points="80,60 1120,60 1070,115 130,115" fill="linear-gradient(90deg, transparent, #b45309, ${accent}, #b45309, transparent)" />
  <text x="600" y="98" font-size="28" font-weight="900" fill="#2a0a03" text-anchor="middle" letter-spacing="1">
    ${opts.partyName ? escapeXml(opts.partyName) : 'উৎসবের আনন্দ ছড়িয়ে পড়ুক সবার মাঝে'}
  </text>

  <!-- 3 SMILING CUTOUT PORTRAITS -->
  ${leaderSvg}

  <!-- PLAYFUL FESTIVE HEADLINE: ঈদ মোবারক / শুভ নববর্ষ -->
  <g transform="translate(600, 830)" filter="url(#drop-shadow)">
    <text x="0" y="0" font-size="${headlineSize}" font-weight="900" fill="url(#g-gold)" text-anchor="middle" letter-spacing="2">
      ${escapeXml(headline)}
    </text>
  </g>

  <!-- SUBHEADLINE & DATE -->
  <text x="600" y="900" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" filter="url(#drop-shadow)">
    ${escapeXml(subHeadline)}
  </text>
  ${
    opts.dateLine
      ? `<g transform="translate(600, 960)">
          <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#200802" stroke="${accent}" stroke-width="2" />
          <text x="0" y="8" font-size="22" font-weight="800" fill="${accent}" text-anchor="middle">${escapeXml(opts.dateLine)}</text>
        </g>`
      : ''
  }

  <!-- FESTIVE DIVIDER -->
  <g transform="translate(600, 1030)" opacity="0.85">
    <line x1="-320" y1="0" x2="320" y2="0" stroke="${accent}" stroke-width="2" />
    <use href="#g-sparkle" x="0" y="0" transform="scale(1.4)" />
    <circle cx="-160" cy="0" r="5" fill="${accent}" />
    <circle cx="160" cy="0" r="5" fill="${accent}" />
  </g>

  <!-- COLORFUL & DISTINCT PROFESSIONAL BOTTOM CREDIT BAR -->
  <g transform="translate(0, 1260)">
    <rect x="60" y="0" width="1080" height="260" rx="20" fill="#1f0902" stroke="${accent}" stroke-width="2.5" filter="url(#drop-shadow)" />
    <line x1="80" y1="2" x2="1120" y2="2" stroke="${accent}" stroke-width="5" stroke-linecap="round" />

    <text x="600" y="48" font-size="20" font-weight="700" fill="#fde047" text-anchor="middle" letter-spacing="3">
      — আন্তরিক শুভেচ্ছা ও ভালোবাসায় —
    </text>

    <!-- Promoter Name -->
    <text x="600" y="106" font-size="46" font-weight="900" fill="url(#g-gold)" text-anchor="middle">
      ${escapeXml(opts.promoterName)}
    </text>

    <!-- Designation & Area -->
    <text x="600" y="156" font-size="26" font-weight="800" fill="#ffffff" text-anchor="middle">
      ${escapeXml(opts.promoterDesignation)} · ${escapeXml(opts.promoterArea)}
    </text>

    ${
      opts.promoterContact
        ? `<text x="600" y="198" font-size="20" font-weight="600" fill="#fde047" text-anchor="middle">
            যোগাযোগ: ${escapeXml(opts.promoterContact)}
          </text>`
        : ''
    }

    <text x="600" y="238" font-size="14" font-weight="600" fill="#a8a29e" text-anchor="middle">
      উৎসবের রঙে রাঙুক জীবন · RISE Poster Engine
    </text>
  </g>
</svg>`;
};

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export const generatePosterSvg = (opts: PosterRenderOptions): string => {
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;
  const occasion = (opts.occasionType || '').toLowerCase();

  if (occasion.includes('victory') || occasion.includes('বিজয়')) {
    return renderVictoryDay(opts, width, height);
  }
  if (occasion.includes('election') || occasion.includes('নির্বাচন')) {
    return renderElection(opts, width, height);
  }
  if (occasion.includes('memorial') || occasion.includes('শোক') || occasion.includes('স্মরণ')) {
    return renderMemorial(opts, width, height);
  }
  if (occasion.includes('greeting') || occasion.includes('শুভেচ্ছা') || occasion.includes('ঈদ') || occasion.includes('নববর্ষ')) {
    return renderGreetings(opts, width, height);
  }

  // Fallback to Victory Day style
  return renderVictoryDay(opts, width, height);
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
