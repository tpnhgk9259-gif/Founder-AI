"use client";

import { useState, useEffect } from "react";

// ─── Types & structure par slide ────────────────────────────────────────────

type SlideKey = "cover" | "problem" | "solution" | "market" | "product" | "traction" | "business" | "competition" | "team" | "funds" | "roadmap" | "contact";

const SLIDES: { key: SlideKey; num: string; label: string; color: string }[] = [
  { key: "cover", num: "01", label: "Couverture", color: "var(--uf-orange)" },
  { key: "problem", num: "02", label: "Problème", color: "var(--uf-magenta)" },
  { key: "solution", num: "03", label: "Solution", color: "var(--uf-teal)" },
  { key: "market", num: "04", label: "Marché", color: "var(--uf-violet)" },
  { key: "product", num: "05", label: "Produit", color: "var(--uf-orange)" },
  { key: "traction", num: "06", label: "Traction", color: "var(--uf-lime)" },
  { key: "business", num: "07", label: "Business model", color: "var(--uf-yellow)" },
  { key: "competition", num: "08", label: "Concurrence", color: "var(--uf-magenta)" },
  { key: "team", num: "09", label: "Équipe", color: "var(--uf-teal)" },
  { key: "funds", num: "10", label: "Usage des fonds", color: "var(--uf-orange)" },
  { key: "roadmap", num: "11", label: "Roadmap", color: "var(--uf-violet)" },
  { key: "contact", num: "12", label: "Contact", color: "var(--uf-ink)" },
];

type Field = { key: string; label: string; placeholder?: string; type?: "text" | "textarea" | "image"; half?: boolean };

