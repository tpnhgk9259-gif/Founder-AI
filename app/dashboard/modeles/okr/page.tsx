"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

type Initiative = {
  title: string;
  effort: number; // 1-5
  assignees: string[]; // noms des collaborateurs
};

type KeyResult = {
  title: string;
  target: string;
  owner: string;
  score: number; // 0-1 (fin de trimestre)
  initiatives: Initiative[];
};

type OKR = {
  department: string;
  objective: string;
  keyResults: KeyResult[];
};

type Collaborator = { id: string; name: string; role: string; department: string };

const DEPARTMENTS = ["Produit", "Commercial", "Tech", "Ops", "Finance"];
const QUARTERS = ["T2 2026", "T3 2026", "T4 2026", "T1 2027"];
const DEPT_COLORS: Record<string, string> = {
  Produit: "#FF6A1F", Commercial: "#E8358E", Tech: "#6E4BE8", Ops: "#0DB4A0", Finance: "#FFD12A",
};

function emptyKR(): KeyResult {
  return { title: "", target: "", owner: "", score: 0, initiatives: [{ title: "", effort: 0, assignees: [] }] };
}

function emptyOKR(dept: string): OKR {
  return { department: dept, objective: "", keyResults: [emptyKR(), emptyKR()] };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function OKRPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [quarter, setQuarter] = useState(QUARTERS[0]);
  const [priority, setPriority] = useState("");
  const [okrs, setOkrs] = useState<OKR[]>(DEPARTMENTS.map(d => emptyOKR(d)));
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      fetch(`/api/startup?startupId=${sid}`).then(r => r.json()).then(d => {
        if (d?.name) setStartupName(d.name);
        if (d?.collaborators) setCollaborators(d.collaborators);
      }).catch(() => {});
      const saved = localStorage.getItem(`founderai_okr_${sid}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.quarter) setQuarter(p.quarter);
          if (p.priority) setPriority(p.priority);
          if (p.okrs) setOkrs(p.okrs);
        } catch { /* */ }
      }
    }
  }, []);

  function persist(q: string, p: string, o: OKR[]) {
    if (startupId) localStorage.setItem(`founderai_okr_${startupId}`, JSON.stringify({ quarter: q, priority: p, okrs: o }));
  }

  function updateOKR(deptIdx: number, patch: Partial<OKR>) {
    setOkrs(prev => { const next = [...prev]; next[deptIdx] = { ...next[deptIdx], ...patch }; persist(quarter, priority, next); return next; });
  }

  function updateKR(deptIdx: number, krIdx: number, patch: Partial<KeyResult>) {
    setOkrs(prev => {
      const next = [...prev];
      const krs = [...next[deptIdx].keyResults];
      krs[krIdx] = { ...krs[krIdx], ...patch };
      next[deptIdx] = { ...next[deptIdx], keyResults: krs };
      persist(quarter, priority, next);
      return next;
    });
  }

  function updateInitiative(deptIdx: number, krIdx: number, initIdx: number, patch: Partial<Initiative>) {
    setOkrs(prev => {
      const next = [...prev];
      const krs = [...next[deptIdx].keyResults];
      const inits = [...krs[krIdx].initiatives];
      inits[initIdx] = { ...inits[initIdx], ...patch };
      krs[krIdx] = { ...krs[krIdx], initiatives: inits };
      next[deptIdx] = { ...next[deptIdx], keyResults: krs };
      persist(quarter, priority, next);
      return next;
    });
  }

  function addInitiative(deptIdx: number, krIdx: number) {
    const kr = okrs[deptIdx].keyResults[krIdx];
    if (kr.initiatives.length >= 6) return;
    updateKR(deptIdx, krIdx, { initiatives: [...kr.initiatives, { title: "", effort: 0, assignees: [] }] });
  }

  function removeInitiative(deptIdx: number, krIdx: number, initIdx: number) {
    const kr = okrs[deptIdx].keyResults[krIdx];
    if (kr.initiatives.length <= 1) return;
    updateKR(deptIdx, krIdx, { initiatives: kr.initiatives.filter((_, i) => i !== initIdx) });
  }

  function addKR(deptIdx: number) {
    const okr = okrs[deptIdx];
    if (okr.keyResults.length >= 5) return;
    updateOKR(deptIdx, { keyResults: [...okr.keyResults, emptyKR()] });
  }

  function toggleAssignee(deptIdx: number, krIdx: number, initIdx: number, name: string) {
    const init = okrs[deptIdx].keyResults[krIdx].initiatives[initIdx];
    const assignees = init.assignees.includes(name) ? init.assignees.filter(a => a !== name) : [...init.assignees, name];
    updateInitiative(deptIdx, krIdx, initIdx, { assignees });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true); setError("");
    try {
      const collabNames = collaborators.map(c => `${c.name} (${c.role}, ${c.department})`);
      const res = await fetch("/api/ai/fill-okr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startupId, quarter, collaborators: collabNames }) });
      const text = await res.text();
      // Support SSE streaming
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const lines = text.split("\n").filter(l => l.startsWith("data: "));
        if (!lines.length) { setError("Pas de reponse."); return; }
        const json = JSON.parse(lines[lines.length - 1].replace("data: ", ""));
        if (json.error) { setError(json.error); return; }
        if (json.data) {
          // Ne pas ecraser les OKRs deja remplis
          const newOkrs = (json.data.okrs || []) as OKR[];
          const merged = okrs.map((existing, i) => {
            if ((existing.objective || "").trim()) return existing;
            return newOkrs[i] || existing;
          });
          if (json.data.priority && !priority.trim()) setPriority(json.data.priority);
          setOkrs(merged);
          persist(quarter, json.data.priority || priority, merged);
        }
      } else {
        const json = JSON.parse(text);
        if (json.error) { setError(json.error); return; }
      }
    } catch (err) { setError(`Erreur : ${err instanceof Error ? err.message : String(err)}`); }
    finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_okr", JSON.stringify({ quarter, priority, okrs, startupName, collaborators }));
    window.open("/okr-preview.html", "_blank");
  }

  const hasContent = okrs.some(o => (o.objective || "").trim());
  const collabNames = collaborators.map(c => c.name);

  const inp = "w-full px-3 py-2 text-sm focus:outline-none";
  const inpS = { border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" };

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard?tab=documents" className="text-sm hover:underline flex items-center gap-1 mb-3" style={{ color: "var(--uf-orange)" }}>{"\u2190"} Retour aux documents</a>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 22, lineHeight: 0.85, color: "var(--uf-ink)" }}>OKR Planner</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoFill} disabled={filling || !startupId} className="px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-orange)", color: "#fff" }}>{filling ? "Generation..." : "Demander a mes agents"}</button>
            <button onClick={() => { setOkrs(DEPARTMENTS.map(d => emptyOKR(d))); setPriority(""); if (startupId) localStorage.removeItem(`founderai_okr_${startupId}`); setError(""); }} className="px-4 py-2.5 text-sm font-medium rounded-full" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>Vider</button>
            <button onClick={openPreview} disabled={!hasContent} className="px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>Preview & Export PDF</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {error && <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>{error}</div>}

        {/* Contexte trimestre */}
        <div className="p-5 flex items-end gap-4 flex-wrap" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <div>
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Trimestre</label>
            <select value={quarter} onChange={(e) => { setQuarter(e.target.value); persist(e.target.value, priority, okrs); }} className="px-3 py-2 text-sm focus:outline-none cursor-pointer" style={{ ...inpS, fontFamily: "var(--uf-mono)" }}>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>{"Priorit\u00E9 strat\u00E9gique du trimestre"}</label>
            <input type="text" value={priority} onChange={(e) => { setPriority(e.target.value); persist(quarter, e.target.value, okrs); }} placeholder="Ex: Atteindre le product-market fit sur le segment PME industrie" className={inp} style={inpS} />
          </div>
        </div>

        {/* OKRs par departement */}
        {okrs.map((okr, di) => {
          const color = DEPT_COLORS[okr.department] || "#6C6760";
          return (
            <div key={okr.department} className="p-5" style={{ background: "var(--uf-card)", border: `1.5px solid ${color}30`, borderLeft: `4px solid ${color}`, borderRadius: "var(--uf-r-xl)" }}>
              {/* Dept header + Objective */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: color, color: color === "#FFD12A" ? "var(--uf-ink)" : "#fff", fontFamily: "var(--uf-mono)" }}>{okr.department}</span>
                <input type="text" value={okr.objective} onChange={(e) => updateOKR(di, { objective: e.target.value })}
                  placeholder={["Valider le PMF sur le segment cible", "Construire un pipeline repeatable", "Fiabiliser la plateforme pour le scale", "Structurer les processus pour 2x la team", "Atteindre le breakeven operationnel"][di] ?? "Objectif"}
                  className="flex-1 px-3 py-2 text-sm font-semibold focus:outline-none" style={inpS} />
              </div>

              {/* Key Results */}
              {okr.keyResults.map((kr, ki) => (
                <div key={ki} className="ml-4 mb-4 p-3" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5">
                      <label className="text-[9px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: color }}>Key Result</label>
                      <input type="text" value={kr.title} onChange={(e) => updateKR(di, ki, { title: e.target.value })} placeholder="Resultat mesurable" className="w-full px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Cible</label>
                      <input type="text" value={kr.target} onChange={(e) => updateKR(di, ki, { target: e.target.value })} placeholder="50 demos" className="w-full px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[9px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Owner</label>
                      <input type="text" value={kr.owner} onChange={(e) => updateKR(di, ki, { owner: e.target.value })} placeholder="Head of Sales" className="w-full px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Score</label>
                      <input type="number" min="0" max="1" step="0.1" value={kr.score} onChange={(e) => updateKR(di, ki, { score: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                    </div>
                  </div>

                  {/* Initiatives */}
                  <div className="space-y-2 mt-2">
                    <label className="text-[9px] font-medium tracking-[0.1em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Initiatives</label>
                    {kr.initiatives.map((init, ii) => (
                      <div key={ii} className="flex items-start gap-2 pl-2" style={{ borderLeft: `2px solid ${color}40` }}>
                        <div className="flex-1">
                          <input type="text" value={init.title} onChange={(e) => updateInitiative(di, ki, ii, { title: e.target.value })} placeholder="Action concrete..." className="w-full px-2 py-1 text-xs focus:outline-none" style={inpS} />
                        </div>
                        {/* Effort */}
                        <div className="flex items-center gap-0.5">
                          <span className="text-[8px] uppercase mr-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Effort</span>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} type="button" onClick={() => updateInitiative(di, ki, ii, { effort: init.effort === n ? 0 : n })}
                              className="w-5 h-5 rounded text-[8px] font-bold" style={{ background: init.effort >= n ? color : "var(--uf-paper-2)", color: init.effort >= n ? (color === "#FFD12A" ? "var(--uf-ink)" : "#fff") : "var(--uf-muted)", border: "none", cursor: "pointer" }}>{n}</button>
                          ))}
                        </div>
                        {/* Assignees */}
                        {collabNames.length > 0 && (
                          <div className="flex items-center gap-0.5 flex-wrap">
                            {collabNames.map(name => (
                              <button key={name} type="button" onClick={() => toggleAssignee(di, ki, ii, name)}
                                className="text-[8px] px-1.5 py-0.5 rounded-full" title={name}
                                style={{ background: init.assignees.includes(name) ? color : "var(--uf-paper-2)", color: init.assignees.includes(name) ? (color === "#FFD12A" ? "var(--uf-ink)" : "#fff") : "var(--uf-muted)", border: "none", cursor: "pointer" }}>
                                {name.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                        )}
                        {kr.initiatives.length > 1 && (
                          <button type="button" onClick={() => removeInitiative(di, ki, ii)} className="text-[10px]" style={{ color: "var(--uf-muted)" }}>{"\u2715"}</button>
                        )}
                      </div>
                    ))}
                    {kr.initiatives.length < 6 && (
                      <button type="button" onClick={() => addInitiative(di, ki)} className="text-[10px] ml-2" style={{ color: color }}>+ Initiative</button>
                    )}
                  </div>
                </div>
              ))}
              {okr.keyResults.length < 5 && (
                <button type="button" onClick={() => addKR(di)} className="text-xs ml-4" style={{ color: color }}>+ Key Result</button>
              )}
            </div>
          );
        })}

        {collaborators.length === 0 && (
          <p className="text-center text-xs" style={{ color: "var(--uf-muted)" }}>
            Ajoutez vos collaborateurs dans le <a href="/dashboard?tab=tableau" style={{ color: "var(--uf-orange)" }}>tableau de bord</a> pour les affecter aux initiatives.
          </p>
        )}
      </div>
    </div>
  );
}
