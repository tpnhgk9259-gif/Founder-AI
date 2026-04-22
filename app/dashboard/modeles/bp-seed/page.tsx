"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BusinessModel = "saas" | "marketplace" | "deeptech" | "medtech" | "services";

const BM_META: Record<BusinessModel, { label: string; desc: string; emoji: string; color: string }> = {
  saas:        { label: "SaaS", desc: "Abonnement logiciel récurrent", emoji: "💻", color: "var(--uf-violet)" },
  marketplace: { label: "Marketplace", desc: "Plateforme de mise en relation", emoji: "🔄", color: "var(--uf-magenta)" },
  deeptech:    { label: "DeepTech", desc: "Innovation de rupture, R&D longue", emoji: "🔬", color: "var(--uf-teal)" },
  medtech:     { label: "MedTech", desc: "Dispositif médical, parcours réglementaire", emoji: "🏥", color: "var(--uf-orange)" },
  services:    { label: "Services", desc: "Conseil, prestation, expertise", emoji: "🤝", color: "var(--uf-yellow)" },
};

const TEMPLATE_FILES: Record<BusinessModel, string> = {
  saas:        "/templates/FounderAI_BP_Seed_SaaS.xlsx",
  marketplace: "/templates/FounderAI_BP_Seed_Marketplace.xlsx",
  deeptech:    "/templates/FounderAI_BP_Seed_DeepTech.xlsx",
  medtech:     "/templates/FounderAI_BP_Seed_MedTech.xlsx",
  services:    "/templates/FounderAI_BP_Seed_Services.xlsx",
};

// ─── Cell mappings per business model ────────────────────────────────────────
// Each entry: [sheetName, cellRef, fieldKey, label, type, placeholder?]

type FieldType = "number" | "percent" | "text" | "currency";
type CellMapping = [string, string, string, string, FieldType, string?];

const SAAS_FIELDS: CellMapping[] = [
  // Plan stratégique
  ["Plan stratégique", "B5", "name", "Nom de la startup", "text", "Ma Startup"],
  ["Plan stratégique", "B6", "sector", "Secteur d'activité", "text", "SaaS B2B — RH Tech"],
  ["Plan stratégique", "B7", "createdAt", "Date de création", "text", "Janvier 2026"],
  ["Plan stratégique", "B8", "founders", "Fondateur(s)", "text", "Marie Dupont (CEO)"],
  ["Plan stratégique", "B9", "location", "Localisation", "text", "Paris, France"],
  ["Plan stratégique", "B10", "stage", "Stade actuel", "text", "MVP lancé"],
  ["Plan stratégique", "B12", "problem", "Problème résolu", "text"],
  ["Plan stratégique", "B13", "solution", "Solution proposée", "text"],
  ["Plan stratégique", "B14", "uvp", "Proposition de valeur unique", "text"],
  ["Plan stratégique", "B17", "tam", "TAM (marché total)", "text", "2,5 Mds€"],
  ["Plan stratégique", "B18", "sam", "SAM (marché adressable)", "text", "400 M€"],
  ["Plan stratégique", "B19", "som", "SOM (objectif 3 ans)", "text", "2 M€"],
  // Hypothèses — Pricing
  ["Hypothèses", "B6", "price_starter", "Prix Starter (€/mois)", "currency", "29"],
  ["Hypothèses", "C6", "mix_starter", "Mix Starter (%)", "percent", "50"],
  ["Hypothèses", "B7", "price_pro", "Prix Pro (€/mois)", "currency", "79"],
  ["Hypothèses", "C7", "mix_pro", "Mix Pro (%)", "percent", "35"],
  ["Hypothèses", "B8", "price_premium", "Prix Premium (€/mois)", "currency", "199"],
  ["Hypothèses", "C8", "mix_premium", "Mix Premium (%)", "percent", "15"],
  ["Hypothèses", "B10", "annual_pct", "Engagement annuel (%)", "percent", "30"],
  // Acquisition
  ["Hypothèses", "B14", "new_clients_y1", "Nouveaux clients/mois Y1", "number", "10"],
  ["Hypothèses", "C14", "new_clients_y2", "Nouveaux clients/mois Y2", "number", "35"],
  ["Hypothèses", "D14", "new_clients_y3", "Nouveaux clients/mois Y3", "number", "75"],
  ["Hypothèses", "B15", "churn_y1", "Churn mensuel Y1 (%)", "percent", "6"],
  ["Hypothèses", "C15", "churn_y2", "Churn mensuel Y2 (%)", "percent", "4.5"],
  ["Hypothèses", "D15", "churn_y3", "Churn mensuel Y3 (%)", "percent", "3"],
  ["Hypothèses", "B17", "cac_y1", "CAC Y1 (€)", "currency", "50"],
  ["Hypothèses", "C17", "cac_y2", "CAC Y2 (€)", "currency", "40"],
  ["Hypothèses", "D17", "cac_y3", "CAC Y3 (€)", "currency", "30"],
  // Coûts variables
  ["Hypothèses", "B24", "cost_hosting", "Hébergement/client/mois (€)", "currency", "1.5"],
  ["Hypothèses", "B25", "cost_api", "API/services tiers/client/mois (€)", "currency", "0.5"],
  ["Hypothèses", "B26", "cost_support", "Support/client/mois (€)", "currency", "2"],
  ["Hypothèses", "B27", "cost_payment_pct", "Frais paiement (% CA)", "percent", "2.9"],
];

