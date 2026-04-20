"use client";

import { useState, useEffect } from "react";

type LeanCanvasSection = {
  key: string;
  label: string;
  description: string;
  emoji: string;
  color: string;
};

const SECTIONS: LeanCanvasSection[] = [
  {
    key: "probleme",
    label: "Problème",
    description: "Les 3 principaux problèmes de vos clients",
    emoji: "⚡",
    color: "border-red-200 bg-red-50",
  },
  {
    key: "solution",
    label: "Solution",
    description: "Les 3 fonctionnalités ou approches clés",
    emoji: "💡",
    color: "border-yellow-200 bg-yellow-50",
  },
  {
    key: "proposition_valeur",
    label: "Proposition de valeur unique",
    description: "Message clair et distinctif qui explique pourquoi vous êtes différent",
    emoji: "🎯",
    color: "border-violet-200 bg-violet-50",
  },
  {
    key: "avantage_concurrentiel",
    label: "Avantage déloyal",
    description: "Ce que vous avez que les autres ne peuvent pas facilement copier",
    emoji: "🏆",
    color: "border-orange-200 bg-orange-50",
  },
  {
    key: "segments_clients",
    label: "Segments de clients",
    description: "Clients cibles, early adopters",
    emoji: "👥",
    color: "border-blue-200 bg-blue-50",
  },
  {
    key: "metriques_cles",
    label: "Métriques clés",
    description: "Indicateurs qui mesurent la santé de votre business",
    emoji: "📊",
    color: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "canaux",
    label: "Canaux",
    description: "Chemins pour atteindre vos clients",
    emoji: "📣",
    color: "border-pink-200 bg-pink-50",
  },
  {
    key: "structure_couts",
    label: "Structure de coûts",
    description: "Coûts fixes et variables principaux",
    emoji: "💸",
    color: "border-gray-200 bg-gray-50",
  },
  {
    key: "sources_revenus",
    label: "Sources de revenus",
    description: "Comment vous générez de l'argent",
    emoji: "💰",
    color: "border-teal-200 bg-teal-50",
  },
];

