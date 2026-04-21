const agents = [
  {
    name: "Alex",
    role: "Directeur Commercial",
    emoji: "🚀",
    color: "from-orange-400 to-pink-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "text-orange-500",
    description:
      "Stratégie de croissance, acquisition client, partnerships et sales. Alex analyse votre pipeline et identifie vos leviers de revenus.",
    skills: ["Go-to-market", "Pipeline CRM", "Pricing", "Partenariats"],
  },
  {
    name: "Maya",
    role: "Directrice Stratégie",
    emoji: "🧭",
    color: "from-violet-500 to-indigo-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    accent: "text-violet-500",
    description:
      "Positionnement, roadmap produit et analyse concurrentielle. Maya vous aide à faire les bons choix au bon moment.",
    skills: ["Roadmap", "OKR", "Veille marché", "Pivot stratégique"],
  },
  {
    name: "Sam",
    role: "Directeur Financier",
    emoji: "📊",
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    accent: "text-emerald-500",
    description:
      "Modélisation financière, cash flow et préparation des levées de fonds. Sam garde un œil sur votre runway à tout moment.",
    skills: ["Runway", "Modèle financier", "Term sheet", "Unit economics"],
  },
  {
    name: "Léo",
    role: "Directeur Produit",
    emoji: "⚙️",
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    accent: "text-sky-500",
    description:
      "Conception produit, architecture et dette technique. Léo traduit vos ambitions en décisions produit et tech solides.",
    skills: ["MVP design", "Architecture", "Build vs buy", "Recrutement tech"],
  },
  {
    name: "Marc",
    role: "Directeur des Opérations",
    emoji: "📋",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "text-amber-500",
    description:
      "Organisation, process et structuration d'équipe. Marc transforme le chaos startup en machine bien huilée.",
    skills: ["OKR", "Recrutement", "Process", "Scaling ops"],
  },
];

