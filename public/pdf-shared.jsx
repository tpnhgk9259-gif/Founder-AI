// Shared primitives for PDF mockups — 280×157.5mm landscape sheets.
// All positioning in mm via MM constant. Use absolute positioning inside .pdf-sheet.

const MM = 3.78; // 1mm in px at 96dpi

const PDF_COLORS_DEFAULT = {
  paper: '#FBF8F0', paper2: '#F2EEE2', card: '#FFFFFF',
  ink: '#0F0E0B', ink2: '#242220',
  muted: '#6C6760', muted2: '#A09A8E',
  line: '#E0D9C7', line2: '#CEC5AE',
  orange: '#FF6A1F', magenta: '#E8358E', teal: '#0DB4A0',
  violet: '#6E4BE8', yellow: '#FFD12A', lime: '#C8E64D',
};
const PDF_COLORS = { ...PDF_COLORS_DEFAULT };
window.PDF_COLORS = PDF_COLORS;
window.PDF_COLORS_DEFAULT = PDF_COLORS_DEFAULT;

// ── Color extraction from logo ──────────────────────────────────────
window.applyLogoColors = function applyLogoColors(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) { resolve(false); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64; // downsample for speed
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Collect non-white, non-black, non-transparent pixels
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
        if (a < 128) continue; // skip transparent
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        if (lum < 30 || lum > 230) continue; // skip near-black / near-white
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (sat < 25) continue; // skip grays
        pixels.push([r, g, b]);
      }

      if (pixels.length < 10) { resolve(false); return; }

      // Simple k-means with k=3
      function dist(a, b) { return (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2; }
      let centers = [pixels[0], pixels[Math.floor(pixels.length/3)], pixels[Math.floor(pixels.length*2/3)]];
      for (let iter = 0; iter < 10; iter++) {
        const clusters = [[], [], []];
        pixels.forEach(p => {
          let minD = Infinity, minI = 0;
          centers.forEach((c, i) => { const d = dist(p, c); if (d < minD) { minD = d; minI = i; } });
          clusters[minI].push(p);
        });
        centers = clusters.map((cl, i) => {
          if (!cl.length) return centers[i];
          const avg = [0, 0, 0];
          cl.forEach(p => { avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2]; });
          return avg.map(v => Math.round(v / cl.length));
        });
      }

      // Sort by saturation (most vivid first)
      const sat = (c) => Math.max(...c) - Math.min(...c);
      centers.sort((a, b) => sat(b) - sat(a));

      const toHex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
      // Derive hue-shifted variants for secondary colors
      function hueShift(rgb, degrees) {
        let [r, g, b] = rgb.map(v => v / 255);
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0, s = max === 0 ? 0 : d / max, v = max;
        if (d) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          else if (max === g) h = ((b - r) / d + 2) / 6;
          else h = ((r - g) / d + 4) / 6;
        }
        h = ((h * 360 + degrees) % 360) / 360;
        // HSV to RGB
        const i = Math.floor(h * 6), f = h * 6 - i;
        const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        let ro, go, bo;
        switch (i % 6) {
          case 0: ro = v; go = t; bo = p; break;
          case 1: ro = q; go = v; bo = p; break;
          case 2: ro = p; go = v; bo = t; break;
          case 3: ro = p; go = q; bo = v; break;
          case 4: ro = t; go = p; bo = v; break;
          case 5: ro = v; go = p; bo = q; break;
        }
        return [Math.round(ro * 255), Math.round(go * 255), Math.round(bo * 255)];
      }

      // Lighten a color for lime-like usage
      function lighten(rgb, amount) {
        return rgb.map(v => Math.min(255, Math.round(v + (255 - v) * amount)));
      }

      const primary = centers[0];
      const secondary = centers.length > 1 && sat(centers[1]) > 30 ? centers[1] : hueShift(primary, 150);
      const tertiary = centers.length > 2 && sat(centers[2]) > 30 ? centers[2] : hueShift(primary, 210);

      // Apply to PDF_COLORS
      PDF_COLORS.orange = toHex(primary);
      PDF_COLORS.magenta = toHex(secondary);
      PDF_COLORS.teal = toHex(hueShift(primary, 180));
      PDF_COLORS.violet = toHex(tertiary);
      PDF_COLORS.lime = toHex(lighten(primary, 0.65));
      PDF_COLORS.yellow = toHex(lighten(secondary, 0.5));

      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
};

