// Shared primitives for PDF mockups — 280×157.5mm landscape sheets.
// All positioning in mm via MM constant. Use absolute positioning inside .pdf-sheet.

const MM = 3.78; // 1mm in px at 96dpi

const PDF_COLORS = {
  paper: '#FBF8F0', paper2: '#F2EEE2', card: '#FFFFFF',
  ink: '#0F0E0B', ink2: '#242220',
  muted: '#6C6760', muted2: '#A09A8E',
  line: '#E0D9C7', line2: '#CEC5AE',
  orange: '#FF6A1F', magenta: '#E8358E', teal: '#0DB4A0',
  violet: '#6E4BE8', yellow: '#FFD12A', lime: '#C8E64D',
};
window.PDF_COLORS = PDF_COLORS;
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
  <Abs x={x} y={y} w={w}>
    <div style={{
      fontFamily: 'Anton, Bebas Neue, sans-serif',
      fontSize: size,
      lineHeight: 0.9,
      letterSpacing: '-0.012em',
      textTransform: 'uppercase',
      color,
      whiteSpace: 'nowrap',
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

const PDFHeader = ({ startup, kind, page, total }) => (
  <>
    <PDFLogo size={5 * MM} x={10} y={10}/>
    <Abs x={20} y={10}>
      <div style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 8,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: PDF_COLORS.muted, fontWeight: 500, lineHeight: 1.1, paddingTop: 2,
      }}>
        <span style={{ color: PDF_COLORS.ink, fontWeight: 700 }}>FounderAI</span>
        <span style={{ margin: '0 8px', color: PDF_COLORS.muted2 }}>·</span>
        Livrable · {kind}
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
