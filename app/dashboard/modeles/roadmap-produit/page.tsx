"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

type Objective = {
  title: string;
  metric: string; // KR mesurable
};

type Actor = {
  name: string;
  role: string; // ex: "Client final", "Admin", "Partenaire"
};

type Feature = {
  title: string;
  description: string;
  objectiveIdx: number; // lié à quel objectif
  actorIdx: number;     // lié à quel acteur
  impact: number;       // 1-5
  effort: number;       // 1-5
  quarter: string;      // T1 26, T2 26, etc.
};

const QUARTERS = ["T2 26", "T3 26", "T4 26", "T1 27", "T2 27", "T3 27"];

function priorityScore(f: Feature): number {
  return f.effort > 0 ? Math.round((f.impact / f.effort) * 10) / 10 : 0;
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function RoadmapProduitPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [objectives, setObjectives] = useState<Objective[]>([
    { title: "", metric: "" },
    { title: "", metric: "" },
    { title: "", metric: "" },
  ]);
  const [actors, setActors] = useState<Actor[]>([
    { name: "", role: "" },
    { name: "", role: "" },
  ]);
  const [features, setFeatures] = useState<Feature[]>([
    { title: "", description: "", objectiveIdx: 0, actorIdx: 0, impact: 0, effort: 0, quarter: QUARTERS[0] },
    { title: "", description: "", objectiveIdx: 0, actorIdx: 0, impact: 0, effort: 0, quarter: QUARTERS[0] },
    { title: "", description: "", objectiveIdx: 0, actorIdx: 0, impact: 0, effort: 0, quarter: QUARTERS[1] },
  ]);
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      fetch(`/api/startup?startupId=${sid}`)
        .then((r) => r.json())
        .then((data) => { if (data?.name) setStartupName(data.name); })
        .catch(() => {});
      const saved = localStorage.getItem(`founderai_roadmap_${sid}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.objectives) setObjectives(p.objectives);
          if (p.actors) setActors(p.actors);
          if (p.features) setFeatures(p.features);
        } catch { /* ignore */ }
      }
    }
  }, []);

  function persist(objs: Objective[], acts: Actor[], feats: Feature[]) {
    if (startupId) localStorage.setItem(`founderai_roadmap_${startupId}`, JSON.stringify({ objectives: objs, actors: acts, features: feats }));
  }

  function updateObjective(idx: number, patch: Partial<Objective>) {
    setObjectives(prev => { const next = [...prev]; next[idx] = { ...next[idx], ...patch }; persist(next, actors, features); return next; });
  }
  function updateActor(idx: number, patch: Partial<Actor>) {
    setActors(prev => { const next = [...prev]; next[idx] = { ...next[idx], ...patch }; persist(objectives, next, features); return next; });
  }
  function updateFeature(idx: number, patch: Partial<Feature>) {
    setFeatures(prev => { const next = [...prev]; next[idx] = { ...next[idx], ...patch }; persist(objectives, actors, next); return next; });
  }
  function addFeature() {
    setFeatures(prev => { const next = [...prev, { title: "", description: "", objectiveIdx: 0, actorIdx: 0, impact: 0, effort: 0, quarter: QUARTERS[0] }]; persist(objectives, actors, next); return next; });
  }
  function removeFeature(idx: number) {
    if (features.length <= 1) return;
    setFeatures(prev => { const next = prev.filter((_, i) => i !== idx); persist(objectives, actors, next); return next; });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fill-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur lors de la generation."); return; }
      if (json.objectives) setObjectives(json.objectives);
      if (json.actors) setActors(json.actors);
      if (json.features) setFeatures(json.features);
      persist(json.objectives ?? objectives, json.actors ?? actors, json.features ?? features);
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setFilling(false);
    }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_roadmap", JSON.stringify({ objectives, actors, features, startupName }));
    window.open("/roadmap-produit-preview.html", "_blank");
  }

  function handleReset() {
    const emptyObj = [{ title: "", metric: "" }, { title: "", metric: "" }, { title: "", metric: "" }];
    const emptyAct = [{ name: "", role: "" }, { name: "", role: "" }];
    const emptyFeat = [{ title: "", description: "", objectiveIdx: 0, actorIdx: 0, impact: 0, effort: 0, quarter: QUARTERS[0] }];
    setObjectives(emptyObj);
    setActors(emptyAct);
    setFeatures(emptyFeat);
    if (startupId) localStorage.removeItem(`founderai_roadmap_${startupId}`);
    setError("");
  }

  const hasContent = objectives.some(o => o.title.trim()) || features.some(f => f.title.trim());

  // Sort features by priority for display
  const sortedFeatures = [...features].map((f, i) => ({ ...f, _idx: i })).sort((a, b) => priorityScore(b) - priorityScore(a));

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard?tab=documents" className="text-sm hover:underline flex items-center gap-1 mb-3" style={{ color: "var(--uf-orange)" }}>
              {"\u2190"} Retour aux documents
            </a>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 22, lineHeight: 0.85, color: "var(--uf-ink)" }}>
                Roadmap Produit
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoFill} disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}>
              {filling ? "Generation..." : "Demander a mes agents"}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2.5 text-sm font-medium rounded-full transition-all"
              style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>
              Vider
            </button>
            <button onClick={openPreview} disabled={!hasContent}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              Preview & Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>{error}</div>
        )}

        {/* ── Section 1 : Objectifs business ── */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #FF6A1F30", borderLeft: "4px solid #FF6A1F", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#FF6A1F", fontFamily: "var(--uf-mono)" }}>01</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Objectifs business</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            Quels sont vos 2-3 objectifs principaux pour les 12 prochains mois ? Associez un KR mesurable.
          </p>
          <div className="space-y-3">
            {objectives.map((obj, i) => (
              <div key={i} className="flex gap-3">
                <input type="text" value={obj.title} onChange={(e) => updateObjective(i, { title: e.target.value })}
                  placeholder={["Atteindre 100 clients payants", "Valider le product-market fit", "Preparer la Serie A"][i] ?? "Objectif..."}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
                <input type="text" value={obj.metric} onChange={(e) => updateObjective(i, { metric: e.target.value })}
                  placeholder={["MRR > 50k", "NPS > 50", "ARR > 1M"][i] ?? "KR mesurable"}
                  className="w-40 px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)", fontFamily: "var(--uf-mono)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2 : Acteurs ── */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #6E4BE830", borderLeft: "4px solid #6E4BE8", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#6E4BE8", fontFamily: "var(--uf-mono)" }}>02</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Acteurs</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            Qui sont les utilisateurs ou parties prenantes impactes par votre produit ?
          </p>
          <div className="space-y-3">
            {actors.map((act, i) => (
              <div key={i} className="flex gap-3">
                <input type="text" value={act.name} onChange={(e) => updateActor(i, { name: e.target.value })}
                  placeholder={["Client final", "Admin / back-office"][i] ?? "Acteur..."}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
                <input type="text" value={act.role} onChange={(e) => updateActor(i, { role: e.target.value })}
                  placeholder={["Utilisateur quotidien", "Gere les equipes"][i] ?? "Role..."}
                  className="w-48 px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
              </div>
            ))}
            {actors.length < 5 && (
              <button type="button" onClick={() => setActors(prev => { const next = [...prev, { name: "", role: "" }]; persist(objectives, next, features); return next; })}
                className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>
                + Ajouter un acteur
              </button>
            )}
          </div>
        </div>

        {/* ── Section 3 : Features priorisees ── */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #0DB4A030", borderLeft: "4px solid #0DB4A0", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#0DB4A0", fontFamily: "var(--uf-mono)" }}>03</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Features</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>
            Listez vos features, rattachez-les a un objectif et un acteur, puis scorez Impact (1-5) et Effort (1-5). Le ratio Impact/Effort priorise automatiquement.
          </p>

          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="p-4 relative" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                {features.length > 1 && (
                  <button type="button" onClick={() => removeFeature(i)} className="absolute top-3 right-3 text-xs" style={{ color: "var(--uf-muted)" }}>{"\u2715"}</button>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <input type="text" value={feat.title} onChange={(e) => updateFeature(i, { title: e.target.value })}
                      placeholder="Nom de la feature"
                      className="w-full px-3 py-2 text-sm font-semibold focus:outline-none"
                      style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" value={feat.description} onChange={(e) => updateFeature(i, { description: e.target.value })}
                      placeholder="Description courte (valeur apportee)"
                      className="w-full px-3 py-2 text-sm focus:outline-none"
                      style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }} />
                  </div>
                  <select value={feat.objectiveIdx} onChange={(e) => updateFeature(i, { objectiveIdx: parseInt(e.target.value) })}
                    className="px-3 py-2 text-sm focus:outline-none cursor-pointer"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }}>
                    {objectives.map((o, oi) => <option key={oi} value={oi}>{o.title || `Objectif ${oi + 1}`}</option>)}
                  </select>
                  <select value={feat.actorIdx} onChange={(e) => updateFeature(i, { actorIdx: parseInt(e.target.value) })}
                    className="px-3 py-2 text-sm focus:outline-none cursor-pointer"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }}>
                    {actors.map((a, ai) => <option key={ai} value={ai}>{a.name || `Acteur ${ai + 1}`}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Impact */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase" style={{ fontFamily: "var(--uf-mono)", color: "#FF6A1F" }}>Impact</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => updateFeature(i, { impact: feat.impact === n ? 0 : n })}
                          className="w-6 h-6 rounded text-[10px] font-bold" style={{ background: feat.impact >= n ? "#FF6A1F" : "var(--uf-paper-2)", color: feat.impact >= n ? "#fff" : "var(--uf-muted)", border: "none", cursor: "pointer" }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  {/* Effort */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase" style={{ fontFamily: "var(--uf-mono)", color: "#6E4BE8" }}>Effort</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => updateFeature(i, { effort: feat.effort === n ? 0 : n })}
                          className="w-6 h-6 rounded text-[10px] font-bold" style={{ background: feat.effort >= n ? "#6E4BE8" : "var(--uf-paper-2)", color: feat.effort >= n ? "#fff" : "var(--uf-muted)", border: "none", cursor: "pointer" }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  {/* Quarter */}
                  <select value={feat.quarter} onChange={(e) => updateFeature(i, { quarter: e.target.value })}
                    className="px-2 py-1 text-xs focus:outline-none cursor-pointer"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)", fontFamily: "var(--uf-mono)" }}>
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  {/* Score */}
                  {feat.impact > 0 && feat.effort > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-1 rounded" style={{ background: "#0DB4A018", color: "#0DB4A0", fontFamily: "var(--uf-mono)" }}>
                      {priorityScore(feat)}x
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {features.length < 20 && (
            <button type="button" onClick={addFeature}
              className="mt-4 text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)", background: "var(--uf-paper)" }}>
              + Ajouter une feature
            </button>
          )}
        </div>

        {/* ── Vue trimestrielle (read-only) ── */}
        {features.some(f => f.title.trim() && f.impact > 0) && (
          <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <h2 className="font-bold uppercase tracking-wide mb-4" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Vue trimestrielle</h2>
            <div className="grid grid-cols-3 gap-4">
              {QUARTERS.slice(0, 3).map(q => {
                const qFeatures = sortedFeatures.filter(f => f.quarter === q && f.title.trim());
                return (
                  <div key={q}>
                    <div className="text-[10px] font-bold uppercase mb-2 px-2 py-1 rounded" style={{ fontFamily: "var(--uf-mono)", background: "var(--uf-paper-2)", color: "var(--uf-muted)" }}>{q}</div>
                    <div className="space-y-2">
                      {qFeatures.length === 0 && <div className="text-xs" style={{ color: "var(--uf-muted)" }}>-</div>}
                      {qFeatures.map((f, i) => (
                        <div key={i} className="text-xs px-2 py-1.5 rounded" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)" }}>
                          <div className="font-semibold" style={{ color: "var(--uf-ink)" }}>{f.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span style={{ color: "#FF6A1F", fontFamily: "var(--uf-mono)", fontSize: 9 }}>I:{f.impact}</span>
                            <span style={{ color: "#6E4BE8", fontFamily: "var(--uf-mono)", fontSize: 9 }}>E:{f.effort}</span>
                            <span style={{ color: "#0DB4A0", fontFamily: "var(--uf-mono)", fontSize: 9, fontWeight: 700 }}>{priorityScore(f)}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] pt-2" style={{ color: "var(--uf-muted)" }}>
          Impact Map + priorisation Impact/Effort. Les features avec le meilleur ratio sont prioritaires.
        </p>
      </div>
    </div>
  );
}
