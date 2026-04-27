"use client";

import { useState, useEffect } from "react";

type LeanCanvasSection = {
  key: string;
  label: string;
  description: string;
  emoji: string;
  tokenColor: string; // CSS custom property name
};

const SECTIONS: LeanCanvasSection[] = [
  {
    key: "probleme",
    label: "Problème",
    description: "Les 3 principaux problèmes de vos clients",
    emoji: "⚡",
    tokenColor: "var(--uf-magenta)",
  },
  {
    key: "solution",
    label: "Solution",
    description: "Les 3 fonctionnalités ou approches clés",
    emoji: "💡",
    tokenColor: "var(--uf-yellow)",
  },
  {
    key: "proposition_valeur",
    label: "Proposition de valeur unique",
    description: "Message clair et distinctif qui explique pourquoi vous êtes différent",
    emoji: "🎯",
    tokenColor: "var(--uf-orange)",
  },
  {
    key: "avantage_concurrentiel",
    label: "Avantage déloyal",
    description: "Ce que vous avez que les autres ne peuvent pas facilement copier",
    emoji: "🏆",
    tokenColor: "var(--uf-violet)",
  },
  {
    key: "segments_clients",
    label: "Segments de clients",
    description: "Clients cibles, early adopters",
    emoji: "👥",
    tokenColor: "var(--uf-teal)",
  },
  {
    key: "metriques_cles",
    label: "Métriques clés",
    description: "Indicateurs qui mesurent la santé de votre business",
    emoji: "📊",
    tokenColor: "var(--uf-lime)",
  },
  {
    key: "canaux",
    label: "Canaux",
    description: "Chemins pour atteindre vos clients",
    emoji: "📣",
    tokenColor: "var(--uf-magenta)",
  },
  {
    key: "structure_couts",
    label: "Structure de coûts",
    description: "Coûts fixes et variables principaux",
    emoji: "💸",
    tokenColor: "var(--uf-muted)",
  },
  {
    key: "sources_revenus",
    label: "Sources de revenus",
    description: "Comment vous générez de l'argent",
    emoji: "💰",
    tokenColor: "var(--uf-teal)",
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
      const filledByUser = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim()));
      const res = await fetch("/api/ai/fill-lean-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, userContext: filledByUser }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de la génération.");
        return;
      }
      setValues((prev) => {
        // Ne pas ecraser les champs remplis par l'utilisateur
        const merged = { ...json.sections };
        for (const [k, v] of Object.entries(prev)) {
          if (v.trim()) merged[k] = v;
        }
        if (startupId) localStorage.setItem(`founderai_lean_canvas_${startupId}`, JSON.stringify(merged));
        return merged;
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

      // Charte FounderAI — design tokens mapped to RGB
      const ORANGE: [number, number, number] = [255, 106, 31];
      const INK: [number, number, number] = [15, 14, 11];
      const MUTED: [number, number, number] = [108, 103, 96];
      const LINE: [number, number, number] = [224, 217, 199];
      const PAPER: [number, number, number] = [251, 248, 240];
      const CARD: [number, number, number] = [255, 255, 255];

      // ── Fond papier ─────────────────────────────────────────────────────────
      doc.setFillColor(...PAPER);
      doc.rect(0, 0, PW, PH, "F");

      // ── Header ──────────────────────────────────────────────────────────────
      // Pastille logo
      doc.setFillColor(...ORANGE);
      doc.circle(M + 3.5, M + 3.5, 3.5, "F");
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("f", M + 2.3, M + 5);

      // Nom startup ou logo
      if (startupLogo) {
        const fmt = startupLogo.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(startupLogo, fmt, M + 10, M - 1, 24, 9);
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.text((startupName || "Startup").toUpperCase(), M + 10, M + 5);
      }

      // Label
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("LEAN CANVAS", M + 10 + (startupLogo ? 26 : doc.getTextWidth((startupName || "Startup").toUpperCase()) + 4), M + 5);

      // Date
      const dateHeader = new Date().toLocaleDateString("fr-FR");
      doc.setFontSize(7);
      doc.text(dateHeader, PW - M, M + 5, { align: "right" });

      // Ligne de séparation
      const lineY = M + 9;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.line(M, lineY, PW - M, lineY);

      // ── Titre ───────────────────────────────────────────────────────────────
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text("LEAN CANVAS", M, lineY + 8);

      if (startupName) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...MUTED);
        doc.text(startupName, M + doc.getTextWidth("LEAN CANVAS  ") + 2, lineY + 8);
      }

      // ── Dimensions de la grille ───────────────────────────────────────────────
      const gridTop = lineY + 13;
      const footerH = 36;
      const gridH = PH - M - gridTop - footerH;
      const footerTop = gridTop + gridH;
      const colW = CW / 5;
      const cx = (i: number) => M + i * colW;

      // Séparation interne col 2 (Solution / Métriques) et col 4 (Avantages / Canaux)
      const splitY = gridTop + gridH * 0.57;
      const topH = splitY - gridTop;
      const botH = gridH - topH;

      // ── Fond carte blanche ────────────────────────────────────────────────────
      doc.setFillColor(...CARD);
      doc.roundedRect(M, gridTop, CW, gridH + footerH, 2, 2, "F");

      // ── Bordures ──────────────────────────────────────────────────────────────
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);

      // Contour global
      doc.roundedRect(M, gridTop, CW, gridH + footerH, 2, 2);

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
        // Titre orange bold uppercase
        doc.setFontSize(LABEL_FS);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...ORANGE);
        doc.text(label.toUpperCase(), x + PAD, y + PAD + 3);

        // Petit trait accent sous le titre
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.5);
        doc.line(x + PAD, y + PAD + 4.5, x + PAD + 12, y + PAD + 4.5);

        // Contenu
        if (content?.trim()) {
          doc.setFontSize(CONTENT_FS);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...INK);
          const maxLines = Math.floor((h - 12) / (CONTENT_FS * 0.42));
          const lines = doc.splitTextToSize(content, w - PAD * 2);
          doc.text(lines.slice(0, maxLines), x + PAD, y + PAD + 10);
        }
      }

      function drawSubLabel(x: number, label: string) {
        doc.setFontSize(SUBLABEL_FS);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...MUTED);
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

      // ── Footer page ─────────────────────────────────────────────────────────
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(M, PH - M - 4, PW - M, PH - M - 4);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(`${(startupName || "").toUpperCase()}  \u00B7  Lean Canvas  \u00B7  ${new Date().toLocaleDateString("fr-FR")}`, M, PH - M - 1);
      doc.text("Confidentiel", PW - M, PH - M - 1, { align: "right" });

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
  const filledCount = Object.values(values).filter((v) => v.trim().length > 0).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard?tab=documents" className="inline-flex items-center gap-2.5 text-lg font-semibold">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal"
                style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}
              >
                f
              </div>
              <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
            </a>
            <h1
              className="mt-2 uppercase tracking-[-0.015em]"
              style={{ fontFamily: "var(--uf-display)", fontSize: 24, lineHeight: 0.82, color: "var(--uf-ink)" }}
            >
              Lean Canvas
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] font-medium"
              style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}
            >
              {filledCount} / {SECTIONS.length} sections
            </span>
            <button
              onClick={handleFillWithCodir}
              disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:-translate-y-px transition-transform focus:outline-none"
              style={{ background: "var(--uf-orange)", color: "#fff", borderRadius: "var(--uf-r-md)" }}
            >
              {filling ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Génération…
                </>
              ) : (
                "Demander à mes agents"
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
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:-translate-y-px transition-transform focus:outline-none"
              style={{ background: "var(--uf-card)", color: "var(--uf-muted)", border: "1.5px solid var(--uf-line)", borderRadius: "var(--uf-r-md)" }}
            >
              Vider
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={generating || !startupId || !hasContent}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:-translate-y-px transition-transform focus:outline-none"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)", borderRadius: "var(--uf-r-md)" }}
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
                "Générer le document"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div
            className="mb-6 text-sm px-4 py-3 flex items-center gap-2"
            style={{ color: "#c53030", background: "#c5303014", border: "1px solid #c5303030", borderRadius: "var(--uf-r-lg)" }}
          >
            {error}
          </div>
        )}

        {saveSuccess && (
          <div
            className="mb-6 text-sm px-4 py-3 flex items-center gap-2"
            style={{ color: "var(--uf-teal)", background: "var(--uf-teal)14", border: "1px solid var(--uf-teal)30" , borderRadius: "var(--uf-r-lg)" }}
          >
            PDF généré et ajouté à vos documents avec succès !
          </div>
        )}

        {/* Grille des sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="flex flex-col gap-2 p-4"
              style={{
                background: `${section.tokenColor}14`,
                border: `1.5px solid ${section.tokenColor}`,
                borderRadius: "var(--uf-r-xl)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <div>
                  <p
                    className="text-sm font-black"
                    style={{ color: "var(--uf-ink)", fontFamily: "var(--uf-display)" }}
                  >
                    {section.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--uf-muted)" }}>
                    {section.description}
                  </p>
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
                className="w-full mt-1 text-sm px-3 py-2.5 resize-none focus:outline-none"
                style={{
                  color: "var(--uf-ink)",
                  background: "var(--uf-card)",
                  border: "1px solid var(--uf-line)",
                  borderRadius: "var(--uf-r-lg)",
                }}
              />
            </div>
          ))}
        </div>

        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}
        >
          Remplissez les sections manuellement ou utilisez le bouton &quot;Demander à mes agents&quot; pour générer automatiquement le contenu.
        </p>
      </div>
    </div>
  );
}
