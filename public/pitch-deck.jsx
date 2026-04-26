// Pitch Deck — 12 slides, 280×157.5mm paysage, startup = Lumen.
// Structure VC classique : cover · problème · solution · marché · produit · traction · business model
//                         · concurrence · équipe · usage des fonds · roadmap · contact

// Helper : lire une valeur du formulaire avec fallback
const V = (key, fallback = '') => (window.FORM_VALUES && window.FORM_VALUES[key]) || fallback;

// Helper : découper un titre long en lignes de max N caractères
function splitTitle(text, maxChars = 35) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

// Helper : taille auto selon longueur du texte
function autoSize(text, baseSize = 40) {
  if (!text) return baseSize;
  const len = text.length;
  if (len < 30) return baseSize;
  if (len < 50) return Math.round(baseSize * 0.9);
  if (len < 80) return Math.round(baseSize * 0.8);
  if (len < 120) return Math.round(baseSize * 0.7);
  return Math.round(baseSize * 0.6);
}

const LUMEN = {
  name: 'Lumen',
  tagline: 'Le guide énergétique des restaurants indépendants.',
  oneliner: 'Baisser de 30 % la facture d\'électricité des 150 000 restaurants français.',
  stage: 'Pré-seed · Recherche 800 k€',
  founders: [
    { name: 'Juliette Moreau', role: 'CEO · Ex-Sowee (EDF)', photo: 'magenta' },
    { name: 'Thomas Vidal',    role: 'CTO · Ex-Back Market', photo: 'violet' },
    { name: 'Nadia Benhamou',  role: 'COO · Ex-Frichti',    photo: 'teal' },
  ],
};

// ── SLIDE 01 · Cover ────────────────────────────────────────────────
const SlideCover = ({ s = LUMEN }) => (
  <div className="pdf-sheet">
    {/* Color slab right */}
    <div style={{ position: 'absolute', right: 0, top: 0, width: 108 * MM, height: '100%', background: PDF_COLORS.orange }}/>
    <Slab x={172} y={100} w={90} h={50} color="rgba(255,255,255,0.08)"/>
    <div style={{ position: 'absolute', right: 20 * MM, top: 20 * MM, width: 72 * MM, height: 110 * MM, border: '1px solid rgba(255,255,255,0.28)', overflow: 'hidden' }}>
      {V('cover_image') && <img src={V('cover_image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
    </div>

    {/* Decorative huge rounded shape */}
    <div style={{ position: 'absolute', left: -30 * MM, bottom: -40 * MM, width: 120 * MM, height: 120 * MM, borderRadius: '50%', background: PDF_COLORS.lime, opacity: 0.25 }}/>

    {V('startup_logo') ? (
      <Abs x={14} y={12.5}>
        <img src={V('startup_logo')} style={{ height: 6 * MM, maxWidth: 20 * MM, objectFit: 'contain' }}/>
      </Abs>
    ) : (
      <Abs x={14} y={13}>
        <div style={{
          width: 5.5 * MM, height: 5.5 * MM, borderRadius: '50%',
          background: PDF_COLORS.orange, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif', fontSize: 5.5 * MM * 0.55,
        }}>{((V('startupName') || s.name)[0] || 'S').toUpperCase()}</div>
      </Abs>
    )}
    <Abs x={V('startup_logo') ? 36 : 24} y={14}>
      <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, paddingTop: 2 }}>
        <span style={{ color: PDF_COLORS.ink, fontWeight: 700 }}>{V('startupName') || s.name}</span>
        <span style={{ margin: '0 8px', color: PDF_COLORS.muted2 }}>·</span>
        Pitch Deck
      </div>
    </Abs>

    <Eyebrow x={14} y={48} size={9} accent={PDF_COLORS.orange}>{V('stage', s.stage)}</Eyebrow>
    <Title x={14} y={58} size={82} color={PDF_COLORS.ink}>{(V('startupName') || s.name).toUpperCase()}</Title>
    <SerifAccent x={14} y={92} size={22} color={PDF_COLORS.muted} w={140}>{V('tagline', s.tagline)}</SerifAccent>

    <Abs x={14} y={126}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: `${2 * MM}px ${4 * MM}px`,
        background: PDF_COLORS.ink, color: PDF_COLORS.paper,
        borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        <span style={{ width: 7, height: 7, background: PDF_COLORS.lime, borderRadius: '50%' }}/>
        Deck confidentiel
      </div>
    </Abs>

    {/* Logo startup en grand, bas-gauche de la séparation */}
    {V('startup_logo') ? (
      <Abs x={130} y={110}>
        <img src={V('startup_logo')} style={{ height: 30 * MM, maxWidth: 40 * MM, objectFit: 'contain' }}/>
      </Abs>
    ) : (
      <Abs x={130} y={110}>
        <div style={{
          width: 30 * MM, height: 30 * MM, borderRadius: '50%',
          background: PDF_COLORS.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif', fontSize: 30 * MM * 0.5, color: PDF_COLORS.ink,
        }}>{((V('startupName') || s.name)[0] || 'S').toUpperCase()}</div>
      </Abs>
    )}

    <Abs x={178} y={132}>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}>contact</div>
      <div style={{ color: '#fff', fontSize: 10.5, marginTop: 3, fontWeight: 500 }}>{V('contact_email', 'email@startup.com')}{V('contact_phone') ? ` · ${V('contact_phone')}` : ''}</div>
    </Abs>
  </div>
);

