"use client";

import { useState, useEffect } from "react";
import type { MvpReport, MvpLot } from "@/app/api/ai/mvp-report/route";

type MvpSection = {
  key: string;
  label: string;
  placeholder: string;
  emoji: string;
  color: string;
};

const SECTIONS: MvpSection[] = [
  {
    key: "cible",
    label: "À qui s'adresse le MVP ?",
    placeholder: "Décrivez votre client idéal et s'il y a d'autres utilisateurs concernés par le MVP…",
    emoji: "🎯",
    color: "border-violet-200 bg-violet-50",
  },
  {
    key: "probleme",
    label: "Problème que doit résoudre le MVP pour le client idéal",
    placeholder: "Décrivez le problème…",
    emoji: "⚡",
    color: "border-red-200 bg-red-50",
  },
  {
    key: "fonctions_client",
    label: "Les fonctions que veut voir absolument le client",
    placeholder: "Décrivez ce que le client idéal recherche en priorité…",
    emoji: "✅",
    color: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "fonctions_autres",
    label: "Les fonctions que veulent voir absolument les autres utilisateurs",
    placeholder: "Décrivez ce que recherchent les autres utilisateurs…",
    emoji: "👥",
    color: "border-blue-200 bg-blue-50",
  },
  {
    key: "no_go_client",
    label: "Ce que le client ne veut absolument pas",
    placeholder: "Décrivez ce qui fera fuir le client idéal…",
    emoji: "🚫",
    color: "border-orange-200 bg-orange-50",
  },
  {
    key: "no_go_autres",
    label: "Ce que les autres utilisateurs ne veulent absolument pas",
    placeholder: "Décrivez ce qui fera fuir les autres utilisateurs…",
    emoji: "⛔",
    color: "border-pink-200 bg-pink-50",
  },
];

const EFFORT_COLORS: Record<string, string> = {
  "Faible":  "bg-emerald-100 text-emerald-700",
  "Moyen":   "bg-orange-100 text-orange-700",
  "Élevé":   "bg-red-100 text-red-700",
};

