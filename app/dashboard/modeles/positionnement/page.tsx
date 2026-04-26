"use client";

import { useState, useEffect } from "react";

// ── Obviously Awesome — April Dunford ───────────────────────────────────────
// 5 composantes + positionnement

type Section = {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  color: string;
  num: string;
};

const SECTIONS: Section[] = [
  {
    key: "competitive_alternatives",
    label: "Alternatives compétitives",
    description: "Que feraient vos clients si votre produit n'existait pas ? Listez les alternatives réelles (concurrents directs, solutions artisanales, Excel, ne rien faire...).",
    placeholder: "1. Tableur Excel + consultant externe\n2. ERP généraliste (SAP, Odoo)\n3. Solution maison bricolée\n4. Ne rien faire (statu quo)",
    color: "#E8358E",
    num: "01",
  },
  {
    key: "unique_attributes",
    label: "Attributs uniques",
    description: "Quelles fonctionnalités ou capacités avez-vous que les alternatives n'ont pas ? Soyez factuel et spécifique.",
    placeholder: "1. IA prédictive entraînée sur 50 000 cas sectoriels\n2. Mise en place en 48h (vs 6 mois pour un ERP)\n3. Interface no-code pour les non-techniques\n4. Intégration native avec les outils existants",
    color: "#6E4BE8",
    num: "02",
  },
  {
    key: "value",
    label: "Valeur délivrée",
    description: "Quelle valeur concrète ces attributs uniques apportent à vos clients ? Traduisez les features en bénéfices mesurables.",
    placeholder: "1. Réduction de 40% du temps de décision\n2. ROI visible en 30 jours (pas 18 mois)\n3. Accessible à toute l'équipe, pas seulement au DSI\n4. Zéro migration — fonctionne avec l'existant",
    color: "#FF6A1F",
    num: "03",
  },
  {
    key: "target_market",
    label: "Marché cible",
    description: "Qui sont les clients qui valorisent le plus cette valeur ? Décrivez votre ICP (Ideal Customer Profile) et vos early adopters.",
    placeholder: "ICP : PME industrielles 50-500 employés, France\nEarly adopters : Directeurs ops qui gèrent encore avec Excel\nTaille marché cible : 12 000 entreprises en France\nBudget annuel moyen : 15-50k€ pour ce type d'outil",
    color: "#0DB4A0",
    num: "04",
  },
  {
    key: "market_category",
    label: "Catégorie de marché",
    description: "Dans quelle catégorie vous positionnez-vous pour rendre votre valeur évidente ? Existante (leader/challenger), adjacente (sous-segment), ou nouvelle ?",
    placeholder: "Catégorie : Copilote IA pour les opérations industrielles\nStratégie : Nouvelle catégorie (pas un ERP, pas un BI, pas un consultant)\nContexte : L'IA rend enfin possible l'analyse prédictive accessible aux PME\nRéférent connu : \"Le Datadog des opérations industrielles\"",
    color: "#FFD12A",
    num: "05",
  },
];

const STATEMENT_KEY = "positioning_statement";
const BEACHHEAD_KEY = "beachhead_plan";
const MAX_SEGMENTS = 8;

type Segment = {
  name: string;
  urgency: number;       // 1-5
  accessibility: number; // 1-5
  potential: number;     // 1-5
  competition: number;   // 1-5 (1 = très concurrentiel, 5 = océan bleu)
};

function emptySegment(): Segment {
  return { name: "", urgency: 0, accessibility: 0, potential: 0, competition: 0 };
}

function segmentScore(s: Segment): number {
  return s.urgency + s.accessibility + s.potential + s.competition;
}

