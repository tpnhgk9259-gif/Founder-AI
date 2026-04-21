
/* ─── Agent data ─────────────────────────────────────────────────────────── */

const AGENTS = [
  { id: "maya", name: "Maya", role: "Directrice Stratégie", shortRole: "Stratégie", color: "#FF6A1F", avatar: "/avatar/maya_strategie.png" },
  { id: "alex", name: "Alex", role: "Directeur Commercial", shortRole: "Commercial", color: "#E8358E", avatar: "/avatar/alex_vente.png" },
  { id: "sam", name: "Sam", role: "Directeur Financier", shortRole: "Finance", color: "#0DB4A0", avatar: "/avatar/sam_finance.png" },
  { id: "leo", name: "Léo", role: "Directeur Produit", shortRole: "Produit", color: "#6E4BE8", avatar: "/avatar/leo_produit.png" },
  { id: "marc", name: "Marc", role: "Directeur des Opérations", shortRole: "Opérations", color: "#FFD12A", avatar: "/avatar/marc_operations.png" },
];

function Token({ agent, size = "sm" }: { agent: typeof AGENTS[0]; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-16 h-16" : size === "md" ? "w-11 h-11" : "w-7 h-7";

  return (
    <img
      src={agent.avatar}
      alt={`Agent ${agent.name} — ${agent.role}`}
      className={`${sz} rounded-full object-cover shrink-0`}
    />
  );
}

function Arrow({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5" />
      <path d="M8 12h8M13 8l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LandingV2() {
  return (
    <div className="font-[var(--uf-sans)] antialiased" style={{ background: "var(--uf-paper)", color: "var(--uf-ink)" }}>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-14 py-5 border-b" style={{ borderColor: "var(--uf-line)", background: "rgba(251,248,240,0.94)", backdropFilter: "blur(12px)" }}>
        <a href="/" className="flex items-center gap-2.5 text-lg font-semibold" style={{ color: "var(--uf-ink)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
          <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
        </a>
        <div className="hidden md:flex gap-9 text-[13px] font-medium" style={{ color: "var(--uf-ink)" }}>
          <a href="#equipe">L&apos;équipe</a>
          <a href="#features">Fonctionnalités</a>
          <a href="#tarifs">Tarifs</a>
          <a href="/guide">Guide</a>
          <a href="/partenaires/inscription">Devenir partenaire</a>
        </div>
        <div className="flex gap-2.5 items-center">
          <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 text-[11.5px] font-medium rounded-full border" style={{ fontFamily: "var(--uf-mono)", borderColor: "var(--uf-line)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--uf-lime)", boxShadow: "0 0 0 0 var(--uf-lime)" }} />
            2 147 en ligne
          </span>
          <a href="/connexion" className="px-3.5 py-2 text-[12.5px] font-medium rounded-full hover:-translate-y-px transition-transform" style={{ color: "var(--uf-ink)" }}>Se connecter</a>
          <a href="/inscription" className="px-3.5 py-2 text-[12.5px] font-medium rounded-full hover:-translate-y-px transition-transform flex items-center gap-2" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
            Essayer <Arrow size={14} color="var(--uf-paper)" />
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="px-14 pt-[88px] pb-24">
        <div className="max-w-[1328px] mx-auto">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              — FounderAI · Conseil de direction augmenté
            </span>
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase hidden md:block" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted-2)" }}>
              Saison 01 / 2026
            </span>
          </div>

          <div className="mb-1.5">
            <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(56px, 9vw, 128px)", lineHeight: 0.82 }}>Votre équipe</h1>
          </div>
          <div className="mb-2">
            <span className="italic" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(40px, 6vw, 84px)", lineHeight: 0.95, letterSpacing: "-0.01em" }}>de direction</span>
          </div>
          <div className="flex items-center gap-5 mb-10">
            <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(56px, 9vw, 128px)", lineHeight: 0.82 }}>pour grandir vite</h1>
            <div className="w-[78px] h-[78px] rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--uf-orange)" }}>
              <Arrow size={40} color="#fff" />
            </div>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-[72px] items-end mt-2">
            <p className="text-[19px] leading-relaxed max-w-[640px]">
              Cinq agents IA entraînés comme un vrai board — stratégie, vente, finance, produit, opérations.
              <span style={{ color: "var(--uf-muted)" }}> Interrogez-les individuellement, ou réunissez-les en CODIR sur une décision critique.</span>
            </p>
            <div className="flex flex-col gap-3.5 items-start">
              <div className="flex gap-2.5 flex-wrap">
                <a href="/inscription" className="px-7 py-4 text-[15px] font-medium rounded-full flex items-center gap-2.5 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
                  Démarrer gratuitement <Arrow size={16} color="var(--uf-paper)" />
                </a>
                <a href="#codir" className="px-7 py-4 text-[15px] font-medium rounded-full border hover:-translate-y-px transition-transform" style={{ borderColor: "var(--uf-line-2)", color: "var(--uf-ink)" }}>
                  ▶ Voir un CODIR
                </a>
              </div>
              <span className="text-[13px]" style={{ color: "var(--uf-muted)" }}>14 jours · Sans CB · Annulation en 1 clic</span>
            </div>
          </div>

          {/* Agents strip */}
          <div className="mt-[72px] px-7 py-[22px] rounded-full border flex items-center justify-between flex-wrap gap-4" style={{ background: "var(--uf-card)", borderColor: "var(--uf-line)" }}>
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Votre équipe</span>
            <div className="flex items-center gap-7 flex-wrap">
              {AGENTS.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <Token agent={a} size="sm" />
                  <div>
                    <div className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 18 }}>{a.name}</div>
                    <div className="text-[10.5px] tracking-[0.1em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>{a.shortRole}</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#equipe" className="px-3.5 py-2 text-[12.5px] font-medium rounded-full hover:-translate-y-px transition-transform" style={{ color: "var(--uf-ink)" }}>Voir l&apos;équipe →</a>
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────────────────── */}
      <section className="py-5 overflow-hidden" style={{ background: "var(--uf-ink)" }}>
        <div className="whitespace-nowrap">
          <div className="inline-flex gap-14 items-center animate-[uf-mar_50s_linear_infinite]">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="inline-flex gap-14 items-center">
                {[
                  ["MAYA", "vient de livrer un pitch deck à Juliette (Seed SaaS)"],
                  ["ALEX", "a généré 84 ventes ce mois-ci"],
                  ["SAM", "a livré le business plan de Series A en 20 minutes"],
                  ["LÉO", "a réduit de 50% le coût du MVP"],
                  ["MARC", "a boosté nos KPIs de 20% en moins de 3 mois"],
                  ["CODIR", "· 3 mauvaises décisions évitées ce mois-ci"],
                ].map(([name, text], i) => (
                  <span key={`${k}-${i}`} className="inline-flex items-center gap-3" style={{ fontFamily: "var(--uf-mono)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--uf-lime)", fontFamily: "var(--uf-display)", fontSize: 20, letterSpacing: "0.02em" }}>{name}</span>
                    <span style={{ color: "var(--uf-muted-2)" }}>{text}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes uf-mar { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ── LOGOS ──────────────────────────────────────────────────────────── */}
      <section className="px-14 py-14 border-b" style={{ borderColor: "var(--uf-line)" }}>
        <div className="max-w-[1328px] mx-auto grid md:grid-cols-[240px_1fr] gap-12 items-center">
          <span className="italic text-[22px]" style={{ fontFamily: "var(--uf-serif)" }}>Des fondateurs en pré-seed jusqu&apos;à la série A.</span>
          <div className="flex gap-11 items-center flex-wrap">
            {["Pulsalys", "Les Premières", "Réseau Entreprendre", "Bpifrance", "H7", "Le Village by CA"].map((l, i) => (
              <div key={l} style={{
                fontFamily: i % 2 ? "var(--uf-serif)" : "var(--uf-display)",
                fontSize: i % 2 ? 22 : 18,
                fontStyle: i % 2 ? "italic" : "normal",
                textTransform: i % 2 ? "none" : "uppercase",
                letterSpacing: i % 2 ? 0 : "0.02em",
                color: "var(--uf-muted)",
              }}>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── L'ÉQUIPE ──────────────────────────────────────────────────────── */}
      <section id="equipe" className="px-14 py-28">
        <div className="max-w-[1328px] mx-auto">
          <div className="flex justify-between items-baseline mb-10">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>01 — L&apos;équipe</span>
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted-2)" }}>5 / 5 spécialistes</span>
          </div>

          <div className="flex items-baseline gap-4 flex-wrap mb-4">
            <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(48px, 7.5vw, 112px)", lineHeight: 0.82 }}>5 spécialistes.</h2>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <span className="italic" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 0.95, color: "var(--uf-muted)" }}>Une</span>
            <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(48px, 7.5vw, 112px)", lineHeight: 0.82 }}>mission.</h2>
          </div>

          <p className="text-[17px] leading-relaxed max-w-[720px] mt-8 mb-14" style={{ color: "var(--uf-muted)" }}>
            Chaque agent est entraîné pour que vous réalisiez la meilleure exécution.
            La vallée de la mort, c&apos;est excitant. Mais on n&apos;a pas envie d&apos;y rester très longtemps.
          </p>

          <div className="grid md:grid-cols-3 gap-3.5">
            {[
              { agent: AGENTS[0], desc: "Positionnement, roadmap produit et analyse concurrentielle. Maya vous aide à faire les bons choix au bon moment.", tags: ["Roadmap", "OKR", "Veille marché", "Pivot stratégique"] },
              { agent: AGENTS[1], desc: "Stratégie de croissance, acquisition client, partnerships et sales. Alex analyse votre pipeline et identifie vos leviers de revenus.", tags: ["Go-to-market", "Pipeline CRM", "Pricing", "Partenariats"] },
              { agent: AGENTS[2], desc: "Modélisation financière, cash flow et préparation des levées de fonds. Sam garde un œil sur votre runway à tout moment.", tags: ["Runway", "Modèle financier", "Term sheet", "Unit economics"] },
              { agent: AGENTS[3], desc: "Conception produit, architecture et dette technique. Léo traduit vos ambitions en décisions produit et tech solides.", tags: ["MVP design", "Architecture", "Build vs buy", "Recrutement tech"] },
              { agent: AGENTS[4], desc: "Organisation, process et structuration d'équipe. Marc transforme le chaos startup en machine bien huilée.", tags: ["OKR", "Recrutement", "Process", "Scaling ops"] },
            ].map(({ agent, desc, tags }, i) => (
              <div key={agent.id} className={`border p-7 flex flex-col gap-5 min-h-[260px] ${i === 3 ? "md:col-start-1" : i === 4 ? "md:col-start-2" : ""}`} style={{ background: "var(--uf-card)", borderColor: "var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                <div className="flex items-start justify-between">
                  <Token agent={agent} size="lg" />
                  <div className="text-[10px] tracking-[0.14em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>0{i + 1}</div>
                </div>
                <div>
                  <div className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 40 }}>{agent.name}</div>
                  <div className="mt-1 text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: agent.color }}>{agent.role}</div>
                </div>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--uf-muted)" }}>{desc}</p>
                <div className="mt-auto flex gap-1 flex-wrap">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-1 text-[11px] font-medium" style={{ fontFamily: "var(--uf-mono)", background: "var(--uf-paper-2)", borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODIR ─────────────────────────────────────────────────────────── */}
      <section id="codir" className="px-14 pb-28">
        <div className="max-w-[1328px] mx-auto">
          <div className="relative overflow-hidden grid md:grid-cols-[1.3fr_1fr] gap-14 items-center" style={{ background: "var(--uf-ink)", borderRadius: "var(--uf-r-xl)", padding: "72px 56px", color: "var(--uf-paper)" }}>
            <div className="absolute -top-[60px] -right-10 w-[220px] h-[220px] rounded-full" style={{ background: "var(--uf-orange)", opacity: 0.95 }} />

            <div className="relative z-10">
              <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-lime)" }}>02 — Mode CODIR</span>
              <h3 className="uppercase tracking-[-0.015em] mt-4" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(48px, 7vw, 104px)", lineHeight: 0.82, color: "var(--uf-paper)" }}>
                Réunissez les cinq
              </h3>
              <div className="italic mt-1.5" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 0.95, color: "var(--uf-lime)" }}>
                autour d&apos;une seule question.
              </div>
              <p className="mt-6 text-[16px] leading-relaxed max-w-[560px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                Vos agents confrontent leurs points de vue. Maya pousse la vision, Sam tire sur le cash,
                Alex défend l&apos;exécution. Vous arbitrez — avec la synthèse écrite qui en découle.
              </p>
              <div className="mt-8 flex gap-4 items-center flex-wrap">
                <a href="/inscription" className="px-7 py-4 text-[15px] font-medium rounded-full flex items-center gap-2.5 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-lime)", color: "var(--uf-ink)" }}>
                  Lancer une session <Arrow size={16} color="var(--uf-ink)" />
                </a>
                <div className="flex items-center">
                  {AGENTS.map((a, i) => (
                    <div key={a.id} className="rounded-full" style={{ marginLeft: i === 0 ? 0 : -14, border: "3px solid var(--uf-ink)" }}>
                      <Token agent={a} size="md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mock CODIR */}
            <div className="relative z-10 border p-[22px]" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", borderRadius: 18 }}>
              <div className="flex items-center gap-2.5 pb-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--uf-lime)" }} />
                <span className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "rgba(255,255,255,0.7)" }}>Session en cours · 00:47</span>
              </div>
              <div className="mt-3.5 grid gap-2.5">
                {[
                  [AGENTS[0], "Je pousse pour un positionnement plus haut de gamme — Series A oblige."],
                  [AGENTS[2], "Runway actuel : 14 mois. Un pricing à +30% nous donne 4 mois de plus."],
                  [AGENTS[1], "Le marché peut absorber. J'ai 12 signaux de willingness-to-pay."],
                ].map(([a, t], i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <Token agent={a as typeof AGENTS[0]} size="sm" />
                    <div className="flex-1">
                      <div className="tracking-[0.02em]" style={{ fontFamily: "var(--uf-display)", fontSize: 13, color: (a as typeof AGENTS[0]).color }}>{(a as typeof AGENTS[0]).name.toUpperCase()}</div>
                      <div className="text-[13px] leading-snug mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>{t as string}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex items-center gap-2.5 px-3.5 py-2.5" style={{ background: "var(--uf-lime)", color: "var(--uf-ink)", borderRadius: 8 }}>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ fontFamily: "var(--uf-mono)" }}>✦ Synthèse</span>
                <span className="text-[12px] font-medium">Note de décision prête · pricing_v3.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="px-14 pb-28">
        <div className="max-w-[1328px] mx-auto">
          <div className="flex justify-between items-baseline mb-10">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>03 — Ce qu&apos;ils font concrètement</span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap mb-2.5">
            <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(40px, 6.5vw, 96px)", lineHeight: 0.82 }}>Des livrables,</h2>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap mb-14">
            <span className="italic" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(32px, 5vw, 72px)", lineHeight: 0.95, color: "var(--uf-muted)" }}>pas des conversations</span>
            <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(32px, 5vw, 72px)", lineHeight: 0.82 }}>qui tournent en rond.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-3.5">
            {[
              { t: "Mémoire contextuelle", d: "Uploadez deck, KPIs, contrats. Les agents y reviennent sans qu'on ait à ré-expliquer.", kpi: "2 Go", kpiLabel: "par startup", accent: "var(--uf-orange)" },
              { t: "Documents générés", d: "Business plan, pitch, specs, contrats, emails. Markdown, PDF, DOCX.", kpi: "47", kpiLabel: "formats", accent: "var(--uf-teal)" },
              { t: "Mode CODIR", d: "Les 5 agents en parallèle sur une question. Synthèse des désaccords.", kpi: "< 90s", kpiLabel: "par session", accent: "var(--uf-magenta)" },
              { t: "Base de connaissances", d: "Playbooks YC, First Round, Reforge, SaaStr déjà chargés. Plus vos sources.", kpi: "12k+", kpiLabel: "ressources", accent: "var(--uf-violet)" },
              { t: "Suivi de KPIs", d: "CA, marge, acquisition, rétention — ajoutez vos indicateurs clés et les agents les utilisent pour calibrer leurs recommandations.", kpi: "9", kpiLabel: "intégrations", accent: "var(--uf-yellow)" },
              { t: "Confidentialité", d: "Jamais utilisées pour entraîner. Hébergement UE. SOC 2 en cours.", kpi: "FR/UE", kpiLabel: "hébergement", accent: "var(--uf-ink)" },
            ].map((f, i) => (
              <div key={f.t} className="relative overflow-hidden border p-7 flex flex-col min-h-[240px]" style={{ background: "var(--uf-card)", borderColor: "var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                <div className="absolute top-0 left-0 w-10 h-1" style={{ background: f.accent }} />
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>0{i + 1}</span>
                  <div className="text-right">
                    <div className="uppercase" style={{ fontFamily: "var(--uf-display)", fontSize: 48, lineHeight: 0.9, color: f.accent === "var(--uf-yellow)" ? "var(--uf-ink)" : f.accent }}>{f.kpi}</div>
                    <div className="text-[10.5px] mt-1 tracking-[0.1em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>{f.kpiLabel}</div>
                  </div>
                </div>
                <div className="flex-1" />
                <div>
                  <div className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 26 }}>{f.t}</div>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--uf-muted)" }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="tarifs" className="px-14 pb-28">
        <div className="max-w-[1328px] mx-auto">
          <div className="flex justify-between items-baseline mb-8">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>04 — Tarifs</span>
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted-2)" }}>Mensuel · TTC</span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap mb-4">
            <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(40px, 6.5vw, 96px)", lineHeight: 0.82 }}>Un plan par</h2>
            <span className="italic" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(32px, 5vw, 72px)", lineHeight: 0.95 }}>étape de vie.</span>
          </div>
          <p className="text-[15px] mb-10" style={{ color: "var(--uf-muted)" }}>14 jours d&apos;essai. Sans CB. Annulation en 1 clic.</p>

          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {[
              { name: "Starter", price: "49", tagline: "Idéation & premier pitch", agents: ["maya", "alex", "leo"], features: ["3 agents au choix", "50 sessions / mois", "5 livrables / mois", "Mémoire contextuelle 3 mois", "Support Community"], featured: false },
              { name: "Growth", price: "149", tagline: "Traction & premières ventes", agents: ["maya", "alex", "leo", "sam"], features: ["5 agents + CODIR", "Sessions illimitées", "20 livrables / mois", "Mémoire contextuelle 12 mois", "Support email prioritaire"], featured: true },
              { name: "Scale", price: "349", tagline: "Équipe constituée, levée en vue", agents: AGENTS.map((a) => a.id), features: ["5 agents + CODIR", "Sessions illimitées", "Livrables illimités", "Mémoire contextuelle illimitée", "1h / mois de support premium inclus"], featured: false },
            ].map((plan) => (
              <div key={plan.name} className="relative flex flex-col p-7 min-h-[540px]" style={{
                background: plan.featured ? "var(--uf-ink)" : "var(--uf-card)",
                color: plan.featured ? "var(--uf-paper)" : "var(--uf-ink)",
                border: plan.featured ? "none" : "1px solid var(--uf-line)",
                borderRadius: "var(--uf-r-xl)",
              }}>
                {plan.featured && (
                  <span className="absolute -top-3 left-6 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", background: "var(--uf-lime)", color: "var(--uf-ink)" }}>
                    ★ Le plus choisi
                  </span>
                )}
                <div>
                  <div className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: plan.featured ? "var(--uf-lime)" : "var(--uf-muted)" }}>{plan.name}</div>
                  <div className="mt-2 text-[14px]" style={{ color: plan.featured ? "rgba(255,255,255,0.78)" : "var(--uf-muted)" }}>{plan.tagline}</div>
                </div>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="uppercase" style={{ fontFamily: "var(--uf-display)", fontSize: 88, lineHeight: 0.9 }}>{plan.price}€</span>
                  <span className="text-[14px]" style={{ color: plan.featured ? "rgba(255,255,255,0.78)" : "var(--uf-muted)" }}>/mois</span>
                </div>
                <div className="mt-4 flex gap-1.5 items-center">
                  {AGENTS.filter((a) => plan.agents.includes(a.id)).map((a) => <Token key={a.id} agent={a} size="sm" />)}
                  {plan.agents.length < 5 && <span className="text-[11px] ml-1" style={{ fontFamily: "var(--uf-mono)", color: plan.featured ? "rgba(255,255,255,0.78)" : "var(--uf-muted)" }}>{plan.agents.length}/5</span>}
                </div>
                <ul className="mt-6 grid gap-2.5 text-[13.5px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5 items-start">
                      <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5" style={{
                        background: plan.featured ? "var(--uf-lime)" : "var(--uf-ink)",
                        color: plan.featured ? "var(--uf-ink)" : "var(--uf-lime)",
                      }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex-1" />
                <a href="/inscription" className="mt-7 w-full text-center px-7 py-4 text-[15px] font-medium rounded-full hover:-translate-y-px transition-transform block" style={{
                  background: plan.featured ? "var(--uf-lime)" : "var(--uf-ink)",
                  color: plan.featured ? "var(--uf-ink)" : "var(--uf-paper)",
                }}>
                  {plan.featured ? "Démarrer avec Growth" : `Choisir ${plan.name}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="px-14 pb-28">
        <div className="max-w-[1328px] mx-auto">
          <div className="relative overflow-hidden text-white" style={{ background: "var(--uf-orange)", borderRadius: "var(--uf-r-xl)", padding: "80px 56px" }}>
            <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full" style={{ background: "var(--uf-ink)" }} />
            <div className="relative z-10 max-w-[900px]">
              <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "rgba(255,255,255,0.8)" }}>— Commencez maintenant</span>
              <h2 className="uppercase tracking-[-0.015em] mt-4" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(48px, 7.5vw, 112px)", lineHeight: 0.82 }}>Prenez vos prochaines</h2>
              <div className="flex items-baseline gap-4 flex-wrap mt-1">
                <h2 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: "clamp(48px, 7.5vw, 112px)", lineHeight: 0.82 }}>décisions</h2>
                <span className="italic" style={{ fontFamily: "var(--uf-serif)", fontSize: "clamp(36px, 5.5vw, 80px)", lineHeight: 0.95, color: "var(--uf-ink)" }}>avec conseil.</span>
              </div>
              <div className="flex gap-3 mt-10 flex-wrap">
                <a href="/inscription" className="px-7 py-4 text-[15px] font-medium rounded-full flex items-center gap-2.5 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-ink)", color: "#fff" }}>
                  Commencer gratuitement <Arrow size={16} color="#fff" />
                </a>
                <a href="/guide" className="px-7 py-4 text-[15px] font-medium rounded-full hover:-translate-y-px transition-transform" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}>
                  Parler à un fondateur
                </a>
              </div>
              <div className="mt-4 text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }}>Pas de CB · Annulation en 1 clic · Hébergé en France</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="px-14 pt-14 pb-7 border-t" style={{ borderColor: "var(--uf-line)" }}>
        <div className="max-w-[1328px] mx-auto grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">
          <div>
            <a href="/" className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
            </a>
            <p className="mt-3.5 text-[13px] leading-relaxed max-w-[280px]" style={{ color: "var(--uf-muted)" }}>
              FounderAI SAS · Hébergé en France
            </p>
          </div>
          {[
            ["Produit", [["L'équipe", "#equipe"], ["Fonctionnalités", "#features"], ["Tarifs", "#tarifs"], ["Guide", "/guide"]]],
            ["Ressources", [["Guide fondateur", "/guide"], ["Templates", "#"]]],
            ["Entreprise", [["Partenaires", "/partenaires/inscription"], ["Contact", "#"]]],
            ["Légal", [["CGU", "/cgu"], ["Confidentialité", "/politique-confidentialite"], ["Mentions légales", "/mentions-legales"]]],
          ].map(([title, items]) => (
            <div key={title as string}>
              <div className="text-[11px] font-medium tracking-[0.16em] uppercase mb-3.5" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>{title as string}</div>
              <ul className="grid gap-2.5 text-[13px]">
                {(items as string[][]).map(([label, href]) => (
                  <li key={label}><a href={href} className="hover:underline">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1328px] mx-auto mt-10 pt-6 border-t flex justify-between text-[12px]" style={{ borderColor: "var(--uf-line)", color: "var(--uf-muted)" }}>
          <span>© 2026 FounderAI</span>
          <span>v2.1 · Hébergé en France</span>
        </div>
      </footer>
    </div>
  );
}