const MARKETPLACE_FIELDS: CellMapping[] = [
  ["Plan stratégique", "B5", "name", "Nom de la startup", "text", "Ma Marketplace"],
  ["Plan stratégique", "B6", "sector", "Secteur", "text", "Marketplace freelances tech"],
  ["Plan stratégique", "B7", "createdAt", "Date de création", "text", "Mars 2026"],
  ["Plan stratégique", "B8", "founders", "Fondateur(s)", "text"],
  ["Plan stratégique", "B9", "location", "Localisation", "text", "Lyon, France"],
  ["Plan stratégique", "B10", "stage", "Stade actuel", "text"],
  ["Plan stratégique", "B12", "problem", "Problème résolu", "text"],
  ["Plan stratégique", "B13", "solution", "Solution proposée", "text"],
  ["Plan stratégique", "B14", "uvp", "Proposition de valeur unique", "text"],
  // Hypothèses
  ["Hypothèses", "B6", "tx_y1", "Transactions/mois Y1", "number", "20"],
  ["Hypothèses", "C6", "tx_y2", "Transactions/mois Y2", "number", "80"],
  ["Hypothèses", "D6", "tx_y3", "Transactions/mois Y3", "number", "200"],
  ["Hypothèses", "B7", "basket_y1", "Panier moyen Y1 (€)", "currency", "2000"],
  ["Hypothèses", "C7", "basket_y2", "Panier moyen Y2 (€)", "currency", "2200"],
  ["Hypothèses", "D7", "basket_y3", "Panier moyen Y3 (€)", "currency", "2500"],
  ["Hypothèses", "B8", "take_y1", "Take rate Y1 (%)", "percent", "12"],
  ["Hypothèses", "C8", "take_y2", "Take rate Y2 (%)", "percent", "12"],
  ["Hypothèses", "D8", "take_y3", "Take rate Y3 (%)", "percent", "15"],
  ["Hypothèses", "B14", "suppliers_y1", "Offreurs inscrits Y1", "number", "200"],
  ["Hypothèses", "B16", "buyers_y1", "Demandeurs actifs Y1", "number", "50"],
  ["Hypothèses", "B19", "rebuy_y1", "Taux réachat Y1 (%)", "percent", "40"],
  ["Hypothèses", "B23", "cac_supply", "CAC offreur (€)", "currency", "20"],
  ["Hypothèses", "B24", "cac_demand", "CAC demandeur (€)", "currency", "80"],
  ["Hypothèses", "B30", "payment_pct", "Frais paiement (% GMV)", "percent", "2.9"],
];

