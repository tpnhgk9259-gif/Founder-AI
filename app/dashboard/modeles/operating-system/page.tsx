"use client";

import { useState, useEffect } from "react";

// ── Constants ───────────────────────────────────────────────────────────────

const VISION_TEMPLATES = [
  "Devenir le leader de [marche] en [geo] d'ici 3 ans",
  "Atteindre [X] clients et [Y] ARR d'ici 2028",
  "Construire la reference [secteur] pour les [cible]",
  "Remplacer [solution legacy] par une approche [differenciateur]",
  "Democratiser [technologie/service] pour [segment sous-equipe]",
];

const VALUE_OPTIONS = [
  "Transparence", "Vitesse d'execution", "Obsession client", "Frugalite",
  "Autonomie", "Data-driven", "Impact mesurable", "Excellence technique",
  "Bienveillance", "Audace", "Simplicite", "Apprentissage continu",
  "Responsabilite individuelle", "Collaboration", "Innovation",
  "Integrite", "Resilience", "Focus", "Diversite", "Fun",
];

const PROCESS_TEMPLATES = [
  { name: "Acquisition clients", category: "Commercial" },
  { name: "Onboarding clients", category: "Produit" },
  { name: "Delivery / production", category: "Produit" },
  { name: "Support client", category: "Client" },
  { name: "Recrutement", category: "RH" },
  { name: "Facturation & recouvrement", category: "Finance" },
  { name: "Reporting & pilotage", category: "Direction" },
  { name: "Deploiement technique", category: "Tech" },
];

const AUTOMATION_LEVELS = ["Manuel", "Semi-auto", "Automatise"];

const RITUAL_TEMPLATES = [
  { name: "Daily standup", frequency: "Quotidien", duration: "15 min", participants: "Equipe produit" },
  { name: "Weekly team", frequency: "Hebdo", duration: "45 min", participants: "Toute l'equipe" },
  { name: "Monthly review", frequency: "Mensuel", duration: "2h", participants: "Cofondateurs + leads" },
  { name: "Quarterly OKR", frequency: "Trimestriel", duration: "Demi-journee", participants: "Direction" },
];

// ── Types ───────────────────────────────────────────────────────────────────

type Process = {
  name: string;
  category: string;
  level: string;
  currentTool: string;
  recommendedTool: string;
  needsHire: boolean;
  hireProfile: string;
};

type Ritual = {
  name: string;
  frequency: string;
  duration: string;
  participants: string;
};

type Metric = {
  name: string;
  owner: string;
  frequency: string;
  target: string;
};

type HirePlan = {
  role: string;
  priority: string;
  quarter: string;
  budget: string;
};

type OSData = {
  vision: string;
  mission: string;
  values: string[];
  customValues: string;
  orgChart: string;
  processes: Process[];
  rituals: Ritual[];
  metrics: Metric[];
  hirePlan: HirePlan[];
};