// Override direct avec une couleur hex choisie manuellement
window.applyBrandColor = function applyBrandColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const primary = [r, g, b];

  function hueShift(rgb, degrees) {
    let [r, g, b] = rgb.map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    h = ((h * 360 + degrees) % 360) / 360;
    const i = Math.floor(h * 6), f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    let ro, go, bo;
    switch (i % 6) {
      case 0: ro = v; go = t; bo = p; break;
      case 1: ro = q; go = v; bo = p; break;
      case 2: ro = p; go = v; bo = t; break;
      case 3: ro = p; go = q; bo = v; break;
      case 4: ro = t; go = p; bo = v; break;
      case 5: ro = v; go = p; bo = q; break;
    }
    return [Math.round(ro * 255), Math.round(go * 255), Math.round(bo * 255)];
  }
  function lighten(rgb, amount) { return rgb.map(v => Math.min(255, Math.round(v + (255 - v) * amount))); }
  const toHex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');

  PDF_COLORS.orange = hex;
  PDF_COLORS.magenta = toHex(hueShift(primary, 150));
  PDF_COLORS.teal = toHex(hueShift(primary, 180));
  PDF_COLORS.violet = toHex(hueShift(primary, 210));
  PDF_COLORS.lime = toHex(lighten(primary, 0.65));
  PDF_COLORS.yellow = toHex(lighten(hueShift(primary, 150), 0.5));
};

window.MM = MM;

// Positioned element in mm coords
const Abs = ({ x = 0, y = 0, w, h, children, style, ...rest }) => (
  <div
    style={{
      position: 'absolute',
      left: x * MM,
      top: y * MM,
      width: w != null ? w * MM : undefined,
      height: h != null ? h * MM : undefined,
      ...style,
    }}
    {...rest}
  >{children}</div>
);