// ── SLIDE 02 · Problème ────────────────────────────────────────────
const SlideProblem = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.magenta}>01 — Le problème</Eyebrow>

    <TitleBlock x={14} y={30} size={autoSize(V('problem_title', 'LE PROBLÈME'))} lines={[
      { text: V('problem_title', 'LE PROBLÈME') },
    ]}/>

    {/* Left stats */}
    <Abs x={14} y={72}>
      <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: PDF_COLORS.magenta, lineHeight: 0.9 }}>{V('stat1_value', '18 %')}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: PDF_COLORS.muted, marginTop: 6, width: 58 * MM, lineHeight: 1.35 }}>
        {V('stat1_label', 'Statistique clé sur le problème identifié.')}
      </div>
    </Abs>

    <Abs x={76} y={72}>
      <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: PDF_COLORS.teal, lineHeight: 0.9 }}>{V('stat2_value', '28 h')}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: PDF_COLORS.muted, marginTop: 6, width: 54 * MM, lineHeight: 1.35 }}>
        {V('stat2_label', 'par mois perdues à analyser les factures.')}
      </div>
    </Abs>

    {/* Right : quote */}
    <div style={{ position: 'absolute', right: 14 * MM, top: 72 * MM, width: 120 * MM, padding: 5 * MM, background: PDF_COLORS.paper2, borderLeft: `4px solid ${PDF_COLORS.ink}`, borderRadius: 4 }}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 500 }}>{V('quote_source', 'Source')}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, marginTop: 8, lineHeight: 1.45, color: PDF_COLORS.ink }}>
        {V('quote_text', 'Le problème vu par vos utilisateurs.')}
      </div>
    </div>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 03 · Solution ────────────────────────────────────────────
const SlideSolution = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.teal}>02 — La solution</Eyebrow>

    <TitleBlock x={14} y={30} size={autoSize(V('solution_title', 'NOTRE SOLUTION'))} lines={[
      { text: V('solution_title', 'NOTRE SOLUTION') },
    ]}/>

    {/* 3-step flow */}
    <div style={{ position: 'absolute', left: 14 * MM, top: 68 * MM, width: 252 * MM, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 * MM }}>
      {[
        { n: '01', color: PDF_COLORS.orange, t: V('pillar1_title', 'Pilier 1'),  d: V('pillar1_desc', 'Description du premier pilier de la solution.') },
        { n: '02', color: PDF_COLORS.teal,    t: V('pillar2_title', 'Pilier 2'),   d: V('pillar2_desc', 'Description du deuxième pilier.') },
        { n: '03', color: PDF_COLORS.violet,  t: V('pillar3_title', 'Pilier 3'),       d: V('pillar3_desc', 'Description du troisième pilier.') },
      ].map(st => (
        <div key={st.n} style={{
          padding: `${4 * MM}px ${4 * MM}px`, background: PDF_COLORS.card,
          border: `1px solid ${PDF_COLORS.line}`, borderRadius: 8, position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 12 * MM, height: 0.8 * MM, background: st.color }}/>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8.5, color: st.color, letterSpacing: '0.16em', fontWeight: 700 }}>{st.n}</div>
          <div style={{ fontFamily: 'Anton', fontSize: 22, marginTop: 2 * MM, lineHeight: 0.95, textTransform: 'uppercase' }}>{st.t}</div>
          <div style={{ fontSize: 10, color: PDF_COLORS.muted, marginTop: 2 * MM, lineHeight: 1.5 }}>{st.d}</div>
        </div>
      ))}
    </div>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 04 · Marché ──────────────────────────────────────────────
