import type { PosterRenderOptions } from '../types/poster.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escape a string for safe embedding inside an HTML attribute or text node */
const escHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Build CSS for the leader photo grid (1, 2, or 3 photos) */
const buildLeaderPhotoHtml = (leaders: PosterRenderOptions['leaders']): string => {
  const count = Math.min(leaders.length, 3);
  const photoSize = count === 1 ? 280 : count === 2 ? 240 : 200;
  const borderSize = Math.round(photoSize * 0.035);
  const ringSize = Math.round(photoSize * 0.018);

  return leaders
    .slice(0, count)
    .map(
      (l) => `
    <div class="leader-card">
      <div class="photo-frame" style="width:${photoSize}px;height:${photoSize}px;border-width:${borderSize}px;box-shadow:0 0 0 ${ringSize}px rgba(180,140,0,0.5),0 8px 32px rgba(0,0,0,0.6);">
        <img
          src="${escHtml(l.url)}"
          alt="${escHtml(l.name)}"
          class="leader-img"
          onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#1a6b2a,#0d3d18)'"
        />
        <div class="photo-shine"></div>
      </div>
      <p class="leader-name">${escHtml(l.name)}</p>
      ${l.designation ? `<p class="leader-designation">${escHtml(l.designation)}</p>` : ''}
    </div>`
    )
    .join('\n');
};

/** Create a repeating geometric SVG pattern as a data URI */
const buildPatternDataUri = (accentColor: string): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
    <polygon points='40,4 50,30 78,30 56,48 64,76 40,60 16,76 24,48 2,30 30,30' 
             fill='none' stroke='${accentColor}' stroke-width='0.6' opacity='0.18'/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// ─── Main Template Generator ──────────────────────────────────────────────────