const FIELDS: Record<SlideKey, Field[]> = {
  cover: [
    { key: "startupName", label: "Nom de la startup", placeholder: "Lumen" },
    { key: "tagline", label: "Tagline", placeholder: "Le copilote énergie des restaurateurs indépendants." },
    { key: "stage", label: "Stade & levée", placeholder: "Pré-seed · Recherche 800 k€" },
    { key: "cover_image", label: "Image de couverture (produit, app, photo)", type: "image" },
  ],
  problem: [
    { key: "problem_title", label: "Titre du problème", placeholder: "L'énergie, 2e poste de charges — ignoré." },
    { key: "stat1_value", label: "Stat 1 — Valeur", placeholder: "18 %", half: true },
    { key: "stat1_label", label: "Stat 1 — Description", placeholder: "du CA moyen en facture d'énergie" },
    { key: "stat2_value", label: "Stat 2 — Valeur", placeholder: "28 h", half: true },
    { key: "stat2_label", label: "Stat 2 — Description", placeholder: "par mois perdues à analyser les factures" },
    { key: "quote_text", label: "Citation client", placeholder: "« Ma facture double entre janvier et juillet. »", type: "textarea" },
    { key: "quote_source", label: "Source de la citation", placeholder: "Marc L., Bistrot des Batignolles" },
  ],
  solution: [
    { key: "solution_title", label: "Titre de la solution", placeholder: "Un copilote énergie pour chaque resto." },
    { key: "pillar1_title", label: "Étape 1 — Titre", placeholder: "Connecter", half: true },
    { key: "pillar1_desc", label: "Étape 1 — Description", placeholder: "Upload PDF ou sync Enedis en 2 min." },
    { key: "pillar2_title", label: "Étape 2 — Titre", placeholder: "Analyser", half: true },
    { key: "pillar2_desc", label: "Étape 2 — Description", placeholder: "Détection des 14 anomalies tarifaires." },
    { key: "pillar3_title", label: "Étape 3 — Titre", placeholder: "Agir", half: true },
    { key: "pillar3_desc", label: "Étape 3 — Description", placeholder: "Changement de contrat, plan de sobriété." },
  ],
  market: [
    { key: "tam_value", label: "TAM — Valeur", placeholder: "1,8 Md€", half: true },
    { key: "tam_label", label: "TAM — Description", placeholder: "Restauration française" },
    { key: "sam_value", label: "SAM — Valeur", placeholder: "720 M€", half: true },
    { key: "sam_label", label: "SAM — Description", placeholder: "Indépendants 5-30 ETP" },
    { key: "som_value", label: "SOM — Valeur", placeholder: "48 M€", half: true },
    { key: "som_label", label: "SOM — Description", placeholder: "Île-de-France + 4 métropoles · 3 ans" },
    { key: "market_metric1_label", label: "Métrique 1 — Label", placeholder: "Croissance du marché", half: true },
    { key: "market_metric1_value", label: "Métrique 1 — Valeur", placeholder: "+12 %/an", half: true },
    { key: "market_metric2_label", label: "Métrique 2 — Label", placeholder: "Pénétration visée", half: true },
    { key: "market_metric2_value", label: "Métrique 2 — Valeur", placeholder: "6,7 %", half: true },
  ],
  product: [
    { key: "product_title", label: "Titre", placeholder: "3 minutes pour savoir quoi faire." },
    { key: "product_image", label: "Image produit (screenshot, mockup, photo)", type: "image" },
    { key: "feature1_title", label: "Feature 1 — Titre", placeholder: "OCR factures", half: true },
    { key: "feature1_desc", label: "Feature 1 — Description", placeholder: "Lit EDF, Engie, TotalEnergies — PDF et scannées" },
    { key: "feature2_title", label: "Feature 2 — Titre", placeholder: "Alertes temps réel", half: true },
    { key: "feature2_desc", label: "Feature 2 — Description", placeholder: "Détecte 14 anomalies dès réception de la facture" },
    { key: "feature3_title", label: "Feature 3 — Titre", placeholder: "Comparateur", half: true },
    { key: "feature3_desc", label: "Feature 3 — Description", placeholder: "Négocie en direct avec 8 fournisseurs" },
    { key: "feature4_title", label: "Feature 4 — Titre", placeholder: "Export PDF", half: true },
    { key: "feature4_desc", label: "Feature 4 — Description", placeholder: "Export PDF conforme aux décrets" },
    { key: "feature5_title", label: "Feature 5 — Titre", placeholder: "Mode multi-sites", half: true },
    { key: "feature5_desc", label: "Feature 5 — Description", placeholder: "Pour les groupes de 2 à 30 établissements" },
  ],
  traction: [
    { key: "traction_title", label: "Titre", placeholder: "6 mois d'existence, 38 restos payants." },
    { key: "kpi1_value", label: "KPI 1 — Valeur", placeholder: "+87 %", half: true },
    { key: "kpi1_label", label: "KPI 1 — Label", placeholder: "croissance MRR mois sur mois", half: true },
    { key: "kpi2_value", label: "KPI 2 — Valeur", placeholder: "9 180€", half: true },
    { key: "kpi2_label", label: "KPI 2 — Label", placeholder: "MRR avril 2026", half: true },
    { key: "kpi3_value", label: "KPI 3 — Valeur", placeholder: "38 / 45", half: true },
    { key: "kpi3_label", label: "KPI 3 — Label", placeholder: "payants sur comptes activés (84%)", half: true },
    { key: "kpi4_value", label: "KPI 4 — Valeur", placeholder: "94 %", half: true },
    { key: "kpi4_label", label: "KPI 4 — Label", placeholder: "rétention 90 jours", half: true },
  ],
  business: [
    { key: "bm_title", label: "Titre", placeholder: "Deux leviers, zéro CAC variable." },
    { key: "plan1_name", label: "Offre 1 — Nom", placeholder: "Solo", half: true },
    { key: "plan1_price", label: "Offre 1 — Prix", placeholder: "39 €/mois", half: true },
    { key: "plan1_desc", label: "Offre 1 — Description", placeholder: "Restaurant seul" },
    { key: "plan2_name", label: "Offre 2 — Nom", placeholder: "Growth", half: true },
    { key: "plan2_price", label: "Offre 2 — Prix", placeholder: "99 €/mois", half: true },
    { key: "plan2_desc", label: "Offre 2 — Description", placeholder: "2 à 5 établissements" },
    { key: "plan3_name", label: "Offre 3 — Nom (optionnel)", placeholder: "Groupe", half: true },
    { key: "plan3_price", label: "Offre 3 — Prix", placeholder: "249 €/mois", half: true },
    { key: "plan3_desc", label: "Offre 3 — Description", placeholder: "6 à 30 · pack enseigne" },
    { key: "plan4_name", label: "Offre 4 — Nom (optionnel)", placeholder: "Enterprise", half: true },
    { key: "plan4_price", label: "Offre 4 — Prix", placeholder: "Sur devis", half: true },
    { key: "plan4_desc", label: "Offre 4 — Description", placeholder: "Grands comptes, API dédiée" },
    { key: "cac_value", label: "CAC", placeholder: "42 €", half: true },
    { key: "ltv_value", label: "LTV", placeholder: "3 860 €", half: true },
    { key: "ltv_cac_ratio", label: "Ratio LTV/CAC", placeholder: "91:1", half: true },
    { key: "cogs_value", label: "COGS", placeholder: "8 %", half: true },
  ],
  competition: [
    { key: "comp_title", label: "Titre", placeholder: "Personne n'outille les restaurateurs." },
    { key: "comp1_name", label: "Concurrent 1", placeholder: "Fournisseurs EDF/Engie", half: true },
    { key: "comp1_position", label: "Position (faiblesse)", placeholder: "Captifs", half: true },
    { key: "comp2_name", label: "Concurrent 2", placeholder: "Comparateurs (Selectra)", half: true },
    { key: "comp2_position", label: "Position (faiblesse)", placeholder: "Ponctuels", half: true },
    { key: "comp3_name", label: "Concurrent 3", placeholder: "Opéra Energie", half: true },
    { key: "comp3_position", label: "Position (faiblesse)", placeholder: "BtoB large", half: true },
    { key: "advantage1", label: "Avantage 1 — Titre", placeholder: "Base de factures", half: true },
    { key: "advantage1_desc", label: "Avantage 1 — Description", placeholder: "14 000 PDF analysés" },
    { key: "advantage2", label: "Avantage 2 — Titre", placeholder: "Verticale unique", half: true },
    { key: "advantage2_desc", label: "Avantage 2 — Description", placeholder: "Un seul persona : restaurateur" },
  ],
  team: [
    { key: "member1_name", label: "Fondateur 1 — Nom", placeholder: "Juliette Moreau", half: true },
    { key: "member1_role", label: "Fondateur 1 — Rôle", placeholder: "CEO · Ex-Sowee (EDF)", half: true },
    { key: "member2_name", label: "Fondateur 2 — Nom", placeholder: "Thomas Vidal", half: true },
    { key: "member2_role", label: "Fondateur 2 — Rôle", placeholder: "CTO · Ex-Back Market", half: true },
    { key: "member3_name", label: "Fondateur 3 — Nom", placeholder: "Nadia Benhamou", half: true },
    { key: "member3_role", label: "Fondateur 3 — Rôle", placeholder: "COO · Ex-Frichti", half: true },
    { key: "advisor1", label: "Advisor 1", placeholder: "Pierre-Édouard Stérin (Otium)", half: true },
    { key: "advisor2", label: "Advisor 2", placeholder: "Claire Léost (Alan)", half: true },
  ],
  funds: [
    { key: "funds_title", label: "Titre", placeholder: "800 k€ pour 18 mois de runway." },
    { key: "fund1_pct", label: "Poste 1 — %", placeholder: "45 %", half: true },
    { key: "fund1_amount", label: "Poste 1 — Montant", placeholder: "360 k€", half: true },
    { key: "fund1_label", label: "Poste 1 — Label", placeholder: "Équipe tech (3 ETP senior)" },
    { key: "fund2_pct", label: "Poste 2 — %", placeholder: "25 %", half: true },
    { key: "fund2_amount", label: "Poste 2 — Montant", placeholder: "200 k€", half: true },
    { key: "fund2_label", label: "Poste 2 — Label", placeholder: "Acquisition B2B (partenariats)" },
    { key: "fund3_pct", label: "Poste 3 — %", placeholder: "18 %", half: true },
    { key: "fund3_amount", label: "Poste 3 — Montant", placeholder: "144 k€", half: true },
    { key: "fund3_label", label: "Poste 3 — Label", placeholder: "Partenaires fournisseurs" },
    { key: "fund4_pct", label: "Poste 4 — %", placeholder: "12 %", half: true },
    { key: "fund4_amount", label: "Poste 4 — Montant", placeholder: "96 k€", half: true },
    { key: "fund4_label", label: "Poste 4 — Label", placeholder: "Pilotage (légal, compta, ops)" },
  ],
  roadmap: [
    { key: "ms1_quarter", label: "Milestone 1 — Trimestre", placeholder: "T2 26", half: true },
    { key: "ms1_title", label: "Milestone 1 — Titre", placeholder: "Seed", half: true },
    { key: "ms1_note", label: "Milestone 1 — Note", placeholder: "Closing 800 k€, 3 ETP" },
    { key: "ms2_quarter", label: "Milestone 2 — Trimestre", placeholder: "T3 26", half: true },
    { key: "ms2_title", label: "Milestone 2 — Titre", placeholder: "100 restos", half: true },
    { key: "ms2_note", label: "Milestone 2 — Note", placeholder: "v1 multi-sites + export BDR" },
    { key: "ms3_quarter", label: "Milestone 3 — Trimestre", placeholder: "T4 26", half: true },
    { key: "ms3_title", label: "Milestone 3 — Titre", placeholder: "Umih deal", half: true },
    { key: "ms3_note", label: "Milestone 3 — Note", placeholder: "Distribution officielle 40 dpts" },
    { key: "ms4_quarter", label: "Milestone 4 — Trimestre", placeholder: "T1 27", half: true },
    { key: "ms4_title", label: "Milestone 4 — Titre", placeholder: "500 restos", half: true },
    { key: "ms4_note", label: "Milestone 4 — Note", placeholder: "MRR 40 k€, breakeven" },
  ],
  contact: [
    { key: "contact_name", label: "Nom du contact", placeholder: "Juliette Moreau" },
    { key: "contact_role", label: "Rôle", placeholder: "CEO", half: true },
    { key: "contact_email", label: "Email", placeholder: "juliette@lumen.earth", half: true },
    { key: "contact_phone", label: "Téléphone", placeholder: "+33 6 71 42 19 08", half: true },
    { key: "contact_location", label: "Adresse", placeholder: "Station F · 5 parvis Alan Turing · 75013 Paris" },
    { key: "contact_cta", label: "Message d'accroche", placeholder: "Des fonds qui connaissent la restauration, le SaaS vertical, l'impact.", type: "textarea" },
    { key: "closing_date", label: "Date de closing", placeholder: "Juillet 2026", half: true },
    { key: "min_ticket", label: "Ticket minimum", placeholder: "50 k€ · jusqu'à 250 k€", half: true },
  ],
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PitchDeckV2Page() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState<SlideKey>("cover");
  const [startupId, setStartupId] = useState<string | null>(null);
  const [filling, setFilling] = useState(false);

  // Pré-remplir depuis le profil startup
  useEffect(() => {
    const id = localStorage.getItem("founderai_startup_id");
    if (!id) return;
    setStartupId(id);
    fetch(`/api/startup?startupId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const prefill: Record<string, string> = {};
        if (data.name) prefill.startupName = data.name;
        if (data.description) prefill.tagline = data.description;
        if (data.sector) prefill.tam_label = data.sector;
        setValues((prev) => ({ ...prefill, ...prev }));
      })
      .catch(() => {});
  }, []);

  function updateField(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function autoFill() {
    if (!startupId || filling) return;
    setFilling(true);
    try {
      const res = await fetch("/api/ai/fill-pitch-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.values) {
          setValues((prev) => ({ ...prev, ...data.values }));
        }
      }
    } catch { /* silencieux */ }
    finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_pitch_deck_v2", JSON.stringify(values));
    window.open("/pitch-deck-v2-preview.html", "_blank");
  }

  const fields = FIELDS[activeSlide];
  const filledCount = Object.values(values).filter(Boolean).length;
  const totalFields = Object.values(FIELDS).flat().length;

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="inline-flex items-center gap-2.5 text-lg font-semibold">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
            </a>
            <h1 className="mt-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 24, lineHeight: 0.82 }}>
              Pitch Deck — 12 slides
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              {filledCount} / {totalFields} champs
            </span>
            <button
              onClick={autoFill}
              disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}
            >
              {filling ? "Génération…" : "✨ Auto-fill IA"}
            </button>
            <button
              onClick={openPreview}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              Preview & Export PDF →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex gap-6">
        {/* Nav slides */}
        <nav className="w-48 shrink-0 space-y-1">
          {SLIDES.map((s) => {
            const isActive = activeSlide === s.key;
            const slideFields = FIELDS[s.key];
            const filled = slideFields.filter((f) => values[f.key]).length;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSlide(s.key)}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 transition-all"
                style={{
                  background: isActive ? "var(--uf-card)" : "transparent",
                  border: isActive ? "1px solid var(--uf-line)" : "1px solid transparent",
                  borderRadius: "var(--uf-r-md)",
                }}
              >
                <span className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: isActive ? s.color : "var(--uf-paper-2)", color: isActive ? "#fff" : "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}>
                  {s.num}
                </span>
                <span className="text-xs font-medium truncate" style={{ color: isActive ? "var(--uf-ink)" : "var(--uf-muted)" }}>
                  {s.label}
                </span>
                {filled > 0 && (
                  <span className="ml-auto text-[9px] font-medium" style={{ color: filled === slideFields.length ? "var(--uf-teal)" : "var(--uf-muted-2)" }}>
                    {filled}/{slideFields.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Formulaire */}
        <div className="flex-1 p-6" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: SLIDES.find((s) => s.key === activeSlide)!.color, color: "#fff", fontFamily: "var(--uf-mono)" }}>
              {SLIDES.find((s) => s.key === activeSlide)!.num}
            </span>
            <h2 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 22, color: "var(--uf-ink)" }}>
              {SLIDES.find((s) => s.key === activeSlide)!.label}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="text-[11px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
                  {f.label}
                </label>
                {f.type === "image" ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-24 flex items-center justify-center overflow-hidden cursor-pointer"
                      style={{ border: "2px dashed var(--uf-line)", borderRadius: "var(--uf-r-md)", background: "var(--uf-paper-2)" }}
                      onClick={() => document.getElementById(`img-${f.key}`)?.click()}
                    >
                      {values[f.key] ? (
                        <img src={values[f.key]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🖼️</span>
                      )}
                    </div>
                    <input
                      id={`img-${f.key}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => updateField(f.key, reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => document.getElementById(`img-${f.key}`)?.click()}
                        className="text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ border: "1px solid var(--uf-line)", color: "var(--uf-ink)" }}
                      >
                        {values[f.key] ? "Changer" : "Choisir une image"}
                      </button>
                      {values[f.key] && (
                        <button
                          type="button"
                          onClick={() => updateField(f.key, "")}
                          className="text-xs" style={{ color: "var(--uf-muted)" }}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={values[f.key] ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 text-sm focus:outline-none resize-y"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.key] ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                const idx = SLIDES.findIndex((s) => s.key === activeSlide);
                if (idx > 0) setActiveSlide(SLIDES[idx - 1].key);
              }}
              disabled={activeSlide === "cover"}
              className="text-sm font-medium disabled:opacity-30"
              style={{ color: "var(--uf-muted)" }}
            >
              ← Slide précédente
            </button>
            <button
              onClick={() => {
                const idx = SLIDES.findIndex((s) => s.key === activeSlide);
                if (idx < SLIDES.length - 1) setActiveSlide(SLIDES[idx + 1].key);
              }}
              disabled={activeSlide === "contact"}
              className="text-sm font-medium disabled:opacity-30"
              style={{ color: "var(--uf-orange)" }}
            >
              Slide suivante →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