const SlideMarket = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.violet}>03 — Le marché</Eyebrow>

    {(() => {
      const marketTitle = V('market_size') ? `Un marche de ${V('market_size')} ${V('market_geo', '')}` : 'Un premier TAM de 1,8 Md en France.';
      return <TitleBlock x={14} y={30} size={autoSize(marketTitle, 36)} lines={[
        { text: marketTitle },
      ]}/>;
    })()}

    {/* Horizontal bars — TAM / SAM / SOM (dégressives) */}
    <Abs x={14} y={46}>
      <div style={{ width: 252 * MM, display: 'flex', flexDirection: 'column', gap: 2.5 * MM }}>
        {[
          { k: 'TAM', name: V('tam_label', 'Marché total'),      sub: '',            big: V('tam_value', '1,8'), unit: V('tam_value','').includes('Md') ? '' : 'Md€', widthPct: 100, bg: '#EFEBE0', border: '#C9C2B0', ink: PDF_COLORS.ink,    eyebrow: PDF_COLORS.muted,  textColor: PDF_COLORS.ink },
          { k: 'SAM', name: V('sam_label', 'Marché adressable'),       sub: '',     big: V('sam_value', '720'), unit: V('sam_value','').includes('M') ? '' : 'M€',  widthPct: 60,  bg: 'rgba(122, 90, 242, 0.14)', border: PDF_COLORS.violet, ink: PDF_COLORS.violet, eyebrow: PDF_COLORS.violet, textColor: PDF_COLORS.violet },
          { k: 'SOM', name: V('som_label', 'Objectif 3 ans'), sub: '', big: V('som_value', '48'),  unit: V('som_value','').includes('M') ? '' : 'M€',  widthPct: 28,  bg: PDF_COLORS.orange,            border: PDF_COLORS.orange, ink: '#fff',            eyebrow: '#fff',            textColor: '#fff' },
        ].map((r) => (
          <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 6 * MM }}>
            {/* Bar */}
            <div style={{
              width: `${r.widthPct}%`, minHeight: 14 * MM,
              background: r.bg, border: `1px solid ${r.border}`, borderRadius: 3,
              padding: `${2 * MM}px ${4 * MM}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 * MM,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2.5 * MM }}>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: r.eyebrow, fontWeight: 700 }}>{r.k}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: r.textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                </div>
                <div style={{ fontSize: 9, color: r.k === 'SOM' ? 'rgba(255,255,255,0.85)' : PDF_COLORS.muted, marginTop: 0.5 * MM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1.5 * MM, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Anton', fontSize: r.k === 'TAM' ? 36 : r.k === 'SAM' ? 30 : 26, color: r.ink, lineHeight: 0.85 }}>{r.big}</span>
                <span style={{ fontFamily: 'Anton', fontSize: r.k === 'TAM' ? 20 : r.k === 'SAM' ? 18 : 16, color: r.ink }}>{r.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Abs>

    {/* Supporting metrics */}
    <Abs x={14} y={118}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 * MM, width: 252 * MM }}>
        {[
          ['Croissance du marché', '+12 %/an', 'Digitalisation des indépendants, sortie COVID, décret tertiaire.', PDF_COLORS.magenta],
          ['Pénétration visée',    '6,7 %',    '4 800 restos payants sur le SAM à horizon 36 mois.',               PDF_COLORS.teal],
          ['Next market',          'Benelux',  '32 000 restos comparables · ouverture S2 2027.',                    PDF_COLORS.violet],
        ].map(([kpiLabel, big, note, c]) => (
          <div key={kpiLabel} style={{
            padding: `${3 * MM}px ${4 * MM}px`,
            background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderLeft: `3px solid ${c}`, borderRadius: 4,
          }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>{kpiLabel}</div>
            <div style={{ fontFamily: 'Anton', fontSize: 24, color: c, lineHeight: 0.9, marginTop: 1 * MM, whiteSpace: 'nowrap' }}>{big}</div>
            <div style={{ fontSize: 10, color: PDF_COLORS.muted, lineHeight: 1.45, marginTop: 1.5 * MM }}>{note}</div>
          </div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 05 · Produit ──────────────────────────────────────────────
const SlideProduct = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>04 — Le produit</Eyebrow>
    <TitleBlock x={14} y={30} size={autoSize(V('product_title', '3 MINUTES POUR SAVOIR QUOI FAIRE.'))} lines={[
      { text: V('product_title', '3 MINUTES POUR SAVOIR QUOI FAIRE.') },
    ]}/>

    {/* App screen mock — simplified phone */}
    <div style={{
      position: 'absolute', left: 14 * MM, top: 62 * MM,
      width: 82 * MM, height: 74 * MM,
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${PDF_COLORS.line}`, background: PDF_COLORS.paper2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {V('product_image') ? (
        <img src={V('product_image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
      ) : (
        <div style={{ textAlign: 'center', color: PDF_COLORS.muted }}>
          <div style={{ fontSize: 28 }}>🖼️</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 * MM }}>Image produit</div>
        </div>
      )}
    </div>

    {/* Right : 3 capabilities */}
    <Abs x={108} y={62}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM }}>
        {[
          [V('feature1_title', 'Feature 1'), V('feature1_desc', 'Description de la feature 1'), PDF_COLORS.orange],
          [V('feature2_title', 'Feature 2'), V('feature2_desc', 'Description de la feature 2'), PDF_COLORS.magenta],
          [V('feature3_title', 'Feature 3'), V('feature3_desc', 'Description de la feature 3'), PDF_COLORS.teal],
          V('feature4_title') && [V('feature4_title'), V('feature4_desc', ''), PDF_COLORS.violet],
          V('feature5_title') && [V('feature5_title'), V('feature5_desc', ''), PDF_COLORS.yellow],
        ].filter(Boolean).map(([t, d, c]) => (
          <div key={t} style={{
            padding: `${2.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.card,
            border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6,
            display: 'grid', gridTemplateColumns: '40mm 1fr', gap: 2.5 * MM, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 * MM }}>
              <div style={{ width: 2 * MM, height: 6 * MM, background: c }}/>
              <div style={{ fontFamily: 'Anton', fontSize: 15, textTransform: 'uppercase', lineHeight: 1 }}>{t}</div>
            </div>
            <div style={{ fontSize: 9.5, color: PDF_COLORS.muted, lineHeight: 1.45 }}>{d}</div>
          </div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 06 · Traction ────────────────────────────────────────────
const SlideTraction = ({ s = LUMEN, n, total }) => {
  // Build chart data from form fields, filter out empty entries
  const chartData = [1,2,3,4,5,6].map(i => ({
    month: V(`chart_m${i}`, ['Nov','Dec','Jan','Fev','Mar','Avr'][i-1] || ''),
    value: parseFloat(V(`chart_v${i}`, '0')) || 0,
  })).filter(d => d.month);
  const max = Math.max(...chartData.map(d => d.value), 1);
  const chartLabel = V('chart_label', 'MRR (€)');
  const chartPeriod = V('chart_period', '');
  return (
    <div className="pdf-sheet">
      <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
      <Eyebrow x={14} y={22} accent={PDF_COLORS.lime}>05 — Traction</Eyebrow>
      <TitleBlock x={14} y={30} size={autoSize(V('traction_title', '6 MOIS, 38 CLIENTS PAYANTS.'))} lines={[
        { text: V('traction_title', '6 MOIS, 38 CLIENTS PAYANTS.') },
      ]}/>

      {/* Chart */}
      <Abs x={14} y={50}>
        <div style={{ width: 140 * MM, height: 72 * MM, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6, padding: 4 * MM, position: 'relative' }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>{chartLabel}{chartPeriod ? ` · ${chartPeriod}` : ''}</div>
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '82%', marginTop: 2 * MM, display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <line key={p} x1="30" y1={20 + p * 140} x2="400" y2={20 + p * 140} stroke={PDF_COLORS.line} strokeWidth={0.5}/>
            ))}
            {chartData.map((d, i) => {
              const bw = Math.min(50, Math.max(30, 300 / chartData.length));
              const gap = (360 - chartData.length * bw) / Math.max(chartData.length - 1, 1);
              const x = 40 + i * (bw + gap);
              const h = (d.value / max) * 140;
              const y = 160 - h;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={bw} height={h} fill={i === chartData.length - 1 ? PDF_COLORS.orange : PDF_COLORS.ink}/>
                  <text x={x + bw / 2} y={175} fontFamily="Geist Mono" fontSize="9" fill={PDF_COLORS.muted} textAnchor="middle" letterSpacing="0.1em">{d.month}</text>
                  {d.value > 0 && <text x={x + bw / 2} y={y - 4} fontFamily="Anton" fontSize="13" fill={PDF_COLORS.ink} textAnchor="middle">{d.value}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </Abs>

      {/* KPI cards right */}
      <Abs x={162} y={50}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM, width: 104 * MM }}>
          {[
            [V('kpi1_value', '+87 %'), V('kpi1_label', 'KPI 1'), PDF_COLORS.orange],
            [V('kpi2_value', '9 180€'), V('kpi2_label', 'KPI 2'), PDF_COLORS.teal],
            [V('kpi3_value', '38 / 45'), V('kpi3_label', 'KPI 3'), PDF_COLORS.violet],
            [V('kpi4_value', '94 %'), V('kpi4_label', 'KPI 4'), PDF_COLORS.magenta],
          ].map(([big, label, c]) => (
            <div key={label} style={{
              padding: `${2 * MM}px ${3 * MM}px`, background: PDF_COLORS.card,
              border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6,
              display: 'grid', gridTemplateColumns: '28mm 1fr', alignItems: 'center', gap: 2 * MM,
            }}>
              <div style={{ fontFamily: 'Anton', fontSize: 22, color: c, lineHeight: 0.9 }}>{big}</div>
              <div style={{ fontSize: 9, color: PDF_COLORS.muted, lineHeight: 1.45 }}>{label}</div>
            </div>
          ))}
        </div>
      </Abs>

      <PDFFooter startup={s.name} page={n} total={total}/>
    </div>
  );
};

// ── SLIDE 07 · Business Model ───────────────────────────────────────
const SlideBusiness = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.yellow}>06 — Business model</Eyebrow>
    <TitleBlock x={14} y={30} size={autoSize(V('bm_title', 'BUSINESS MODEL'))} lines={[
      { text: V('bm_title', 'BUSINESS MODEL') },
    ]}/>

    {/* Pricing tiers */}
    <Abs x={14} y={62}>
      {(() => {
        const plans = [
          { t: V('plan1_name', 'Offre 1'), p: V('plan1_price', ''), bg: PDF_COLORS.card, ink: PDF_COLORS.ink, cap: V('plan1_desc', '') },
          { t: V('plan2_name', 'Offre 2'), p: V('plan2_price', ''), bg: PDF_COLORS.ink, ink: PDF_COLORS.paper, cap: V('plan2_desc', ''), featured: true },
          V('plan3_name') && { t: V('plan3_name'), p: V('plan3_price', ''), bg: PDF_COLORS.card, ink: PDF_COLORS.ink, cap: V('plan3_desc', '') },
          V('plan4_name') && { t: V('plan4_name'), p: V('plan4_price', ''), bg: PDF_COLORS.card, ink: PDF_COLORS.ink, cap: V('plan4_desc', '') },
        ].filter(Boolean);
        const cols = plans.length;
        return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 * MM, width: 252 * MM }}>
        {plans.map(plan => (
          <div key={plan.t} style={{
            padding: `${4 * MM}px ${4 * MM}px`,
            background: plan.bg, color: plan.ink,
            border: `1px solid ${plan.featured ? PDF_COLORS.ink : PDF_COLORS.line}`,
            borderRadius: 8, height: 46 * MM, position: 'relative',
          }}>
            {plan.featured && (
              <div style={{ position: 'absolute', top: -3 * MM, right: 4 * MM, padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.lime, color: PDF_COLORS.ink, fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999 }}>★ Le plus pris</div>
            )}
            <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.7 }}>{plan.cap}</div>
            <div style={{ fontFamily: 'Anton', fontSize: 28, marginTop: 2 * MM, textTransform: 'uppercase' }}>{plan.t}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 * MM, marginTop: 3 * MM }}>
              <div style={{ fontFamily: 'Anton', fontSize: 44, lineHeight: 0.9 }}>{plan.p}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, opacity: 0.7 }}>/ mois · HT</div>
            </div>
          </div>
        ))}
      </div>;
      })()}
    </Abs>

    {/* CAC/LTV inline metrics */}
    <Abs x={14} y={125}>
      <div style={{ display: 'flex', gap: 6 * MM, fontFamily: 'Geist, sans-serif' }}>
        {[
          ['CAC', V('cac_value', '42 €'), ''],
          ['LTV', V('ltv_value', '3 860 €'), ''],
          ['RATIO', V('ltv_cac_ratio', '91:1'), ''],
          ['COGS', V('cogs_value', '8 %'), ''],
        ].map(([k, v, d]) => (
          <div key={k} style={{ minWidth: 48 * MM }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', color: PDF_COLORS.muted, fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontFamily: 'Anton', fontSize: 28, lineHeight: 0.9, marginTop: 1 * MM }}>{v}</div>
            <div style={{ fontSize: 9, color: PDF_COLORS.muted, marginTop: 1 * MM, lineHeight: 1.45 }}>{d}</div>
          </div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 08 · Concurrence ──────────────────────────────────────────
const SlideCompet = ({ s = LUMEN, n, total }) => {
  const criteria = [V('criteria1','Prix'), V('criteria2','Simplicite'), V('criteria3','Couverture'), V('criteria4','Support'), V('criteria5')].filter(Boolean);
  const actors = [
    { name: V('comp1_name', 'Concurrent 1'), scores: (V('comp1_scores','1,1,1,1,1')).split(',').map(Number), highlight: false },
    { name: V('comp2_name', 'Concurrent 2'), scores: (V('comp2_scores','1,1,1,1,1')).split(',').map(Number), highlight: false },
    V('comp3_name') && { name: V('comp3_name'), scores: (V('comp3_scores','1,1,1,1,1')).split(',').map(Number), highlight: false },
    { name: V('startupName') || s.name, scores: (V('our_scores','3,3,3,3,3')).split(',').map(Number), highlight: true },
  ].filter(Boolean);
  const stars = (n) => { const s = Math.min(3, Math.max(0, n || 0)); return '★'.repeat(s) + '☆'.repeat(3 - s); };

  return (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.magenta}>07 — Concurrence</Eyebrow>
    <Title x={14} y={30} size={36}>{V('comp_title', 'CONCURRENCE')}</Title>

    {/* Tableau comparatif avec etoiles */}
    <Abs x={14} y={50}>
      <div style={{ width: 252 * MM }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Geist, sans-serif', fontSize: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: `${2 * MM}px ${3 * MM}px`, fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, borderBottom: `2px solid ${PDF_COLORS.ink}` }}></th>
              {criteria.map(c => (
                <th key={c} style={{ textAlign: 'center', padding: `${2 * MM}px ${2 * MM}px`, fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, borderBottom: `2px solid ${PDF_COLORS.ink}` }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actors.map((a, i) => (
              <tr key={a.name} style={{ background: a.highlight ? PDF_COLORS.orange : i % 2 === 0 ? PDF_COLORS.card : PDF_COLORS.paper }}>
                <td style={{
                  padding: `${2.5 * MM}px ${3 * MM}px`,
                  fontFamily: 'Anton', fontSize: a.highlight ? 16 : 13, textTransform: 'uppercase',
                  color: a.highlight ? '#fff' : PDF_COLORS.ink,
                  borderBottom: `1px solid ${a.highlight ? 'transparent' : PDF_COLORS.line}`,
                  whiteSpace: 'nowrap',
                }}>{a.name}</td>
                {criteria.map((c, ci) => (
                  <td key={c} style={{
                    textAlign: 'center', padding: `${2.5 * MM}px ${2 * MM}px`,
                    fontSize: 12, letterSpacing: 1,
                    color: a.highlight ? '#fff' : (a.scores[ci] >= 3 ? PDF_COLORS.orange : a.scores[ci] >= 2 ? PDF_COLORS.ink : PDF_COLORS.muted2),
                    borderBottom: `1px solid ${a.highlight ? 'transparent' : PDF_COLORS.line}`,
                  }}>{stars(a.scores[ci])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Abs>

    {/* Tuiles "Pourquoi on gagne ?" */}
    {(() => {
      const advs = [
        V('advantage1') && { title: V('advantage1'), desc: V('advantage1_desc','') },
        V('advantage2') && { title: V('advantage2'), desc: V('advantage2_desc','') },
        V('advantage3') && { title: V('advantage3'), desc: V('advantage3_desc','') },
      ].filter(Boolean);
      if (!advs.length) return null;
      const tileW = (252 - (advs.length - 1) * 4) / advs.length;
      return (
        <Abs x={14} y={118}>
          <div style={{ display: 'flex', gap: 4 * MM, alignItems: 'stretch' }}>
            {advs.map((a, i) => (
              <div key={i} style={{
                width: tileW * MM,
                background: PDF_COLORS.card,
                border: `1.5px solid ${PDF_COLORS.orange}`,
                borderRadius: 6,
                padding: `${2.5 * MM}px ${3 * MM}px`,
              }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif', fontSize: 11, textTransform: 'uppercase',
                  color: PDF_COLORS.orange, letterSpacing: '0.02em', marginBottom: 2 * MM,
                }}>{a.title}</div>
                {a.desc && <div style={{
                  fontFamily: 'Geist, sans-serif', fontSize: 8.5, color: PDF_COLORS.ink,
                  lineHeight: 1.4,
                }}>{a.desc}</div>}
              </div>
            ))}
          </div>
        </Abs>
      );
    })()}

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);
};

// ── SLIDE 09 · Équipe ──────────────────────────────────────────────
const SlideTeam = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.teal}>08 — Équipe</Eyebrow>
    <Title x={14} y={30} size={36}>L&apos;ÉQUIPE</Title>

    <Abs x={14} y={60}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 * MM, width: 252 * MM }}>
        {s.founders.map((f, i) => {
          const colorMap = { magenta: PDF_COLORS.magenta, violet: PDF_COLORS.violet, teal: PDF_COLORS.teal };
          return (
            <div key={f.name} style={{ padding: `${3 * MM}px ${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 8 }}>
              <div style={{
                width: 16 * MM, height: 16 * MM, borderRadius: '50%',
                background: colorMap[f.photo],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Anton', fontSize: 22, color: '#fff',
              }}>{f.name.split(' ').map(p => p[0]).join('')}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 18, marginTop: 2 * MM, textTransform: 'uppercase', lineHeight: 1 }}>{f.name}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: PDF_COLORS.muted, marginTop: 1 * MM }}>{f.role}</div>
            </div>
          );
        })}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 10 · Usage des fonds ──────────────────────────────────────