function emptyData(): OSData {
  return {
    vision: "",
    mission: "",
    values: [],
    customValues: "",
    orgChart: "",
    processes: PROCESS_TEMPLATES.map(p => ({ ...p, level: "Manuel", currentTool: "", recommendedTool: "", needsHire: false, hireProfile: "" })),
    rituals: RITUAL_TEMPLATES.map(r => ({ ...r })),
    metrics: [
      { name: "", owner: "", frequency: "Hebdo", target: "" },
      { name: "", owner: "", frequency: "Hebdo", target: "" },
      { name: "", owner: "", frequency: "Mensuel", target: "" },
      { name: "", owner: "", frequency: "Mensuel", target: "" },
      { name: "", owner: "", frequency: "Mensuel", target: "" },
    ],
    hirePlan: [
      { role: "", priority: "Haute", quarter: "T2 26", budget: "" },
      { role: "", priority: "Moyenne", quarter: "T3 26", budget: "" },
      { role: "", priority: "Basse", quarter: "T4 26", budget: "" },
    ],
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function OperatingSystemPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [data, setData] = useState<OSData>(emptyData());
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      fetch(`/api/startup?startupId=${sid}`).then(r => r.json()).then(d => { if (d?.name) setStartupName(d.name); }).catch(() => {});
      const saved = localStorage.getItem(`founderai_os_${sid}`);
      if (saved) { try { setData(JSON.parse(saved)); } catch { /* */ } }
    }
  }, []);

  function persist(d: OSData) { if (startupId) localStorage.setItem(`founderai_os_${startupId}`, JSON.stringify(d)); }
  function update(patch: Partial<OSData>) { setData(prev => { const next = { ...prev, ...patch }; persist(next); return next; }); }

  function toggleValue(val: string) {
    setData(prev => {
      const values = prev.values.includes(val) ? prev.values.filter(v => v !== val) : prev.values.length < 5 ? [...prev.values, val] : prev.values;
      const next = { ...prev, values };
      persist(next); return next;
    });
  }

  function updateProcess(idx: number, patch: Partial<Process>) {
    setData(prev => { const ps = [...prev.processes]; ps[idx] = { ...ps[idx], ...patch }; const next = { ...prev, processes: ps }; persist(next); return next; });
  }

  function updateRitual(idx: number, patch: Partial<Ritual>) {
    setData(prev => { const rs = [...prev.rituals]; rs[idx] = { ...rs[idx], ...patch }; const next = { ...prev, rituals: rs }; persist(next); return next; });
  }

  function updateMetric(idx: number, patch: Partial<Metric>) {
    setData(prev => { const ms = [...prev.metrics]; ms[idx] = { ...ms[idx], ...patch }; const next = { ...prev, metrics: ms }; persist(next); return next; });
  }

  function updateHire(idx: number, patch: Partial<HirePlan>) {
    setData(prev => { const hs = [...prev.hirePlan]; hs[idx] = { ...hs[idx], ...patch }; const next = { ...prev, hirePlan: hs }; persist(next); return next; });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true); setError("");
    try {
      const res = await fetch("/api/ai/fill-operating-system", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startupId }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      if (json.data) { setData(json.data); persist(json.data); }
    } catch { setError("Erreur inattendue."); } finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_os", JSON.stringify({ ...data, startupName }));
    window.open("/operating-system-preview.html", "_blank");
  }

  const hasContent = data.vision.trim() || data.values.length > 0 || data.processes.some(p => p.currentTool);

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
              <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 22, lineHeight: 0.85, color: "var(--uf-ink)" }}>Operating System Canvas</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoFill} disabled={filling || !startupId} className="px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-orange)", color: "#fff" }}>{filling ? "Generation..." : "Demander a mes agents"}</button>
            <button onClick={() => { setData(emptyData()); if (startupId) localStorage.removeItem(`founderai_os_${startupId}`); setError(""); }} className="px-4 py-2.5 text-sm font-medium rounded-full" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>Vider</button>
            <button onClick={openPreview} disabled={!hasContent} className="px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>Preview & Export PDF</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {error && <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>{error}</div>}

        {/* 1. Vision & Mission */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #FF6A1F30", borderLeft: "4px solid #FF6A1F", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#FF6A1F", fontFamily: "var(--uf-mono)" }}>01</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Vision & Mission</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Choisissez un template de vision et personnalisez-le. La mission decrit votre raison d'exister.</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {VISION_TEMPLATES.map((t, i) => (
              <button key={i} type="button" onClick={() => update({ vision: t })}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{ background: data.vision === t ? "var(--uf-orange)" : "var(--uf-paper)", color: data.vision === t ? "#fff" : "var(--uf-muted)", border: `1px solid ${data.vision === t ? "var(--uf-orange)" : "var(--uf-line)"}` }}>
                {t.substring(0, 40)}...
              </button>
            ))}
          </div>
          <input type="text" value={data.vision} onChange={(e) => update({ vision: e.target.value })} placeholder="Notre vision a 3 ans..." className={inp} style={inpS} />
          <div className="mt-3">
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Mission</label>
            <input type="text" value={data.mission} onChange={(e) => update({ mission: e.target.value })} placeholder="Nous existons pour..." className={inp} style={inpS} />
          </div>
        </div>

        {/* 2. Valeurs */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #E8358E30", borderLeft: "4px solid #E8358E", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#E8358E", fontFamily: "var(--uf-mono)" }}>02</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Valeurs fondamentales</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Selectionnez 3 a 5 valeurs non-negociables qui guident vos decisions. {data.values.length}/5</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {VALUE_OPTIONS.map(v => (
              <button key={v} type="button" onClick={() => toggleValue(v)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{ background: data.values.includes(v) ? "#E8358E" : "var(--uf-paper)", color: data.values.includes(v) ? "#fff" : "var(--uf-muted)", border: `1px solid ${data.values.includes(v) ? "#E8358E" : "var(--uf-line)"}`, opacity: !data.values.includes(v) && data.values.length >= 5 ? 0.4 : 1 }}>
                {v}
              </button>
            ))}
          </div>
          <input type="text" value={data.customValues} onChange={(e) => update({ customValues: e.target.value })} placeholder="Valeurs personnalisees (separees par des virgules)" className={inp} style={inpS} />
        </div>

        {/* 3. Structure */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #6E4BE830", borderLeft: "4px solid #6E4BE8", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#6E4BE8", fontFamily: "var(--uf-mono)" }}>03</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Structure organisationnelle</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Decrivez les roles cles et qui est responsable de quoi (fonctions, pas personnes).</p>
          <textarea value={data.orgChart} onChange={(e) => update({ orgChart: e.target.value })} rows={4} placeholder={"CEO : Vision, fundraising, partnerships\nCTO : Produit, tech, architecture\nHead of Growth : Acquisition, retention, revenue\nOps : Recrutement, finance, legal"} className="w-full px-4 py-3 text-sm focus:outline-none resize-y" style={{ ...inpS, lineHeight: 1.6 }} />
        </div>

        {/* 4. Processus cles */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #0DB4A030", borderLeft: "4px solid #0DB4A0", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#0DB4A0", fontFamily: "var(--uf-mono)" }}>04</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Processus cles</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Pour chaque processus, indiquez le niveau d'automatisation, l'outil actuel et le besoin de recrutement.</p>
          <div className="space-y-3">
            {data.processes.map((p, i) => (
              <div key={i} className="p-3" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold" style={{ color: "var(--uf-ink)" }}>{p.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "var(--uf-paper-2)", color: "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}>{p.category}</span>
                  <div className="ml-auto flex gap-1">
                    {AUTOMATION_LEVELS.map(lv => (
                      <button key={lv} type="button" onClick={() => updateProcess(i, { level: lv })}
                        className="text-[9px] px-2 py-1 rounded font-medium"
                        style={{ background: p.level === lv ? (lv === "Automatise" ? "#0DB4A0" : lv === "Semi-auto" ? "#FFD12A" : "#E8358E") : "var(--uf-paper-2)", color: p.level === lv ? (lv === "Semi-auto" ? "var(--uf-ink)" : "#fff") : "var(--uf-muted)", border: "none", cursor: "pointer" }}>
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={p.currentTool} onChange={(e) => updateProcess(i, { currentTool: e.target.value })} placeholder="Outil actuel (ou aucun)" className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                  <input type="text" value={p.recommendedTool} onChange={(e) => updateProcess(i, { recommendedTool: e.target.value })} placeholder="Outil recommande" className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateProcess(i, { needsHire: !p.needsHire })}
                      className="text-[9px] px-2 py-1 rounded font-medium"
                      style={{ background: p.needsHire ? "#6E4BE8" : "var(--uf-paper-2)", color: p.needsHire ? "#fff" : "var(--uf-muted)", border: "none", cursor: "pointer" }}>
                      {p.needsHire ? "Recrutement oui" : "Recrutement non"}
                    </button>
                    {p.needsHire && (
                      <input type="text" value={p.hireProfile} onChange={(e) => updateProcess(i, { hireProfile: e.target.value })} placeholder="Profil" className="flex-1 px-2 py-1 text-xs focus:outline-none" style={inpS} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Rituels */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #FFD12A30", borderLeft: "4px solid #FFD12A", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: "#FFD12A", color: "var(--uf-ink)", fontFamily: "var(--uf-mono)" }}>05</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Rituels & cadence</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Vos reunions recurrentes. Adaptez la frequence, la duree et les participants.</p>
          <div className="space-y-2">
            {data.rituals.map((r, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input type="text" value={r.name} onChange={(e) => updateRitual(i, { name: e.target.value })} className="px-2 py-1.5 text-xs font-semibold focus:outline-none" style={inpS} />
                <input type="text" value={r.frequency} onChange={(e) => updateRitual(i, { frequency: e.target.value })} className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={r.duration} onChange={(e) => updateRitual(i, { duration: e.target.value })} className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={r.participants} onChange={(e) => updateRitual(i, { participants: e.target.value })} className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Metriques ops */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", borderLeft: "4px solid var(--uf-ink)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--uf-ink)", fontFamily: "var(--uf-mono)" }}>06</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>{"M\u00E9triques op\u00E9rationnelles"}</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>5-8 KPIs suivis en continu avec un owner et une cible.</p>
          <div className="space-y-2">
            {data.metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input type="text" value={m.name} onChange={(e) => updateMetric(i, { name: e.target.value })} placeholder={["MRR", "Churn", "NPS", "Lead time", "Burn rate"][i] ?? "KPI"} className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                <input type="text" value={m.owner} onChange={(e) => updateMetric(i, { owner: e.target.value })} placeholder="Owner" className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                <input type="text" value={m.frequency} onChange={(e) => updateMetric(i, { frequency: e.target.value })} placeholder="Frequence" className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={m.target} onChange={(e) => updateMetric(i, { target: e.target.value })} placeholder="Cible" className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
              </div>
            ))}
            {data.metrics.length < 8 && (
              <button type="button" onClick={() => update({ metrics: [...data.metrics, { name: "", owner: "", frequency: "Hebdo", target: "" }] })}
                className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>+ Ajouter</button>
            )}
          </div>
        </div>

        {/* 7. Plan de recrutement */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #C8E64D30", borderLeft: "4px solid #C8E64D", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: "#C8E64D", color: "var(--uf-ink)", fontFamily: "var(--uf-mono)" }}>07</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Plan de recrutement</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Postes a ouvrir sur 12-18 mois avec priorite et budget.</p>
          <div className="space-y-2">
            {data.hirePlan.map((h, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input type="text" value={h.role} onChange={(e) => updateHire(i, { role: e.target.value })} placeholder={["Dev senior fullstack", "Head of Sales", "Ops manager"][i] ?? "Poste"} className="px-2 py-1.5 text-xs focus:outline-none" style={inpS} />
                <select value={h.priority} onChange={(e) => updateHire(i, { priority: e.target.value })} className="px-2 py-1.5 text-xs focus:outline-none cursor-pointer" style={inpS}>
                  <option value="Haute">Haute</option><option value="Moyenne">Moyenne</option><option value="Basse">Basse</option>
                </select>
                <input type="text" value={h.quarter} onChange={(e) => updateHire(i, { quarter: e.target.value })} placeholder="T2 26" className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={h.budget} onChange={(e) => updateHire(i, { budget: e.target.value })} placeholder="55-65k" className="px-2 py-1.5 text-xs focus:outline-none" style={{ ...inpS, fontFamily: "var(--uf-mono)" }} />
              </div>
            ))}
            {data.hirePlan.length < 8 && (
              <button type="button" onClick={() => update({ hirePlan: [...data.hirePlan, { role: "", priority: "Moyenne", quarter: "T3 26", budget: "" }] })}
                className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>+ Ajouter</button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] pt-2" style={{ color: "var(--uf-muted)" }}>
          Votre systeme operationnel definit comment vous executez. Chaque processus manuel est une opportunite d'automatisation ou de recrutement.
        </p>
      </div>
    </div>
  );
}