const DEEPTECH_FIELDS: CellMapping[] = [
  ["Plan strategique", "B4", "name", "Nom", "text", "CarbonLoop"],
  ["Plan strategique", "B5", "sector", "Secteur", "text", "CleanTech"],
  ["Plan strategique", "B6", "createdAt", "Date création", "text"],
  ["Plan strategique", "B7", "founders", "Fondateurs", "text"],
  ["Plan strategique", "B8", "location", "Localisation", "text", "Grenoble"],
  ["Plan strategique", "B9", "trl", "TRL actuel", "text", "TRL 4"],
  // Hypothèses
  ["Hypotheses", "E5", "units_y4", "Unités livrées Y4", "number", "2"],
  ["Hypotheses", "F5", "units_y5", "Unités livrées Y5", "number", "3"],
  ["Hypotheses", "G5", "units_y6", "Unités livrées Y6", "number", "5"],
  ["Hypotheses", "E7", "price_y4", "Prix/unité Y4 (€)", "currency", "800000"],
  ["Hypotheses", "F7", "price_y5", "Prix/unité Y5 (€)", "currency", "900000"],
  ["Hypotheses", "G7", "price_y6", "Prix/unité Y6 (€)", "currency", "950000"],
  ["Hypotheses", "E9", "maint_pct", "Maintenance (% CAPEX)", "percent", "15"],
  ["Hypotheses", "B17", "rd_staff_y1", "Personnel R&D Y1 (€)", "currency", "180000"],
  ["Hypotheses", "C17", "rd_staff_y2", "Personnel R&D Y2 (€)", "currency", "320000"],
  ["Hypotheses", "D17", "rd_staff_y3", "Personnel R&D Y3 (€)", "currency", "400000"],
  ["Hypotheses", "B61", "funding_founders", "Apport fondateurs (€)", "currency", "30000"],
  ["Hypotheses", "B62", "funding_ba", "Love money / BA (€)", "currency", "50000"],
  ["Hypotheses", "B63", "funding_seed", "Levée Seed (€)", "currency", "800000"],
];

const MEDTECH_FIELDS: CellMapping[] = [
  ["Plan strategique", "B4", "name", "Nom", "text", "NeuraSense"],
  ["Plan strategique", "B5", "sector", "Secteur", "text", "MedTech — Dispositif monitoring"],
  ["Plan strategique", "B6", "createdAt", "Date création", "text"],
  ["Plan strategique", "B7", "founders", "Fondateurs", "text"],
  ["Plan strategique", "B8", "location", "Localisation", "text", "Strasbourg"],
  ["Plan strategique", "B9", "stage", "Stade", "text", "Prototype fonctionnel"],
  // Hypothèses
  ["Hypotheses", "E5", "dm_y4", "Dispositifs vendus Y4", "number", "20"],
  ["Hypotheses", "F5", "dm_y5", "Dispositifs vendus Y5", "number", "60"],
  ["Hypotheses", "E6", "dm_price_y4", "Prix DM Y4 (€)", "currency", "5000"],
  ["Hypotheses", "F6", "dm_price_y5", "Prix DM Y5 (€)", "currency", "4800"],
  ["Hypotheses", "E8", "patients_y4", "Patients monitoring Y4", "number", "100"],
  ["Hypotheses", "F8", "patients_y5", "Patients monitoring Y5", "number", "400"],
  ["Hypotheses", "E9", "consumable_price", "Consommable/patient/mois (€)", "currency", "200"],
  ["Hypotheses", "B20", "rd_staff_y1", "Personnel R&D Y1 (€)", "currency", "200000"],
  ["Hypotheses", "B23", "clinical_y2", "Études cliniques Y2 (€)", "currency", "120000"],
  ["Hypotheses", "C23", "clinical_y3", "Études cliniques Y3 (€)", "currency", "250000"],
  ["Hypotheses", "B66", "funding_founders", "Apport fondateurs (€)", "currency", "40000"],
  ["Hypotheses", "B68", "funding_seed", "Levée Seed (€)", "currency", "1200000"],
];

