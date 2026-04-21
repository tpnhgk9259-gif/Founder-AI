"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PersonaKey = "solo" | "growth" | "partner";

interface Step {
  title: string;
  description: string;
  agent?: string;
  agentEmoji?: string;
  href: string;
  cta: string;
  tip?: string;
}

interface Persona {
  key: PersonaKey;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  border: string;
  bg: string;
  accent: string;
  steps: Step[];
}

// ─── Données ─────────────────────────────────────────────────────────────────

const PERSONAS: Persona[] = [
  {
    key: "solo",
    emoji: "🚀",
    title: "Fondateur solo / early-stage",
    subtitle: "Vous lancez votre projet et cherchez à structurer vos fondations.",
    gradient: "from-violet-500 to-indigo-500",
    border: "border-violet-200",
    bg: "bg-violet-50",
    accent: "text-violet-600",
    steps: [
      {
        title: "Complétez votre profil startup",
        description: "Nom, secteur, stade, description — ces informations permettent à vos agents de contextualiser chaque conseil.",
        href: "/dashboard?tab=tableau",
        cta: "Remplir mon profil",
        tip: "Plus votre profil est complet, plus les réponses des agents sont pertinentes.",
      },
      {
        title: "Identifiez votre opportunité de marché avec Maya",
        description: "Analysez votre marché, repérez un espace incontesté et construisez une stratégie de positionnement claire.",
        agent: "Maya",
        agentEmoji: "🧭",
        href: "/dashboard?agent=strategie&msg=Bonjour Maya ! J'ai une idée de startup et j'aimerais identifier la meilleure opportunité de marché. Peux-tu m'aider à analyser le potentiel et à définir mon positionnement ?",
        cta: "Parler à Maya",
        tip: "Maya utilise des frameworks comme Blue Ocean Strategy et Porter pour structurer votre réflexion.",
      },
      {
        title: "Testez votre hypothèse avec un MVP grâce à Léo",
        description: "Définissez le minimum viable pour valider votre stratégie sur le terrain : fonctionnalités indispensables, celles à exclure, et effort de développement.",
        agent: "Léo",
        agentEmoji: "⚙️",
        href: "/dashboard?agent=technique&msg=Bonjour Léo ! Maya m'a aidé à identifier une opportunité de marché. Maintenant j'aimerais définir le MVP le plus simple pour tester cette hypothèse. Par quoi commencer ?",
        cta: "Parler à Léo",
        tip: "Léo s'assure que vous construisez le bon produit avant de construire le produit bien.",
      },
      {
        title: "Trouvez vos premiers clients avec Alex",
        description: "Identifiez vos early adopters, définissez votre stratégie d'acquisition et posez les bases de votre business model.",
        agent: "Alex",
        agentEmoji: "🚀",
        href: "/dashboard?agent=vente&msg=Bonjour Alex ! J'ai un MVP prêt et j'aimerais trouver mes premiers clients. Comment identifier mes early adopters et poser les bases d'un business model viable ?",
        cta: "Parler à Alex",
        tip: "Alex vous aide à passer de l'idée au premier euro de revenu.",
      },
      {
        title: "Formalisez votre vision avec le Lean Canvas",
        description: "Synthétisez votre stratégie, votre MVP et votre modèle économique sur un canevas d'une page.",
        href: "/dashboard/modeles/lean-canvas",
        cta: "Créer mon Lean Canvas",
        tip: "L'IA pré-remplit le canvas à partir de votre profil et de vos conversations avec Maya, Léo et Alex.",
      },
      {
        title: "Préparez votre Pitch Deck",
        description: "12 slides prêtes pour convaincre : problème, solution, marché, traction, business model, équipe, ask.",
        href: "/dashboard/modeles/pitch-deck-seed",
        cta: "Créer mon Pitch Deck",
        tip: "Vous pouvez ajouter des photos et personnaliser chaque slide avant d'exporter en PDF.",
      },
      {
        title: "Vous avez une preuve de marché ? Passez au forfait Growth",
        description: "Débloquez Sam (Directeur Financier) pour construire un business plan robuste, modéliser vos projections et préparer votre levée de fonds. Le mode CODIR réunit vos 4 agents pour des décisions stratégiques.",
        agent: "Sam",
        agentEmoji: "📊",
        href: "/inscription?plan=growth",
        cta: "Découvrir le forfait Growth",
        tip: "Quand passer au Growth ? En B2B, quand vous avez vendu la même offre à la même cible au moins 3 à 5 fois (3 suffit si votre prix est élevé). En B2C, visez plusieurs dizaines d'utilisateurs actifs. Sur un projet deep tech, des marques d'intérêt concrètes (LOI, pilotes, précommandes) suffisent pour valider le potentiel marché.",
      },
    ],
  },
  {
    key: "growth",
    emoji: "📈",
    title: "Fondateur en croissance",
    subtitle: "Vous avez vos premiers clients et cherchez à scaler.",
    gradient: "from-emerald-400 to-teal-500",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    accent: "text-emerald-600",
    steps: [
      {
        title: "Mettez à jour vos KPIs",
        description: "Chiffre d'affaires, coût d'acquisition, marge, taux de rétention, panier moyen — vos agents utilisent ces données pour calibrer leurs recommandations.",
        href: "/dashboard?tab=tableau",
        cta: "Mettre à jour mes KPIs",
        tip: "Ajoutez au moins 3-4 indicateurs clés pour que Sam et Maya puissent analyser votre situation.",
      },
      {
        title: "Scalez vos ventes avec Alex",
        description: "Vous avez vos premiers clients — maintenant il faut répéter. Alex vous aide à structurer vos canaux d'acquisition, optimiser votre pricing et industrialiser votre démarche commerciale.",
        agent: "Alex",
        agentEmoji: "🚀",
        href: "/dashboard?agent=vente&msg=Bonjour Alex ! J'ai validé mon offre avec mes premiers clients et je veux maintenant scaler mes ventes. Comment structurer ma démarche commerciale pour accélérer ?",
        cta: "Parler à Alex",
      },
      {
        title: "Construisez un business plan détaillé avec Sam",
        description: "Projetez votre croissance sur 18 mois, maîtrisez vos coûts et préparez votre prochaine levée ou votre chemin vers la rentabilité.",
        agent: "Sam",
        agentEmoji: "📊",
        href: "/dashboard?agent=finance&msg=Bonjour Sam ! Nos ventes commencent à être régulières et j'aimerais construire un business plan solide sur 18 mois. Par où commencer ?",
        cta: "Parler à Sam",
        tip: "Un business plan détaillé est la base pour lever des fonds, mais aussi pour piloter votre croissance au quotidien.",
      },
      {
        title: "Recrutez vos prochains postes clés avec Marc",
        description: "La croissance nécessite de renforcer l'équipe. Marc vous aide à définir les priorités de recrutement, les scorecards de poste et le plan d'onboarding 30-60-90 jours.",
        agent: "Marc",
        agentEmoji: "📋",
        href: "/dashboard?agent=operations&msg=Bonjour Marc ! Je dois recruter pour accompagner notre croissance. Peux-tu m'aider à définir les priorités de recrutement et structurer les fiches de poste ?",
        cta: "Parler à Marc",
      },
      {
        title: "Prenez les bonnes décisions avant d'accélérer",
        description: "Avant de scaler, il faut une vision claire des priorités à exécuter dans les 18 prochains mois pour ne pas se disperser. Le CODIR réunit vos 5 agents pour croiser les perspectives et trancher.",
        href: "/dashboard?agent=codir&msg=Quelles sont les 3 priorités stratégiques sur lesquelles nous devons concentrer nos efforts dans les 18 prochains mois pour maximiser notre croissance ?",
        cta: "Lancer un CODIR",
        tip: "Une mauvaise décision stratégique à ce stade coûte 6 mois. Le CODIR vous aide à trancher avec l'éclairage de chaque domaine.",
      },
      {
        title: "Structurez vos OKR avec Marc",
        description: "Quand l'équipe approche la dizaine de personnes, il faut organiser et structurer la façon de travailler. Marc vous aide à définir des objectifs trimestriels clairs et mesurables pour aligner tout le monde.",
        agent: "Marc",
        agentEmoji: "📋",
        href: "/dashboard?agent=operations&msg=Bonjour Marc ! L'équipe grandit et j'ai besoin de structurer notre façon de travailler. Comment mettre en place des OKR adaptés à notre stade ?",
        cta: "Parler à Marc",
        tip: "C'est entre 10 et 15 personnes qu'une startup doit absolument se structurer pour devenir une scale-up. Sans OKR ni process clairs à ce stade, la croissance se bloque.",
      },
    ],
  },
  {
    key: "partner",
    emoji: "🏛️",
    title: "Incubateur / Accélérateur / Fonds",
    subtitle: "Vous accompagnez un portefeuille de startups.",
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-200",
    bg: "bg-amber-50",
    accent: "text-amber-600",
    steps: [
      {
        title: "Configurez votre espace partenaire",
        description: "Renseignez le nom de votre structure, son type (incubateur, fonds, studio) et vos informations.",
        href: "/partner",
        cta: "Accéder à mon espace",
      },
      {
        title: "Invitez vos startups",
        description: "Ajoutez les fondateurs par email — ils recevront un accès avec le plan que vous leur attribuez (Starter, Growth ou Scale).",
        href: "/partner?tab=portfolio",
        cta: "Gérer mon portefeuille",
        tip: "Chaque startup a son propre espace, ses propres conversations et ses propres documents.",
      },
      {
        title: "Personnalisez les agents",
        description: "Renommez les agents et adaptez le persona du manager (Victor) pour coller à l'identité de votre programme.",
        href: "/partner?tab=personnalisation",
        cta: "Personnaliser",
        tip: "Vous pouvez par exemple renommer Maya en votre mentor stratégie et adapter son style de communication.",
      },
      {
        title: "Enrichissez les bases de connaissances",
        description: "Ajoutez vos propres frameworks, méthodologies et ressources dans la base de chaque agent via le panel admin.",
        href: "/admin?tab=agents",
        cta: "Gérer les connaissances",
        tip: "Les agents utilisent vos contenus en priorité (RAG sémantique) pour des réponses alignées avec votre programme.",
      },
      {
        title: "Suivez l'activité de vos startups",
        description: "Consultez les conversations, les documents générés et l'usage de chaque startup de votre portefeuille.",
        href: "/admin?tab=conversations",
        cta: "Voir les conversations",
      },
    ],
  },
];

