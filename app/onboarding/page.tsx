"use client";

import { useState, useEffect, useRef } from "react";

const SECTORS = [
  "SaaS / Logiciel", "Marketplace", "Fintech", "Healthtech", "Edtech",
  "E-commerce", "Deep tech / IA", "Hardware", "Média / Contenu", "Autre",
];

const STAGES = [
  { value: "idea",            label: "Idée / Pré-produit" },
  { value: "mvp",             label: "MVP / Beta" },
  { value: "early_traction",  label: "Early traction (premiers clients)" },
  { value: "growth",          label: "Croissance" },
  { value: "scale",           label: "Scale" },
];

type ChallengeKey = "strategie" | "vente" | "finance" | "technique";

const CHALLENGES: {
  key: ChallengeKey;
  label: string;
  emoji: string;
  agentName: string;
  messageBuilder: (ctx: { name: string; sector: string; stageLabel: string }) => string;
}[] = [
  {
    key: "strategie",
    label: "Clarifier ma stratégie et mon positionnement",
    emoji: "🧭",
    agentName: "Maya",
    messageBuilder: ({ name, sector, stageLabel }) =>
      `Bonjour Maya ! Je travaille sur ${name || "ma startup"}${sector ? `, dans le secteur ${sector}` : ""}${stageLabel ? ` — nous sommes au stade ${stageLabel}` : ""}. Mon défi principal est de clarifier ma stratégie et mon positionnement. Par où commencer ?`,
  },
  {
    key: "vente",
    label: "Trouver mes premiers clients",
    emoji: "🚀",
    agentName: "Alex",
    messageBuilder: ({ name, sector, stageLabel }) =>
      `Bonjour Alex ! Je travaille sur ${name || "ma startup"}${sector ? `, dans le secteur ${sector}` : ""}${stageLabel ? ` — nous sommes au stade ${stageLabel}` : ""}. Mon défi principal est de trouver mes premiers clients. Par où commencer ?`,
  },
  {
    key: "finance",
    label: "Structurer ma vision financière ou lever des fonds",
    emoji: "📊",
    agentName: "Sam",
    messageBuilder: ({ name, sector, stageLabel }) =>
      `Bonjour Sam ! Je travaille sur ${name || "ma startup"}${sector ? `, dans le secteur ${sector}` : ""}${stageLabel ? ` — nous sommes au stade ${stageLabel}` : ""}. Mon défi principal est de structurer ma vision financière${stageLabel?.includes("traction") || stageLabel?.includes("Croissance") ? " et préparer une levée de fonds" : ""}. Par où commencer ?`,
  },
  {
    key: "technique",
    label: "Prioriser et scoper mon produit",
    emoji: "⚙️",
    agentName: "Léo",
    messageBuilder: ({ name, sector, stageLabel }) =>
      `Bonjour Léo ! Je travaille sur ${name || "ma startup"}${sector ? `, dans le secteur ${sector}` : ""}${stageLabel ? ` — nous sommes au stade ${stageLabel}` : ""}. Mon défi principal est de prioriser et scoper mon produit. Par où commencer ?`,
  },
];