const PRIORITE_COLORS: Record<string, string> = {
  "Indispensable": "bg-violet-100 text-violet-700",
  "Important":     "bg-blue-100 text-blue-700",
  "Souhaitable":   "bg-gray-100 text-gray-600",
};

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
      if (!res.ok) { setError(json.error ?? "Erreur lors de la génération."); return; }
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
      if (!res.ok) { setError(json.error ?? "Erreur lors de la génération du rapport."); return; }
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

      function headerBand(y: number) {
        doc.setFillColor(109, 40, 217);
        doc.rect(M, y, W, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("RAPPORT DE PRÉSENTATION MVP", PAGE_W / 2, y + 8, { align: "center" });
        if (startupLogo) {
          const fmt = startupLogo.startsWith("data:image/png") ? "PNG" : "JPEG";
          doc.addImage(startupLogo, fmt, M + 1, y + 1, 24, 10);
        } else if (startupName) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(startupName, M + 3, y + 8);
        }
        const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
        doc.setFontSize(8);
        doc.text(dateStr, PAGE_W - M - 3, y + 8, { align: "right" });
      }

      headerBand(M);
      let y = M + 18;

      // ── Synthèse ──────────────────────────────────────────────────────────
      doc.setFillColor(237, 233, 254);
      doc.rect(M, y, W, 7, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 40, 160);
      doc.text("SYNTHÈSE EXÉCUTIVE", M + 3, y + 5);
      y += 9;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 60);
      const syntheseLines = doc.splitTextToSize(report.synthese, W - 4);
      y = checkPage(y, syntheseLines.length * 4.5 + 4);
      doc.text(syntheseLines, M + 4, y + 1);
      y += syntheseLines.length * 4.5 + 6;

      // ── Résumé budget + effort ─────────────────────────────────────────────
      y = checkPage(y, 18);
      doc.setFillColor(245, 243, 255);
      doc.rect(M, y, W, 14, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 40, 160);
      doc.text("BUDGET ESTIMÉ", M + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 60);
      doc.text(`${fmtEur(report.budget_total_min)} — ${fmtEur(report.budget_total_max)}`, M + 4, y + 11);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 40, 160);
      doc.text("EFFORT TOTAL", M + W / 2 + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 60);
      const effortLines = doc.splitTextToSize(report.effort_total, W / 2 - 8);
      doc.text(effortLines.slice(0, 2), M + W / 2 + 4, y + 11);
      y += 20;

      // ── Lots fonctionnels ──────────────────────────────────────────────────
      y = checkPage(y, 10);
      doc.setFillColor(237, 233, 254);
      doc.rect(M, y, W, 7, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 40, 160);
      doc.text(`LOTS FONCTIONNELS (${report.lots.length})`, M + 3, y + 5);
      y += 9;

      report.lots.forEach((lot: MvpLot, idx: number) => {
        const fonctLines = doc.splitTextToSize(lot.fonctionnalites.map((f) => `• ${f}`).join("\n"), W - 8);
        const impactClientLines = doc.splitTextToSize(lot.impact_client, (W - 8) / 2);
        const impactAutresLines = doc.splitTextToSize(lot.impact_autres, (W - 8) / 2);
        const impactRows = Math.max(impactClientLines.length, impactAutresLines.length);
        const effortLines2 = doc.splitTextToSize(lot.effort_detail, W - 8);
        const blockH = 8 + fonctLines.length * 4 + impactRows * 4 + effortLines2.length * 4 + 32;

        y = checkPage(y, blockH);

        // Bandeau titre lot
        const bgR = idx % 2 === 0 ? 248 : 243;
        doc.setFillColor(bgR, bgR, 255);
        doc.rect(M, y, W, 8, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 30, 140);
        doc.text(`Lot ${idx + 1} — ${lot.titre}`, M + 3, y + 5.5);

        // Badges
        const badgeX = PAGE_W - M - 3;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 40, 160);
        doc.text(lot.priorite, badgeX, y + 5.5, { align: "right" });
        y += 10;

        // Description
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 100);
        const descLines = doc.splitTextToSize(lot.description, W - 4);
        doc.text(descLines, M + 3, y + 1);
        y += descLines.length * 4 + 3;

        // Fonctionnalités
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 80);
        doc.text("Fonctionnalités :", M + 3, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 60);
        doc.text(fonctLines, M + 5, y);
        y += fonctLines.length * 4 + 3;

        // Impact client / autres (2 colonnes)
        const colW = (W - 4) / 2;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 80);
        doc.setFontSize(7.5);
        doc.text("Impact client idéal :", M + 3, y);
        doc.text("Impact autres utilisateurs :", M + 3 + colW + 2, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 60);
        doc.text(impactClientLines, M + 3, y);
        doc.text(impactAutresLines, M + 3 + colW + 2, y);
        y += impactRows * 4 + 3;

        // Effort + Budget
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(60, 60, 80);
        doc.text(`Effort : `, M + 3, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 60);
        doc.text(`${lot.effort} — ${lot.effort_detail}`, M + 16, y);
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 80);
        doc.text(`Budget : `, M + 3, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 60);
        doc.text(`${fmtEur(lot.budget_min)} — ${fmtEur(lot.budget_max)}`, M + 17, y);
        y += 8;
      });

      // ── Recommandation ────────────────────────────────────────────────────
      y = checkPage(y, 14);
      doc.setFillColor(237, 233, 254);
      doc.rect(M, y, W, 7, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 40, 160);
      doc.text("RECOMMANDATION", M + 3, y + 5);
      y += 9;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 60);
      const recoLines = doc.splitTextToSize(report.recommandation, W - 4);
      y = checkPage(y, recoLines.length * 4.5 + 4);
      doc.text(recoLines, M + 4, y + 1);
      y += recoLines.length * 4.5 + 6;

      // ── Footer ─────────────────────────────────────────────────────────────
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 180);
        doc.setFont("helvetica", "italic");
        doc.text("Généré par FounderAI", PAGE_W / 2, PAGE_H - M / 2, { align: "center" });
        doc.text(`${p} / ${totalPages}`, PAGE_W - M - 3, PAGE_H - M / 2, { align: "right" });
      }

      // ── Upload ──────────────────────────────────────────────────────────────
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const fileName = `Rapport MVP${startupName ? ` — ${startupName}` : ""} (${dateStr}).pdf`;
      const pdfBlob = doc.output("blob");

      // Téléchargement direct dans le navigateur
      const dlUrl = URL.createObjectURL(pdfBlob);
      const dlLink = document.createElement("a");
      dlLink.href = dlUrl;
      dlLink.download = fileName;
      dlLink.click();
      URL.revokeObjectURL(dlUrl);

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const textContent = [
        `RAPPORT MVP${startupName ? ` — ${startupName}` : ""}`,
        `\nSYNTHÈSE\n${report.synthese}`,
        `\nBUDGET TOTAL : ${fmtEur(report.budget_total_min)} — ${fmtEur(report.budget_total_max)}`,
        `\nEFFORT TOTAL : ${report.effort_total}`,
        ...report.lots.map((lot, i) =>
          `\nLOT ${i + 1} — ${lot.titre} [${lot.priorite}]\n${lot.description}\nFonctionnalités : ${lot.fonctionnalites.join(", ")}\nImpact client : ${lot.impact_client}\nImpact autres : ${lot.impact_autres}\nEffort : ${lot.effort} — ${lot.effort_detail}\nBudget : ${fmtEur(lot.budget_min)} — ${fmtEur(lot.budget_max)}`
        ),
        `\nRECOMMANDATION\n${report.recommandation}`,
      ].join("\n");

      const formData = new FormData();
      formData.append("startupId", startupId!);
      formData.append("file", file);
      formData.append("text", textContent);
      // Ne pas envoyer le dataUrl : évite un timeout Postgres sur les gros PDFs

      const uploadRes = await fetch("/api/startup/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const ct = uploadRes.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? ((await uploadRes.json()).error ?? "Erreur lors de la sauvegarde.")
          : `Erreur serveur temporaire (${uploadRes.status}). Le PDF a été généré — réessayez dans un instant.`;
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
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <a href="/dashboard?tab=documents" className="text-sm text-violet-600 hover:underline flex items-center gap-1 mb-4">
            ← Retour aux documents
          </a>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-gray-900">⚡ MVP</h1>
              <p className="text-gray-500 text-sm mt-1">Cadrez et scopez votre produit minimum viable.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleFillWithAgents}
                disabled={filling || !startupId}
                className="flex items-center gap-2 bg-white border-2 border-violet-200 text-violet-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {filling ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Génération en cours…
                  </>
                ) : (
                  <>🏛️ Demander à mes agents de remplir</>
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
                className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-500 font-bold text-sm px-4 py-2.5 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                🗑️ Vider
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span>✅</span>
            <span>Rapport PDF sauvegardé dans vos documents !</span>
          </div>
        )}

        {/* Formulaire */}
        <div className="flex flex-col gap-5">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className={`rounded-2xl border-2 p-5 ${section.color} flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <p className="text-sm font-black text-gray-900">{section.label}</p>
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
                className="w-full mt-1 text-sm text-gray-800 bg-white/70 border border-white/80 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder-gray-400"
              />
            </div>
          ))}
        </div>

        {/* Bouton générer le rapport */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport || !hasContent}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200 text-sm"
          >
            {generatingReport ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération du rapport en cours…
              </>
            ) : (
              <>📊 Générer le rapport de présentation MVP</>
            )}
          </button>
        </div>

        {/* Rapport généré */}
        {report && (
          <div id="mvp-report" className="mt-10 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-black text-gray-900">📊 Rapport de présentation MVP</h2>
              <button
                onClick={handleExportReportPdf}
                disabled={generating || !startupId}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Export en cours…
                  </>
                ) : (
                  <>📄 Exporter en PDF</>
                )}
              </button>
            </div>

            {/* Synthèse */}
            <div className="bg-white rounded-2xl border-2 border-violet-100 p-6">
              <p className="text-xs font-black text-violet-600 uppercase tracking-wider mb-2">Synthèse exécutive</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.synthese}</p>
            </div>

            {/* Budget + Effort */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border-2 border-emerald-100 p-5">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">Budget estimé</p>
                <p className="text-xl font-black text-gray-900">{fmtEur(report.budget_total_min)}</p>
                <p className="text-sm text-gray-500">— {fmtEur(report.budget_total_max)}</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-blue-100 p-5">
                <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">Effort total</p>
                <p className="text-sm font-bold text-gray-900 leading-snug">{report.effort_total}</p>
              </div>
            </div>

            {/* Lots fonctionnels */}
            <div className="space-y-4">
              <h3 className="font-black text-gray-900">Lots fonctionnels</h3>
              {report.lots.map((lot, idx) => (
                <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
                  <div className="bg-violet-50 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-violet-400">LOT {idx + 1}</span>
                      <h4 className="font-black text-gray-900 text-sm">{lot.titre}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITE_COLORS[lot.priorite] ?? "bg-gray-100 text-gray-600"}`}>
                        {lot.priorite}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${EFFORT_COLORS[lot.effort] ?? "bg-gray-100 text-gray-600"}`}>
                        {lot.effort}
                      </span>
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                        {fmtEur(lot.budget_min)} – {fmtEur(lot.budget_max)}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    <p className="text-sm text-gray-600 italic">{lot.description}</p>

                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Fonctionnalités</p>
                      <ul className="space-y-1">
                        {lot.fonctionnalites.map((f, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-violet-50 rounded-xl p-3">
                        <p className="text-xs font-black text-violet-600 mb-1">Impact client idéal</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{lot.impact_client}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-black text-blue-600 mb-1">Impact autres utilisateurs</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{lot.impact_autres}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      <span className="font-bold">Effort :</span> {lot.effort_detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommandation */}
            <div className="bg-white rounded-2xl border-2 border-orange-100 p-6">
              <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-2">Recommandation</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.recommandation}</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Remplissez les sections puis cliquez sur &quot;Générer le rapport&quot; pour obtenir les lots fonctionnels avec impacts et estimations.
        </p>
      </div>
    </main>
  );
}
