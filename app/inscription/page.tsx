"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

type PlanKey = "starter" | "growth" | "scale";
type AgentKey = "strategie" | "vente" | "finance" | "technique" | "operations" | "codir";

const PLANS: { key: PlanKey; name: string; price: string; popular?: boolean; agentCount: number; sessions: string; memory: string; codir: boolean }[] = [
  { key: "starter",  name: "Starter", price: "49€/mois",  agentCount: 3, sessions: "50 sessions/mois",    memory: "Mémoire 3 mois",     codir: false },
  { key: "growth",   name: "Growth",  price: "149€/mois", agentCount: 4, sessions: "Sessions illimitées", memory: "Mémoire 12 mois",    codir: true, popular: true },
  { key: "scale",    name: "Scale",   price: "349€/mois", agentCount: 5, sessions: "Tout illimité",       memory: "Mémoire illimitée",  codir: true },
];

const SELECTABLE_AGENTS: { key: AgentKey; name: string; role: string; emoji: string }[] = [
  { key: "strategie",  name: "Maya", role: "Directrice Stratégie",      emoji: "🧭" },
  { key: "vente",      name: "Alex", role: "Directeur Commercial",      emoji: "🚀" },
  { key: "finance",    name: "Sam",  role: "Directeur Financier",       emoji: "📊" },
  { key: "technique",  name: "Léo",  role: "Directeur Produit",         emoji: "⚙️" },
  { key: "operations", name: "Marc", role: "Directeur des Opérations",  emoji: "📋" },
];

const MAX_AGENTS: Record<PlanKey, number> = { starter: 3, growth: 5, scale: 5 };
// Growth et Scale incluent les 4 agents spécialisés — seul Starter exige un choix parmi 3