export default function PositionnementPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [startupLogo, setStartupLogo] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries([...SECTIONS.map((s) => [s.key, ""]), [STATEMENT_KEY, ""], [BEACHHEAD_KEY, ""]])
  );
  const [segments, setSegments] = useState<Segment[]>([emptySegment(), emptySegment(), emptySegment(), emptySegment()]);
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      fetch(`/api/startup?startupId=${sid}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.name) setStartupName(data.name);
          if (data?.logo) setStartupLogo(data.logo);
        })
        .catch(() => {});
      const saved = localStorage.getItem(`founderai_positioning_${sid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed._segments) { setSegments(parsed._segments); delete parsed._segments; }
          setValues((prev) => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }
    }
  }, []);

  function persist(vals: Record<string, string>, segs: Segment[]) {
    if (startupId) localStorage.setItem(`founderai_positioning_${startupId}`, JSON.stringify({ ...vals, _segments: segs }));
  }

  function updateField(key: string, val: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      persist(next, segments);
      return next;
    });
  }

  function updateSegment(idx: number, patch: Partial<Segment>) {
    setSegments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      persist(values, next);
      return next;
    });
  }

  function addSegment() {
    if (segments.length >= MAX_SEGMENTS) return;
    setSegments((prev) => {
      const next = [...prev, emptySegment()];
      persist(values, next);
      return next;
    });
  }

  function removeSegment(idx: number) {
    if (segments.length <= 2) return;
    setSegments((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      persist(values, next);
      return next;
    });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fill-positioning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur lors de la génération."); return; }
      const newSegments = json.segments ?? segments;
      if (json.segments) setSegments(newSegments);
      setValues((prev) => {
        const next = { ...prev, ...json.values };
        persist(next, newSegments);
        return next;
      });
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setFilling(false);
    }
  }

  function openPreview() {
    const data = { ...values, _segments: segments, startupName };
    sessionStorage.setItem("founderai_positioning", JSON.stringify(data));
    window.open("/positionnement-preview.html", "_blank");
  }

  const hasContent = Object.values(values).some((v) => v.trim().length > 0) || segments.some((s) => s.name.trim());
  const filledSegments = segments.filter((s) => s.name.trim() && s.urgency > 0);
  const bestSegment = filledSegments.length > 0
    ? filledSegments.reduce((a, b) => segmentScore(a) > segmentScore(b) ? a : b)
    : null;

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
              <div>
                <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 22, lineHeight: 0.85, color: "var(--uf-ink)" }}>
                  Positionnement
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoFill}
              disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}
            >
              {filling ? "Génération..." : "Demander à mes agents"}
            </button>
            <button
              onClick={() => {
                const empty = Object.fromEntries([...SECTIONS.map((s) => [s.key, ""]), [STATEMENT_KEY, ""], [BEACHHEAD_KEY, ""]]);
                setValues(empty);
                setSegments([emptySegment(), emptySegment(), emptySegment(), emptySegment()]);
                if (startupId) localStorage.removeItem(`founderai_positioning_${startupId}`);
                setError("");
              }}
              className="px-4 py-2.5 text-sm font-medium rounded-full transition-all"
              style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}
            >
              Vider
            </button>
            <button
              onClick={openPreview}
              disabled={!hasContent}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              Preview & Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {error && (
          <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>
            {error}
          </div>
        )}

        {/* 5 composantes */}
        {SECTIONS.map((section) => (
          <div
            key={section.key}
            className="p-5"
            style={{
              background: "var(--uf-card)",
              border: `1.5px solid ${section.color}30`,
              borderLeft: `4px solid ${section.color}`,
              borderRadius: "var(--uf-r-xl)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: section.color, fontFamily: "var(--uf-mono)" }}
              >
                {section.num}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>
                {section.label}
              </h2>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
              {section.description}
            </p>
            <textarea
              value={values[section.key]}
              onChange={(e) => updateField(section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={5}
              className="w-full text-sm px-4 py-3 focus:outline-none resize-y"
              style={{
                border: "1px solid var(--uf-line)",
                borderRadius: "var(--uf-r-lg)",
                color: "var(--uf-ink)",
                background: "var(--uf-paper)",
                lineHeight: 1.6,
              }}
            />
          </div>
        ))}

        {/* ── Section 6 : Segmentation & Beachhead ── */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #0DB4A050", borderLeft: "4px solid #0DB4A0", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#0DB4A0", fontFamily: "var(--uf-mono)" }}>06</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>
              Segmentation & March{"\u00E9"} d'ancrage
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            Listez vos segments potentiels et notez-les. Le segment avec le meilleur score devient votre march{"\u00E9"} d'ancrage {"\u2014"} celui que vous pouvez dominer en premier.
          </p>

          {/* Grille de scoring */}
          <div style={{ overflowX: "auto" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)", borderBottom: "2px solid var(--uf-ink)", width: "35%" }}>Segment</th>
                  <th className="text-center px-2 py-2 text-[10px] font-medium tracking-[0.12em] uppercase cursor-help" title="Le besoin est-il br\u00FBlant pour ce segment ? 1 = pas urgent, 5 = critique" style={{ fontFamily: "var(--uf-mono)", color: "#E8358E", borderBottom: "2px solid var(--uf-ink)" }}>Urgence</th>
                  <th className="text-center px-2 py-2 text-[10px] font-medium tracking-[0.12em] uppercase cursor-help" title="Facilit\u00E9 d'acc\u00E8s au segment : r\u00E9seaux, canaux, co\u00FBt d'acquisition. 1 = tr\u00E8s difficile, 5 = acc\u00E8s direct" style={{ fontFamily: "var(--uf-mono)", color: "#6E4BE8", borderBottom: "2px solid var(--uf-ink)" }}>Accessibilit{"\u00E9"}</th>
                  <th className="text-center px-2 py-2 text-[10px] font-medium tracking-[0.12em] uppercase cursor-help" title="Taille du gain potentiel : revenus, volume, valeur strat\u00E9gique. 1 = faible, 5 = tr\u00E8s \u00E9lev\u00E9" style={{ fontFamily: "var(--uf-mono)", color: "#FF6A1F", borderBottom: "2px solid var(--uf-ink)" }}>Potentiel</th>
                  <th className="text-center px-2 py-2 text-[10px] font-medium tracking-[0.12em] uppercase cursor-help" title="Intensit\u00E9 concurrentielle sur ce segment. 1 = march\u00E9 satur\u00E9, 5 = oc\u00E9an bleu (peu ou pas de concurrents)" style={{ fontFamily: "var(--uf-mono)", color: "#0DB4A0", borderBottom: "2px solid var(--uf-ink)" }}>Concurrence</th>
                  <th className="text-center px-2 py-2 text-[10px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-ink)", borderBottom: "2px solid var(--uf-ink)" }}>Score</th>
                  <th className="w-8" style={{ borderBottom: "2px solid var(--uf-ink)" }} />
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, idx) => {
                  const score = segmentScore(seg);
                  const isBest = bestSegment && seg.name === bestSegment.name && score === segmentScore(bestSegment) && score > 0;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--uf-line)", background: isBest ? "#0DB4A010" : "transparent" }}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={seg.name}
                          onChange={(e) => updateSegment(idx, { name: e.target.value })}
                          placeholder={["PME industrie 50-200 pers.", "Grands comptes pharma", "ETI agroalimentaire", "Startups deeptech"][idx] ?? "Segment..."}
                          className="w-full text-sm px-2 py-1 focus:outline-none"
                          style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                        />
                      </td>
                      {(["urgency", "accessibility", "potential", "competition"] as const).map((key) => (
                        <td key={key} className="text-center px-2 py-2">
                          <div className="flex justify-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => updateSegment(idx, { [key]: seg[key] === n ? 0 : n })}
                                className="w-6 h-6 rounded text-[10px] font-bold transition-all"
                                style={{
                                  background: seg[key] >= n
                                    ? (key === "urgency" ? "#E8358E" : key === "accessibility" ? "#6E4BE8" : key === "potential" ? "#FF6A1F" : "#0DB4A0")
                                    : "var(--uf-paper-2)",
                                  color: seg[key] >= n ? "#fff" : "var(--uf-muted)",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                      <td className="text-center px-2 py-2">
                        <span className="text-sm font-bold" style={{ fontFamily: "var(--uf-mono)", color: isBest ? "#0DB4A0" : "var(--uf-ink)" }}>
                          {score > 0 ? `${score}/20` : "-"}
                        </span>
                      </td>
                      <td className="px-1 py-2">
                        {segments.length > 2 && (
                          <button type="button" onClick={() => removeSegment(idx)} className="text-xs transition-colors hover:opacity-70" style={{ color: "var(--uf-muted)" }}>
                            {"\u2715"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {segments.length < MAX_SEGMENTS && (
            <button
              type="button"
              onClick={addSegment}
              className="mt-3 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)", background: "var(--uf-paper)" }}
            >
              + Ajouter un segment
            </button>
          )}

          {/* Beachhead winner */}
          {bestSegment && (
            <div className="mt-4 p-4" style={{ background: "#0DB4A014", border: "1.5px solid #0DB4A040", borderRadius: "var(--uf-r-lg)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold" style={{ color: "#0DB4A0", fontFamily: "var(--uf-display)" }}>{"MARCH\u00C9 D'ANCRAGE"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#0DB4A0", color: "#fff", fontFamily: "var(--uf-mono)" }}>{segmentScore(bestSegment)}/20</span>
              </div>
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--uf-ink)" }}>{bestSegment.name}</div>
              <p className="text-xs mb-2" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
                {"D\u00E9crivez votre plan d'attaque : comment allez-vous dominer ce segment en 12-18 mois ?"}
              </p>
              <textarea
                value={values[BEACHHEAD_KEY]}
                onChange={(e) => updateField(BEACHHEAD_KEY, e.target.value)}
                placeholder={"1. Recruter 10 clients pilotes via le réseau industrie\n2. Atteindre 80% de rétention sur 6 mois\n3. Développer 3 cas d'usage référençables\n4. Lever une preuve de traction pour le segment suivant"}
                rows={4}
                className="w-full text-sm px-4 py-3 focus:outline-none resize-y"
                style={{ border: "1px solid #0DB4A060", borderRadius: "var(--uf-r-lg)", color: "var(--uf-ink)", background: "var(--uf-paper)", lineHeight: 1.6 }}
              />
            </div>
          )}
        </div>

        {/* Positionnement */}
        <div
          className="p-5"
          style={{
            background: "var(--uf-card)",
            border: "2px solid var(--uf-orange)",
            borderRadius: "var(--uf-r-xl)",
          }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--uf-orange)", fontFamily: "var(--uf-display)", fontSize: 16 }}>
            Positionnement
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            Synthétisez votre positionnement en 2-3 phrases percutantes. Format suggéré : Pour [cible] qui [besoin], [produit] est [catégorie] qui [valeur unique]. Contrairement à [alternatives], nous [différenciation].
          </p>
          <textarea
            value={values[STATEMENT_KEY]}
            onChange={(e) => updateField(STATEMENT_KEY, e.target.value)}
            placeholder="Pour les directeurs d'opérations de PME industrielles qui perdent 15h/semaine à piloter avec Excel, OptiFlow est le copilote IA opérationnel qui prédit les goulots d'étranglement avant qu'ils n'arrivent. Contrairement aux ERP rigides ou aux consultants ponctuels, nous combinons l'IA prédictive et la simplicité no-code pour un ROI visible en 30 jours."
            rows={4}
            className="w-full text-sm px-4 py-3 focus:outline-none resize-y"
            style={{
              border: "1px solid var(--uf-orange)",
              borderRadius: "var(--uf-r-lg)",
              color: "var(--uf-ink)",
              background: "var(--uf-paper)",
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          />
        </div>

        <p className="text-center text-[11px] pt-2" style={{ color: "var(--uf-muted)" }}>
          Remplissez dans l'ordre : chaque composante alimente la suivante.
        </p>
      </div>
    </div>
  );
}
