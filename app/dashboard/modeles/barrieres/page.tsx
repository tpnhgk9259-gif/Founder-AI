"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

type BarrierSection = {
  key: string;
  label: string;
  description: string;
  color: string;
  num: string;
  placeholder: string;
};

const SECTIONS: BarrierSection[] = [
  {
    key: "ip",
    label: "Propriété intellectuelle",
    description: "Brevets, marques, secrets industriels, licences exclusives, droits d'auteur, savoir-faire protege.",
    color: "#FF6A1F",
    num: "01",
    placeholder: "- Brevet FR2301234 : procede de synthese (depose, en cours d'extension PCT)\n- Marque FounderAI enregistree INPI (classes 9, 35, 42)\n- Secret industriel : algorithme de scoring entraine sur 50k cas\n- Licence exclusive CEA-Liten pour l'electrolyte sulfure",
  },
  {
    key: "network_effects",
    label: "Effets reseau",
    description: "Plus il y a d'utilisateurs, plus la valeur augmente. Donnees partagees, marketplace, communaute, viralite.",
    color: "#E8358E",
    num: "02",
    placeholder: "- Chaque nouveau client enrichit la base de benchmarks sectoriels\n- Marketplace de templates : les users creent du contenu pour les autres\n- Effet reseau indirect : plus de startups = plus de partenaires attires\n- Communaute Slack de 400 fondateurs (entraide + retention)",
  },
  {
    key: "switching_costs",
    label: "Switching costs",
    description: "Ce qui rend le depart douloureux : integrations profondes, donnees accumulees, formation, habitudes, contrats.",
    color: "#6E4BE8",
    num: "03",
    placeholder: "- Integration bidirectionnelle avec le CRM (2h de setup)\n- 6 mois d'historique conversationnel non-exportable\n- Formation equipe (3 sessions de 45min)\n- Workflows personnalises qui ne migrent pas\n- Engagement annuel avec decote 20%",
  },
  {
    key: "data_advantage",
    label: "Avantage de donnees",
    description: "Donnees proprietaires qui s'enrichissent avec l'usage. Modeles entraines, datasets uniques, feedback loops.",
    color: "#0DB4A0",
    num: "04",
    placeholder: "- Dataset de 12 000 profils startup analyses (non-reproductible)\n- Modele de scoring entraine sur 18 mois de decisions reelles\n- Feedback loop : chaque interaction ameliore les recommandations\n- Donnees sectorielles exclusives (partenariat federation)",
  },
  {
    key: "economies_scale",
    label: "Economies d'echelle",
    description: "Couts qui baissent avec le volume : infra mutualisee, pouvoir de negociation, brand, equipe amortie.",
    color: "#FFD12A",
    num: "05",
    placeholder: "- Cout marginal par user quasi-nul (SaaS)\n- Negociation fournisseur API : -60% au-dela de 10k appels/jour\n- Brand awareness : CAC divise par 3 en 18 mois\n- 1 CSM pour 200 comptes (ratio qui s'ameliore avec le self-service)",
  },
];

type BarrierScore = {
  current: number; // 1-5
  target18m: number; // 1-5
};

type BarriersData = {
  sections: Record<string, string>;
  scores: Record<string, BarrierScore>;
  synthesis: string;
};