export default function Inscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cguAccepted, setCguAccepted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("growth");
  const [selectedAgents, setSelectedAgents] = useState<Set<AgentKey>>(
    new Set(["strategie", "vente", "finance", "technique"])
  );

  const maxAgents = MAX_AGENTS[selectedPlan];
  const isStarterChoice = selectedPlan === "starter";

  function handlePlanChange(plan: PlanKey) {
    setSelectedPlan(plan);
    // Growth et Scale : tous les 4 spécialisés auto-sélectionnés
    if (plan !== "starter") {
      setSelectedAgents(new Set(["strategie", "vente", "finance", "technique", "operations"]));
    } else {
      // Starter : garder la sélection courante si ≤ 3, sinon réduire à 3
      setSelectedAgents((prev) => {
        const arr = Array.from(prev).slice(0, 3);
        return new Set(arr);
      });
    }
  }

  function toggleAgent(key: AgentKey) {
    if (!isStarterChoice) return; // Growth/Scale : agents verrouillés
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= maxAgents) return prev; // limite atteinte
        next.add(key);
      }
      return next;
    });
  }

  const agentsForLicense: AgentKey[] = [
    ...Array.from(selectedAgents),
    ...(selectedPlan !== "starter" ? ["codir" as AgentKey] : []),
  ];

  const canSubmit = cguAccepted && (
    !isStarterChoice || selectedAgents.size === maxAgents
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const firstName = data.get("prenom") as string;
    const lastName = data.get("nom") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const startupName = data.get("entreprise") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, startupName, plan: selectedPlan, agents: agentsForLicense }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de la création du compte.");
        return;
      }

      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError("Compte créé mais connexion impossible. Réessayez.");
        return;
      }

      localStorage.setItem("founderai_startup_id", json.startupId);
      window.location.href = "/onboarding";
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="text-2xl font-black text-gray-900">
            Founder<span className="text-violet-600">AI</span>
          </a>
          <h1 className="text-3xl font-black text-gray-900 mt-6 mb-2">Créez votre compte</h1>
          <p className="text-gray-500">Votre équipe IA est prête en moins de 2 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-5">

          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prenom" className="text-sm font-semibold text-gray-700">Prénom</label>
              <input id="prenom" name="prenom" type="text" required placeholder="Marie"
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nom" className="text-sm font-semibold text-gray-700">Nom</label>
              <input id="nom" name="nom" type="text" required placeholder="Dupont"
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Adresse email</label>
            <input id="email" name="email" type="email" required placeholder="marie@startup.io"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors" />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Mot de passe</label>
            <input id="password" name="password" type="password" required minLength={8} placeholder="8 caractères minimum"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors" />
            <p className="text-xs text-gray-400 mt-1">
              8 caractères minimum — lettres, chiffres et symboles autorisés (<span className="font-mono">! @ # $ % ^ & *</span>)
            </p>
          </div>

          {/* Entreprise */}
          <div className="space-y-1.5">
            <label htmlFor="entreprise" className="text-sm font-semibold text-gray-700">Nom de l&apos;entreprise</label>
            <input id="entreprise" name="entreprise" type="text" placeholder="Ma Startup SAS"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors" />
          </div>

          {/* Choix du plan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Votre forfait</label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((plan) => (
                <button key={plan.key} type="button" onClick={() => handlePlanChange(plan.key)}
                  className={`relative text-left rounded-xl border-2 px-3 py-3 transition-all ${selectedPlan === plan.key ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                  {plan.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Populaire
                    </span>
                  )}
                  <p className="font-black text-gray-900 text-sm">{plan.name}</p>
                  <p className="text-xs text-violet-600 font-bold mt-0.5">{plan.price}</p>
                  <ul className="mt-2 space-y-0.5">
                    <li className="text-[11px] text-gray-500">{plan.agentCount} agents{plan.codir ? " + CODIR" : " au choix"}</li>
                    <li className="text-[11px] text-gray-500">{plan.sessions}</li>
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Choix des agents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                {isStarterChoice ? "Choisissez vos 3 agents" : "Vos agents inclus"}
              </label>
              {isStarterChoice && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedAgents.size === maxAgents ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`}>
                  {selectedAgents.size}/{maxAgents} sélectionnés
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SELECTABLE_AGENTS.map((agent) => {
                const isSelected = selectedAgents.has(agent.key);
                const isDisabled = !isStarterChoice || (!isSelected && selectedAgents.size >= maxAgents);
                return (
                  <button key={agent.key} type="button"
                    onClick={() => toggleAgent(agent.key)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all
                      ${isSelected ? "border-violet-500 bg-violet-50" : "border-gray-200"}
                      ${!isStarterChoice ? "cursor-default" : isDisabled ? "opacity-40 cursor-not-allowed" : "hover:border-gray-300"}`}>
                    <span className="text-xl">{agent.emoji}</span>
                    <div>
                      <p className="text-xs font-black text-gray-900">{agent.name}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{agent.role}</p>
                    </div>
                    <span className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-violet-600 border-violet-600" : "border-gray-300"}`}>
                      {isSelected && <span className="text-white text-[8px] font-black">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedPlan !== "starter" && (
              <div className="flex items-center gap-3 rounded-xl border-2 border-violet-200 bg-violet-50 px-3 py-2.5">
                <span className="text-xl">🏛️</span>
                <div>
                  <p className="text-xs font-black text-violet-700">CODIR IA</p>
                  <p className="text-[10px] text-violet-400 leading-tight">Mode conseil — inclus dans votre forfait</p>
                </div>
                <span className="ml-auto w-4 h-4 rounded-full bg-violet-600 border-2 border-violet-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[8px] font-black">✓</span>
                </span>
              </div>
            )}
            {isStarterChoice && selectedAgents.size < maxAgents && (
              <p className="text-xs text-amber-600 font-medium">
                Sélectionnez encore {maxAgents - selectedAgents.size} agent{maxAgents - selectedAgents.size > 1 ? "s" : ""} pour continuer.
              </p>
            )}
          </div>

          {/* Case CGU */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={cguAccepted} onChange={(e) => setCguAccepted(e.target.checked)}
              className="mt-0.5 accent-violet-600 w-4 h-4 shrink-0" />
            <span className="text-xs text-gray-500 leading-relaxed">
              J'ai lu et j'accepte les{" "}
              <a href="/cgu" target="_blank" className="text-violet-600 underline hover:text-violet-700">Conditions Générales d'Utilisation</a>{" "}
              et la{" "}
              <a href="/politique-confidentialite" target="_blank" className="text-violet-600 underline hover:text-violet-700">Politique de confidentialité</a>{" "}
              de FounderAI.
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading || !canSubmit}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-violet-200 mt-2">
            {loading ? "Création en cours…" : "Activer mon équipe →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Incubateur, fonds ou accélérateur ?{" "}
          <a href="/partenaires/inscription" className="font-semibold text-violet-600 hover:underline">Compte partenaire</a>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Déjà un compte ?{" "}
          <a href="/connexion" className="font-semibold text-violet-600 hover:underline">Se connecter</a>
        </p>
      </div>
    </main>
  );
}