export default function LeanCanvasPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>("");
  const [startupLogo, setStartupLogo] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.key, ""]))
  );
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("founderai_startup_id");
    setStartupId(sid);
    if (sid) {
      // Charger le nom de la startup
      fetch(`/api/startup?startupId=${sid}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.name) setStartupName(data.name);
          if (data?.logo) setStartupLogo(data.logo);
        })
        .catch(() => {});

      // Restaurer les données saisies précédemment
      const saved = localStorage.getItem(`founderai_lean_canvas_${sid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setValues((prev) => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }
    }
  }, []);

  async function handleFillWithCodir() {
    if (!startupId) return;
    setFilling(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fill-lean-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de la génération.");
        return;
      }
      setValues((prev) => {
        const next = { ...prev, ...json.sections };
        if (startupId) localStorage.setItem(`founderai_lean_canvas_${startupId}`, JSON.stringify(next));
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
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const PW = 297;
      const PH = 210;
      const M = 12;
      const CW = PW - 2 * M;

      // Charte FounderAI
      const RED: [number, number, number] = [124, 58, 237];   // violet-600
      const DARK: [number, number, number] = [17, 24, 39];    // gray-900
      const CONTENT_COLOR: [number, number, number] = [55, 65, 81]; // gray-700

      // ── Logo / nom startup ────────────────────────────────────────────────────
      if (startupLogo) {
        const fmt = startupLogo.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(startupLogo, fmt, M, M, 30, 10);
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DARK);
        doc.text(startupName || "Company Logo", M, M + 6);
      }

      const lineY = M + 10;
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.5);
      doc.line(M, lineY, PW - M, lineY);

      // ── Dimensions de la grille ───────────────────────────────────────────────
      const gridTop = lineY + 2;
      const footerH = 36;
      const gridH = PH - M - gridTop - footerH;
      const footerTop = gridTop + gridH;
      const colW = CW / 5;
      const cx = (i: number) => M + i * colW;

      // Séparation interne col 2 (Solution / Métriques) et col 4 (Avantages / Canaux)
      const splitY = gridTop + gridH * 0.57;
      const topH = splitY - gridTop;
      const botH = gridH - topH;

      // ── Bordures ──────────────────────────────────────────────────────────────
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.4);

      // Contour global
      doc.rect(M, gridTop, CW, gridH + footerH);

      // Séparateurs verticaux (grille principale uniquement, s'arrêtent au footer)
      for (let i = 1; i <= 4; i++) {
        doc.line(cx(i), gridTop, cx(i), footerTop);
      }

      // Ligne séparant grille principale et footer
      doc.line(M, footerTop, PW - M, footerTop);

      // Séparateurs internes col 2 et col 4
      doc.line(cx(1), splitY, cx(2), splitY);
      doc.line(cx(3), splitY, cx(4), splitY);

      // Séparateur vertical du footer (milieu uniquement)
      doc.line(M + CW / 2, footerTop, M + CW / 2, PH - M);

      // ── Helper dessin d'une cellule ───────────────────────────────────────────
      const LABEL_FS = 7.5;
      const SUBLABEL_FS = 5.5;
      const CONTENT_FS = 6.5;
      const PAD = 2.5;

      function drawCell(
        x: number, y: number, w: number, h: number,
        label: string, content: string
      ) {
        // Titre violet bold
        doc.setFontSize(LABEL_FS);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...RED);
        doc.text(label, x + PAD, y + PAD + 3);

        // Contenu
        if (content?.trim()) {
          doc.setFontSize(CONTENT_FS);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...CONTENT_COLOR);
          const maxLines = Math.floor((h - 10) / (CONTENT_FS * 0.42));
          const lines = doc.splitTextToSize(content, w - PAD * 2);
          doc.text(lines.slice(0, maxLines), x + PAD, y + PAD + 9);
        }
      }

      function drawSubLabel(x: number, label: string) {
        doc.setFontSize(SUBLABEL_FS);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...RED);
        doc.text(label, x + PAD, splitY + PAD + 3);
      }

      // ── Cellules ──────────────────────────────────────────────────────────────
      // Col 0 — Problème (pleine hauteur) + "Solutions existantes" à hauteur splitY
      drawCell(cx(0), gridTop, colW, gridH, "Problème", values.probleme);
      drawSubLabel(cx(0), "Solutions existantes");

      // Col 1 — Solution (haut) / Métriques clés (bas)
      drawCell(cx(1), gridTop, colW, topH, "Solution",       values.solution);
      drawCell(cx(1), splitY,  colW, botH, "Métriques clés", values.metriques_cles);

      // Col 2 — Proposition de valeur (pleine hauteur) + "Concept haut niveau" à hauteur splitY
      drawCell(cx(2), gridTop, colW, gridH, "Proposition de valeur", values.proposition_valeur);
      drawSubLabel(cx(2), "Concept haut niveau");

      // Col 3 — Avantages compétitifs (haut) / Canaux (bas)
      drawCell(cx(3), gridTop, colW, topH, "Avantages compétitifs", values.avantage_concurrentiel);
      drawCell(cx(3), splitY,  colW, botH, "Canaux",                values.canaux);

      // Col 4 — Segments clients (pleine hauteur) + "Premiers clients" à hauteur splitY
      drawCell(cx(4), gridTop, colW, gridH, "Segments clients", values.segments_clients);
      drawSubLabel(cx(4), "Premiers clients");

      // Footer gauche — Structure de coût
      drawCell(M,           footerTop, CW / 2, footerH, "Structure de coût",  values.structure_couts);

      // Footer droite — Lignes de revenus
      drawCell(M + CW / 2, footerTop, CW / 2, footerH, "Lignes de revenus",  values.sources_revenus);

      // ── Export & upload ───────────────────────────────────────────────────────
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const fileName = `Lean Canvas${startupName ? ` — ${startupName}` : ""} (${dateStr}).pdf`;
      const pdfBlob = doc.output("blob");

      // Téléchargement direct dans le navigateur
      const dlUrl = URL.createObjectURL(pdfBlob);
      const dlLink = document.createElement("a");
      dlLink.href = dlUrl;
      dlLink.download = fileName;
      dlLink.click();
      URL.revokeObjectURL(dlUrl);

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const textContent = SECTIONS.map((s) =>
        `${s.label}\n${values[s.key] || "—"}`
      ).join("\n\n");

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
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <a href="/dashboard?tab=documents" className="text-sm text-violet-600 hover:underline flex items-center gap-1 mb-4">
            ← Retour aux documents
          </a>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-gray-900">🎨 Lean Canvas</h1>
              <p className="text-gray-500 text-sm mt-1">Modélisez votre business model en une page.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleFillWithCodir}
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
                  if (startupId) localStorage.removeItem(`founderai_lean_canvas_${startupId}`);
                  setSaveSuccess(false);
                  setError("");
                }}
                className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-500 font-bold text-sm px-4 py-2.5 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                🗑️ Vider
              </button>
              <button
                onClick={handleGeneratePdf}
                disabled={generating || !startupId || !hasContent}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Génération du PDF…
                  </>
                ) : (
                  <>📄 Générer le document</>
                )}
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
            <span>PDF généré et ajouté à vos documents avec succès !</span>
          </div>
        )}

        {/* Grille des sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className={`rounded-2xl border-2 p-4 ${section.color} flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <div>
                  <p className="text-sm font-black text-gray-900">{section.label}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <textarea
                value={values[section.key]}
                onChange={(e) => {
                  const next = { ...values, [section.key]: e.target.value };
                  setValues(next);
                  if (startupId) localStorage.setItem(`founderai_lean_canvas_${startupId}`, JSON.stringify(next));
                }}
                placeholder={`Décrivez votre ${section.label.toLowerCase()}…`}
                rows={5}
                className="w-full mt-1 text-sm text-gray-800 bg-white/70 border border-white/80 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder-gray-400"
              />
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Remplissez les sections manuellement ou utilisez le bouton &quot;Demander à mes agents de remplir&quot; pour générer automatiquement le contenu.
        </p>
      </div>
    </main>
  );
}