const SlideFunds = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>09 — Usage des fonds</Eyebrow>
    <Title x={14} y={30} size={36}>{V('funds_title', 'USAGE DES FONDS')}</Title>

    {/* Donut chart (CSS conic) */}
    <Abs x={14} y={52}>
      <div style={{ position: 'relative', width: 60 * MM, height: 60 * MM }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `conic-gradient(${PDF_COLORS.orange} 0 45%, ${PDF_COLORS.teal} 45% 70%, ${PDF_COLORS.violet} 70% 88%, ${PDF_COLORS.lime} 88% 100%)`,
        }}/>
        <div style={{
          position: 'absolute', inset: 10 * MM, borderRadius: '50%', background: PDF_COLORS.paper,
          border: `1px solid ${PDF_COLORS.line}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: 'Anton', fontSize: 28, color: PDF_COLORS.ink, lineHeight: 1 }}>800 K€</div>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 7.5, letterSpacing: '0.16em', color: PDF_COLORS.muted, textTransform: 'uppercase', marginTop: 2 }}>Seed</div>
        </div>
      </div>
    </Abs>

    {/* Breakdown */}
    <Abs x={84} y={50}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM, width: 180 * MM }}>
        {[
          [V('fund1_pct', '45 %'), V('fund1_amount', '360 k€'), V('fund1_label', 'Poste 1'), PDF_COLORS.orange, ''],
          [V('fund2_pct', '25 %'), V('fund2_amount', '200 k€'), V('fund2_label', 'Poste 2'), PDF_COLORS.teal, ''],
          [V('fund3_pct', '18 %'), V('fund3_amount', '144 k€'), V('fund3_label', 'Poste 3'), PDF_COLORS.violet, ''],
          [V('fund4_pct', '12 %'), V('fund4_amount', '96 k€'), V('fund4_label', 'Poste 4'), PDF_COLORS.lime, ''],
        ].map(([pct, amount, label, c, note]) => (
          <div key={label} style={{
            padding: `${2.5 * MM}px ${3 * MM}px`,
            background: PDF_COLORS.card,
            border: `1px solid ${PDF_COLORS.line}`, borderLeft: `3px solid ${c}`, borderRadius: 4,
            display: 'grid', gridTemplateColumns: '18mm 28mm 1fr 60mm', gap: 3 * MM, alignItems: 'center',
            color: PDF_COLORS.ink,
          }}>
            <div style={{ fontFamily: 'Anton', fontSize: 20, color: c, lineHeight: 0.9 }}>{pct}</div>
            <div style={{ fontFamily: 'Anton', fontSize: 18, lineHeight: 0.9 }}>{amount}</div>
            <div style={{ fontSize: 10, fontWeight: 500 }}>{label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: PDF_COLORS.muted }}>{note}</div>
          </div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name}/>
  </div>
);

// ── SLIDE 11 · Roadmap ──────────────────────────────────────────────
const SlideRoadmap = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.violet}>10 — Roadmap</Eyebrow>
    <TitleBlock x={14} y={30} size={36} lines={[
      { text: 'LES 24 PROCHAINS MOIS,' },
      { text: 'TRIMESTRE PAR TRIMESTRE.', color: PDF_COLORS.violet },
    ]}/>

    {/* Timeline */}
    <Abs x={14} y={68}>
      <div style={{ position: 'relative', width: 252 * MM, paddingTop: 8 * MM }}>
        {/* axis */}
        <div style={{ position: 'absolute', left: 0, top: 8 * MM, width: '100%', height: 2, background: PDF_COLORS.ink }}/>
        {(() => {
          const milestones = [
            { q: V('ms1_quarter', 'T2 26'), big: V('ms1_title', 'Milestone 1'), note: V('ms1_note', ''), c: PDF_COLORS.orange },
            { q: V('ms2_quarter', 'T3 26'), big: V('ms2_title', 'Milestone 2'), note: V('ms2_note', ''), c: PDF_COLORS.teal },
            { q: V('ms3_quarter', 'T4 26'), big: V('ms3_title', 'Milestone 3'), note: V('ms3_note', ''), c: PDF_COLORS.violet },
            V('ms4_title') && { q: V('ms4_quarter', 'T1 27'), big: V('ms4_title'), note: V('ms4_note', ''), c: PDF_COLORS.magenta },
            V('ms5_title') && { q: V('ms5_quarter', 'T2 27'), big: V('ms5_title'), note: V('ms5_note', ''), c: PDF_COLORS.yellow },
            V('ms6_title') && { q: V('ms6_quarter', 'T4 27'), big: V('ms6_title'), note: V('ms6_note', ''), c: PDF_COLORS.lime },
          ].filter(Boolean);
          return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${milestones.length}, 1fr)`, gap: 3 * MM }}>
          {milestones.map((ms, i) => (
            <div key={ms.q} style={{ position: 'relative', paddingTop: 14 * MM, textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 4 * MM, left: '50%', transform: 'translateX(-50%)', width: 4 * MM, height: 4 * MM, borderRadius: '50%', background: ms.c, border: `2px solid ${PDF_COLORS.ink}` }}/>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>{ms.q}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 22, marginTop: 1 * MM, color: ms.c, textTransform: 'uppercase', lineHeight: 0.95 }}>{ms.big}</div>
              <div style={{ fontSize: 9.5, color: PDF_COLORS.muted, marginTop: 1 * MM, lineHeight: 1.4 }}>{ms.note}</div>
            </div>
          ))}
        </div>;
        })()}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 12 · Contact ──────────────────────────────────────────────