const SERVICES_FIELDS: CellMapping[] = [
  ["Plan strategique", "B5", "name", "Nom de la startup", "text", "Mon Cabinet"],
  ["Plan strategique", "B6", "sector", "Secteur", "text", "Conseil en stratégie digitale"],
  ["Plan strategique", "B7", "createdAt", "Date de création", "text"],
  ["Plan strategique", "B8", "founders", "Fondateur(s)", "text"],
  ["Plan strategique", "B9", "location", "Localisation", "text"],
  ["Plan strategique", "B10", "stage", "Stade actuel", "text"],
  ["Plan strategique", "B12", "problem", "Problème résolu", "text"],
  ["Plan strategique", "B13", "solution", "Solution proposée", "text"],
  // Hypothèses
  ["Hypotheses", "B6", "consultants_y1", "Consultants ETP Y1", "number", "1.5"],
  ["Hypotheses", "C6", "consultants_y2", "Consultants ETP Y2", "number", "3"],
  ["Hypotheses", "D6", "consultants_y3", "Consultants ETP Y3", "number", "5"],
  ["Hypotheses", "B8", "occupation_y1", "Taux occupation Y1 (%)", "percent", "60"],
  ["Hypotheses", "C8", "occupation_y2", "Taux occupation Y2 (%)", "percent", "70"],
  ["Hypotheses", "D8", "occupation_y3", "Taux occupation Y3 (%)", "percent", "75"],
  ["Hypotheses", "B10", "tjm_y1", "TJM moyen Y1 (€)", "currency", "800"],
  ["Hypotheses", "C10", "tjm_y2", "TJM moyen Y2 (€)", "currency", "850"],
  ["Hypotheses", "D10", "tjm_y3", "TJM moyen Y3 (€)", "currency", "900"],
  ["Hypotheses", "B11", "basket_y1", "Panier moyen mission Y1 (€)", "currency", "8000"],
  ["Hypotheses", "B14", "rebuy_y1", "Taux récurrence Y1 (%)", "percent", "25"],
  ["Hypotheses", "B18", "new_clients_y1", "Nouveaux clients/an Y1", "number", "10"],
  ["Hypotheses", "B19", "cac_y1", "CAC Y1 (€)", "currency", "200"],
  ["Hypotheses", "B24", "subcontract_pct", "Sous-traitance (% CA)", "percent", "15"],
];