// Agents pour l'étape 3 (fallback si pas de défi sélectionné)
const AGENTS_FALLBACK = CHALLENGES.map((c) => ({
  key: c.key,
  agent: c.agentName,
  emoji: c.emoji,
  role: c.key === "strategie" ? "Directrice Stratégie" : c.key === "vente" ? "Directeur Commercial" : c.key === "finance" ? "Directeur Financier" : "Directeur Produit",
  description: c.key === "strategie" ? "Positionnement, OKR, pivot, analyse concurrentielle" : c.key === "vente" ? "Go-to-market, pipeline, pricing, acquisition" : c.key === "finance" ? "Runway, métriques SaaS, levée de fonds, burn rate" : "Roadmap, discovery, priorisation, build vs buy",
  gradient: c.key === "strategie" ? "from-violet-500 to-indigo-500" : c.key === "vente" ? "from-orange-400 to-pink-500" : c.key === "finance" ? "from-emerald-400 to-teal-500" : "from-sky-400 to-blue-500",
  border: c.key === "strategie" ? "border-violet-200" : c.key === "vente" ? "border-orange-200" : c.key === "finance" ? "border-emerald-200" : "border-sky-200",
  bg: c.key === "strategie" ? "bg-violet-50" : c.key === "vente" ? "bg-orange-50" : c.key === "finance" ? "bg-emerald-50" : "bg-sky-50",
  messageBuilder: c.messageBuilder,
}));

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");

  // Étape 2 — profil startup
  const [name, setName]               = useState("");
  const [sector, setSector]           = useState("");
  const [stage, setStage]             = useState("");
  const [description, setDescription] = useState("");
  const [challenge, setChallenge]     = useState<ChallengeKey | "">("");
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState("");

  // Étape 2 — upload documents
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = localStorage.getItem("founderai_startup_id");
    setStartupId(id);
    if (id) {
      fetch(`/api/startup?startupId=${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.name)        setName(d.name);
          if (d.sector)      setSector(d.sector);
          if (d.stage)       setStage(d.stage);
          if (d.description) setDescription(d.description);
        })
        .catch(() => {});

      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => { if (d.first_name) setFirstName(d.first_name); })
        .catch(() => {});
    }
  }, []);

  function getStageLabel() {
    return STAGES.find((s) => s.value === stage)?.label ?? "";
  }

  async function saveProfile(): Promise<boolean> {
    if (!startupId) return false;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/startup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, name, sector, stage, description }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSaveError(j.error ?? "Erreur lors de la sauvegarde.");
        return false;
      }
      return true;
    } catch {
      setSaveError("Erreur réseau.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !startupId) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("startupId", startupId);
      const res = await fetch("/api/startup/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setUploadError(j.error ?? "Erreur lors de l'upload.");
        return;
      }
      setUploadedDocs((prev) => [...prev, file.name]);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setUploadError("Erreur réseau.");
    } finally {
      setUploading(false);
    }
  }

  function goToDashboard(agentKey: string, firstMessage: string) {
    sessionStorage.setItem("founderai_onboarding_agent", agentKey);
    sessionStorage.setItem("founderai_onboarding_message", firstMessage);
    window.location.href = "/dashboard";
  }

  async function handleStep2Next() {
    const ok = await saveProfile();
    if (!ok) return;

    if (challenge) {
      // Défi renseigné → redirection directe vers l'agent correspondant
      const def = CHALLENGES.find((c) => c.key === challenge)!;
      const msg = def.messageBuilder({ name, sector, stageLabel: getStageLabel() });
      goToDashboard(challenge, msg);
    } else {
      // Pas de défi → afficher l'étape 3 (choix manuel)
      setStep(3);
    }
  }

  // ── Étape 1 — Bienvenue ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <a href="/" className="text-2xl font-black text-gray-900">
              Founder<span className="text-violet-600">AI</span>
            </a>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-10">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🎉
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">
              Bienvenue{firstName ? `, ${firstName}` : ""} !
            </h1>
            <p className="text-gray-500 mb-10">
              Votre CODIR IA est prêt. 2 étapes rapides pour que vos agents vous connaissent dès le départ.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { num: "1", label: "Bienvenue",      icon: "🎉" },
                { num: "2", label: "Votre startup",  icon: "🏢" },
                { num: "3", label: "Premier agent",  icon: "💬" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl">
                    {s.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-violet-200"
            >
              Commencer →
            </button>
            <a href="/dashboard" className="block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Passer et aller directement au dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ── Étape 2 — Profil + défi ──────────────────────────────────────────────────
  if (step === 2) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <StepHeader current={2} />

          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">Décrivez votre startup</h2>
              <p className="text-sm text-gray-500 mt-1">Ces informations permettent à vos agents d'être immédiatement pertinents.</p>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Nom de la startup</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ma Startup SAS"
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Secteur + Stade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Secteur</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 transition-colors bg-white"
                >
                  <option value="">— Choisir —</option>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Stade</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 transition-colors bg-white"
                >
                  <option value="">— Choisir —</option>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(optionnel)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="En 2-3 phrases, décrivez ce que fait votre startup, pour qui, et votre modèle économique."
                rows={3}
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors resize-none"
              />
            </div>

            {/* Défi principal ← nouveau */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Votre défi principal en ce moment <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <p className="text-xs text-gray-400">Nous choisirons l'agent le plus adapté et lancerons la conversation sur ce sujet.</p>
              <div className="grid grid-cols-1 gap-2">
                {CHALLENGES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setChallenge(challenge === c.key ? "" : c.key)}
                    className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      challenge === c.key
                        ? "border-violet-500 bg-violet-50 text-violet-800"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{c.emoji}</span>
                    <span>{c.label}</span>
                    {challenge === c.key && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-black">✓</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload documents */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Documents <span className="text-gray-400 font-normal">(optionnel)</span></p>
                <p className="text-xs text-gray-400 mt-0.5">Pitch deck, business plan, étude de marché… Plus vos agents ont de contexte, plus ils sont pertinents.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 hover:border-violet-400 rounded-xl px-4 py-3 transition-colors group">
                <span className="text-2xl">📎</span>
                <span className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors">
                  {uploading ? "Upload en cours…" : "Cliquez pour déposer un document (PDF, TXT)"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              {uploadedDocs.length > 0 && (
                <ul className="space-y-1">
                  {uploadedDocs.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-xs text-emerald-600">
                      <span>✓</span><span className="truncate">{doc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleStep2Next}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-violet-200"
              >
                {saving ? "Enregistrement…" : challenge ? `Parler à ${CHALLENGES.find((c) => c.key === challenge)!.agentName} →` : "Continuer →"}
              </button>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Passer
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Étape 3 — Choix manuel (fallback si pas de défi renseigné) ───────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <StepHeader current={3} />

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-black text-gray-900 mb-1">Avec quel agent voulez-vous commencer ?</h2>
          <p className="text-sm text-gray-500 mb-6">Choisissez celui qui correspond à votre priorité du moment.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {AGENTS_FALLBACK.map((a) => {
              const msg = a.messageBuilder({ name, sector, stageLabel: getStageLabel() });
              return (
                <button
                  key={a.key}
                  onClick={() => goToDashboard(a.key, msg)}
                  className={`text-left p-5 rounded-2xl border-2 ${a.border} ${a.bg} hover:shadow-md hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-2xl shadow-sm`}>
                      {a.emoji}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{a.agent}</p>
                      <p className="text-xs text-gray-500">{a.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Aller directement au dashboard →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Composant progress bar ────────────────────────────────────────────────────

function StepHeader({ current }: { current: 2 | 3 }) {
  const steps = [
    { num: 1, label: "Bienvenue" },
    { num: 2, label: "Votre startup" },
    { num: 3, label: "Premier agent" },
  ];
  return (
    <div className="text-center mb-8">
      <a href="/" className="text-2xl font-black text-gray-900">
        Founder<span className="text-violet-600">AI</span>
      </a>
      <div className="flex items-center justify-center gap-2 mt-4">
        {steps.map((s, i) => {
          const done = s.num < current;
          const active = s.num === current;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  done || active ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {done ? "✓" : s.num}
                </div>
                <span className={`text-xs font-semibold ${done || active ? "text-violet-600" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
