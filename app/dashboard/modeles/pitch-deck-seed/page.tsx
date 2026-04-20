"use client";

import { useState, useEffect, useRef } from "react";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  rows: number;
};

type PhotoKey = {
  key: string;
  label: string;
  afterField?: string; // si défini, le trombone s'affiche après ce champ
};

type SectionDef = {
  id: string;
  emoji: string;
  title: string;
  fields: FieldDef[];
  photoHint?: string;
  photoKeys?: PhotoKey[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "pitch",
    emoji: "🎯",
    title: "Accroche",
    fields: [
      { key: "tagline", label: "Accroche / Tagline principal", placeholder: "La plateforme qui...", rows: 4 },
    ],
    photoHint: "Une photo ou illustration produit s'affichera à droite de l'accroche (ex : capture d'écran, mockup, visuel de marque).",
    photoKeys: [{ key: "photo_pitch", label: "Visuel produit / Illustration" }],
  },
  {
    id: "problem",
    emoji: "⚡",
    title: "Le problème",
    fields: [
      { key: "problem_title", label: "Titre du slide", placeholder: "Pourquoi X est un problème pour Y ?", rows: 2 },
      { key: "stat1_value", label: "Statistique 1 — Valeur", placeholder: "30%", rows: 1 },
      { key: "stat1_label", label: "Statistique 1 — Description", placeholder: "du temps est consacré à...", rows: 2 },
      { key: "stat2_value", label: "Statistique 2 — Valeur", placeholder: "94,7%", rows: 1 },
      { key: "stat2_label", label: "Statistique 2 — Description", rows: 2 },
      { key: "stat3_value", label: "Statistique 3 — Valeur", rows: 1 },
      { key: "stat3_label", label: "Statistique 3 — Description", rows: 2 },
      { key: "problem_source", label: "Source des données", placeholder: "Étude XYZ sur N personnes", rows: 1 },
    ],
  },
  {
    id: "solution",
    emoji: "💡",
    title: "La solution",
    fields: [
      { key: "solution_title", label: "Titre du slide (bénéfice clé)", placeholder: "Nom : plus de temps pour X et meilleur Y", rows: 2 },
      { key: "pillar1_title", label: "Pilier 1 — Titre", rows: 1 },
      { key: "pillar1_desc", label: "Pilier 1 — Description", rows: 2 },
      { key: "pillar2_title", label: "Pilier 2 — Titre", rows: 1 },
      { key: "pillar2_desc", label: "Pilier 2 — Description", rows: 2 },
      { key: "pillar3_title", label: "Pilier 3 — Titre", rows: 1 },
      { key: "pillar3_desc", label: "Pilier 3 — Description", rows: 2 },
    ],
    photoHint: "Une illustration s'affichera dans la zone supérieure de chaque carte pilier.",
    photoKeys: [
      { key: "photo_pillar1", label: "Illustration — Pilier 1", afterField: "pillar1_desc" },
      { key: "photo_pillar2", label: "Illustration — Pilier 2", afterField: "pillar2_desc" },
      { key: "photo_pillar3", label: "Illustration — Pilier 3", afterField: "pillar3_desc" },
    ],
  },
  {
    id: "mvp",
    emoji: "🚀",
    title: "Notre MVP",
    photoHint: "Une capture d'écran ou maquette de votre MVP s'affichera à droite des fonctionnalités et métriques.",
    fields: [
      { key: "mvp_title", label: "Titre du slide", placeholder: "Notre MVP : [nom du produit]", rows: 1 },
      { key: "mvp_intro", label: "Intro de la carte", placeholder: "Notre [produit] permet au client :", rows: 2 },
      { key: "mvp_bullets", label: "Points clés (1 par ligne, 4-5 lignes)", rows: 5 },
      { key: "metric1_value", label: "Métrique 1 — Valeur", placeholder: "8 à 10h", rows: 1 },
      { key: "metric1_label", label: "Métrique 1 — Description", rows: 2 },
      { key: "metric2_value", label: "Métrique 2 — Valeur", placeholder: "15", rows: 1 },
      { key: "metric2_label", label: "Métrique 2 — Description", rows: 2 },
    ],
    photoKeys: [{ key: "photo_mvp", label: "Capture d'écran ou maquette du MVP" }],
  },
  {
    id: "bm",
    emoji: "💰",
    title: "Business Model",
    fields: [
      { key: "bm1_title", label: "Flux 1 — Titre", rows: 1 },
      { key: "bm1_desc", label: "Flux 1 — Description", rows: 2 },
      { key: "bm2_title", label: "Flux 2 — Titre", rows: 1 },
      { key: "bm2_desc", label: "Flux 2 — Description", rows: 2 },
      { key: "bm3_title", label: "Flux 3 — Titre", rows: 1 },
      { key: "bm3_desc", label: "Flux 3 — Description", rows: 2 },
    ],
    photoHint: "Une illustration s'affichera dans la zone supérieure de chaque carte de flux de revenus.",
    photoKeys: [
      { key: "photo_bm1", label: "Illustration — Flux 1", afterField: "bm1_desc" },
      { key: "photo_bm2", label: "Illustration — Flux 2", afterField: "bm2_desc" },
      { key: "photo_bm3", label: "Illustration — Flux 3", afterField: "bm3_desc" },
    ],
  },
  {
    id: "market",
    emoji: "📈",
    title: "Marché",
    fields: [
      { key: "market_size", label: "Taille du marché", placeholder: "5,1 Mds€", rows: 1 },
      { key: "market_geo", label: "Zone géographique", placeholder: "en Europe", rows: 1 },
      { key: "market_growth", label: "Taux de croissance annuelle (CAGR)", placeholder: "12%", rows: 1 },
      { key: "market_description", label: "Description du marché (contexte, non affiché dans le PDF)", rows: 4 },
      { key: "tam_label", label: "TAM — Label", placeholder: "TAM : Marché total", rows: 1 },
      { key: "tam_value", label: "TAM — Valeur", placeholder: "5,1 Mds €", rows: 1 },
      { key: "sam_label", label: "SAM — Label", placeholder: "SAM : Marché adressable", rows: 1 },
      { key: "sam_value", label: "SAM — Valeur", rows: 1 },
      { key: "som_label", label: "SOM — Label", placeholder: "SOM : Marché atteignable", rows: 1 },
      { key: "som_value", label: "SOM — Valeur", rows: 1 },
      { key: "early_label", label: "Early adopters — Label", rows: 1 },
      { key: "early_value", label: "Early adopters — Valeur", rows: 1 },
    ],
  },
  {
    id: "competition",
    emoji: "🏆",
    title: "Concurrence",
    fields: [
      { key: "comp_criteria", label: "Critères de comparaison (1 par ligne, 6 max)", rows: 6 },
      { key: "comp1_name", label: "Concurrent 1 — Nom", rows: 1 },
      { key: "comp1_scores", label: "Concurrent 1 — Scores (chiffres 0-3 séparés par virgules)", placeholder: "1,1,1,2,0,1", rows: 1 },
      { key: "comp2_name", label: "Concurrent 2 — Nom", rows: 1 },
      { key: "comp2_scores", label: "Concurrent 2 — Scores", placeholder: "1,0,1,2,0,1", rows: 1 },
      { key: "comp3_name", label: "Concurrent 3 — Nom", rows: 1 },
      { key: "comp3_scores", label: "Concurrent 3 — Scores", placeholder: "1,1,1,1,0,0", rows: 1 },
      { key: "our_scores", label: "Nos scores (pour chaque critère)", placeholder: "3,3,2,2,3,3", rows: 1 },
    ],
  },
  {
    id: "roadmap",
    emoji: "🗓️",
    title: "Roadmap",
    fields: [
      { key: "roadmap_q1", label: "Trimestre 1", placeholder: "Q3 2025", rows: 1 },
      { key: "roadmap_q2", label: "Trimestre 2", placeholder: "Q4 2025", rows: 1 },
      { key: "roadmap_q3", label: "Trimestre 3", placeholder: "Q1 2026", rows: 1 },
      { key: "roadmap_q4", label: "Trimestre 4", placeholder: "Q2 2026", rows: 1 },
      {
        key: "roadmap_rows",
        label: "Items de roadmap\n(format: Catégorie|Nom item|trimestre début 0-3|trimestre fin 0-3)",
        placeholder: "Produit|MVP v0|0|0\nProduit|MVP v1|1|2\nMarketing|Lancement|1|1",
        rows: 8,
      },
    ],
  },
  {
    id: "team",
    emoji: "👥",
    title: "Équipe",
    photoHint: "Une photo de profil s'affichera pour chaque membre (format carré recommandé). En l'absence de photo, les initiales seront utilisées.",
    fields: [
      { key: "member1_name", label: "Membre 1 — Nom", rows: 1 },
      { key: "member1_role", label: "Membre 1 — Rôle", placeholder: "CEO", rows: 1 },
      { key: "member1_bio", label: "Membre 1 — Bio", rows: 3 },
      { key: "member2_name", label: "Membre 2 — Nom", rows: 1 },
      { key: "member2_role", label: "Membre 2 — Rôle", rows: 1 },
      { key: "member2_bio", label: "Membre 2 — Bio", rows: 3 },
      { key: "member3_name", label: "Membre 3 — Nom", rows: 1 },
      { key: "member3_role", label: "Membre 3 — Rôle", rows: 1 },
      { key: "member3_bio", label: "Membre 3 — Bio", rows: 3 },
    ],
    photoKeys: [
      { key: "photo_member1", label: "Photo — Membre 1", afterField: "member1_bio" },
      { key: "photo_member2", label: "Photo — Membre 2", afterField: "member2_bio" },
      { key: "photo_member3", label: "Photo — Membre 3", afterField: "member3_bio" },
    ],
  },
  {
    id: "funds",
    emoji: "🎯",
    title: "Levée de fonds",
    fields: [
      { key: "funds_title", label: "Titre (ex: Nous recherchons 500k€ pour)", rows: 2 },
      { key: "fund1", label: "Usage 1", rows: 2 },
      { key: "fund2", label: "Usage 2", rows: 2 },
      { key: "fund3", label: "Usage 3", rows: 2 },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function PhotoUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1.5 block">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-violet-200">
          <img src={value} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          <button
            type="button"
            onClick={() => { onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs font-bold transition-colors"
            title="Supprimer"
          >✕</button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs text-violet-600 font-bold px-2.5 py-1 rounded-lg shadow transition-colors"
          >Changer</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-violet-400 rounded-xl px-4 py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:text-violet-500 transition-colors bg-gray-50 hover:bg-violet-50"
        >
          <span className="text-2xl">📎</span>
          <span className="text-xs font-semibold">Cliquer pour joindre une photo</span>
          <span className="text-xs opacity-70">JPG, PNG — format carré recommandé</span>
        </button>
      )}
    </div>
  );
}

export default function PitchDeckSeedPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>("");
  const [startupLogo, setStartupLogo] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(ALL_KEYS.map((k) => [k, ""]))
  );
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const stepBarRef = useRef<HTMLDivElement>(null);

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

      const saved = localStorage.getItem(`founderai_pitch_deck_${sid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Nettoyer les anciennes clés et données corrompues
          delete parsed.market_title;
          // Si market_size contient une phrase complète (résidu de migration), la vider
          if (parsed.market_size && /un march[eé]/i.test(parsed.market_size)) {
            delete parsed.market_size;
          }
          setValues((prev) => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }

      const savedPhotos = localStorage.getItem(`founderai_pitch_deck_photos_${sid}`);
      if (savedPhotos) {
        try { setPhotos(JSON.parse(savedPhotos)); } catch { /* ignore */ }
      }
    }
  }, []);

  function handlePhotoChange(key: string, dataUrl: string) {
    setPhotos((prev) => {
      const next = { ...prev };
      if (dataUrl) next[key] = dataUrl;
      else delete next[key];
      if (startupId) {
        try {
          localStorage.setItem(`founderai_pitch_deck_photos_${startupId}`, JSON.stringify(next));
        } catch { /* localStorage plein */ }
      }
      return next;
    });
  }

  // Scroll active step pill into view
  useEffect(() => {
    if (stepBarRef.current) {
      const active = stepBarRef.current.querySelector(`[data-step="${currentStep}"]`);
      if (active) {
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentStep]);

  function handleChange(key: string, val: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (startupId) localStorage.setItem(`founderai_pitch_deck_${startupId}`, JSON.stringify(next));
      return next;
    });
  }

  function sectionHasContent(section: SectionDef): boolean {
    return section.fields.some((f) => (values[f.key] || "").trim().length > 0);
  }

  async function handleFillWithAgents() {
    if (!startupId) return;
    setFilling(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fill-pitch-deck", {
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
        if (startupId) localStorage.setItem(`founderai_pitch_deck_${startupId}`, JSON.stringify(next));
        return next;
      });
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setFilling(false);
    }
  }

  function handleReset() {
    const empty = Object.fromEntries(ALL_KEYS.map((k) => [k, ""]));
    setValues(empty);
    setPhotos({});
    if (startupId) {
      localStorage.removeItem(`founderai_pitch_deck_${startupId}`);
      localStorage.removeItem(`founderai_pitch_deck_photos_${startupId}`);
    }
    setSaveSuccess(false);
    setError("");
  }

  async function handleGeneratePdf() {
    if (!startupId) return;
    setGenerating(true);
    setError("");
    setSaveSuccess(false);

    try {
      const { jsPDF } = await import("jspdf");

      const PW = 280;
      const PH = 157.5;

      const NAVY: [number, number, number] = [15, 27, 77];
      const CYAN: [number, number, number] = [61, 200, 216];
      const BLUE: [number, number, number] = [59, 110, 196];
      const LIGHT_BLUE: [number, number, number] = [235, 247, 250];
      const WHITE: [number, number, number] = [255, 255, 255];
      const GRAY: [number, number, number] = [120, 130, 150];

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [PW, PH] });

      const parseScores = (s: string): number[] =>
        (s || "").split(",").map((v) => Math.min(3, Math.max(0, parseInt(v.trim()) || 0)));

      const getImgFormat = (dataUrl: string): string =>
        dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";

      const TOTAL_SLIDES = 12;
      function drawSlideNum(n: number) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(`${n} / ${TOTAL_SLIDES}`, PW - 6, PH - 4, { align: "right" });
      }

      function drawBlobs(type: "cover" | "light") {
        if (type === "cover") {
          doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.ellipse(-30, -30, 80, 80, "F");
          doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
          doc.ellipse(310, -20, 70, 50, "F");
          doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
          doc.ellipse(-20, 175, 55, 65, "F");
          doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
          doc.ellipse(310, 170, 60, 55, "F");
        } else {
          doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
          doc.ellipse(PW + 10, -10, 40, 35, "F");
          doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.ellipse(-15, PH + 10, 35, 30, "F");
        }
      }

      // ── Slide 1 : Cover ───────────────────────────────────────────────────────
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");
      drawBlobs("cover");

      if (startupLogo) {
        const logoW = 80; const logoH = 40;
        doc.addImage(startupLogo, getImgFormat(startupLogo), PW / 2 - logoW / 2, PH / 2 - logoH / 2, logoW, logoH);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(startupName || "Ma Startup", PW / 2, PH / 2, { align: "center" });
      }
      drawSlideNum(1);

      // ── Slide 2 : Pitch ───────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(-30, -30, 80, 80, "F");

      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.roundedRect(10, 8, 50, 12, 3, 3, "F");
      if (startupLogo) {
        doc.addImage(startupLogo, getImgFormat(startupLogo), 13, 9.5, 44, 9);
      } else {
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(startupName || "Startup", 35, 16, { align: "center" });
      }

      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      doc.text(dateStr, PW - 10, 14, { align: "right" });

      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const tagLines = doc.splitTextToSize(values.tagline || startupName || "Notre mission", 140);
      doc.text(tagLines.slice(0, 4), 10, 50);

      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.roundedRect(155, 20, 112, 110, 8, 8, "F");

      if (photos.photo_pitch) {
        doc.addImage(photos.photo_pitch, getImgFormat(photos.photo_pitch), 155, 20, 112, 110);
      } else {
        doc.setFontSize(16);
        doc.text("📸", 211, 68, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text("Insérez votre visuel produit", 211, 78, { align: "center" });
        doc.text("(capture, mockup ou illustration)", 211, 84, { align: "center" });
      }

      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.ellipse(PW + 20, PH + 20, 60, 50, "F");

      drawSlideNum(2);
      // ── Slide 3 : Problème ────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const problemTitleLines = doc.splitTextToSize(values.problem_title || "Le problème", 200);
      doc.text(problemTitleLines, 14, 22);

      const stats = [
        { value: values.stat1_value || "", label: values.stat1_label || "" },
        { value: values.stat2_value || "", label: values.stat2_label || "" },
        { value: values.stat3_value || "", label: values.stat3_label || "" },
      ];

      stats.forEach((stat, i) => {
        const x = 14 + i * 85;
        doc.setFontSize(32);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(stat.value || "—", x + 35, 70, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        const descLines = doc.splitTextToSize(stat.label, 70);
        doc.text(descLines.slice(0, 4), x + 35, 82, { align: "center" });
      });

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(-20, PH + 10, 55, 50, "F");

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      if (values.problem_source) {
        doc.text(values.problem_source, PW - 8, PH - 6, { align: "right" });
      }

      drawSlideNum(3);
      // ── Slide 4 : Solution ────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(PW + 15, -15, 45, 40, "F");
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.ellipse(-15, PH + 10, 40, 40, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const solutionTitleLines = doc.splitTextToSize(values.solution_title || "Notre solution", 250);
      doc.text(solutionTitleLines.slice(0, 2), 14, 20);

      const pillars = [
        { title: values.pillar1_title || "", desc: values.pillar1_desc || "" },
        { title: values.pillar2_title || "", desc: values.pillar2_desc || "" },
        { title: values.pillar3_title || "", desc: values.pillar3_desc || "" },
      ];

      pillars.forEach((pillar, i) => {
        const cx = 14 + i * 89;
        doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.roundedRect(cx, 28, 82, 110, 6, 6, "F");

        const pillarPhoto = photos[`photo_pillar${i + 1}`];
        if (pillarPhoto) {
          doc.addImage(pillarPhoto, getImgFormat(pillarPhoto), cx + 4, 32, 74, 52);
        } else {
          doc.setFillColor(220, 235, 240);
          doc.roundedRect(cx + 4, 32, 74, 52, 4, 4, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(CYAN[0], CYAN[1], CYAN[2]);
        const ptLines = doc.splitTextToSize(pillar.title, 70);
        doc.text(ptLines.slice(0, 2), cx + 4, 94);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        const pdLines = doc.splitTextToSize(pillar.desc, 70);
        doc.text(pdLines.slice(0, 5), cx + 4, 104);
      });

      drawSlideNum(4);
      // ── Slide 5 : MVP ─────────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");
      drawBlobs("light");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text(values.mvp_title || "Notre MVP", 14, 18);

      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.roundedRect(8, 24, 160, 80, 6, 6, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text(values.mvp_intro || "Notre produit permet :", 14, 35);

      const bullets = (values.mvp_bullets || "").split("\n").filter(Boolean).slice(0, 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 60);
      bullets.forEach((b, i) => {
        doc.text("•  " + b, 14, 43 + i * 9);
      });

      doc.setFillColor(235, 245, 248);
      doc.roundedRect(8, 108, 76, 36, 6, 6, "F");
      doc.setFillColor(235, 245, 248);
      doc.roundedRect(90, 108, 76, 36, 6, 6, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text(values.metric1_value || "—", 46, 123, { align: "center" });
      doc.text(values.metric2_value || "—", 128, 123, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      const m1Lines = doc.splitTextToSize(values.metric1_label || "", 64);
      doc.text(m1Lines.slice(0, 2), 46, 131, { align: "center" });
      const m2Lines = doc.splitTextToSize(values.metric2_label || "", 64);
      doc.text(m2Lines.slice(0, 2), 128, 131, { align: "center" });

      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.roundedRect(172, 24, 97, 120, 8, 8, "F");
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.roundedRect(176, 28, 89, 112, 6, 6, "F");

      if (photos.photo_mvp) {
        doc.addImage(photos.photo_mvp, getImgFormat(photos.photo_mvp), 176, 28, 89, 112);
      } else {
        doc.setFontSize(16);
        doc.text("📸", 220, 78, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text("Capture d'écran ou maquette", 220, 89, { align: "center" });
        doc.text("de votre MVP", 220, 95, { align: "center" });
      }

      drawSlideNum(5);
      // ── Slide 6 : Business Model ──────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(PW - 10, -20, 55, 55, "F");
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.ellipse(-20, PH + 15, 50, 50, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text("Business Model", 14, 22);

      const bms = [
        { title: values.bm1_title || "", desc: values.bm1_desc || "" },
        { title: values.bm2_title || "", desc: values.bm2_desc || "" },
        { title: values.bm3_title || "", desc: values.bm3_desc || "" },
      ];

      bms.forEach((bm, i) => {
        const cx = 14 + i * 89;
        doc.setFillColor(245, 248, 252);
        doc.roundedRect(cx, 30, 82, 110, 6, 6, "F");

        const bmPhoto = photos[`photo_bm${i + 1}`];
        if (bmPhoto) {
          doc.addImage(bmPhoto, getImgFormat(bmPhoto), cx + 4, 34, 74, 50);
        } else {
          doc.setFillColor(220, 230, 240);
          doc.roundedRect(cx + 4, 34, 74, 50, 4, 4, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(CYAN[0], CYAN[1], CYAN[2]);
        const btLines = doc.splitTextToSize(bm.title, 70);
        doc.text(btLines.slice(0, 2), cx + 4, 93);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        const bdLines = doc.splitTextToSize(bm.desc, 72);
        doc.text(bdLines.slice(0, 5), cx + 4, 101);
      });

      drawSlideNum(6);
      // ── Slide 7 : Marché ──────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(PW + 15, -15, 45, 40, "F");
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.ellipse(-15, PH + 15, 40, 40, "F");

      const sizeVal = (values.market_size || "").trim();
      const marketTitle = /un march[eé]/i.test(sizeVal)
        ? sizeVal  // déjà une phrase complète, utiliser directement
        : [
            "Un marché potentiel à plus de",
            sizeVal || "—",
            values.market_geo || "",
            values.market_growth ? `en croissance de ${values.market_growth}` : "",
          ].filter(Boolean).join(" ");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const marketTitleLines = doc.splitTextToSize(marketTitle, 125);
      doc.text(marketTitleLines, 12, 20);

      // Cercles partageant la même base (comme sur le modèle Medikiosk)
      const circCx = 207;
      const baseY  = 145;
      const radii  = [56, 42, 28, 14];
      const fills: [number,number,number][] = [
        [225, 243, 252],   // TAM — bleu très clair
        [160, 210, 235],   // SAM — bleu clair
        [ 80, 155, 210],   // SOM — bleu moyen
        NAVY,              // Early adopters — navy
      ];
      const acronyms  = ["TAM", "SAM", "SOM", ""];
      const ciValues  = [values.tam_value || "", values.sam_value || "", values.som_value || "", values.early_value || ""];
      const cirCy     = (r: number) => baseY - r;

      // ── Passe 1 : dessiner tous les cercles ──
      radii.forEach((r, i) => {
        doc.setFillColor(fills[i][0], fills[i][1], fills[i][2]);
        doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setLineWidth(0.4);
        doc.circle(circCx, cirCy(r), r, "FD");
      });

      // ── Passe 2 : acronyme + valeur au centre de la bande visible ──
      radii.forEach((r, i) => {
        const nextTop = i < radii.length - 1 ? cirCy(radii[i + 1]) - radii[i + 1] : baseY;
        const bandTop = cirCy(r) - r;
        const midY    = (bandTop + nextTop) / 2;
        const dark    = i < 2;
        const tc: [number,number,number] = dark ? NAVY : WHITE;

        if (acronyms[i]) {
          // TAM, SAM, SOM : acronyme + valeur
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(tc[0], tc[1], tc[2]);
          doc.text(acronyms[i], circCx, midY - 1, { align: "center" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(ciValues[i], circCx, midY + 5, { align: "center" });
        } else {
          // Early adopters : valeur en blanc centré dans le cercle navy
          if (ciValues[i]) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
            doc.text(ciValues[i], circCx, cirCy(r) + 2.5, { align: "center" });
          }
        }
      });

      // ── Bullet points à gauche alignés avec chaque bande ──
      const bulletDefs = [
        { acro: "TAM", def: values.tam_label   || "Total Addressable Market",      val: values.tam_value   || "" },
        { acro: "SAM", def: values.sam_label   || "Serviceable Addressable Market", val: values.sam_value   || "" },
        { acro: "SOM", def: values.som_label   || "Serviceable Obtainable Market",  val: values.som_value   || "" },
        { acro: "",    def: values.early_label || "Early adopters",                 val: values.early_value || "" },
      ];

      bulletDefs.forEach(({ acro, def, val }, i) => {
        const nextTop = i < radii.length - 1 ? cirCy(radii[i + 1]) - radii[i + 1] : baseY;
        const bandTop = cirCy(radii[i]) - radii[i];
        const midY    = (bandTop + nextTop) / 2;

        // point coloré
        doc.setFillColor(fills[i][0], fills[i][1], fills[i][2]);
        doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setLineWidth(0.3);
        doc.circle(18, midY - 1, 3, "FD");

        // acronyme en gras
        if (acro) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.text(acro, 24, midY - 0.5);
        }

        // définition en italique
        const defLines = doc.splitTextToSize(def, 95);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(60, 70, 90);
        doc.text(defLines.slice(0, 2), acro ? 24 : 24, midY + (acro ? 5 : 2));
      });

      drawSlideNum(7);
      // ── Slide 8 : Concurrence ─────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");
      drawBlobs("light");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text("Competition", 14, 18);

      const criteria = (values.comp_criteria || "").split("\n").filter(Boolean).slice(0, 6);
      const competitors = [
        { name: startupName || "Nous", scores: parseScores(values.our_scores) },
        { name: values.comp1_name || "Concurrent 1", scores: parseScores(values.comp1_scores) },
        { name: values.comp2_name || "Concurrent 2", scores: parseScores(values.comp2_scores) },
        { name: values.comp3_name || "Concurrent 3", scores: parseScores(values.comp3_scores) },
      ];

      const tableX = 14;
      const tableY = 26;
      const colW = [55, 52, 52, 52, 52];
      const effectiveCriteria = criteria.length > 0 ? criteria : ["Critère 1", "Critère 2", "Critère 3"];
      const rowH = (PH - tableY - 12) / (effectiveCriteria.length + 1);
      const totalTableW = colW.reduce((a, b) => a + b, 0);

      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.rect(tableX + colW[0], tableY, colW[1] + colW[2] + colW[3] + colW[4], rowH, "F");

      competitors.forEach((comp, i) => {
        const colStart = colW.slice(0, i + 1).reduce((a, b) => a + b, 0);
        const cx = tableX + colStart + colW[i + 1] / 2;
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text((comp.name || "—").slice(0, 20), cx, tableY + rowH / 2 + 3, { align: "center" });
      });

      effectiveCriteria.forEach((crit, ri) => {
        const ry = tableY + (ri + 1) * rowH;

        doc.setFillColor(ri % 2 === 0 ? 245 : 250, ri % 2 === 0 ? 250 : 252, ri % 2 === 0 ? 253 : 255);
        doc.rect(tableX, ry, totalTableW, rowH, "F");

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(crit, tableX + 3, ry + rowH / 2 + 2);

        competitors.forEach((comp, ci) => {
          const score = comp.scores[ri] ?? 0;
          const colStart = colW.slice(0, ci + 1).reduce((a, b) => a + b, 0);
          const cx = tableX + colStart + colW[ci + 1] / 2;
          const cy = ry + rowH / 2;
          for (let s = 0; s < 3; s++) {
            const sx = cx - 9 + s * 9;
            if (s < score) {
              doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
              doc.circle(sx, cy, 3, "F");
            } else {
              doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
              doc.setLineWidth(0.4);
              doc.circle(sx, cy, 3, "S");
            }
          }
        });

        doc.setDrawColor(200, 210, 220);
        doc.setLineWidth(0.2);
        doc.line(tableX, ry, tableX + totalTableW, ry);
      });

      doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.setLineWidth(0.4);
      doc.rect(tableX, tableY, totalTableW, (effectiveCriteria.length + 1) * rowH);
      doc.line(tableX + colW[0], tableY, tableX + colW[0], tableY + (effectiveCriteria.length + 1) * rowH);

      drawSlideNum(8);
      // ── Slide 9 : Roadmap ─────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");
      drawBlobs("light");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text("Roadmap produit + 12 mois", 14, 18);

      const roadmapItems = (values.roadmap_rows || "")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("|");
          return {
            cat: parts[0]?.trim() || "",
            label: parts[1]?.trim() || "",
            start: Math.min(3, Math.max(0, parseInt(parts[2]?.trim() || "0") || 0)),
            end: Math.min(3, Math.max(0, parseInt(parts[3]?.trim() || "0") || 0)),
          };
        });

      const quarters = [
        values.roadmap_q1 || "Q1",
        values.roadmap_q2 || "Q2",
        values.roadmap_q3 || "Q3",
        values.roadmap_q4 || "Q4",
      ];

      const cats = [...new Set(roadmapItems.map((item) => item.cat))].filter(Boolean);
      const effectiveCats = cats.length > 0 ? cats : ["Produit", "Marketing", "Commercial"];

      const ganttX = 50;
      const ganttY = 28;
      const ganttW = PW - ganttX - 14;
      const qW = ganttW / 4;
      const catH = (PH - ganttY - 14) / effectiveCats.length;

      quarters.forEach((q, qi) => {
        const qx = ganttX + qi * qW;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(q, qx + qW / 2, ganttY - 3, { align: "center" });

        doc.setDrawColor(200, 210, 220);
        doc.setLineWidth(0.3);
        doc.line(qx, ganttY, qx, ganttY + effectiveCats.length * catH);
      });
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.3);
      doc.line(ganttX + 4 * qW, ganttY, ganttX + 4 * qW, ganttY + effectiveCats.length * catH);

      effectiveCats.forEach((cat, ci) => {
        const cy = ganttY + ci * catH;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 90, 110);
        doc.text(cat, 4, cy + catH / 2 + 3);

        if (ci > 0) {
          doc.setDrawColor(180, 190, 210);
          doc.setLineWidth(0.2);
          for (let dx = ganttX; dx < PW - 14; dx += 4) {
            doc.line(dx, cy, dx + 2, cy);
          }
        }

        const catItems = roadmapItems.filter((it) => it.cat === cat);
        const catItemH = catH / (catItems.length || 1);

        catItems.forEach((item, ii) => {
          const iy = cy + ii * catItemH + 2;
          const ix = ganttX + item.start * qW + 2;
          const iw = (item.end - item.start + 1) * qW - 4;
          const ih = catItemH - 4;

          doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
          doc.roundedRect(ix, iy, Math.max(iw, 20), ih, 3, 3, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
          doc.text(
            item.label || "",
            ix + Math.max(iw, 20) / 2,
            iy + ih / 2 + 2.5,
            { align: "center" }
          );
        });
      });

      doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.setLineWidth(0.4);
      doc.line(ganttX, ganttY + effectiveCats.length * catH, PW - 14, ganttY + effectiveCats.length * catH);

      drawSlideNum(9);
      // ── Slide 10 : Équipe ─────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.ellipse(PW + 10, -15, 45, 40, "F");
      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(-15, PH + 15, 40, 35, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text("Équipe", 14, 18);

      const members = [
        { name: values.member1_name || "", role: values.member1_role || "", bio: values.member1_bio || "" },
        { name: values.member2_name || "", role: values.member2_role || "", bio: values.member2_bio || "" },
        { name: values.member3_name || "", role: values.member3_role || "", bio: values.member3_bio || "" },
      ];

      members.forEach((m, i) => {
        const cx = 14 + i * 89;
        doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.roundedRect(cx, 24, 83, 118, 8, 8, "F");

        const memberPhoto = photos[`photo_member${i + 1}`];
        if (memberPhoto) {
          doc.addImage(memberPhoto, getImgFormat(memberPhoto), cx + 19, 30, 44, 44);
          // cercle de contour sur la photo
          doc.setDrawColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
          doc.setLineWidth(1.5);
          doc.circle(cx + 41, 52, 22, "S");
        } else {
          doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
          doc.circle(cx + 41, 52, 22, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
          doc.text("📸 photo", cx + 41, 34, { align: "center" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
          const initials = (m.name || "?")
            .split(" ")
            .map((n) => n[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase();
          doc.text(initials, cx + 41, 56, { align: "center" });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(m.name || "", cx + 41, 84, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(m.role || "", cx + 41, 93, { align: "center" });

        doc.setFontSize(8);
        doc.setTextColor(70, 80, 100);
        const bioLines = doc.splitTextToSize(m.bio || "", 75);
        doc.text(bioLines.slice(0, 6), cx + 41, 103, { align: "center" });
      });

      drawSlideNum(10);
      // ── Slide 11 : Levée de fonds ─────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(0, 0, PW, PH, "F");

      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(PW - 5, -20, 45, 45, "F");
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.ellipse(-15, PH + 15, 50, 50, "F");
      doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
      doc.ellipse(PW + 10, PH + 10, 40, 35, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const fundsTitleLines = doc.splitTextToSize(values.funds_title || "Nous recherchons", 200);
      doc.text(fundsTitleLines, 14, 25);

      const funds = [values.fund1, values.fund2, values.fund3].filter(Boolean);
      let fundY = fundsTitleLines.length > 1 ? 55 : 48;
      funds.forEach((fund) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        const fLines = doc.splitTextToSize(fund, 200);
        doc.text(fLines, 14, fundY);
        fundY += fLines.length * 10 + 8;
      });

      drawSlideNum(11);
      // ── Slide 12 : Merci ──────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.rect(0, 0, PW, PH, "F");
      drawBlobs("cover");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text("Merci", PW / 2, PH / 2, { align: "center" });
      drawSlideNum(12);

      // ── Export & upload ───────────────────────────────────────────────────────
      const exportDateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const fileName = `Pitch Deck${startupName ? ` — ${startupName}` : ""} (${exportDateStr}).pdf`;
      const pdfBlob = doc.output("blob");

      // Téléchargement direct dans le navigateur
      const dlUrl = URL.createObjectURL(pdfBlob);
      const dlLink = document.createElement("a");
      dlLink.href = dlUrl;
      dlLink.download = fileName;
      dlLink.click();
      URL.revokeObjectURL(dlUrl);

      if (!startupId) { setSaveSuccess(true); return; }

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const textContent = [
        `Pitch Deck — ${startupName || "Startup"}`,
        `Tagline: ${values.tagline || ""}`,
        `Problème: ${values.problem_title || ""}\n${values.stat1_value} ${values.stat1_label}\n${values.stat2_value} ${values.stat2_label}\n${values.stat3_value} ${values.stat3_label}`,
        `Solution: ${values.solution_title || ""}\n${values.pillar1_title}: ${values.pillar1_desc}\n${values.pillar2_title}: ${values.pillar2_desc}\n${values.pillar3_title}: ${values.pillar3_desc}`,
        `MVP: ${values.mvp_title || ""}\n${values.mvp_intro || ""}\n${values.mvp_bullets || ""}`,
        `Business Model:\n${values.bm1_title}: ${values.bm1_desc}\n${values.bm2_title}: ${values.bm2_desc}\n${values.bm3_title}: ${values.bm3_desc}`,
        `Marché: ${values.market_size || ""} ${values.market_geo || ""}\n${values.market_description || ""}`,
        `Roadmap:\n${values.roadmap_rows || ""}`,
        `Équipe:\n${values.member1_name} — ${values.member1_role}: ${values.member1_bio}\n${values.member2_name} — ${values.member2_role}: ${values.member2_bio}\n${values.member3_name} — ${values.member3_role}: ${values.member3_bio}`,
        `Levée de fonds: ${values.funds_title || ""}\n${values.fund1 || ""}\n${values.fund2 || ""}\n${values.fund3 || ""}`,
      ].join("\n\n");

      const formData = new FormData();
      formData.append("startupId", startupId);
      formData.append("file", file);
      formData.append("text", textContent);
      // Ne pas envoyer le dataUrl : le PDF peut peser plusieurs Mo en base64 et provoquer un timeout Postgres

      const uploadRes = await fetch("/api/startup/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const ct = uploadRes.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? ((await uploadRes.json()).error ?? "Erreur lors de la sauvegarde.")
          : `Erreur serveur temporaire (${uploadRes.status}). Le PDF a été généré — réessayez la sauvegarde dans un instant.`;
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

  const hasContent = ALL_KEYS.some((k) => (values[k] || "").trim().length > 0);
  const currentSection = SECTIONS[currentStep];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-violet-50 to-indigo-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard?tab=documents"
              className="text-sm text-violet-600 hover:underline flex items-center gap-1"
            >
              ← Retour
            </a>
            <div>
              <h1 className="text-base font-black text-gray-900">🚀 Pitch Deck Seed</h1>
              <p className="text-xs text-gray-400">12 slides · format 16:9</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleFillWithAgents}
              disabled={filling || !startupId}
              className="flex items-center gap-1.5 bg-white border-2 border-violet-200 text-violet-700 font-bold text-xs px-3 py-2 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {filling ? <><Spinner /> Génération…</> : <>🏛️ Remplir avec mes agents</>}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 bg-white border-2 border-gray-200 text-gray-500 font-bold text-xs px-3 py-2 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
            >
              🗑️ Vider
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={generating || !startupId || !hasContent}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
            >
              {generating ? <><Spinner /> Génération…</> : <>📄 Générer le PDF</>}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="max-w-4xl mx-auto mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </div>
        )}
        {saveSuccess && (
          <div className="max-w-4xl mx-auto mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2">
            ✅ PDF généré et ajouté à vos documents avec succès !
          </div>
        )}
      </header>

      {/* ── Step navigator ──────────────────────────────────────────────────── */}
      <nav
        ref={stepBarRef}
        className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 overflow-x-auto flex gap-1.5 scrollbar-hide"
      >
        {SECTIONS.map((section, idx) => {
          const filled = sectionHasContent(section);
          const isActive = idx === currentStep;
          return (
            <button
              key={section.id}
              data-step={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : filled
                  ? "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                  : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span>{section.emoji}</span>
              <span className="hidden sm:inline">{section.title}</span>
              {filled && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Section content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 h-full">
          {/* Section header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{currentSection.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">
                  Slide {currentStep + 2} sur 12
                </p>
                <h2 className="text-xl font-black text-gray-900">{currentSection.title}</h2>
              </div>
            </div>
          </div>

          {/* Photo hint */}
          {currentSection.photoHint && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-xl flex-shrink-0">📸</span>
              <div>
                <p className="text-xs font-bold text-amber-700 mb-0.5">Photo illustrative requise</p>
                <p className="text-xs text-amber-600 leading-relaxed">{currentSection.photoHint}</p>
              </div>
            </div>
          )}

          {/* Trombones sans afterField (pitch, mvp) — affichés avant les champs */}
          {currentSection.photoKeys?.filter((pk) => !pk.afterField).map((pk) => (
            <div key={pk.key} className="mb-5">
              <PhotoUpload
                label={pk.label}
                value={photos[pk.key] || ""}
                onChange={(dataUrl) => handlePhotoChange(pk.key, dataUrl)}
              />
            </div>
          ))}

          {/* Fields */}
          <div className="space-y-5">
            {currentSection.fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block whitespace-pre-line">
                  {field.label}
                </label>
                <textarea
                  value={values[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ""}
                  rows={field.rows || 2}
                  className="w-full text-sm text-gray-800 bg-white border-2 border-gray-200 focus:border-violet-400 focus:outline-none rounded-xl px-4 py-3 resize-none transition-colors placeholder-gray-300 shadow-sm"
                />
                {/* Trombone positionné après ce champ (équipe) */}
                {currentSection.photoKeys?.filter((pk) => pk.afterField === field.key).map((pk) => (
                  <div key={pk.key} className="mt-3">
                    <PhotoUpload
                      label={pk.label}
                      value={photos[pk.key] || ""}
                      onChange={(dataUrl) => handlePhotoChange(pk.key, dataUrl)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Bottom navigation ───────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {SECTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`rounded-full transition-all ${
                  idx === currentStep
                    ? "w-6 h-2 bg-violet-600"
                    : sectionHasContent(SECTIONS[idx])
                    ? "w-2 h-2 bg-violet-300"
                    : "w-2 h-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {currentStep < SECTIONS.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(SECTIONS.length - 1, s + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all shadow-md shadow-violet-200"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleGeneratePdf}
              disabled={generating || !startupId || !hasContent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all shadow-md shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? <><Spinner /> Génération…</> : <>📄 Générer le PDF</>}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
