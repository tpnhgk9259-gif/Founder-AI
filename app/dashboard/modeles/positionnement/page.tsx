"use client";

import { useState, useEffect } from "react";

// ── Obviously Awesome — April Dunford ───────────────────────────────────────
// 5 composantes + statement de positionnement

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

export default function PositionnementPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [startupLogo, setStartupLogo] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries([...SECTIONS.map((s) => [s.key, ""]), [STATEMENT_KEY, ""]])
  );
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        try { setValues((prev) => ({ ...prev, ...JSON.parse(saved) })); } catch { /* ignore */ }
      }
    }
  }, []);

  function updateField(key: string, val: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (startupId) localStorage.setItem(`founderai_positioning_${startupId}`, JSON.stringify(next));
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
      setValues((prev) => {
        const next = { ...prev, ...json.values };
        if (startupId) localStorage.setItem(`founderai_positioning_${startupId}`, JSON.stringify(next));
        return next;
      });
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setFilling(false);
    }
  }

  async function handleGeneratePdf() {
    if (!startupId) return;
    setGenerating(true);
    setError("");
    setSaveSuccess(false);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const PW = 210;
      const PH = 297;
      const M = 14;
      const W = PW - 2 * M;

      const ORANGE: [number, number, number] = [255, 106, 31];
      const INK: [number, number, number] = [15, 14, 11];
      const MUTED: [number, number, number] = [108, 103, 96];
      const LINE: [number, number, number] = [224, 217, 199];
      const PAPER: [number, number, number] = [251, 248, 240];

      // Fond
      doc.setFillColor(...PAPER);
      doc.rect(0, 0, PW, PH, "F");

      // Header
      doc.setFillColor(...ORANGE);
      doc.circle(M + 3.5, M + 3.5, 3.5, "F");
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("f", M + 2.3, M + 5);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      const headerName = (startupName || "Startup").toUpperCase();
      doc.text(headerName, M + 10, M + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.setFontSize(7);
      doc.text("\u00B7  Positionnement", M + 10 + doc.getTextWidth(headerName) + 3, M + 5);
      doc.text(new Date().toLocaleDateString("fr-FR"), PW - M, M + 5, { align: "right" });

      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.line(M, M + 9, PW - M, M + 9);

      // Titre
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text("POSITIONNEMENT", M, M + 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...MUTED);
      doc.text("Obviously Awesome \u2014 April Dunford", M, M + 26);

      let y = M + 34;

      function checkPage(curY: number, needed: number): number {
        if (curY + needed > PH - M - 6) {
          doc.addPage();
          doc.setFillColor(...PAPER);
          doc.rect(0, 0, PW, PH, "F");
          return M + 6;
        }
        return curY;
      }

      // Sections
      const sectionColors: [number, number, number][] = [
        [232, 53, 142],  // magenta
        [110, 75, 232],  // violet
        [255, 106, 31],  // orange
        [13, 180, 160],  // teal
        [255, 209, 42],  // yellow
      ];

      SECTIONS.forEach((section, idx) => {
        const content = values[section.key]?.trim() || "";
        const contentLines = content ? doc.splitTextToSize(content, W - 10) : [];
        const blockH = 14 + contentLines.length * 4.5 + 6;

        y = checkPage(y, blockH);

        const sc = sectionColors[idx];

        // Barre accent
        doc.setDrawColor(...sc);
        doc.setLineWidth(1);
        doc.line(M, y, M, y + blockH - 2);

        // Numéro
        doc.setFillColor(...sc);
        doc.roundedRect(M + 3, y, 7, 5, 1, 1, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(section.num, M + 5, y + 3.5);

        // Titre section
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.text(section.label.toUpperCase(), M + 13, y + 4);

        // Description
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...MUTED);
        const descLines = doc.splitTextToSize(section.description, W - 14);
        doc.text(descLines.slice(0, 2), M + 13, y + 9);
        y += 14;

        // Contenu
        if (contentLines.length > 0) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...INK);
          doc.text(contentLines, M + 6, y);
          y += contentLines.length * 4.5;
        }

        y += 6;
      });

      // Statement de positionnement
      const statement = values[STATEMENT_KEY]?.trim();
      if (statement) {
        y = checkPage(y, 30);

        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.8);
        doc.line(M, y, M + 14, y);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...ORANGE);
        doc.text("STATEMENT DE POSITIONNEMENT", M + 17, y + 0.5);

        y += 6;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, y, W, 0, 1.5, 1.5, "F"); // placeholder for height

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        const stLines = doc.splitTextToSize(statement, W - 10);
        const stH = stLines.length * 5.5 + 8;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, y, W, stH, 1.5, 1.5, "F");
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.4);
        doc.roundedRect(M, y, W, stH, 1.5, 1.5);
        doc.text(stLines, M + 5, y + 6);
        y += stH + 6;
      }

      // Footer
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(M, PH - M - 2, PW - M, PH - M - 2);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(`${headerName}  \u00B7  Positionnement  \u00B7  ${new Date().toLocaleDateString("fr-FR")}`, M, PH - M + 1);
        doc.text(`${p} / ${totalPages}`, PW - M, PH - M + 1, { align: "right" });
      }

      // Export
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const fileName = `Positionnement${startupName ? ` \u2014 ${startupName}` : ""} (${dateStr}).pdf`;
      const pdfBlob = doc.output("blob");

      const dlUrl = URL.createObjectURL(pdfBlob);
      const dlLink = document.createElement("a");
      dlLink.href = dlUrl;
      dlLink.download = fileName;
      dlLink.click();
      URL.revokeObjectURL(dlUrl);

      // Upload
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });
      const textContent = SECTIONS.map((s) => `${s.label}\n${values[s.key] || "\u2014"}`).join("\n\n")
        + (statement ? `\n\nStatement de positionnement\n${statement}` : "");

      const formData = new FormData();
      formData.append("startupId", startupId!);
      formData.append("file", file);
      formData.append("text", textContent);

      const uploadRes = await fetch("/api/startup/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const ct = uploadRes.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? ((await uploadRes.json()).error ?? "Erreur lors de la sauvegarde.")
          : `Erreur serveur temporaire (${uploadRes.status}).`;
        setError(msg);
        return;
      }
      setSaveSuccess(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  }

  const hasContent = Object.values(values).some((v) => v.trim().length > 0);

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
                <p className="text-xs mt-1" style={{ color: "var(--uf-muted)", fontStyle: "italic" }}>Obviously Awesome — April Dunford</p>
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
                const empty = Object.fromEntries([...SECTIONS.map((s) => [s.key, ""]), [STATEMENT_KEY, ""]]);
                setValues(empty);
                if (startupId) localStorage.removeItem(`founderai_positioning_${startupId}`);
                setSaveSuccess(false);
                setError("");
              }}
              className="px-4 py-2.5 text-sm font-medium rounded-full transition-all"
              style={{ background: "var(--uf-card)", border: "1.5px solid var(--uf-line)", color: "var(--uf-muted)" }}
            >
              Vider
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={generating || !startupId || !hasContent}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              {generating ? "Génération..." : "Générer le PDF"}
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

        {saveSuccess && (
          <div className="text-sm px-4 py-3 flex items-center gap-2" style={{ color: "var(--uf-teal)", background: "#0DB4A014", border: "1px solid #0DB4A030", borderRadius: "var(--uf-r-lg)" }}>
            {"\u2705"} PDF généré et ajouté à vos documents !
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

        {/* Statement de positionnement */}
        <div
          className="p-5"
          style={{
            background: "var(--uf-card)",
            border: "2px solid var(--uf-orange)",
            borderRadius: "var(--uf-r-xl)",
          }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--uf-orange)", fontFamily: "var(--uf-display)", fontSize: 16 }}>
            Statement de positionnement
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
          Framework Obviously Awesome — April Dunford. Remplissez dans l'ordre : chaque composante alimente la suivante.
        </p>
      </div>
    </div>
  );
}
