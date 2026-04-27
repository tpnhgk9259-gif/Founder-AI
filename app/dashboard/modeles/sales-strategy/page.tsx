"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

type ValueProp = { segment: string; message: string };
type Channel = { name: string; description: string; cost: string; volume: string };
type FunnelStep = { name: string; conversion: string };
type Target = { quarter: string; deals: string; mrr: string; avgDeal: string };

type SalesData = {
  value_props: ValueProp[];
  channels: Channel[];
  funnel: FunnelStep[];
  cycle_duration: string;
  pricing_model: string;
  pricing_detail: string;
  targets: Target[];
  stack: string;
};

function emptyData(): SalesData {
  return {
    value_props: [{ segment: "", message: "" }, { segment: "", message: "" }],
    channels: [
      { name: "", description: "", cost: "", volume: "" },
      { name: "", description: "", cost: "", volume: "" },
      { name: "", description: "", cost: "", volume: "" },
    ],
    funnel: [
      { name: "Prospect", conversion: "" },
      { name: "Qualifie", conversion: "" },
      { name: "Demo", conversion: "" },
      { name: "Offre envoyee", conversion: "" },
      { name: "Closing", conversion: "" },
    ],
    cycle_duration: "",
    pricing_model: "",
    pricing_detail: "",
    targets: [
      { quarter: "T2 26", deals: "", mrr: "", avgDeal: "" },
      { quarter: "T3 26", deals: "", mrr: "", avgDeal: "" },
      { quarter: "T4 26", deals: "", mrr: "", avgDeal: "" },
    ],
    stack: "",
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SalesStrategyPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [data, setData] = useState<SalesData>(emptyData());
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
      const saved = localStorage.getItem(`founderai_sales_${sid}`);
      if (saved) { try { setData(JSON.parse(saved)); } catch { /* ignore */ } }
    }
  }, []);

  function persist(d: SalesData) {
    if (startupId) localStorage.setItem(`founderai_sales_${startupId}`, JSON.stringify(d));
  }

  function update(patch: Partial<SalesData>) {
    setData(prev => { const next = { ...prev, ...patch }; persist(next); return next; });
  }

  function updateValueProp(idx: number, patch: Partial<ValueProp>) {
    const next = [...data.value_props]; next[idx] = { ...next[idx], ...patch };
    update({ value_props: next });
  }

  function updateChannel(idx: number, patch: Partial<Channel>) {
    const next = [...data.channels]; next[idx] = { ...next[idx], ...patch };
    update({ channels: next });
  }

  function updateFunnel(idx: number, patch: Partial<FunnelStep>) {
    const next = [...data.funnel]; next[idx] = { ...next[idx], ...patch };
    update({ funnel: next });
  }

  function updateTarget(idx: number, patch: Partial<Target>) {
    const next = [...data.targets]; next[idx] = { ...next[idx], ...patch };
    update({ targets: next });
  }

  async function handleAutoFill() {
    if (!startupId || filling) return;
    setFilling(true); setError("");
    try {
      const res = await fetch("/api/ai/fill-sales-strategy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      if (json.data) { setData(json.data); persist(json.data); }
    } catch { setError("Erreur inattendue."); }
    finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_sales", JSON.stringify({ ...data, startupName }));
    window.open("/sales-strategy-preview.html", "_blank");
  }

  const hasContent = data.value_props.some(v => v.segment.trim()) || data.channels.some(c => c.name.trim());

  // Shared input style
  const inp = "w-full px-3 py-2 text-sm focus:outline-none";
  const inpStyle = { border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" };

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
                Sales Strategy
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoFill} disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}>
              {filling ? "Generation..." : "Demander a mes agents"}
            </button>
            <button onClick={() => { setData(emptyData()); if (startupId) localStorage.removeItem(`founderai_sales_${startupId}`); setError(""); }}
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

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {error && <div className="text-sm px-4 py-3" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-lg)" }}>{error}</div>}

        {/* 1. Proposition de valeur par segment */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #FF6A1F30", borderLeft: "4px solid #FF6A1F", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#FF6A1F", fontFamily: "var(--uf-mono)" }}>01</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Proposition de valeur par segment</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Pour chaque segment cible, quel est le message commercial principal ?</p>
          <div className="space-y-3">
            {data.value_props.map((vp, i) => (
              <div key={i} className="flex gap-3">
                <input type="text" value={vp.segment} onChange={(e) => updateValueProp(i, { segment: e.target.value })}
                  placeholder={["PME industrie", "ETI services"][i] ?? "Segment"} className={inp} style={{ ...inpStyle, flex: "0 0 180px" }} />
                <input type="text" value={vp.message} onChange={(e) => updateValueProp(i, { message: e.target.value })}
                  placeholder={["Reduisez vos couts ops de 40% en 30 jours", "Pilotez vos equipes sans Excel"][i] ?? "Message cle"} className={inp} style={inpStyle} />
              </div>
            ))}
            {data.value_props.length < 5 && (
              <button type="button" onClick={() => update({ value_props: [...data.value_props, { segment: "", message: "" }] })}
                className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>+ Ajouter</button>
            )}
          </div>
        </div>

        {/* 2. Canaux d'acquisition */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #E8358E30", borderLeft: "4px solid #E8358E", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#E8358E", fontFamily: "var(--uf-mono)" }}>02</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Canaux d'acquisition</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Comment atteignez-vous vos prospects ? Cout et volume estimes par canal.</p>
          <div className="space-y-3">
            {data.channels.map((ch, i) => (
              <div key={i} className="grid grid-cols-4 gap-3">
                <input type="text" value={ch.name} onChange={(e) => updateChannel(i, { name: e.target.value })}
                  placeholder={["Outbound LinkedIn", "Content SEO", "Partenariats"][i] ?? "Canal"} className={inp} style={inpStyle} />
                <input type="text" value={ch.description} onChange={(e) => updateChannel(i, { description: e.target.value })}
                  placeholder={["Sequences personnalisees", "Articles + lead magnets", "Co-selling"][i] ?? "Description"} className={inp} style={inpStyle} />
                <input type="text" value={ch.cost} onChange={(e) => updateChannel(i, { cost: e.target.value })}
                  placeholder={["500 EUR/mois", "1 ETP", "Commission 15%"][i] ?? "Cout"} className={inp} style={{ ...inpStyle, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={ch.volume} onChange={(e) => updateChannel(i, { volume: e.target.value })}
                  placeholder={["20 leads/mois", "50 MQL/mois", "5 deals/trim."][i] ?? "Volume"} className={inp} style={{ ...inpStyle, fontFamily: "var(--uf-mono)" }} />
              </div>
            ))}
            {data.channels.length < 6 && (
              <button type="button" onClick={() => update({ channels: [...data.channels, { name: "", description: "", cost: "", volume: "" }] })}
                className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}>+ Ajouter</button>
            )}
          </div>
        </div>

        {/* 3. Cycle de vente */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #6E4BE830", borderLeft: "4px solid #6E4BE8", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#6E4BE8", fontFamily: "var(--uf-mono)" }}>03</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Cycle de vente</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Etapes du funnel avec taux de conversion entre chaque etape.</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {data.funnel.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="px-3 py-2 text-xs" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)" }}>
                  <input type="text" value={step.name} onChange={(e) => updateFunnel(i, { name: e.target.value })}
                    className="bg-transparent focus:outline-none text-xs font-semibold w-24" style={{ color: "var(--uf-ink)" }} />
                </div>
                {i < data.funnel.length - 1 && (
                  <input type="text" value={step.conversion} onChange={(e) => updateFunnel(i, { conversion: e.target.value })}
                    placeholder="60%" className="w-12 text-center text-xs font-bold focus:outline-none px-1 py-1 rounded"
                    style={{ background: "#6E4BE818", color: "#6E4BE8", border: "none", fontFamily: "var(--uf-mono)" }} />
                )}
                {i < data.funnel.length - 1 && <span style={{ color: "var(--uf-muted)" }}>{"\u2192"}</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Duree moyenne du cycle</label>
              <input type="text" value={data.cycle_duration} onChange={(e) => update({ cycle_duration: e.target.value })}
                placeholder="45 jours" className="px-3 py-2 text-sm focus:outline-none w-40" style={inpStyle} />
            </div>
          </div>
        </div>

        {/* 4. Pricing */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #0DB4A030", borderLeft: "4px solid #0DB4A0", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#0DB4A0", fontFamily: "var(--uf-mono)" }}>04</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Pricing & packaging</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Modele tarifaire et logique de pricing.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Modele</label>
              <input type="text" value={data.pricing_model} onChange={(e) => update({ pricing_model: e.target.value })}
                placeholder="SaaS par siege, abonnement mensuel" className={inp} style={inpStyle} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Detail / grille</label>
              <textarea value={data.pricing_detail} onChange={(e) => update({ pricing_detail: e.target.value })}
                placeholder={"Starter : 39 EUR/mois (1 user)\nGrowth : 99 EUR/mois (5 users)\nScale : 249 EUR/mois (illimite)"} rows={3}
                className="w-full px-3 py-2 text-sm focus:outline-none resize-y" style={{ ...inpStyle, lineHeight: 1.6 }} />
            </div>
          </div>
        </div>

        {/* 5. Objectifs commerciaux */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid #FFD12A30", borderLeft: "4px solid #FFD12A", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: "#FFD12A", color: "var(--uf-ink)", fontFamily: "var(--uf-mono)" }}>05</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Objectifs commerciaux</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Targets trimestrielles : nombre de deals, MRR vise, panier moyen.</p>
          <div className="space-y-3">
            {data.targets.map((t, i) => (
              <div key={i} className="grid grid-cols-4 gap-3">
                <input type="text" value={t.quarter} onChange={(e) => updateTarget(i, { quarter: e.target.value })}
                  className={inp} style={{ ...inpStyle, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={t.deals} onChange={(e) => updateTarget(i, { deals: e.target.value })}
                  placeholder={["10 deals", "25 deals", "50 deals"][i] ?? "Deals"} className={inp} style={inpStyle} />
                <input type="text" value={t.mrr} onChange={(e) => updateTarget(i, { mrr: e.target.value })}
                  placeholder={["8k MRR", "25k MRR", "50k MRR"][i] ?? "MRR"} className={inp} style={{ ...inpStyle, fontFamily: "var(--uf-mono)" }} />
                <input type="text" value={t.avgDeal} onChange={(e) => updateTarget(i, { avgDeal: e.target.value })}
                  placeholder={["800 EUR", "1 000 EUR", "1 000 EUR"][i] ?? "Panier moyen"} className={inp} style={{ ...inpStyle, fontFamily: "var(--uf-mono)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Stack & outils */}
        <div className="p-5" style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", borderLeft: "4px solid var(--uf-ink)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--uf-ink)", fontFamily: "var(--uf-mono)" }}>06</span>
            <h2 className="font-bold uppercase tracking-wide" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)", fontSize: 16 }}>Stack & outils</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>CRM, outils d'enrichissement, sequences, scoring...</p>
          <textarea value={data.stack} onChange={(e) => update({ stack: e.target.value })}
            placeholder={"CRM : HubSpot (gratuit puis Sales Hub)\nEnrichissement : Dropcontact + LinkedIn Sales Nav\nSequences : Lemlist (outbound) + Intercom (inbound)\nScoring : lead scoring HubSpot + intent data"} rows={4}
            className="w-full px-3 py-2 text-sm focus:outline-none resize-y" style={{ ...inpStyle, lineHeight: 1.6 }} />
        </div>

        <p className="text-center text-[11px] pt-2" style={{ color: "var(--uf-muted)" }}>
          Remplissez chaque section pour construire votre strategie commerciale complete.
        </p>
      </div>
    </div>
  );
}