const features = [
  {
    icon: "⚡",
    title: "Réponses en secondes",
    desc: "Vos agents sont disponibles 24h/24 pour des décisions rapides.",
  },
  {
    icon: "🧠",
    title: "Mémoire contextuelle",
    desc: "Chaque agent connaît l'historique de votre startup et évolue avec vous.",
  },
  {
    icon: "🤝",
    title: "Collaboration inter-agents",
    desc: "Les 5 agents se consultent pour des recommandations cohérentes.",
  },
  {
    icon: "🔒",
    title: "Données confidentielles",
    desc: "Vos informations restent privées et ne sont jamais partagées.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-gray-900">
            Founder<span className="text-violet-600">AI</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#agents" className="hover:text-gray-900 transition-colors">
              Les agents
            </a>
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">
              Tarifs
            </a>
            <a href="/partenaires/inscription" className="hover:text-gray-900 transition-colors">
              Devenir partenaire
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/connexion"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Se connecter
            </a>
            <a
              href="/inscription"
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Démarrer gratuitement
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-violet-100 blur-3xl opacity-50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-100 blur-3xl opacity-40"
        />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            5 agents IA · toujours disponibles
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-none mb-6">
            Votre comité de{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              direction IA
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            FounderAI réunit cinq experts IA autour de votre startup —
            stratégie, commerce, finance et technique — pour vous aider à
            prendre les meilleures décisions, chaque jour.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cta"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-violet-200"
            >
              Essayer gratuitement →
            </a>
            <a
              href="#agents"
              className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105"
            >
              Découvrir les agents
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Déjà utilisé par{" "}
            <span className="font-semibold text-gray-600">+200 fondateurs</span>{" "}
            en early-stage · Aucune CB requise
          </p>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Rencontrez votre équipe
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Quatre personnalités distinctes, une vision commune : faire
              réussir votre startup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={`${agent.bg} ${agent.border} border-2 rounded-3xl p-8 hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                  >
                    {agent.emoji}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      {agent.name}
                    </h3>
                    <p className={`text-sm font-semibold ${agent.accent}`}>
                      {agent.role}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white/80 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Conçu pour les fondateurs
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Pas un chatbot générique. Une vraie équipe de direction taillée
              pour les startups early-stage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 rounded-3xl p-7 hover:bg-gray-100 transition-colors"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-black text-gray-900 text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-400 text-lg mb-16 max-w-xl mx-auto">
            Trois étapes pour avoir votre CODIR IA opérationnel.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Décrivez votre startup",
                desc: "Secteur, stade, objectifs, équipe. Vos agents apprennent à vous connaître.",
              },
              {
                step: "02",
                title: "Posez vos questions",
                desc: "Stratégie de pricing, recrutement, levée de fonds, architecture — rien n'est hors sujet.",
              },
              {
                step: "03",
                title: "Décidez et avancez",
                desc: "Vos agents débattent, proposent des options et vous aident à trancher.",
              },
            ].map((item) => (
              <div key={item.step} className="text-left">
                <span className="text-6xl font-black text-violet-500/30">
                  {item.step}
                </span>
                <h3 className="text-xl font-black mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-3">Modèle SaaS par abonnement</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Tarifs simples
            </h2>
            <p className="text-lg text-gray-500">
              Un forfait tout-inclus. Pas de surprise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="border-2 border-gray-200 rounded-3xl p-8 flex flex-col">
              <p className="font-bold text-gray-500 text-sm mb-2">STARTER</p>
              <p className="text-5xl font-black text-gray-900 mb-1">
                49€
                <span className="text-lg font-normal text-gray-400">/mois</span>
              </p>
              <div className="mt-6 space-y-3 text-sm text-gray-600 flex-1">
                {[
                  "3 agents au choix",
                  "50 sessions / mois",
                  "5 livrables / mois",
                  "Mémoire contextuelle 3 mois",
                  "Support Community",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-green-500 shrink-0">✓</span> {item}
                  </div>
                ))}
              </div>
              <a
                href="#cta"
                className="mt-8 block text-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 rounded-2xl transition-all"
              >
                Commencer →
              </a>
            </div>

            {/* Growth */}
            <div className="bg-violet-600 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col">
              <div aria-hidden="true" className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-violet-200 text-sm">GROWTH</p>
                <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">Populaire</span>
              </div>
              <p className="text-5xl font-black mb-1">
                149€
                <span className="text-lg font-normal text-violet-300">/mois</span>
              </p>
              <div className="mt-6 space-y-3 text-sm text-violet-100 flex-1">
                {[
                  "5 agents + CODIR",
                  "Sessions illimitées",
                  "20 livrables / mois",
                  "Mémoire contextuelle 12 mois",
                  "Support email prioritaire",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-white/80 shrink-0">✓</span> {item}
                  </div>
                ))}
              </div>
              <a
                href="#cta"
                className="mt-8 block text-center bg-white text-violet-700 hover:bg-violet-50 font-bold py-3 rounded-2xl transition-all"
              >
                Essayer 14 jours gratuits →
              </a>
            </div>

            {/* Scale */}
            <div className="border-2 border-gray-900 rounded-3xl p-8 flex flex-col">
              <p className="font-bold text-gray-900 text-sm mb-2">SCALE</p>
              <p className="text-5xl font-black text-gray-900 mb-1">
                349€
                <span className="text-lg font-normal text-gray-400">/mois</span>
              </p>
              <div className="mt-6 space-y-3 text-sm text-gray-600 flex-1">
                {[
                  "5 agents + CODIR",
                  "Sessions illimitées",
                  "Livrables illimités",
                  "Mémoire contextuelle illimitée",
                  "1h / mois de support premium inclus",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-green-500 shrink-0">✓</span> {item}
                  </div>
                ))}
              </div>
              <a
                href="#cta"
                className="mt-8 block text-center bg-gray-900 text-white hover:bg-gray-800 font-bold py-3 rounded-2xl transition-all"
              >
                Nous contacter →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="py-24 px-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Prêt à activer votre CODIR ?
          </h2>
          <p className="text-violet-200 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez les fondateurs qui prennent de meilleures décisions,
            plus vite, avec FounderAI.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 bg-white/10 border border-white/30 placeholder-violet-300 text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="bg-white text-violet-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-violet-50 transition-colors whitespace-nowrap"
            >
              Démarrer →
            </button>
          </form>
          <p className="mt-4 text-violet-300 text-xs">
            Gratuit · Pas de CB · Annulable à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400 space-y-2">
        <p>
          <span className="font-bold text-gray-700">
            Founder<span className="text-violet-600">AI</span>
          </span>{" "}
          · Votre comité de direction IA · 2026
        </p>
        <p className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/partenaires/inscription"
            className="font-medium text-gray-500 hover:text-violet-600 transition-colors"
          >
            Devenir partenaire
          </a>
          <span className="text-gray-300">·</span>
          <a
            href="/cgu"
            className="font-medium text-gray-500 hover:text-violet-600 transition-colors"
          >
            CGU
          </a>
          <span className="text-gray-300">·</span>
          <a
            href="/politique-confidentialite"
            className="font-medium text-gray-500 hover:text-violet-600 transition-colors"
          >
            Politique de confidentialité
          </a>
          <span className="text-gray-300">·</span>
          <a
            href="/mentions-legales"
            className="font-medium text-gray-500 hover:text-violet-600 transition-colors"
          >
            Mentions légales
          </a>
        </p>
      </footer>
    </main>
  );
}
