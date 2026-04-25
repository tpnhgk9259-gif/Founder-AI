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
  if (len < 50) return Math.round(baseSize * 0.8);
  if (len < 80) return Math.round(baseSize * 0.65);
  return Math.round(baseSize * 0.5);
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
    <div style={{ position: 'absolute', right: 20 * MM, top: 20 * MM, width: 72 * MM, height: 110 * MM, border: '1px solid rgba(255,255,255,0.28)' }}/>

    {/* Decorative huge rounded shape */}
    <div style={{ position: 'absolute', left: -30 * MM, bottom: -40 * MM, width: 120 * MM, height: 120 * MM, borderRadius: '50%', background: PDF_COLORS.lime, opacity: 0.25 }}/>

    <PDFLogo size={5.5 * MM} x={14} y={14}/>
    <Abs x={24} y={14}>
      <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, paddingTop: 2 }}>
        <span style={{ color: PDF_COLORS.ink, fontWeight: 700 }}>FounderAI</span>
        <span style={{ margin: '0 8px', color: PDF_COLORS.muted2 }}>·</span>
        Pitch deck · V1 · Avril 2026
      </div>
    </Abs>

    <Eyebrow x={14} y={48} size={9} accent={PDF_COLORS.orange}>{V('funds_title', s.stage)}</Eyebrow>
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

    <Abs x={178} y={28} w={88}>
      <div style={{ color: '#fff', fontFamily: 'Geist Mono', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.9 }}>Vu par</div>
      <div style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: 30, marginTop: 6, lineHeight: 0.9, whiteSpace: 'nowrap' }}>XAVIER&nbsp;N.</div>
      <div style={{ color: '#fff', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, marginTop: 6, opacity: 0.85 }}>Serena Capital</div>
    </Abs>

    <Abs x={178} y={132}>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}>contact</div>
      <div style={{ color: '#fff', fontSize: 10.5, marginTop: 3, fontWeight: 500 }}>juliette@lumen.earth · +33 6 71 42 19 08</div>
    </Abs>
  </div>
);

// ── SLIDE 02 · Problème ────────────────────────────────────────────
const SlideProblem = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.magenta}>01 — Le problème</Eyebrow>

    <TitleBlock x={14} y={30} size={autoSize(V('problem_title', 'LE PROBLÈME'))} w={250} lines={
      splitTitle(V('problem_title', 'LE PROBLÈME'), 40).map(l => ({ text: l }))
    }/>

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
      <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 500 }}>{V('problem_source', 'Source')}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, marginTop: 8, lineHeight: 1.45, color: PDF_COLORS.ink }}>
        {V('stat3_value') ? `« ${V('stat3_value')} — ${V('stat3_label')} »` : '« Le problème vu par vos utilisateurs. »'}
      </div>
    </div>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 03 · Solution ────────────────────────────────────────────