// ─── Composants ──────────────────────────────────────────────────────────────

function StepCard({ step, index, accent }: { step: Step; index: number; accent: string }) {
  return (
    <div className="flex gap-4">
      {/* Numéro + ligne */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${accent.replace("text-", "bg-").replace("600", "100")} flex items-center justify-center text-sm font-black ${accent}`}>
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-gray-200 mt-2" />
      </div>

      {/* Contenu */}
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 mb-2">
            {step.agentEmoji && (
              <span className="text-xl">{step.agentEmoji}</span>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
              {step.agent && (
                <span className={`text-xs font-semibold ${accent}`}>avec {step.agent}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.description}</p>
          {step.tip && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
              <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Astuce :</span> {step.tip}</p>
            </div>
          )}
          <a
            href={step.href}
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${accent} hover:underline`}
          >
            {step.cta}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const [selected, setSelected] = useState<PersonaKey | null>(null);
  const persona = PERSONAS.find((p) => p.key === selected);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-xl font-black text-gray-900">
              Founder<span className="text-violet-600">AI</span>
            </a>
            <h1 className="text-2xl font-black text-gray-900 mt-2">Guide de démarrage</h1>
            <p className="text-sm text-gray-500 mt-1">Choisissez votre profil pour un parcours adapté.</p>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Retour au dashboard
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Sélection persona */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelected(selected === p.key ? null : p.key)}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md hover:scale-[1.02] ${
                selected === p.key
                  ? `${p.border} ${p.bg} shadow-md`
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-2xl shadow-sm mb-3`}>
                {p.emoji}
              </div>
              <p className="font-black text-gray-900 text-sm mb-1">{p.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{p.subtitle}</p>
              {selected === p.key && (
                <div className={`mt-3 text-xs font-bold ${p.accent} flex items-center gap-1`}>
                  <span>Parcours actif</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Parcours étapes */}
        {persona && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center text-xl shadow-sm`}>
                {persona.emoji}
              </div>
              <div>
                <h2 className="font-black text-gray-900">{persona.title}</h2>
                <p className="text-xs text-gray-500">{persona.steps.length} étapes pour bien démarrer</p>
              </div>
            </div>

            <div>
              {persona.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} accent={persona.accent} />
              ))}
            </div>

            {/* CTA final */}
            <div className="text-center mt-4 mb-8">
              <a
                href="/dashboard"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${persona.gradient} text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all`}
              >
                Accéder au dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Aide */}
        {!persona && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">👆</p>
            <p className="text-gray-400 text-sm">Sélectionnez un profil ci-dessus pour voir votre parcours personnalisé.</p>
          </div>
        )}
      </div>
    </main>
  );
}
