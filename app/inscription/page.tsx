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

// Agents fixes par plan — pas de choix utilisateur
const PLAN_AGENTS: Record<PlanKey, AgentKey[]> = {
  starter: ["strategie", "technique", "vente"],                          // Maya, Léo, Alex
  growth:  ["strategie", "technique", "vente", "finance"],               // + Sam + CODIR
  scale:   ["strategie", "technique", "vente", "finance", "operations"], // + Marc + CODIR
};

export default function Inscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cguAccepted, setCguAccepted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("growth");
  const [selectedAgents, setSelectedAgents] = useState<Set<AgentKey>>(
    new Set(PLAN_AGENTS.growth)
  );

  function handlePlanChange(plan: PlanKey) {
    setSelectedPlan(plan);
    setSelectedAgents(new Set(PLAN_AGENTS[plan]));
  }

  const agentsForLicense: AgentKey[] = [
    ...Array.from(selectedAgents),
    ...(selectedPlan !== "starter" ? ["codir" as AgentKey] : []),
  ];

  const canSubmit = cguAccepted;

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
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--uf-paper)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2.5 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
            <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
          </a>
          <h1 className="mt-6 mb-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 40, lineHeight: 0.82 }}>Créez votre compte</h1>
          <p style={{ color: "var(--uf-muted)" }}>Votre équipe IA est prête en moins de 2 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>

          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prenom" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Prénom</label>
              <input id="prenom" name="prenom" type="text" required placeholder="Marie"
                className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nom" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Nom</label>
              <input id="nom" name="nom" type="text" required placeholder="Dupont"
                className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Adresse email</label>
            <input id="email" name="email" type="email" required placeholder="marie@startup.io"
              className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Mot de passe</label>
            <input id="password" name="password" type="password" required minLength={8} placeholder="8 caractères minimum"
              className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            <p className="text-xs text-gray-400 mt-1">
              8 caractères minimum — lettres, chiffres et symboles autorisés (<span className="font-mono">! @ # $ % ^ & *</span>)
            </p>
          </div>

          {/* Entreprise */}
          <div className="space-y-1.5">
            <label htmlFor="entreprise" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Nom de l&apos;entreprise</label>
            <input id="entreprise" name="entreprise" type="text" placeholder="Ma Startup SAS"
              className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
          </div>

          {/* Choix du plan */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Votre forfait</label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((plan) => (
                <button key={plan.key} type="button" onClick={() => handlePlanChange(plan.key)}
                  className="relative text-left px-3 py-3 transition-all" style={{
                    border: selectedPlan === plan.key ? "2px solid var(--uf-orange)" : "1px solid var(--uf-line)",
                    background: selectedPlan === plan.key ? "var(--uf-card)" : "transparent",
                    borderRadius: "var(--uf-r-md)",
                  }}>
                  {plan.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
                      Populaire
                    </span>
                  )}
                  <p className="font-bold text-sm" style={{ color: "var(--uf-ink)" }}>{plan.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: "var(--uf-orange)" }}>{plan.price}</p>
                  <ul className="mt-2 space-y-0.5">
                    <li className="text-[11px] text-gray-500">{plan.agentCount} agents{plan.codir ? " + CODIR" : " au choix"}</li>
                    <li className="text-[11px] text-gray-500">{plan.sessions}</li>
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Agents inclus dans le plan */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>Agents inclus dans votre forfait</label>
            <div className="grid grid-cols-2 gap-2">
              {SELECTABLE_AGENTS.map((agent) => {
                const isIncluded = selectedAgents.has(agent.key);
                return (
                  <div key={agent.key}
                    className="flex items-center gap-3 px-3 py-2.5" style={{
                      border: isIncluded ? "2px solid var(--uf-orange)" : "1px solid var(--uf-line)",
                      background: isIncluded ? "var(--uf-card)" : "transparent",
                      opacity: isIncluded ? 1 : 0.4,
                      borderRadius: "var(--uf-r-md)",
                    }}>
                    <span className="text-xl">{agent.emoji}</span>
                    <div>
                      <p className="text-xs font-black text-gray-900">{agent.name}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{agent.role}</p>
                    </div>
                    {isIncluded && (
                      <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--uf-ink)" }}>
                        <span className="text-[8px] font-bold" style={{ color: "var(--uf-lime)" }}>✓</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedPlan !== "starter" && (
              <div className="flex items-center gap-3 px-3 py-2.5" style={{ border: "2px solid var(--uf-ink)", background: "var(--uf-ink)", borderRadius: "var(--uf-r-md)", color: "var(--uf-paper)" }}>
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--uf-lime)" }}>CODIR IA</p>
                  <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.7)" }}>Mode conseil — inclus dans votre forfait</p>
                </div>
                <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--uf-lime)" }}>
                  <span className="text-[8px] font-bold" style={{ color: "var(--uf-ink)" }}>✓</span>
                </span>
              </div>
            )}
          </div>

          {/* Case CGU */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={cguAccepted} onChange={(e) => setCguAccepted(e.target.checked)}
              className="mt-0.5 accent-violet-600 w-4 h-4 shrink-0" />
            <span className="text-xs text-gray-500 leading-relaxed">
              J'ai lu et j'accepte les{" "}
              <a href="/cgu" target="_blank" className="underline hover:opacity-80" style={{ color: "var(--uf-orange)" }}>Conditions Générales d'Utilisation</a>{" "}
              et la{" "}
              <a href="/politique-confidentialite" target="_blank" className="underline hover:opacity-80" style={{ color: "var(--uf-orange)" }}>Politique de confidentialité</a>{" "}
              de FounderAI.
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading || !canSubmit}
            className="w-full py-4 text-[15px] font-medium rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-transform mt-2"
            style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
            {loading ? "Création en cours…" : "Activer mon équipe →"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--uf-muted)" }}>
          Incubateur, fonds ou accélérateur ?{" "}
          <a href="/partenaires/inscription" className="font-semibold hover:underline" style={{ color: "var(--uf-orange)" }}>Compte partenaire</a>
        </p>
        <p className="text-center text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
          Déjà un compte ?{" "}
          <a href="/connexion" className="font-semibold hover:underline" style={{ color: "var(--uf-orange)" }}>Se connecter</a>
        </p>
      </div>
    </main>
  );
}