const SlideSolution = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.teal}>02 — La solution</Eyebrow>

    <TitleBlock x={14} y={30} size={autoSize(V('solution_title', 'NOTRE SOLUTION'))} w={250} lines={
      splitTitle(V('solution_title', 'NOTRE SOLUTION'), 40).map(l => ({ text: l }))
    }/>

    <Body x={14} y={68} w={120} size={12} lh={1.55} color={PDF_COLORS.muted}>
      {V('mvp_intro', "Description de la solution et de sa proposition de valeur unique.")}
    </Body>

    {/* 3-step flow */}
    <div style={{ position: 'absolute', left: 14 * MM, top: 98 * MM, width: 252 * MM, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 * MM }}>
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
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.violet}>03 — Le marché</Eyebrow>

    {(() => {
      const marketTitle = V('market_size') ? `Un marche de ${V('market_size')} ${V('market_geo', '')}` : 'Un premier TAM de 1,8 Md en France.';
      return <TitleBlock x={14} y={30} size={autoSize(marketTitle, 36)} w={250} lines={
        splitTitle(marketTitle, 45).map(l => ({ text: l }))
      }/>;
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
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>04 — Le produit</Eyebrow>
    <TitleBlock x={14} y={30} size={40} lines={[
      { text: '3 MINUTES POUR' },
      { text: 'SAVOIR QUOI FAIRE.' },
    ]}/>

    {/* App screen mock — simplified phone */}
    <div style={{
      position: 'absolute', left: 14 * MM, top: 62 * MM,
      width: 82 * MM, height: 74 * MM,
      background: PDF_COLORS.ink, borderRadius: 12, padding: 4 * MM,
      color: PDF_COLORS.paper, fontFamily: 'Geist, sans-serif',
    }}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 7.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.lime, fontWeight: 600 }}>Scan juillet 2026</div>
      <div style={{ fontFamily: 'Anton', fontSize: 28, lineHeight: 0.95, marginTop: 3 * MM }}>VOUS PAYEZ</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 * MM, flexWrap: 'nowrap' }}>
        <div style={{ fontFamily: 'Anton', fontSize: 44, lineHeight: 0.9, color: PDF_COLORS.lime, whiteSpace: 'nowrap' }}>2 148€</div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: PDF_COLORS.muted2, whiteSpace: 'nowrap' }}>trop, ce mois-ci.</div>
      </div>
      <div style={{ fontSize: 9, marginTop: 4 * MM, lineHeight: 1.5, opacity: 0.85 }}>
        ▸ Contrat surdimensionné de 6 kVA (−840€/an)<br/>
        ▸ Heures pleines mal optimisées (−720€/an)<br/>
        ▸ Fournisseur sous-compétitif depuis 14 mois
      </div>
      <div style={{
        marginTop: 4 * MM, padding: `${2 * MM}px ${3 * MM}px`, background: PDF_COLORS.lime, color: PDF_COLORS.ink,
        fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
        borderRadius: 999, display: 'inline-block',
      }}>
        Plan d'action →
      </div>
    </div>

    {/* Right : 3 capabilities */}
    <Abs x={108} y={62}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM }}>
        {[
          ['OCR factures', 'Lit EDF, Engie, TotalEnergies, Eni, Vattenfall — PDF et scannées', PDF_COLORS.orange],
          ['Alertes temps réel', 'Détecte 14 anomalies dès réception de la facture', PDF_COLORS.magenta],
          ['Comparateur biaisé', 'Négocie en direct avec 8 fournisseurs partenaires', PDF_COLORS.teal],
          ['Attestation BDR', 'Export PDF conforme aux décrets tertiaires 2026', PDF_COLORS.violet],
          ['Mode multi-sites', 'Pour les groupes de 2 à 30 restaurants — tarif dégressif', PDF_COLORS.yellow],
        ].map(([t, d, c]) => (
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
  const months = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'];
  const mrr = [0, 480, 1240, 2850, 5420, 9180]; // cumulative MRR in €
  const max = Math.max(...mrr);
  return (
    <div className="pdf-sheet">
      <PDFHeader kind="Pitch Deck" page={n} total={total}/>
      <Eyebrow x={14} y={22} accent={PDF_COLORS.lime}>05 — Traction</Eyebrow>
      <TitleBlock x={14} y={30} size={40} lines={[
        { text: "6 MOIS D'EXISTENCE," },
        { text: '38 RESTOS PAYANTS.' },
      ]}/>

      {/* MRR chart */}
      <Abs x={14} y={62}>
        <div style={{ width: 140 * MM, height: 72 * MM, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6, padding: 4 * MM, position: 'relative' }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>MRR (€) · Nov 2025 → Avr 2026</div>
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '82%', marginTop: 2 * MM, display: 'block' }}>
            {/* grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <line key={p} x1="30" y1={20 + p * 140} x2="400" y2={20 + p * 140} stroke={PDF_COLORS.line} strokeWidth={0.5}/>
            ))}
            {/* bars */}
            {mrr.map((v, i) => {
              const bw = 40, gap = 16;
              const x = 40 + i * (bw + gap);
              const h = (v / max) * 140;
              const y = 160 - h;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={bw} height={h} fill={i === 5 ? PDF_COLORS.orange : PDF_COLORS.ink}/>
                  <text x={x + bw / 2} y={175} fontFamily="Geist Mono" fontSize="9" fill={PDF_COLORS.muted} textAnchor="middle" letterSpacing="0.1em">{months[i]}</text>
                  {v > 0 && <text x={x + bw / 2} y={y - 4} fontFamily="Anton" fontSize="13" fill={PDF_COLORS.ink} textAnchor="middle">{v}€</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </Abs>

      {/* KPI cards right */}
      <Abs x={162} y={62}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM, width: 104 * MM }}>
          {[
            ['+87 %', 'croissance MRR mois sur mois', PDF_COLORS.orange],
            ['9 180€', 'MRR avril 2026',                    PDF_COLORS.teal],
            ['38 / 45','payants sur comptes activés (84%)', PDF_COLORS.violet],
            ['94 %',  'rétention 90 jours',                 PDF_COLORS.magenta],
            ['−342€', 'économie moyenne / client / mois',   PDF_COLORS.lime],
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
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.yellow}>06 — Business model</Eyebrow>
    <TitleBlock x={14} y={30} size={40} lines={[
      { text: 'DEUX LEVIERS,' },
      { text: 'ZÉRO CAC VARIABLE.' },
    ]}/>

    {/* Pricing tiers */}
    <Abs x={14} y={62}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 * MM, width: 252 * MM }}>
        {[
          { t: V('bm1_title', 'Offre 1'), p: '', bg: PDF_COLORS.card, ink: PDF_COLORS.ink, cap: V('bm1_desc', 'Description de la première offre') },
          { t: V('bm2_title', 'Offre 2'), p: '', bg: PDF_COLORS.ink, ink: PDF_COLORS.paper, cap: V('bm2_desc', 'Description de la deuxième offre'), featured: true },
          { t: V('bm3_title', 'Offre 3'), p: '', bg: PDF_COLORS.card, ink: PDF_COLORS.ink, cap: V('bm3_desc', 'Description de la troisième offre') },
        ].map(plan => (
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
            <div style={{ fontSize: 9.5, marginTop: 3 * MM, lineHeight: 1.55, opacity: 0.85 }}>
              + 15% de la première année d'économies négociées, facturé une fois.
            </div>
          </div>
        ))}
      </div>
    </Abs>

    {/* CAC/LTV inline metrics */}
    <Abs x={14} y={125}>
      <div style={{ display: 'flex', gap: 6 * MM, fontFamily: 'Geist, sans-serif' }}>
        {[
          ['CAC', '42 €',   'Acquisition via partenaires : Umih, comptables agréés'],
          ['LTV', '3 860 €', 'Sur 36 mois · churn mensuel 1,1%'],
          ['RATIO', '91:1', 'Modèle scalable dès 1 500 clients'],
          ['COGS', '8 %',   'Principalement OCR + LLM API'],
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
const SlideCompet = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.magenta}>07 — Concurrence</Eyebrow>
    <TitleBlock x={14} y={30} size={40} lines={[
      { text: "PERSONNE N'OUTILLE" },
      { text: 'LES RESTAURATEURS.' },
    ]}/>

    {/* 2x2 matrix */}
    <Abs x={14} y={62}>
      <div style={{ position: 'relative', width: 140 * MM, height: 72 * MM, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6 }}>
        {/* axes */}
        <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 1, background: PDF_COLORS.line2 }}/>
        <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: 1, background: PDF_COLORS.line2 }}/>
        {/* axis labels */}
        <div style={{ position: 'absolute', top: 2 * MM, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted }}>↑ Proactif</div>
        <div style={{ position: 'absolute', bottom: 2 * MM, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted }}>Passif ↓</div>
        <div style={{ position: 'absolute', left: 2 * MM, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted }}>← Généraliste</div>
        <div style={{ position: 'absolute', right: 2 * MM, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted }}>Métier →</div>
        {/* dots */}
        {[
          { x: 15, y: 72, label: 'Fournisseurs EDF/Engie', c: PDF_COLORS.muted, sub: 'Captifs' },
          { x: 30, y: 48, label: 'Comparateurs (Selectra)', c: PDF_COLORS.muted, sub: 'Ponctuels' },
          { x: 50, y: 30, label: 'Opéra Energie', c: PDF_COLORS.violet, sub: 'BtoB large' },
          { x: 42, y: 70, label: 'Comptables', c: PDF_COLORS.muted, sub: 'Pas d\'outil' },
          { x: 80, y: 20, label: 'Lumen', c: PDF_COLORS.orange, sub: '← ici', big: true },
        ].map(d => (
          <div key={d.label} style={{
            position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
            transform: 'translate(-50%, -50%)',
          }}>
            <div style={{
              width: (d.big ? 16 : 10) * MM, height: (d.big ? 16 : 10) * MM,
              borderRadius: '50%', background: d.c,
              border: d.big ? `3px solid ${PDF_COLORS.ink}` : 'none',
            }}/>
            <div style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', textAlign: 'center', marginTop: 1 * MM,
            }}>
              <div style={{ fontFamily: d.big ? 'Anton' : 'Geist', fontSize: d.big ? 13 : 9, color: PDF_COLORS.ink, fontWeight: d.big ? 400 : 500 }}>{d.label}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 9, color: PDF_COLORS.muted }}>{d.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Abs>

    {/* Why we win */}
    <Abs x={162} y={62}>
      <div style={{ width: 104 * MM }}>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: PDF_COLORS.magenta, fontWeight: 700 }}>Pourquoi on gagne</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM, marginTop: 3 * MM }}>
          {[
            ['Base de factures', '14 000 PDF analysés, 1 seule qui rivalise'],
            ['Verticale unique', 'Un seul persona : restaurateur indépendant'],
            ['Partenariats', 'Umih, Pennylane, Qonto distribuent Lumen'],
            ['Prix packagé', 'Abonnement + success fee, pas de commission opaque'],
          ].map(([t, d]) => (
            <div key={t} style={{ padding: `${2 * MM}px ${2.5 * MM}px`, background: PDF_COLORS.paper2, borderLeft: `3px solid ${PDF_COLORS.magenta}` }}>
              <div style={{ fontFamily: 'Anton', fontSize: 14, textTransform: 'uppercase', lineHeight: 1 }}>{t}</div>
              <div style={{ fontSize: 9.5, color: PDF_COLORS.muted, marginTop: 1 * MM, lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 09 · Équipe ──────────────────────────────────────────────
const SlideTeam = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.teal}>08 — Équipe</Eyebrow>
    <TitleBlock x={14} y={30} size={40} lines={[
      { text: 'TROIS FONDATEURS,' },
      { text: 'ONZE ANS ENSEMBLE.' },
    ]}/>

    <Abs x={14} y={60}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 * MM, width: 252 * MM }}>
        {s.founders.map((f, i) => {
          const colorMap = { magenta: PDF_COLORS.magenta, violet: PDF_COLORS.violet, teal: PDF_COLORS.teal };
          return (
            <div key={f.name} style={{ padding: `${4 * MM}px ${4 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 8 }}>
              <div style={{
                width: 22 * MM, height: 22 * MM, borderRadius: '50%',
                background: colorMap[f.photo],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Anton', fontSize: 28, color: '#fff',
              }}>{f.name.split(' ').map(p => p[0]).join('')}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 22, marginTop: 3 * MM, textTransform: 'uppercase', lineHeight: 1 }}>{f.name}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: PDF_COLORS.muted, marginTop: 1 * MM }}>{f.role}</div>
              <div style={{ display: 'flex', gap: 2 * MM, marginTop: 3 * MM, flexWrap: 'wrap' }}>
                {[`0${i + 1}`, (f.role || '').toUpperCase(), 'Co-fondateur'].map(t => (
                  <span key={t} style={{ padding: `${0.8 * MM}px ${2 * MM}px`, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 7.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted }}>{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Abs>

    {/* Advisors */}
    <Abs x={14} y={128}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', color: PDF_COLORS.muted, fontWeight: 600, textTransform: 'uppercase' }}>Advisors</div>
      <div style={{ display: 'flex', gap: 5 * MM, marginTop: 2 * MM, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: PDF_COLORS.ink }}>
        <span>— Pierre-Édouard Stérin (Otium)</span>
        <span>— Claire Léost (Alan)</span>
        <span>— Marc Ménasé (Founders Future)</span>
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 10 · Usage des fonds ──────────────────────────────────────
const SlideFunds = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>09 — Usage des fonds</Eyebrow>
    <TitleBlock x={14} y={30} size={autoSize(V('funds_title', 'USAGE DES FONDS'))} w={250} lines={
      splitTitle(V('funds_title', 'USAGE DES FONDS'), 40).map(l => ({ text: l }))
    }/>

    {/* Donut chart (CSS conic) */}
    <Abs x={14} y={74}>
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
    <Abs x={84} y={72}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * MM, width: 180 * MM }}>
        {[
          ['45 %', '360 k€', 'Équipe tech (3 ETP senior)', PDF_COLORS.orange, 'Prioriser mobile + multi-sites'],
          ['25 %', '200 k€', 'Acquisition B2B (partenariats)', PDF_COLORS.teal,  'Alliance Umih + comptables'],
          ['18 %', '144 k€', 'Signature partenaires fournisseurs', PDF_COLORS.violet, '8 contrats visés'],
          ['12 %',  '96 k€', 'Pilotage (légal, compta, ops)',    PDF_COLORS.lime,  'Structurer pour série A'],
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
    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 * MM }}>
          {[
            { q: 'T2 26', big: 'Seed',          note: 'Closing 800 k€, 3 ETP',          c: PDF_COLORS.orange },
            { q: 'T3 26', big: '100 restos',    note: 'v1 multi-sites + export BDR',     c: PDF_COLORS.teal },
            { q: 'T4 26', big: 'Umih deal',     note: 'Distribution officielle 40 dpts', c: PDF_COLORS.violet },
            { q: 'T1 27', big: '500 restos',    note: 'MRR 40 k€, dynamique breakeven', c: PDF_COLORS.magenta },
            { q: 'T2 27', big: 'Série A',       note: '3 à 5 M€, ouverture Belgique',    c: PDF_COLORS.yellow },
            { q: 'T4 27', big: '2 000 restos',  note: 'Équipe 14 ETP, 2 pays',           c: PDF_COLORS.lime },
          ].map((ms, i) => (
            <div key={ms.q} style={{ position: 'relative', paddingTop: 14 * MM, textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 4 * MM, left: '50%', transform: 'translateX(-50%)', width: 4 * MM, height: 4 * MM, borderRadius: '50%', background: ms.c, border: `2px solid ${PDF_COLORS.ink}` }}/>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>{ms.q}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 22, marginTop: 1 * MM, color: ms.c, textTransform: 'uppercase', lineHeight: 0.95 }}>{ms.big}</div>
              <div style={{ fontSize: 9.5, color: PDF_COLORS.muted, marginTop: 1 * MM, lineHeight: 1.4 }}>{ms.note}</div>
            </div>
          ))}
        </div>
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

    <PDFHeader kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.ink}>11 — Contact</Eyebrow>

    <TitleBlock x={14} y={34} size={56} lines={[
      { text: 'PARLONS' },
      { text: 'CE MOIS-CI.' },
    ]}/>
    <SerifAccent x={14} y={80} size={20} color={PDF_COLORS.muted} w={130}>
      Rdv par téléphone ou à Station F, 45 min. Pas de deck 2.0 à préparer — on vient avec les chiffres.
    </SerifAccent>

    <Abs x={14} y={108}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', color: PDF_COLORS.muted, fontWeight: 600, textTransform: 'uppercase' }}>{V('member1_role', 'CEO')} · {(V('startupName') || s.name)}</div>
      <div style={{ fontFamily: 'Anton', fontSize: 32, marginTop: 1 * MM, textTransform: 'uppercase', lineHeight: 1 }}>{(V('member1_name') || s.founders[0]?.name || 'FONDATEUR').toUpperCase()}</div>
      <div style={{ marginTop: 3 * MM, fontSize: 11.5 }}>
        <div><b>juliette@lumen.earth</b></div>
        <div>+33 6 71 42 19 08</div>
        <div style={{ color: PDF_COLORS.muted, marginTop: 1 * MM }}>Station F · 5 parvis Alan Turing · 75013 Paris</div>
      </div>
    </Abs>

    {/* Right side — big quote */}
    <Abs x={156} y={30}>
      <div style={{ color: PDF_COLORS.ink, width: 112 * MM }}>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>Ce qu'on cherche</div>
        <div style={{ fontFamily: 'Anton', fontSize: 36, marginTop: 3 * MM, textTransform: 'uppercase', lineHeight: 0.9 }}>DES FONDS QUI CONNAISSENT</div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 26, marginTop: 2 * MM, color: PDF_COLORS.ink2 }}>la restauration, le SaaS vertical, l'impact.</div>
      </div>
    </Abs>

    <Abs x={156} y={100}>
      <div style={{ width: 112 * MM, display: 'flex', flexDirection: 'column', gap: 1.5 * MM }}>
        {[
          ['CLOSING', 'Juillet 2026'],
          ['MINIMUM TICKET', '50 k€ · jusqu\'à 250 k€'],
          ['LEAD DÉJÀ SIGNÉ', '200 k€ · business angel ex-Deliveroo'],
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

const PitchDeckMock = ({ s = LUMEN }) => {
  const slides = [
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
