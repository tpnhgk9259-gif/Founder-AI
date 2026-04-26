// ── Slides spécifiques Deeptech & Medtech ────────────────────────────────
// Dépend de pdf-shared.jsx (Abs, Title, TitleBlock, Eyebrow, Body, Slab, PDFHeader, PDFFooter, PDF_COLORS, MM)
// et pitch-deck.jsx (V, autoSize, LUMEN)

// ════════════════════════════════════════════════════════════════════════════
//  DEEPTECH
// ════════════════════════════════════════════════════════════════════════════

// ── SLIDE 05 DT · Technologie & IP ──────────────────────────────────────
const SlideTechnology = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>05 — Technologie & IP</Eyebrow>
    <Title x={14} y={30} size={autoSize(V('tech_title', 'NOTRE TECHNOLOGIE'))}>{V('tech_title', 'NOTRE TECHNOLOGIE')}</Title>

    {/* TRL gauge */}
    <Abs x={14} y={48}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 * MM }}>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600 }}>Maturite technologique</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5,6,7,8,9].map(level => {
            const current = parseInt(V('trl_current','4').replace(/\D/g,'')) || 4;
            const target = parseInt(V('trl_target','7').replace(/\D/g,'')) || 7;
            const isCurrent = level <= current;
            const isTarget = level <= target && level > current;
            return (
              <div key={level} style={{
                width: 7 * MM, height: 5 * MM, borderRadius: 3,
                background: isCurrent ? PDF_COLORS.orange : isTarget ? 'rgba(255,106,31,0.2)' : PDF_COLORS.paper2,
                border: level === target ? `1.5px dashed ${PDF_COLORS.orange}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Anton', fontSize: 10, color: isCurrent ? '#fff' : PDF_COLORS.muted,
              }}>{level}</div>
            );
          })}
        </div>
        <div style={{ fontFamily: 'Geist Mono', fontSize: 8, color: PDF_COLORS.muted }}>
          {V('trl_current','TRL 4')} → {V('trl_target','TRL 7')}
        </div>
      </div>
    </Abs>

    {/* Description + image */}
    <Abs x={14} y={62}>
      <div style={{ display: 'flex', gap: 4 * MM, width: 252 * MM }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Geist', fontSize: 10, lineHeight: 1.55, color: PDF_COLORS.ink }}>
            {V('tech_desc', 'Description de la technologie.')}
          </div>
          {/* Brevets */}
          <div style={{ marginTop: 3 * MM }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 1.5 * MM }}>Propriete intellectuelle</div>
            {[V('patent1'), V('patent2'), V('patent3')].filter(Boolean).map((p, i) => (
              <div key={i} style={{ fontFamily: 'Geist', fontSize: 9, color: PDF_COLORS.ink, padding: `${1 * MM}px 0`, borderBottom: `1px solid ${PDF_COLORS.line}`, display: 'flex', alignItems: 'center', gap: 2 * MM }}>
                <span style={{ color: PDF_COLORS.orange, fontFamily: 'Anton', fontSize: 10 }}>IP</span> {p}
              </div>
            ))}
          </div>
          {/* Publications */}
          {(V('pub1') || V('pub2')) && (
            <div style={{ marginTop: 2 * MM }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 1 * MM }}>Publications</div>
              {[V('pub1'), V('pub2')].filter(Boolean).map((p, i) => (
                <div key={i} style={{ fontFamily: 'Geist', fontSize: 8.5, color: PDF_COLORS.muted, fontStyle: 'italic', marginBottom: 0.5 * MM }}>{p}</div>
              ))}
            </div>
          )}
        </div>
        {/* Image tech ou differenciations */}
        <div style={{ width: 100 * MM }}>
          {V('tech_image') ? (
            <img src={V('tech_image')} style={{ width: '100%', height: 55 * MM, objectFit: 'contain', background: PDF_COLORS.card, borderRadius: 6, border: `1px solid ${PDF_COLORS.line}` }}/>
          ) : (
            <div style={{ width: '100%', height: 55 * MM, background: PDF_COLORS.card, borderRadius: 6, border: `1px solid ${PDF_COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PDF_COLORS.muted2, fontSize: 10 }}>Schema technique</div>
          )}
          {/* Differenciations */}
          <div style={{ display: 'flex', gap: 2 * MM, marginTop: 2 * MM }}>
            {[V('tech_diff1'), V('tech_diff2'), V('tech_diff3')].filter(Boolean).map((d, i) => (
              <div key={i} style={{ flex: 1, padding: `${1.5 * MM}px ${2 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.orange}`, borderRadius: 4, fontFamily: 'Geist', fontSize: 8, color: PDF_COLORS.ink, lineHeight: 1.4 }}>
                <span style={{ color: PDF_COLORS.orange, fontFamily: 'Anton', fontSize: 9 }}>{i + 1}.</span> {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 06 DT · Validation scientifique ────────────────────────────────
const SlideValidationSci = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.lime}>06 — Validation scientifique</Eyebrow>
    <Title x={14} y={30} size={autoSize(V('validation_title', 'DU LABO AU PROTOTYPE'))}>{V('validation_title', 'DU LABO AU PROTOTYPE')}</Title>

    {/* KPI resultats */}
    <Abs x={14} y={50}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 * MM, width: 252 * MM }}>
        {[
          [V('val_kpi1_value'), V('val_kpi1_label'), PDF_COLORS.orange],
          [V('val_kpi2_value'), V('val_kpi2_label'), PDF_COLORS.teal],
          [V('val_kpi3_value'), V('val_kpi3_label'), PDF_COLORS.violet],
          [V('val_kpi4_value'), V('val_kpi4_label'), PDF_COLORS.magenta],
        ].filter(([v]) => v).map(([big, label, c], i) => (
          <div key={i} style={{ padding: `${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Anton', fontSize: 28, color: c, lineHeight: 0.9 }}>{big}</div>
            <div style={{ fontSize: 8.5, color: PDF_COLORS.muted, lineHeight: 1.4, marginTop: 2 * MM }}>{label}</div>
          </div>
        ))}
      </div>
    </Abs>

    {/* Partenaires */}
    <Abs x={14} y={100}>
      <div style={{ display: 'flex', gap: 6 * MM, width: 252 * MM }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 2 * MM }}>Partenaires academiques</div>
          {[V('partner_acad1'), V('partner_acad2')].filter(Boolean).map((p, i) => (
            <div key={i} style={{ fontFamily: 'Geist', fontSize: 10, color: PDF_COLORS.ink, marginBottom: 1 * MM }}>{p}</div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 2 * MM }}>Partenaires industriels</div>
          {[V('partner_indus1'), V('partner_indus2')].filter(Boolean).map((p, i) => (
            <div key={i} style={{ fontFamily: 'Geist', fontSize: 10, color: PDF_COLORS.ink, marginBottom: 1 * MM }}>{p}</div>
          ))}
        </div>
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 11 DT · Roadmap R&D ───────────────────────────────────────────
const SlideRoadmapRD = ({ s = LUMEN, n, total }) => {
  const milestones = [1,2,3,4].map(i => V(`rd${i}_title`) && {
    q: V(`rd${i}_quarter`), title: V(`rd${i}_title`), note: V(`rd${i}_note`, ''), trl: V(`rd${i}_trl`, ''),
    c: [PDF_COLORS.orange, PDF_COLORS.teal, PDF_COLORS.violet, PDF_COLORS.magenta][i-1],
  }).filter(Boolean);
  const grants = [V('grant1'), V('grant2'), V('grant3')].filter(Boolean);

  return (
    <div className="pdf-sheet">
      <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
      <Eyebrow x={14} y={22} accent={PDF_COLORS.violet}>12 — Roadmap R&D</Eyebrow>
      <Title x={14} y={30} size={autoSize(V('roadmap_rd_title', 'DE LA RECHERCHE AU MARCHE.'))}>{V('roadmap_rd_title', 'DE LA RECHERCHE AU MARCHE.')}</Title>

      {/* Timeline */}
      <Abs x={14} y={60}>
        <div style={{ display: 'flex', gap: 3 * MM, width: 252 * MM }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ flex: 1, borderTop: `3px solid ${m.c}`, paddingTop: 2 * MM }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', color: PDF_COLORS.muted, textTransform: 'uppercase', fontWeight: 600 }}>{m.q}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 16, textTransform: 'uppercase', marginTop: 1 * MM, lineHeight: 0.95 }}>{m.title}</div>
              {m.trl && <div style={{ fontFamily: 'Geist Mono', fontSize: 8, color: m.c, fontWeight: 700, marginTop: 1 * MM }}>{m.trl}</div>}
              <div style={{ fontSize: 8.5, color: PDF_COLORS.muted, lineHeight: 1.45, marginTop: 1 * MM }}>{m.note}</div>
            </div>
          ))}
        </div>
      </Abs>

      {/* Financements publics */}
      {grants.length > 0 && (
        <Abs x={14} y={115}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 1.5 * MM }}>Financements non-dilutifs</div>
          <div style={{ display: 'flex', gap: 3 * MM }}>
            {grants.map((g, i) => (
              <div key={i} style={{ padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.lime}`, borderRadius: 4, fontFamily: 'Geist', fontSize: 9, color: PDF_COLORS.ink }}>{g}</div>
            ))}
          </div>
        </Abs>
      )}

      <PDFFooter startup={s.name} page={n} total={total}/>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  MEDTECH
// ════════════════════════════════════════════════════════════════════════════

// ── SLIDE 05 MT · Produit & Remboursement ────────────────────────────────
const SlideProductMarketAccess = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>05 — Produit & Remboursement</Eyebrow>
    <Title x={14} y={30} size={autoSize(V('pma_title', 'NOTRE DISPOSITIF'))}>{V('pma_title', 'NOTRE DISPOSITIF')}</Title>

    <Abs x={14} y={48}>
      <div style={{ display: 'flex', gap: 4 * MM, width: 252 * MM }}>
        {/* Image produit */}
        <div style={{ width: 100 * MM }}>
          {V('product_image') ? (
            <img src={V('product_image')} style={{ width: '100%', height: 60 * MM, objectFit: 'contain', background: PDF_COLORS.card, borderRadius: 6, border: `1px solid ${PDF_COLORS.line}` }}/>
          ) : (
            <div style={{ width: '100%', height: 60 * MM, background: PDF_COLORS.card, borderRadius: 6, border: `1px solid ${PDF_COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PDF_COLORS.muted2, fontSize: 10 }}>Image du dispositif</div>
          )}
          {/* Classification */}
          <div style={{ display: 'flex', gap: 2 * MM, marginTop: 2 * MM }}>
            {V('dm_class') && <div style={{ padding: `${1 * MM}px ${2.5 * MM}px`, background: PDF_COLORS.orange, color: '#fff', borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em' }}>{V('dm_class')}</div>}
            {V('dm_type') && <div style={{ padding: `${1 * MM}px ${2.5 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 999, fontFamily: 'Geist', fontSize: 8.5, color: PDF_COLORS.ink }}>{V('dm_type')}</div>}
          </div>
        </div>
        {/* Features + Remboursement */}
        <div style={{ flex: 1 }}>
          {[
            [V('feature1_title'), V('feature1_desc'), PDF_COLORS.orange],
            [V('feature2_title'), V('feature2_desc'), PDF_COLORS.teal],
            [V('feature3_title'), V('feature3_desc'), PDF_COLORS.violet],
          ].filter(([t]) => t).map(([t, d, c], i) => (
            <div key={i} style={{ marginBottom: 2 * MM, paddingLeft: 3 * MM, borderLeft: `2px solid ${c}` }}>
              <div style={{ fontFamily: 'Anton', fontSize: 12, textTransform: 'uppercase', color: PDF_COLORS.ink }}>{t}</div>
              <div style={{ fontSize: 9, color: PDF_COLORS.muted, lineHeight: 1.4 }}>{d}</div>
            </div>
          ))}
          {/* Remboursement */}
          {V('remb_strategy') && (
            <div style={{ marginTop: 3 * MM, padding: `${2 * MM}px ${3 * MM}px`, background: PDF_COLORS.card, border: `1.5px solid ${PDF_COLORS.lime}`, borderRadius: 6 }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.lime, fontWeight: 600, marginBottom: 1 * MM }}>Strategie de remboursement</div>
              <div style={{ fontSize: 9, color: PDF_COLORS.ink, lineHeight: 1.45 }}>{V('remb_strategy')}</div>
              <div style={{ display: 'flex', gap: 3 * MM, marginTop: 1.5 * MM }}>
                {V('price_hospital') && <div style={{ fontSize: 9 }}><span style={{ color: PDF_COLORS.muted }}>Prix hopital:</span> <b>{V('price_hospital')}</b></div>}
                {V('price_remb') && <div style={{ fontSize: 9 }}><span style={{ color: PDF_COLORS.muted }}>Remb. vise:</span> <b>{V('price_remb')}</b></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 06 MT · Validation clinique ────────────────────────────────────
const SlideValidationClin = ({ s = LUMEN, n, total }) => (
  <div className="pdf-sheet">
    <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
    <Eyebrow x={14} y={22} accent={PDF_COLORS.lime}>06 — Validation clinique</Eyebrow>
    <Title x={14} y={30} size={autoSize(V('clin_title', 'PREUVES CLINIQUES'))}>{V('clin_title', 'PREUVES CLINIQUES')}</Title>

    {/* Phase + Design */}
    <Abs x={14} y={48}>
      <div style={{ display: 'flex', gap: 3 * MM }}>
        {V('clin_phase') && <div style={{ padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.orange, color: '#fff', borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600 }}>{V('clin_phase')}</div>}
        {V('clin_design') && <div style={{ padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 999, fontFamily: 'Geist', fontSize: 9, color: PDF_COLORS.ink }}>{V('clin_design')}</div>}
      </div>
    </Abs>

    {/* KPI cliniques */}
    <Abs x={14} y={62}>
      <div style={{ display: 'flex', gap: 3 * MM, width: 252 * MM }}>
        {[
          [V('clin_kpi1_value'), V('clin_kpi1_label'), PDF_COLORS.orange],
          [V('clin_kpi2_value'), V('clin_kpi2_label'), PDF_COLORS.teal],
          [V('clin_kpi3_value'), V('clin_kpi3_label'), PDF_COLORS.violet],
        ].filter(([v]) => v).map(([big, label, c], i) => (
          <div key={i} style={{ flex: 1, padding: `${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Anton', fontSize: 32, color: c, lineHeight: 0.9 }}>{big}</div>
            <div style={{ fontSize: 8.5, color: PDF_COLORS.muted, lineHeight: 1.4, marginTop: 2 * MM }}>{label}</div>
          </div>
        ))}
      </div>
    </Abs>

    {/* KOLs */}
    <Abs x={14} y={106}>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: PDF_COLORS.muted, fontWeight: 600, marginBottom: 2 * MM }}>Key Opinion Leaders</div>
      <div style={{ display: 'flex', gap: 3 * MM }}>
        {[V('kol1'), V('kol2'), V('kol3')].filter(Boolean).map((k, i) => (
          <div key={i} style={{ flex: 1, padding: `${2 * MM}px ${3 * MM}px`, background: PDF_COLORS.card, border: `1px solid ${PDF_COLORS.line}`, borderRadius: 6, fontFamily: 'Geist', fontSize: 9, color: PDF_COLORS.ink }}>{k}</div>
        ))}
      </div>
    </Abs>

    <PDFFooter startup={s.name} page={n} total={total}/>
  </div>
);

// ── SLIDE 07 MT · Parcours reglementaire ─────────────────────────────────
const SlideRegulatory = ({ s = LUMEN, n, total }) => {
  const steps = [1,2,3,4].map(i => V(`reg_step${i}_label`) && {
    date: V(`reg_step${i}_date`), label: V(`reg_step${i}_label`), status: V(`reg_step${i}_status`, ''),
  }).filter(Boolean);
  const statusColor = (st) => {
    const low = (st || '').toLowerCase();
    if (low.includes('obtenu') || low.includes('fait') || low.includes('done')) return PDF_COLORS.teal;
    if (low.includes('en cours') || low.includes('progress')) return PDF_COLORS.orange;
    return PDF_COLORS.muted;
  };

  return (
    <div className="pdf-sheet">
      <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
      <Eyebrow x={14} y={22} accent={PDF_COLORS.yellow}>07 — Parcours reglementaire</Eyebrow>
      <Title x={14} y={30} size={autoSize(V('reg_title', 'PARCOURS REGLEMENTAIRE'))}>{V('reg_title', 'PARCOURS REGLEMENTAIRE')}</Title>

      {/* Classification badges */}
      <Abs x={14} y={48}>
        <div style={{ display: 'flex', gap: 2 * MM }}>
          {V('reg_class_eu') && <div style={{ padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.violet, color: '#fff', borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 700 }}>EU {V('reg_class_eu')}</div>}
          {V('reg_class_us') && <div style={{ padding: `${1.5 * MM}px ${3 * MM}px`, background: PDF_COLORS.teal, color: '#fff', borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 700 }}>FDA {V('reg_class_us')}</div>}
        </div>
      </Abs>

      {/* Pathway description */}
      {V('reg_pathway') && (
        <Abs x={14} y={58}>
          <div style={{ fontFamily: 'Geist', fontSize: 10, lineHeight: 1.5, color: PDF_COLORS.ink, width: 252 * MM }}>{V('reg_pathway')}</div>
        </Abs>
      )}

      {/* Steps timeline */}
      <Abs x={14} y={75}>
        <div style={{ display: 'flex', gap: 3 * MM, width: 252 * MM }}>
          {steps.map((st, i) => (
            <div key={i} style={{ flex: 1, borderTop: `3px solid ${statusColor(st.status)}`, paddingTop: 2 * MM }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', color: PDF_COLORS.muted, textTransform: 'uppercase', fontWeight: 600 }}>{st.date}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 14, textTransform: 'uppercase', marginTop: 1 * MM, lineHeight: 0.95, color: PDF_COLORS.ink }}>{st.label}</div>
              {st.status && <div style={{ marginTop: 1 * MM, padding: `${0.5 * MM}px ${2 * MM}px`, background: statusColor(st.status), color: '#fff', borderRadius: 999, fontFamily: 'Geist Mono', fontSize: 7, fontWeight: 600, display: 'inline-block' }}>{st.status}</div>}
            </div>
          ))}
        </div>
      </Abs>

      {/* Partners */}
      <Abs x={14} y={120}>
        <div style={{ display: 'flex', gap: 4 * MM }}>
          {V('reg_notified_body') && (
            <div style={{ fontSize: 9 }}><span style={{ color: PDF_COLORS.muted, fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Org. notifie:</span> <b>{V('reg_notified_body')}</b></div>
          )}
          {V('reg_cro') && (
            <div style={{ fontSize: 9 }}><span style={{ color: PDF_COLORS.muted, fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>CRO:</span> <b>{V('reg_cro')}</b></div>
          )}
        </div>
      </Abs>

      <PDFFooter startup={s.name} page={n} total={total}/>
    </div>
  );
};

// ── SLIDE 11 MT · Roadmap reglementaire ──────────────────────────────────
const SlideRoadmapReg = ({ s = LUMEN, n, total }) => {
  const milestones = [1,2,3,4,5,6].map(i => V(`rr${i}_title`) && {
    q: V(`rr${i}_quarter`), title: V(`rr${i}_title`), note: V(`rr${i}_note`, ''),
    c: [PDF_COLORS.orange, PDF_COLORS.teal, PDF_COLORS.violet, PDF_COLORS.magenta, PDF_COLORS.yellow, PDF_COLORS.lime][i-1],
  }).filter(Boolean);

  return (
    <div className="pdf-sheet">
      <PDFHeader startup={V('startupName') || s.name} logo={V('startup_logo')} kind="Pitch Deck" page={n} total={total}/>
      <Eyebrow x={14} y={22} accent={PDF_COLORS.violet}>11 — Roadmap reglementaire</Eyebrow>
      <TitleBlock x={14} y={30} size={36} lines={[
        { text: 'DU LABO' },
        { text: 'AU PATIENT.', color: PDF_COLORS.violet },
      ]}/>

      <Abs x={14} y={58}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 * MM, width: 252 * MM }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ width: milestones.length <= 4 ? `calc(${100/milestones.length}% - ${3 * MM}px)` : `calc(33% - ${3 * MM}px)`, borderTop: `3px solid ${m.c}`, paddingTop: 2 * MM }}>
              <div style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.14em', color: PDF_COLORS.muted, textTransform: 'uppercase', fontWeight: 600 }}>{m.q}</div>
              <div style={{ fontFamily: 'Anton', fontSize: 15, textTransform: 'uppercase', marginTop: 1 * MM, lineHeight: 0.95 }}>{m.title}</div>
              <div style={{ fontSize: 8.5, color: PDF_COLORS.muted, lineHeight: 1.4, marginTop: 1 * MM }}>{m.note}</div>
            </div>
          ))}
        </div>
      </Abs>

      <PDFFooter startup={s.name} page={n} total={total}/>
    </div>
  );
};

// ── Export ────────────────────────────────────────────────────────────────
Object.assign(window, {
  SlideTechnology, SlideValidationSci, SlideRoadmapRD,
  SlideProductMarketAccess, SlideValidationClin, SlideRegulatory, SlideRoadmapReg,
});