export const generatePosterHtml = (opts: PosterRenderOptions): string => {
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1600;
  const primary = opts.primaryColor ?? '#0a3318';
  const accent = opts.accentColor ?? '#FFD700';
  const overlay = opts.overlayOpacity ?? 0.55;
  const leaderCount = Math.min(opts.leaders.length, 3);
  const patternUri = buildPatternDataUri(accent);

  // Dynamically size headline font based on text length
  const headlineLen = opts.headline.length;
  const headlineFontSize =
    headlineLen <= 10 ? 108 : headlineLen <= 16 ? 90 : headlineLen <= 22 ? 78 : 66;

  const backgroundCss = opts.backgroundImageUrl
    ? `background-image: url('${escHtml(opts.backgroundImageUrl)}'); background-size: cover; background-position: center;`
    : `background: radial-gradient(ellipse 120% 80% at 50% 30%, #1e7a35 0%, ${primary} 55%, #040f07 100%);`;

  return /* html */ `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${width}, height=${height}" />
  <title>Political Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
  <style>
    /* ── Reset ──────────────────────────────────────────────────────── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; }

    /* ── Root Variables ────────────────────────────────────────────── */
    :root {
      --accent: ${accent};
      --accent-dark: #b8860b;
      --accent-glow: rgba(255,215,0,0.35);
      --text-primary: #ffffff;
      --text-accent: ${accent};
      --font-bangla: 'Hind Siliguri', 'Noto Sans Bengali', 'Arial Unicode MS', sans-serif;
    }

    /* ── Poster Container ──────────────────────────────────────────── */
    .poster {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      ${backgroundCss}
      font-family: var(--font-bangla);
      color: var(--text-primary);
    }

    /* ── Background Overlay (when bg image is set) ─────────────────── */
    .bg-overlay {
      position: absolute; inset: 0;
      background: rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, ${overlay});
      z-index: 0;
    }

    /* ── Geometric Pattern Layer ────────────────────────────────────── */
    .pattern-layer {
      position: absolute; inset: 0;
      background-image: url('${patternUri}');
      background-size: 80px 80px;
      z-index: 1;
      pointer-events: none;
    }

    /* ── Decorative Radial Glow ─────────────────────────────────────── */
    .glow-center {
      position: absolute;
      top: 38%; left: 50%;
      transform: translate(-50%, -50%);
      width: 900px; height: 900px;
      background: radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 70%);
      z-index: 1;
    }

    /* ── Corner Ornaments ───────────────────────────────────────────── */
    .corner {
      position: absolute;
      width: 130px; height: 130px;
      z-index: 2;
    }
    .corner svg { width: 100%; height: 100%; }
    .corner-tl { top: 88px; left: 12px; }
    .corner-tr { top: 88px; right: 12px; transform: scaleX(-1); }
    .corner-bl { bottom: 130px; left: 12px; transform: scaleY(-1); }
    .corner-br { bottom: 130px; right: 12px; transform: scale(-1); }

    /* ── Content Stack ──────────────────────────────────────────────── */
    .content {
      position: relative;
      z-index: 3;
      width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── TOP BANNER ─────────────────────────────────────────────────── */
    .top-banner {
      width: 100%;
      background: linear-gradient(90deg, transparent 0%, var(--accent-dark) 15%, var(--accent) 50%, var(--accent-dark) 85%, transparent 100%);
      padding: 14px 60px;
      text-align: center;
      clip-path: polygon(0 0, 100% 0, 97% 100%, 3% 100%);
    }
    .top-banner-text {
      font-size: 34px;
      font-weight: 700;
      color: #0d3318;
      letter-spacing: 0.04em;
      text-shadow: 0 1px 2px rgba(255,255,255,0.3);
    }

    /* ── HORIZONTAL RULE ────────────────────────────────────────────── */
    .divider {
      display: flex;
      align-items: center;
      width: 88%;
      gap: 14px;
      margin: 0 auto;
    }
    .divider-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }
    .divider-diamond {
      width: 10px; height: 10px;
      background: var(--accent);
      transform: rotate(45deg);
      flex-shrink: 0;
    }

    /* ── LEADER PHOTOS SECTION ──────────────────────────────────────── */
    .leaders-section {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: ${leaderCount === 1 ? 0 : leaderCount === 2 ? 80 : 40}px;
      padding: 0 40px;
      margin-top: 24px;
    }
    .leader-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .photo-frame {
      border-radius: 50%;
      border-style: solid;
      border-color: var(--accent);
      overflow: hidden;
      position: relative;
      background: linear-gradient(135deg, #1a6b2a, #0d3d18);
      flex-shrink: 0;
    }
    .leader-img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    /* Shine overlay on photos */
    .photo-shine {
      position: absolute; inset: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
      pointer-events: none;
    }
    .leader-name {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-accent);
      text-align: center;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      max-width: 260px;
      line-height: 1.2;
    }
    .leader-designation {
      font-size: 20px;
      font-weight: 400;
      color: rgba(255,255,255,0.85);
      text-align: center;
      max-width: 240px;
      line-height: 1.2;
    }

    /* ── HEADLINE ───────────────────────────────────────────────────── */
    .headline-section {
      width: 100%;
      text-align: center;
      padding: 0 60px;
    }
    .headline {
      font-size: ${headlineFontSize}px;
      font-weight: 900;
      line-height: 1.15;
      background: linear-gradient(180deg, #ffffff 0%, var(--accent) 60%, #e0a800 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
      letter-spacing: 0.01em;
    }
    .sub-headline {
      font-size: 40px;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
      margin-top: 14px;
      letter-spacing: 0.02em;
    }
    .date-line {
      font-size: 34px;
      font-weight: 600;
      color: var(--accent);
      margin-top: 10px;
      letter-spacing: 0.05em;
    }

    /* ── DECORATIVE CENTER GRAPHIC ──────────────────────────────────── */
    .center-graphic {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .center-graphic svg {
      opacity: 0.12;
    }

    /* ── BOTTOM BANNER ──────────────────────────────────────────────── */
    .bottom-banner {
      width: 100%;
      background: linear-gradient(90deg, #000000 0%, #111111 30%, #1a1a1a 50%, #111111 70%, #000000 100%);
      border-top: 3px solid var(--accent);
      padding: 20px 60px;
      text-align: center;
      position: relative;
      flex-shrink: 0;
    }
    .bottom-banner::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }
    .banner-label {
      font-size: 22px;
      font-weight: 400;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .banner-name {
      font-size: 38px;
      font-weight: 700;
      color: var(--accent);
      line-height: 1.2;
    }
    .banner-detail {
      font-size: 26px;
      font-weight: 400;
      color: rgba(255,255,255,0.85);
      margin-top: 4px;
    }
    .banner-contact {
      font-size: 22px;
      font-weight: 300;
      color: rgba(255,255,255,0.6);
      margin-top: 4px;
    }
  </style>
</head>
<body>
<div class="poster">

  ${opts.backgroundImageUrl ? '<div class="bg-overlay"></div>' : ''}
  <div class="pattern-layer"></div>
  <div class="glow-center"></div>

  <!-- Corner ornaments -->
  <div class="corner corner-tl">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,5 L5,60 Q5,95 40,95 L95,95" stroke="${accent}" stroke-width="2.5" fill="none"/>
      <path d="M5,5 L5,45 Q5,80 35,80 L95,80" stroke="${accent}" stroke-width="1" fill="none" opacity="0.4"/>
      <circle cx="5" cy="5" r="5" fill="${accent}"/>
      <circle cx="95" cy="95" r="3" fill="${accent}" opacity="0.6"/>
    </svg>
  </div>
  <div class="corner corner-tr">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,5 L5,60 Q5,95 40,95 L95,95" stroke="${accent}" stroke-width="2.5" fill="none"/>
      <path d="M5,5 L5,45 Q5,80 35,80 L95,80" stroke="${accent}" stroke-width="1" fill="none" opacity="0.4"/>
      <circle cx="5" cy="5" r="5" fill="${accent}"/>
      <circle cx="95" cy="95" r="3" fill="${accent}" opacity="0.6"/>
    </svg>
  </div>
  <div class="corner corner-bl">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,5 L5,60 Q5,95 40,95 L95,95" stroke="${accent}" stroke-width="2.5" fill="none"/>
      <path d="M5,5 L5,45 Q5,80 35,80 L95,80" stroke="${accent}" stroke-width="1" fill="none" opacity="0.4"/>
      <circle cx="5" cy="5" r="5" fill="${accent}"/>
      <circle cx="95" cy="95" r="3" fill="${accent}" opacity="0.6"/>
    </svg>
  </div>
  <div class="corner corner-br">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,5 L5,60 Q5,95 40,95 L95,95" stroke="${accent}" stroke-width="2.5" fill="none"/>
      <path d="M5,5 L5,45 Q5,80 35,80 L95,80" stroke="${accent}" stroke-width="1" fill="none" opacity="0.4"/>
      <circle cx="5" cy="5" r="5" fill="${accent}"/>
      <circle cx="95" cy="95" r="3" fill="${accent}" opacity="0.6"/>
    </svg>
  </div>

  <!-- Main Content -->
  <div class="content">

    <!-- TOP BANNER -->
    <div class="top-banner">
      <p class="top-banner-text">${escHtml(opts.partyName ?? '✦ জনগণের সেবায় অঙ্গীকারবদ্ধ ✦')}</p>
    </div>

    <!-- LEADER PHOTOS -->
    <div class="leaders-section" style="margin-top:${leaderCount > 0 ? 28 : 0}px;">
      ${buildLeaderPhotoHtml(opts.leaders)}
    </div>

    <!-- Divider -->
    <div class="divider" style="margin-top:28px;">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-diamond"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
    </div>

    <!-- HEADLINE -->
    <div class="headline-section" style="margin-top:24px;">
      <h1 class="headline">${escHtml(opts.headline)}</h1>
      ${opts.subHeadline ? `<p class="sub-headline">${escHtml(opts.subHeadline)}</p>` : ''}
      ${opts.dateLine ? `<p class="date-line">✦ ${escHtml(opts.dateLine)} ✦</p>` : ''}
    </div>

    <!-- Divider -->
    <div class="divider" style="margin-top:24px;">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-diamond"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
    </div>

    <!-- CENTER DECORATIVE GRAPHIC (stylised map / sun) -->
    <div class="center-graphic">
      <svg width="700" height="420" viewBox="0 0 700 420" xmlns="http://www.w3.org/2000/svg">
        <!-- Radial sun burst -->
        <g transform="translate(350,210)">
          ${Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x2 = Math.cos(rad) * 190;
            const y2 = Math.sin(rad) * 190;
            return `<line x1="0" y1="0" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${accent}" stroke-width="1.5"/>`;
          }).join('\n          ')}
          <circle cx="0" cy="0" r="80" fill="none" stroke="${accent}" stroke-width="2"/>
          <circle cx="0" cy="0" r="120" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="8,6"/>
          <circle cx="0" cy="0" r="160" fill="none" stroke="${accent}" stroke-width="0.8" stroke-dasharray="4,8"/>
          <circle cx="0" cy="0" r="190" fill="none" stroke="${accent}" stroke-width="0.5"/>
          <!-- Inner star -->
          <polygon points="0,-55 13,-18 52,-18 22,8 34,46 0,26 -34,46 -22,8 -52,-18 -13,-18"
                   fill="${accent}" opacity="0.9"/>
        </g>
      </svg>
    </div>

    <!-- SPACER -->
    <div style="flex:1;"></div>

    <!-- BOTTOM PROMOTIONAL BANNER -->
    <div class="bottom-banner">
      <p class="banner-label">প্রচারে</p>
      <p class="banner-name">${escHtml(opts.promoterName)}</p>
      <p class="banner-detail">${escHtml(opts.promoterDesignation)} | ${escHtml(opts.promoterArea)}</p>
      ${opts.promoterContact ? `<p class="banner-contact">${escHtml(opts.promoterContact)}</p>` : ''}
    </div>

  </div><!-- /content -->
</div><!-- /poster -->
</body>
</html>`;
};
