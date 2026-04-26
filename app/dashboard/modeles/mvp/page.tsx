"use client";

import { useState, useEffect } from "react";
import type { MvpReport, MvpLot } from "@/app/api/ai/mvp-report/route";

type MvpSection = {
  key: string;
  label: string;
  placeholder: string;
  emoji: string;
  color: string;       // hex accent color
  bgColor: string;     // hex + "14" for light bg
};

const SECTIONS: MvpSection[] = [
  {
    key: "cible",
    label: "A qui s'adresse le MVP ?",
    placeholder: "Decrivez votre client ideal et s'il y a d'autres utilisateurs concernes par le MVP...",
    emoji: "\u{1F3AF}",
    color: "#6E4BE8",
    bgColor: "#6E4BE814",
  },
  {
    key: "probleme",
    label: "Probleme que doit resoudre le MVP pour le client ideal",
    placeholder: "Decrivez le probleme...",
    emoji: "\u26A1",
    color: "#E8358E",
    bgColor: "#E8358E14",
  },
  {
    key: "fonctions_client",
    label: "Les fonctions que veut voir absolument le client",
    placeholder: "Decrivez ce que le client ideal recherche en priorite...",
    emoji: "\u2705",
    color: "#0DB4A0",
    bgColor: "#0DB4A014",
  },
  {
    key: "fonctions_autres",
    label: "Les fonctions que veulent voir absolument les autres utilisateurs",
    placeholder: "Decrivez ce que recherchent les autres utilisateurs...",
    emoji: "\u{1F465}",
    color: "#FF6A1F",
    bgColor: "#FF6A1F14",
  },
  {
    key: "no_go_client",
    label: "Ce que le client ne veut absolument pas",
    placeholder: "Decrivez ce qui fera fuir le client ideal...",
    emoji: "\u{1F6AB}",
    color: "#FFD12A",
    bgColor: "#FFD12A14",
  },
  {
    key: "no_go_autres",
    label: "Ce que les autres utilisateurs ne veulent absolument pas",
    placeholder: "Decrivez ce qui fera fuir les autres utilisateurs...",
    emoji: "\u26D4",
    color: "#E8358E",
    bgColor: "#E8358E14",
  },
];

const EFFORT_STYLES: Record<string, { background: string; color: string }> = {
  "Faible": { background: "#0DB4A018", color: "#0DB4A0" },
  "Moyen":  { background: "#FF6A1F18", color: "#FF6A1F" },
  "Eleve":  { background: "#E8358E18", color: "#E8358E" },
};

const PRIORITE_STYLES: Record<string, { background: string; color: string }> = {
  "Indispensable": { background: "#FF6A1F18", color: "#FF6A1F" },
  "Important":     { background: "#6E4BE818", color: "#6E4BE8" },
  "Souhaitable":   { background: "var(--uf-line)", color: "var(--uf-muted)" },
};

const FALLBACK_BADGE = { background: "var(--uf-line)", color: "var(--uf-muted)" };

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    .replace(/\u00A0|\u202F/g, " ");
}