// Display title, all-caps Anton
const Title = ({ x, y, size = 32, color = PDF_COLORS.ink, children, style, w }) => (
  <Abs x={x} y={y} w={w}>
    <div style={{
      fontFamily: 'Anton, Bebas Neue, sans-serif',
      fontSize: size,
      lineHeight: 0.86,
      letterSpacing: '-0.012em',
      textTransform: 'uppercase',
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</div>
  </Abs>
);

// Multi-line title where each line is rendered in normal flow (block).
// Children can be string[], or array of {text, color, size, serif}
const TitleBlock = ({ x, y, size = 32, color = PDF_COLORS.ink, lines = [], style, w }) => (
  <Abs x={x} y={y} style={{ width: w ? w * MM : `calc(100% - ${x * MM}px - ${14 * MM}px)` }}>
    <div style={{
      fontFamily: 'Anton, Bebas Neue, sans-serif',
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: '-0.012em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}>
      {lines.map((ln, i) => {
        if (typeof ln === 'string') {
          return <div key={i}>{ln}</div>;
        }
        return (
          <div key={i} style={{
            fontFamily: ln.serif ? 'Instrument Serif, Georgia, serif' : undefined,
            fontStyle: ln.serif ? 'italic' : undefined,
            fontSize: ln.size || size,
            color: ln.color || color,
            textTransform: ln.serif ? 'none' : 'uppercase',
            letterSpacing: ln.serif ? '-0.01em' : '-0.012em',
            lineHeight: ln.serif ? 1 : 0.9,
            marginTop: ln.mt || 0,
          }}>{ln.text}</div>
        );
      })}
    </div>
  </Abs>
);

// Serif italic accent
const SerifAccent = ({ x, y, size = 20, color = PDF_COLORS.muted, children, style, w }) => (
  <Abs x={x} y={y} w={w}>
    <div style={{
      fontFamily: 'Instrument Serif, Georgia, serif',
      fontStyle: 'italic',
      fontSize: size,
      lineHeight: 1.05,
      letterSpacing: '-0.01em',
      color,
      ...style,
    }}>{children}</div>
  </Abs>
);

// Monospace eyebrow label
const Eyebrow = ({ x, y, size = 8.5, color = PDF_COLORS.muted, accent, children, style }) => (
  <Abs x={x} y={y}>
    <div style={{
      fontFamily: 'Geist Mono, ui-monospace, monospace',
      fontSize: size,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color,
      fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style,
    }}>
      {accent && <span style={{ width: 10, height: 2, background: accent, display: 'inline-block' }}/>}
      {children}
    </div>
  </Abs>
);

// Body text block
const Body = ({ x, y, w, size = 10, lh = 1.55, color = PDF_COLORS.ink, children, style }) => (
  <Abs x={x} y={y} w={w}>
    <div style={{
      fontFamily: 'Geist, sans-serif',
      fontSize: size,
      lineHeight: lh,
      color,
      ...style,
    }}>{children}</div>
  </Abs>
);

// Color slab (rect)
const Slab = ({ x = 0, y = 0, w, h, color, style, children }) => (
  <div style={{
    position: 'absolute',
    left: x * MM, top: y * MM,
    width: w * MM, height: h * MM,
    background: color,
    ...style,
  }}>{children}</div>
);

// Agent token — matches UF system
const AgentToken = ({ agent, size = 10, showLetter = true, style }) => {
  const map = {
    maya:    { bg: PDF_COLORS.orange,  shape: { borderRadius: '50%' }, fg: '#fff', letter: 'M' },
    alex:    { bg: PDF_COLORS.magenta, shape: { borderRadius: '36% 64% 42% 58% / 48% 36% 64% 52%' }, fg: '#fff', letter: 'A' },
    sam:     { bg: PDF_COLORS.teal,    shape: { borderRadius: 3 }, fg: '#fff', letter: 'S' },
    leo:     { bg: PDF_COLORS.violet,  shape: { borderRadius: '50% 50% 14% 14%' }, fg: '#fff', letter: 'L' },
    marc:    { bg: PDF_COLORS.yellow,  shape: { clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)' }, fg: PDF_COLORS.ink, letter: 'M' },
  }[agent] || { bg: PDF_COLORS.ink, shape: { borderRadius: '50%' }, fg: '#fff', letter: '?' };
  return (
    <div style={{
      width: size * MM, height: size * MM,
      background: map.bg, color: map.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Anton, sans-serif', fontSize: size * MM * 0.45,
      ...map.shape, ...style,
    }}>{showLetter ? map.letter : null}</div>
  );
};

// Logo: FoundΞrAI wordmark
const PDFLogo = ({ size = 7 * MM, x, y, color = PDF_COLORS.ink, accent = PDF_COLORS.orange }) => (
  <Abs x={x} y={y}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'Anton, sans-serif',
      fontSize: size * 0.9, color, lineHeight: 1,
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: size, height: size, borderRadius: '50%',
        background: accent, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.62,
      }}>ƒ</span>
    </div>
  </Abs>
);

const PDFHeader = ({ startup, kind, page, total, logo }) => (
  <>
    {logo ? (
      <Abs x={10} y={8.5}>
        <img src={logo} style={{ height: 6 * MM, maxWidth: 20 * MM, objectFit: 'contain' }}/>
      </Abs>
    ) : (
      <Abs x={10} y={9}>
        <div style={{
          width: 5 * MM, height: 5 * MM, borderRadius: '50%',
          background: PDF_COLORS.orange, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif', fontSize: 5 * MM * 0.55,
        }}>{(startup || 'S')[0].toUpperCase()}</div>
      </Abs>
    )}
    <Abs x={logo ? 32 : 20} y={10}>
      <div style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 8,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: PDF_COLORS.muted, fontWeight: 500, lineHeight: 1.1, paddingTop: 2,
      }}>
        <span style={{ color: PDF_COLORS.ink, fontWeight: 700 }}>{startup || 'Startup'}</span>
        <span style={{ margin: '0 8px', color: PDF_COLORS.muted2 }}>·</span>
        {kind}
      </div>
    </Abs>
    {page && (
      <Abs x={260} y={10}>
        <div style={{
          fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 8,
          letterSpacing: '0.12em', color: PDF_COLORS.muted, textAlign: 'right', paddingTop: 2,
          textTransform: 'uppercase',
        }}>
          {String(page).padStart(2,'0')} / {String(total).padStart(2,'0')}
        </div>
      </Abs>
    )}
    {/* Divider */}
    <Slab x={10} y={15.5} w={260} h={0.15} color={PDF_COLORS.line}/>
  </>
);

const PDFFooter = ({ startup, page, total }) => (
  <>
    <Slab x={10} y={148.5} w={260} h={0.15} color={PDF_COLORS.line}/>
    <Abs x={10} y={151}>
      <div style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 7.5,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: PDF_COLORS.muted,
      }}>
        <span style={{ color: PDF_COLORS.ink }}>{startup.toUpperCase()}</span>
        <span style={{ margin: '0 6px', color: PDF_COLORS.muted2 }}>·</span>
        Généré par FounderAI · {new Date().toLocaleDateString('fr-FR')}
      </div>
    </Abs>
    <Abs x={260} y={151}>
      <div style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 7.5,
        letterSpacing: '0.14em', color: PDF_COLORS.muted, textAlign: 'right', textTransform: 'uppercase',
      }}>
        Confidentiel
      </div>
    </Abs>
  </>
);

Object.assign(window, { Abs, Title, TitleBlock, SerifAccent, Eyebrow, Body, Slab, AgentToken, PDFLogo, PDFHeader, PDFFooter });