function emptyData(): BarriersData {
  return {
    sections: Object.fromEntries(SECTIONS.map(s => [s.key, ""])),
    scores: Object.fromEntries(SECTIONS.map(s => [s.key, { current: 0, target18m: 0 }])),
    synthesis: "",
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function BarrieresPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [data, setData] = useState<BarriersData>(emptyData());
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      fetch(`/api/startup?startupId=${sid}`)
        .then((r) => r.json())
        .then((d) => { if (d?.name) setStartupName(d.name); })
        .catch(() => {});
      const saved = localStorage.getItem(`founderai_barrieres_${sid}`);
      if (saved) { try { setData(JSON.parse(saved)); } catch { /* ignore */ } }
    }
  }, []);

  function persist(d: BarriersData) {
    if (startupId) localStorage.setItem(`founderai_barrieres_${startupId}`, JSON.stringify(d));
  }

  function updateSection(key: string, val: string) {
    setData(prev => { const next = { ...prev, sections: { ...prev.sections, [key]: val } }; persist(next); return next; });
  }

  function updateScore(key: string, field: "current" | "target18m", val: number) {
    setData(prev => {
      const next = { ...prev, scores: { ...prev.scores, [key]: { ...prev.scores[key], [field]: val } } };
      persist(next); return next;
    });
  }

  function updateSynthesis(val: string) {
    setData(prev => { const next = { ...prev, synthesis: val }; persist(next); return next; });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true); setError("");
    try {
      const filledSections = Object.fromEntries(Object.entries(data.sections).filter(([, v]) => v.trim()));
      const res = await fetch("/api/ai/fill-barrieres", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, userContext: filledSections }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      if (json.data) {
        const merged = { ...json.data };
        // Ne pas ecraser les sections remplies par l'utilisateur
        merged.sections = { ...(merged.sections || {}), ...filledSections };
        // Ne pas ecraser les scores deja definis
        if (Object.values(data.scores).some(s => s.current > 0)) merged.scores = data.scores;
        if (data.synthesis.trim()) merged.synthesis = data.synthesis;
        setData(merged); persist(merged);
      }
    } catch { setError("Erreur inattendue."); }
    finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_barrieres", JSON.stringify({ ...data, startupName }));
    window.open("/barrieres-preview.html", "_blank");
  }

  const hasContent = Object.values(data.sections).some(v => v.trim()) || Object.values(data.scores).some(s => s.current > 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard?tab=documents" className="text-sm hover:underline flex items-center gap-1 mb-3" style={{ color: "var(--uf-orange)" }}>
              {"\u2190"} Retour aux documents
            </a>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 22, lineHeight: 0.85, color: "var(--uf-ink)" }}>
                {"Barri\u00E8res \u00E0 l'entr\u00E9e"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoFill} disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}>
              {filling ? "Generation..." : "Demander a mes agents"}
            </button>
            <button onClick={() => { setData(emptyData()); if (startupId) localStorage.removeItem(`founderai_barrieres_${startupId}`); setError(""); }}
              className="px-4 py-2.5 text-sm font-medium rounded-full"
              style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>
              Vider
            </button>
            <button onClick={openPreview} disabled={!hasContent}
              className="px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              Preview & Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {error && <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>{error}</div>}

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.key} className="p-5" style={{ background: "var(--uf-card)", border: `1.5px solid ${section.color}30`, borderLeft: `4px solid ${section.color}`, borderRadius: "var(--uf-r-xl)" }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: section.color, fontFamily: "var(--uf-mono)" }}>{section.num}</span>
              <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>{section.label}</h2>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>{section.description}</p>

            <textarea
              value={data.sections[section.key]}
              onChange={(e) => updateSection(section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={4}
              className="w-full text-sm px-4 py-3 focus:outline-none resize-y mb-3"
              style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)", color: "var(--uf-ink)", background: "var(--uf-paper)", lineHeight: 1.6 }}
            />

            {/* Scoring */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Aujourd'hui</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => updateScore(section.key, "current", data.scores[section.key]?.current === n ? 0 : n)}
                      className="w-7 h-7 rounded text-[10px] font-bold" style={{ background: (data.scores[section.key]?.current ?? 0) >= n ? section.color : "var(--uf-paper-2)", color: (data.scores[section.key]?.current ?? 0) >= n ? "#fff" : "var(--uf-muted)", border: "none", cursor: "pointer" }}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Dans 18 mois</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => updateScore(section.key, "target18m", data.scores[section.key]?.target18m === n ? 0 : n)}
                      className="w-7 h-7 rounded text-[10px] font-bold" style={{ background: (data.scores[section.key]?.target18m ?? 0) >= n ? `${section.color}80` : "var(--uf-paper-2)", color: (data.scores[section.key]?.target18m ?? 0) >= n ? "#fff" : "var(--uf-muted)", border: `1.5px dashed ${(data.scores[section.key]?.target18m ?? 0) >= n ? section.color : "transparent"}`, cursor: "pointer" }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Synthese */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "2px solid var(--uf-ink)", borderRadius: "var(--uf-r-xl)" }}>
          <h2 className="font-bold uppercase tracking-wide mb-1" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>
            {"Synth\u00E8se : pourquoi on est difficile \u00E0 copier"}
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            En 2-3 phrases, expliquez pourquoi un concurrent ne peut pas reproduire votre avantage en moins de 18 mois.
          </p>
          <textarea
            value={data.synthesis}
            onChange={(e) => updateSynthesis(e.target.value)}
            placeholder="Notre combinaison brevet + 12 mois de donnees d'usage + integrations profondes chez 50 clients cree un fosse que meme un acteur finance ne peut combler en moins de 2 ans. Les effets reseau accelerent : chaque nouveau client enrichit les benchmarks pour tous les autres."
            rows={3}
            className="w-full text-sm px-4 py-3 focus:outline-none resize-y"
            style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)", color: "var(--uf-ink)", background: "var(--uf-paper)", lineHeight: 1.6, fontWeight: 500 }}
          />
        </div>

        <p className="text-center text-[11px] pt-2" style={{ color: "var(--uf-muted)" }}>
          Identifiez vos 2-3 barrieres les plus fortes. Les investisseurs cherchent la defensibilite.
        </p>
      </div>
    </div>
  );
}