export default function MvpPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>("");
  const [startupLogo, setStartupLogo] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.key, ""]))
  );
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<MvpReport | null>(null);
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

      const saved = localStorage.getItem(`founderai_mvp_${sid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setValues((prev) => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }
    }
  }, []);

  async function handleFillWithAgents() {
    if (!startupId) return;
    setFilling(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fill-mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur lors de la generation."); return; }
      setValues((prev) => {
        const next = { ...prev, ...json.sections };
        if (startupId) localStorage.setItem(`founderai_mvp_${startupId}`, JSON.stringify(next));
        return next;
      });
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setFilling(false);
    }
  }

  async function handleGenerateReport() {
    if (!hasContent) return;
    setGeneratingReport(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/ai/mvp-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: values, startupName, startupId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur lors de la generation du rapport."); return; }
      setReport(json.report);
      setTimeout(() => {
        document.getElementById("mvp-report")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleExportReportPdf() {
    if (!report || !startupId) return;
    setGenerating(true);
    setError("");
    setSaveSuccess(false);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const PAGE_W = 210;
      const PAGE_H = 297;
      const M = 14;
      const W = PAGE_W - M * 2;

      function checkPage(curY: number, needed: number): number {
        if (curY + needed > PAGE_H - M - 8) {
          doc.addPage();
          return M + 6;
        }
        return curY;
      }

      const ORANGE: [number, number, number] = [255, 106, 31];
      const INK: [number, number, number] = [15, 14, 11];
      const MUTED: [number, number, number] = [108, 103, 96];
      const LINE: [number, number, number] = [224, 217, 199];
      const PAPER: [number, number, number] = [251, 248, 240];

      // Fond papier
      doc.setFillColor(...PAPER);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");

      function headerBand(y: number) {
        // Pastille FounderAI
        doc.setFillColor(...ORANGE);
        doc.circle(M + 3.5, y + 4, 3.5, "F");
        doc.setFontSize(5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("f", M + 2.3, y + 5.5);

        // Nom startup
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.text((startupName || "Startup").toUpperCase(), M + 10, y + 5.5);

        // Label
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.setFontSize(7);
        const nameW = doc.getTextWidth((startupName || "Startup").toUpperCase());
        doc.text("\u00B7  Rapport MVP", M + 10 + nameW + 3, y + 5.5);

        // Date
        const dateStr = new Date().toLocaleDateString("fr-FR");
        doc.text(dateStr, PAGE_W - M, y + 5.5, { align: "right" });

        // Ligne
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.3);
        doc.line(M, y + 9, PAGE_W - M, y + 9);
      }

      headerBand(M);

      // Titre
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text("RAPPORT MVP", M, M + 18);

      let y = M + 24;

      // Helper: section title bar
      function sectionBar(label: string, atY: number) {
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.8);
        doc.line(M, atY, M + 14, atY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...ORANGE);
        doc.text(label.toUpperCase(), M + 17, atY + 0.5);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        const labelW = doc.getTextWidth(label.toUpperCase());
        doc.line(M + 18 + labelW, atY, PAGE_W - M, atY);
      }

      // -- Synthese ---------------------------------------------------------------
      sectionBar("Synthèse exécutive", y);
      y += 6;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const syntheseLines = doc.splitTextToSize(report.synthese, W - 4);
      y = checkPage(y, syntheseLines.length * 4.5 + 4);
      doc.text(syntheseLines, M + 4, y + 1);
      y += syntheseLines.length * 4.5 + 6;

      // -- Resume budget + effort --------------------------------------------------
      y = checkPage(y, 18);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, y, W, 14, 1.5, 1.5, "F");
      doc.setDrawColor(...LINE);
      doc.roundedRect(M, y, W, 14, 1.5, 1.5);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MUTED);
      doc.text("BUDGET", M + 4, y + 4.5);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(`${fmtEur(report.budget_total_min)} \u2013 ${fmtEur(report.budget_total_max)}`, M + 4, y + 11);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MUTED);
      doc.text("EFFORT", M + W / 2 + 4, y + 4.5);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const effortLines = doc.splitTextToSize(report.effort_total, W / 2 - 8);
      doc.text(effortLines.slice(0, 2), M + W / 2 + 4, y + 11);
      y += 20;

      // -- Lots fonctionnels -------------------------------------------------------
      y = checkPage(y, 10);
      sectionBar(`Lots fonctionnels (${report.lots.length})`, y);
      y += 6;

      report.lots.forEach((lot: MvpLot, idx: number) => {
        const fonctLines = doc.splitTextToSize(lot.fonctionnalites.map((f) => `\u2022 ${f}`).join("\n"), W - 8);
        const impactClientLines = doc.splitTextToSize(lot.impact_client, (W - 8) / 2);
        const impactAutresLines = doc.splitTextToSize(lot.impact_autres, (W - 8) / 2);
        const impactRows = Math.max(impactClientLines.length, impactAutresLines.length);
        const effortLines2 = doc.splitTextToSize(lot.effort_detail, W - 8);
        const blockH = 8 + fonctLines.length * 4 + impactRows * 4 + effortLines2.length * 4 + 32;

        y = checkPage(y, blockH);

        // Bandeau titre lot
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, y, W, 8, 1.5, 1.5, "F");
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.6);
        doc.line(M, y, M, y + 8);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.text(`LOT ${idx + 1}  \u00B7  ${lot.titre.toUpperCase()}`, M + 3, y + 5.5);

        // Badge priorité
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...ORANGE);
        doc.text(lot.priorite.toUpperCase(), PAGE_W - M - 3, y + 5.5, { align: "right" });
        y += 10;

        // Description
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...MUTED);
        const descLines = doc.splitTextToSize(lot.description, W - 4);
        doc.text(descLines, M + 3, y + 1);
        y += descLines.length * 4 + 3;

        // Fonctionnalites
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...MUTED);
        doc.text("FONCTIONNALITES", M + 3, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...INK);
        doc.setFontSize(8);
        doc.text(fonctLines, M + 5, y);
        y += fonctLines.length * 4 + 3;

        // Impact client / autres (2 colonnes)
        const colW = (W - 4) / 2;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...MUTED);
        doc.setFontSize(7);
        doc.text("IMPACT CLIENT", M + 3, y);
        doc.text("IMPACT AUTRES UTILISATEURS", M + 3 + colW + 2, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...INK);
        doc.setFontSize(8);
        doc.text(impactClientLines, M + 3, y);
        doc.text(impactAutresLines, M + 3 + colW + 2, y);
        y += impactRows * 4 + 3;

        // Effort + Budget
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...MUTED);
        doc.text("EFFORT", M + 3, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...INK);
        doc.setFontSize(8);
        doc.text(`${lot.effort} \u2013 ${lot.effort_detail}`, M + 18, y);
        y += 5;

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...MUTED);
        doc.text("BUDGET", M + 3, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...INK);
        doc.setFontSize(8);
        doc.text(`${fmtEur(lot.budget_min)} \u2013 ${fmtEur(lot.budget_max)}`, M + 18, y);
        y += 8;
      });

      // -- Recommandation ----------------------------------------------------------
      y = checkPage(y, 14);
      sectionBar("Recommandation", y);
      y += 6;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const recoLines = doc.splitTextToSize(report.recommandation, W - 4);
      y = checkPage(y, recoLines.length * 4.5 + 4);
      doc.text(recoLines, M + 4, y + 1);
      y += recoLines.length * 4.5 + 6;

      // -- Footer ------------------------------------------------------------------
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        // Fond papier sur chaque page
        if (p > 1) {
          doc.setFillColor(...PAPER);
          doc.rect(0, 0, PAGE_W, PAGE_H, "F");
        }
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(M, PAGE_H - M - 2, PAGE_W - M, PAGE_H - M - 2);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text(`${(startupName || "").toUpperCase()}  \u00B7  Rapport MVP  \u00B7  ${new Date().toLocaleDateString("fr-FR")}`, M, PAGE_H - M + 1);
        doc.text(`${p} / ${totalPages}`, PAGE_W - M, PAGE_H - M + 1, { align: "right" });
      }

      // -- Upload ------------------------------------------------------------------
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const fileName = `Rapport MVP${startupName ? ` \u2014 ${startupName}` : ""} (${dateStr}).pdf`;
      const pdfBlob = doc.output("blob");

      // Telechargement direct dans le navigateur
      const dlUrl = URL.createObjectURL(pdfBlob);
      const dlLink = document.createElement("a");
      dlLink.href = dlUrl;
      dlLink.download = fileName;
      dlLink.click();
      URL.revokeObjectURL(dlUrl);

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const textContent = [
        `RAPPORT MVP${startupName ? ` \u2014 ${startupName}` : ""}`,
        `\nSYNTHESE\n${report.synthese}`,
        `\nBUDGET TOTAL : ${fmtEur(report.budget_total_min)} \u2014 ${fmtEur(report.budget_total_max)}`,
        `\nEFFORT TOTAL : ${report.effort_total}`,
        ...report.lots.map((lot, i) =>
          `\nLOT ${i + 1} \u2014 ${lot.titre} [${lot.priorite}]\n${lot.description}\nFonctionnalites : ${lot.fonctionnalites.join(", ")}\nImpact client : ${lot.impact_client}\nImpact autres : ${lot.impact_autres}\nEffort : ${lot.effort} \u2014 ${lot.effort_detail}\nBudget : ${fmtEur(lot.budget_min)} \u2014 ${fmtEur(lot.budget_max)}`
        ),
        `\nRECOMMANDATION\n${report.recommandation}`,
      ].join("\n");

      const formData = new FormData();
      formData.append("startupId", startupId!);
      formData.append("file", file);
      formData.append("text", textContent);
      // Ne pas envoyer le dataUrl : evite un timeout Postgres sur les gros PDFs

      const uploadRes = await fetch("/api/startup/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const ct = uploadRes.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? ((await uploadRes.json()).error ?? "Erreur lors de la sauvegarde.")
          : `Erreur serveur temporaire (${uploadRes.status}). Le PDF a ete genere \u2014 reessayez dans un instant.`;
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
    <main
      className="min-h-screen px-6 py-10"
      style={{ background: "var(--uf-paper)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* En-tete */}
        <div className="mb-8">
          <a
            href="/dashboard?tab=documents"
            className="text-sm hover:underline flex items-center gap-1 mb-4"
            style={{ color: "var(--uf-orange)" }}
          >
            {"\u2190"} Retour aux documents
          </a>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-2xl font-black"
                style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)" }}
              >
                MVP
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--uf-muted)" }}>
                Cadrez et scopez votre produit minimum viable.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleFillWithAgents}
                disabled={filling || !startupId}
                className="flex items-center gap-2 font-bold text-sm px-4 py-2.5 hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "var(--uf-card)",
                  border: "2px solid var(--uf-line)",
                  color: "var(--uf-orange)",
                  borderRadius: "var(--uf-r-lg)",
                }}
              >
                {filling ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {"Génération en cours\u2026"}
                  </>
                ) : (
                  <>Demander à mes agents de remplir</>
                )}
              </button>
              <button
                onClick={() => {
                  const empty = Object.fromEntries(SECTIONS.map((s) => [s.key, ""]));
                  setValues(empty);
                  setReport(null);
                  if (startupId) localStorage.removeItem(`founderai_mvp_${startupId}`);
                  setSaveSuccess(false);
                  setError("");
                }}
                className="flex items-center gap-2 font-bold text-sm px-4 py-2.5 hover:opacity-80 transition-all"
                style={{
                  background: "var(--uf-card)",
                  border: "2px solid var(--uf-line)",
                  color: "var(--uf-muted)",
                  borderRadius: "var(--uf-r-lg)",
                }}
              >
                Vider
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 text-sm px-4 py-3"
            style={{
              color: "#E8358E",
              background: "#E8358E14",
              border: "1px solid #E8358E40",
              borderRadius: "var(--uf-r-lg)",
            }}
          >
            {error}
          </div>
        )}

        {saveSuccess && (
          <div
            className="mb-6 text-sm px-4 py-3 flex items-center gap-2"
            style={{
              color: "#0DB4A0",
              background: "#0DB4A014",
              border: "1px solid #0DB4A040",
              borderRadius: "var(--uf-r-lg)",
            }}
          >
            <span>{"\u2705"}</span>
            <span>Rapport PDF sauvegarde dans vos documents !</span>
          </div>
        )}

        {/* Formulaire */}
        <div className="flex flex-col gap-5">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="p-5 flex flex-col gap-2"
              style={{
                border: `1.5px solid ${section.color}`,
                background: section.bgColor,
                borderRadius: "var(--uf-r-xl)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <p
                  className="text-sm font-black"
                  style={{ color: "var(--uf-ink)" }}
                >
                  {section.label}
                </p>
              </div>
              <textarea
                value={values[section.key]}
                onChange={(e) => {
                  const next = { ...values, [section.key]: e.target.value };
                  setValues(next);
                  if (startupId) localStorage.setItem(`founderai_mvp_${startupId}`, JSON.stringify(next));
                }}
                placeholder={section.placeholder}
                rows={4}
                className="w-full mt-1 text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2"
                style={{
                  color: "var(--uf-ink)",
                  background: "var(--uf-card)",
                  border: "1px solid var(--uf-line)",
                  borderRadius: "var(--uf-r-lg)",
                  fontFamily: "var(--uf-mono)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Bouton generer le rapport */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport || !hasContent}
            className="flex items-center gap-2 text-white font-bold px-6 py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm hover:opacity-90"
            style={{
              background: "var(--uf-orange)",
              borderRadius: "var(--uf-r-lg)",
              boxShadow: "0 4px 14px #FF6A1F40",
            }}
          >
            {generatingReport ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {"Génération du rapport en cours\u2026"}
              </>
            ) : (
              <>Générer le rapport MVP</>
            )}
          </button>
        </div>

        {/* Rapport genere */}
        {report && (
          <div id="mvp-report" className="mt-10 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2
                className="text-xl font-black"
                style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)" }}
              >
                Rapport MVP
              </h2>
              <button
                onClick={handleExportReportPdf}
                disabled={generating || !startupId}
                className="flex items-center gap-2 text-white font-bold text-sm px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  background: "var(--uf-orange)",
                  borderRadius: "var(--uf-r-lg)",
                  boxShadow: "0 4px 14px #FF6A1F40",
                }}
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {"Export en cours\u2026"}
                  </>
                ) : (
                  <>Exporter en PDF</>
                )}
              </button>
            </div>

            {/* Synthese */}
            <div
              className="p-6"
              style={{
                background: "var(--uf-card)",
                borderRadius: "var(--uf-r-xl)",
                border: "1px solid var(--uf-line)",
              }}
            >
              <p
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: "var(--uf-orange)", fontFamily: "var(--uf-mono)" }}
              >
                Synthese executive
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--uf-ink)" }}>
                {report.synthese}
              </p>
            </div>

            {/* Budget + Effort */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-5"
                style={{
                  background: "var(--uf-card)",
                  borderRadius: "var(--uf-r-xl)",
                  border: "1.5px solid #0DB4A0",
                }}
              >
                <p
                  className="text-xs font-black uppercase tracking-wider mb-1"
                  style={{ color: "#0DB4A0", fontFamily: "var(--uf-mono)" }}
                >
                  Budget estime
                </p>
                <p className="text-xl font-black" style={{ color: "var(--uf-ink)" }}>
                  {fmtEur(report.budget_total_min)}
                </p>
                <p className="text-sm" style={{ color: "var(--uf-muted)" }}>
                  {"\u2014"} {fmtEur(report.budget_total_max)}
                </p>
              </div>
              <div
                className="p-5"
                style={{
                  background: "var(--uf-card)",
                  borderRadius: "var(--uf-r-xl)",
                  border: "1.5px solid #6E4BE8",
                }}
              >
                <p
                  className="text-xs font-black uppercase tracking-wider mb-1"
                  style={{ color: "#6E4BE8", fontFamily: "var(--uf-mono)" }}
                >
                  Effort total
                </p>
                <p className="text-sm font-bold leading-snug" style={{ color: "var(--uf-ink)" }}>
                  {report.effort_total}
                </p>
              </div>
            </div>

            {/* Lots fonctionnels */}
            <div className="space-y-4">
              <h3 className="font-black" style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)" }}>
                Lots fonctionnels
              </h3>
              {report.lots.map((lot, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden"
                  style={{
                    background: "var(--uf-card)",
                    borderRadius: "var(--uf-r-xl)",
                    border: "1px solid var(--uf-line)",
                  }}
                >
                  <div
                    className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
                    style={{ background: "#FF6A1F10" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-black"
                        style={{ color: "var(--uf-orange)", fontFamily: "var(--uf-mono)" }}
                      >
                        LOT {idx + 1}
                      </span>
                      <h4 className="font-black text-sm" style={{ color: "var(--uf-ink)" }}>
                        {lot.titre}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={PRIORITE_STYLES[lot.priorite] ?? FALLBACK_BADGE}
                      >
                        {lot.priorite}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={EFFORT_STYLES[lot.effort] ?? FALLBACK_BADGE}
                      >
                        {lot.effort}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          color: "var(--uf-muted)",
                          background: "var(--uf-paper)",
                          border: "1px solid var(--uf-line)",
                          fontFamily: "var(--uf-mono)",
                        }}
                      >
                        {fmtEur(lot.budget_min)} {"\u2013"} {fmtEur(lot.budget_max)}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    <p className="text-sm italic" style={{ color: "var(--uf-muted)" }}>
                      {lot.description}
                    </p>

                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-wider mb-2"
                        style={{ color: "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}
                      >
                        Fonctionnalites
                      </p>
                      <ul className="space-y-1">
                        {lot.fonctionnalites.map((f, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                            style={{ color: "var(--uf-ink)" }}
                          >
                            <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--uf-orange)" }}>{"\u2022"}</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-3"
                        style={{
                          background: "#FF6A1F10",
                          borderRadius: "var(--uf-r-lg)",
                        }}
                      >
                        <p
                          className="text-xs font-black mb-1"
                          style={{ color: "var(--uf-orange)" }}
                        >
                          Impact client ideal
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--uf-ink)" }}>
                          {lot.impact_client}
                        </p>
                      </div>
                      <div
                        className="p-3"
                        style={{
                          background: "#6E4BE810",
                          borderRadius: "var(--uf-r-lg)",
                        }}
                      >
                        <p
                          className="text-xs font-black mb-1"
                          style={{ color: "#6E4BE8" }}
                        >
                          Impact autres utilisateurs
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--uf-ink)" }}>
                          {lot.impact_autres}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs" style={{ color: "var(--uf-muted)" }}>
                      <span className="font-bold">Effort :</span> {lot.effort_detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommandation */}
            <div
              className="p-6"
              style={{
                background: "var(--uf-card)",
                borderRadius: "var(--uf-r-xl)",
                border: "1.5px solid var(--uf-orange)",
              }}
            >
              <p
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: "var(--uf-orange)", fontFamily: "var(--uf-mono)" }}
              >
                Recommandation
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--uf-ink)" }}>
                {report.recommandation}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: "var(--uf-muted)" }}>
          Remplissez les sections puis cliquez sur &quot;Generer le rapport&quot; pour obtenir les lots fonctionnels avec impacts et estimations.
        </p>
      </div>
    </main>
  );
}