const SlideContact = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    {/* Full-bleed lime block right */}
    <div style={{ position: 'absolute', right: 0, top: 0, width: 130 * MM, height: '100%', background: PDF_COLORS.lime }}/>

    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.ink}>11 — Contact</Eyebrow>

    <TitleBlock x={14} y={34} size={56} lines={[
      { text: 'RENCONTRONS' },
      { text: 'NOUS.' },
    ]}/>
    <SerifAccent x={14} y={80} size={20} color={PDF_COLORS.muted} w={130}>
      {V('contact_subtitle', 'Rdv par telephone ou visio, 45 min. On vient avec les chiffres.')}
    </SerifAccent>

    <Abs x={14} y={108}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', color: PDF_COLORS.muted, fontWeight: 600, textTransform: 'uppercase' }}>{V('contact_role', 'CEO')} · {(V('startupName') || s.name)}</div>
      <div style={{ fontFamily: 'Anton', fontSize: 32, marginTop: 1 * MM, textTransform: 'uppercase', lineHeight: 1 }}>{V('contact_name', s.founders[0]?.name || 'FONDATEUR').toUpperCase()}</div>
      <div style={{ marginTop: 3 * MM, fontSize: 11.5 }}>
        <div><b>{V('contact_email', 'email@startup.com')}</b></div>
        {V('contact_phone') && <div>{V('contact_phone')}</div>}
        {V('contact_location') && <div style={{ color: PDF_COLORS.muted, marginTop: 1 * MM }}>{V('contact_location')}</div>}
      </div>
    </Abs>

    {/* Right side — big quote */}
    <Abs x={156} y={30}>
      <div style={{ color: PDF_COLORS.ink, width: 112 * MM }}>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>Ce qu'on cherche</div>
        <div style={{ fontFamily: 'Anton', fontSize: 28, marginTop: 3 * MM, textTransform: 'uppercase', lineHeight: 0.95 }}>{V('contact_cta', 'DES FONDS QUI CONNAISSENT NOTRE SECTEUR.')}</div>
      </div>
    </Abs>

    <Abs x={156} y={100}>
      <div style={{ width: 112 * MM, display: 'flex', flexDirection: 'column', gap: 1.5 * MM }}>
        {[
          ['CLOSING', V('closing_date', 'Date')],
          ['MINIMUM TICKET', V('min_ticket', 'Montant')],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '40mm 1fr', alignItems: 'baseline', gap: 3 * MM, paddingBottom: 2 * MM, borderBottom: `1px solid rgba(15,14,11,0.25)` }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontFamily: 'Anton', fontSize: 18, textTransform: 'uppercase', lineHeight: 0.95 }}>{v}</div>
          </div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