const FIELDS: Record<BusinessModel, CellMapping[]> = {
  saas: SAAS_FIELDS,
  marketplace: MARKETPLACE_FIELDS,
  deeptech: DEEPTECH_FIELDS,
  medtech: MEDTECH_FIELDS,
  services: SERVICES_FIELDS,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BPSeedPage() {
  const [bm, setBm] = useState<BusinessModel | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [startupName, setStartupName] = useState("");

  // Pré-remplir depuis le profil startup
  useEffect(() => {
    const id = localStorage.getItem("founderai_startup_id");
    if (!id) return;
    fetch(`/api/startup?startupId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setStartupName(data.name);
        const prefill: Record<string, string> = {};
        if (data.name) prefill.name = data.name;
        if (data.sector) prefill.sector = data.sector;
        if (data.description) prefill.problem = data.description;
        if (data.stage) prefill.stage = data.stage;
        setValues((prev) => ({ ...prefill, ...prev }));
      })
      .catch(() => {});
  }, []);

  function updateField(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function generateExcel() {
    if (!bm) return;
    setGenerating(true);

    try {
      const ExcelJS = (await import("exceljs")).default;
      const res = await fetch(TEMPLATE_FILES[bm]);
      const buffer = await res.arrayBuffer();

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);

      const fields = FIELDS[bm];
      for (const [sheetName, cellRef, key, , fieldType] of fields) {
        const ws = wb.getWorksheet(sheetName);
        if (!ws) continue;
        const raw = values[key];
        if (raw === undefined || raw === "") continue;

        const cell = ws.getCell(cellRef);
        if (fieldType === "number" || fieldType === "currency") {
          cell.value = parseFloat(raw) || 0;
        } else if (fieldType === "percent") {
          cell.value = (parseFloat(raw) || 0) / 100;
        } else {
          cell.value = raw;
        }
      }

      const outBuffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([outBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BP_Seed_${BM_META[bm].label}_${startupName || "startup"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur génération Excel :", err);
      alert("Erreur lors de la génération du fichier Excel.");
    } finally {
      setGenerating(false);
    }
  }

  const fields = bm ? FIELDS[bm] : [];

  // Grouper les champs par onglet Excel
  const groups: Record<string, CellMapping[]> = {};
  for (const f of fields) {
    const sheet = f[0];
    if (!groups[sheet]) groups[sheet] = [];
    groups[sheet].push(f);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="inline-flex items-center gap-2.5 text-lg font-semibold">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
            </a>
            <h1 className="mt-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 28, lineHeight: 0.82 }}>
              Business Plan Seed
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
              Remplissez les hypothèses, récupérez un Excel complet avec projections financières automatiques.
            </p>
          </div>
          <a href="/dashboard" className="text-sm" style={{ color: "var(--uf-muted)" }}>← Retour</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Étape 1 : choix du business model */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              01 — Votre business model
            </span>
          </div>
          <div className="grid sm:grid-cols-5 gap-3">
            {(Object.entries(BM_META) as [BusinessModel, typeof BM_META[BusinessModel]][]).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setBm(key)}
                className="text-left p-4 transition-all hover:shadow-md"
                style={{
                  background: bm === key ? "var(--uf-card)" : "transparent",
                  border: bm === key ? `2px solid ${meta.color}` : "1px solid var(--uf-line)",
                  borderRadius: "var(--uf-r-lg)",
                }}
              >
                <div className="text-2xl mb-2">{meta.emoji}</div>
                <div className="font-bold text-sm" style={{ color: "var(--uf-ink)" }}>{meta.label}</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--uf-muted)" }}>{meta.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Étape 2 : formulaire */}
        {bm && (
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
                02 — Hypothèses {BM_META[bm].label}
              </span>
              <span className="text-[11px]" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted-2)" }}>
                {Object.keys(values).filter((k) => values[k]).length} / {fields.length} remplis
              </span>
            </div>

            {Object.entries(groups).map(([sheetName, sheetFields]) => (
              <div key={sheetName} className="mb-6 p-6" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
                <h3 className="uppercase tracking-normal mb-4" style={{ fontFamily: "var(--uf-display)", fontSize: 20, color: "var(--uf-ink)" }}>
                  {sheetName}
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {sheetFields.map(([, , key, label, fieldType, placeholder]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-medium" style={{ color: "var(--uf-muted)" }}>
                        {label}
                        {fieldType === "percent" && <span className="ml-1 opacity-50">(%)</span>}
                        {fieldType === "currency" && <span className="ml-1 opacity-50">(€)</span>}
                      </label>
                      <input
                        type={fieldType === "text" ? "text" : "number"}
                        step={fieldType === "percent" ? "0.1" : fieldType === "currency" ? "0.01" : "1"}
                        value={values[key] ?? ""}
                        onChange={(e) => updateField(key, e.target.value)}
                        placeholder={placeholder ?? ""}
                        className="w-full px-3 py-2 text-sm focus:outline-none"
                        style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", background: "var(--uf-paper)", color: "var(--uf-ink)" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Bouton générer */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={generateExcel}
                disabled={generating}
                className="px-8 py-4 text-[15px] font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform flex items-center gap-2"
                style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
              >
                {generating ? "Génération en cours…" : "Télécharger le Business Plan Excel"}
              </button>
              <span className="text-xs" style={{ color: "var(--uf-muted)" }}>
                Les formules calculent automatiquement revenus, P&L, trésorerie et KPIs.
              </span>
            </div>
          </div>
        )}

        {/* Pas de BM sélectionné */}
        {!bm && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">👆</p>
            <p className="text-sm" style={{ color: "var(--uf-muted)" }}>Sélectionnez votre business model pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