const SLIDE_MAP_STANDARD = [
  { C: SlideCover,     label: '01 · Couverture' },
  { C: SlideProblem,   label: '02 · Problème' },
  { C: SlideSolution,  label: '03 · Solution' },
  { C: SlideMarket,    label: '04 · Marché' },
  { C: SlideProduct,   label: '05 · Produit' },
  { C: SlideTraction,  label: '06 · Traction' },
  { C: SlideBusiness,  label: '07 · Business model' },
  { C: SlideCompet,    label: '08 · Concurrence' },
  { C: SlideTeam,      label: '09 · Équipe' },
  { C: SlideFunds,     label: '10 · Usage des fonds' },
  { C: SlideRoadmap,   label: '11 · Roadmap' },
  { C: SlideContact,   label: '12 · Contact' },
];

const PitchDeckMock = ({ s = LUMEN }) => {
  const tmpl = (window.FORM_VALUES || {})._template || 'standard';

  const slidesMap = {
    standard: SLIDE_MAP_STANDARD,
    deeptech: [
      { C: SlideCover,         label: '01 · Couverture' },
      { C: SlideProblem,       label: '02 · Problème' },
      { C: SlideSolution,      label: '03 · Solution' },
      { C: SlideMarket,        label: '04 · Marché' },
      { C: window.SlideTechnology || SlideProduct,     label: '05 · Technologie & IP' },
      { C: SlideProduct,       label: '06 · Produit' },
      { C: window.SlideValidationSci || SlideTraction,  label: '07 · Validation scientifique' },
      { C: SlideBusiness,      label: '08 · Business model' },
      { C: SlideCompet,        label: '09 · Concurrence' },
      { C: SlideTeam,          label: '10 · Équipe' },
      { C: SlideFunds,         label: '11 · Usage des fonds' },
      { C: window.SlideRoadmapRD || SlideRoadmap,      label: '12 · Roadmap R&D' },
      { C: SlideContact,       label: '13 · Contact' },
    ],
    medtech: [
      { C: SlideCover,         label: '01 · Couverture' },
      { C: SlideProblem,       label: '02 · Problème clinique' },
      { C: SlideSolution,      label: '03 · Solution' },
      { C: SlideMarket,        label: '04 · Marché' },
      { C: window.SlideProductMarketAccess || SlideProduct, label: '05 · Produit & Remboursement' },
      { C: SlideProduct,       label: '06 · Produit' },
      { C: window.SlideValidationClin || SlideTraction,     label: '07 · Validation clinique' },
      { C: window.SlideRegulatory || SlideBusiness,         label: '08 · Parcours réglementaire' },
      { C: SlideCompet,        label: '09 · Concurrence' },
      { C: SlideTeam,          label: '10 · Équipe' },
      { C: SlideFunds,         label: '11 · Usage des fonds' },
      { C: window.SlideRoadmapReg || SlideRoadmap,          label: '12 · Roadmap réglementaire' },
      { C: SlideContact,       label: '13 · Contact' },
    ],
  };

  const slides = slidesMap[tmpl] || SLIDE_MAP_STANDARD;
  const total = slides.length;
  return (
    <div>
      <div className="pdf-group-label">
        <strong>Pitch Deck</strong>
        <em>12 slides · 280 × 157,5 mm · paysage</em>
      </div>
      <div className="pdf-row">
        {slides.map(({ C, label }, i) => (
          <div key={i}>
            <div className="pdf-sheet-caption"><span className="n">{String(i + 1).padStart(2, '0')}</span> {label.split(' · ')[1]}</div>
            <C s={s} n={i + 1} total={total}/>
          </div>
        ))}
      </div>
    </div>
  );
};

window.PitchDeckMock = PitchDeckMock;
window.LUMEN = LUMEN;
