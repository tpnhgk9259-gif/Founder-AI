"use client";

import { useState } from "react";

type Tab = "aide" | "dico";

export const glossary = [
  { term: "Burn rate", def: "Vitesse à laquelle une startup dépense ses réserves de trésorerie chaque mois. Un burn rate de 30k€/mois signifie que vous dépensez 30 000€ par mois." },
  { term: "Runway", def: "Nombre de mois avant que la trésorerie soit épuisée au rythme actuel. Formule : trésorerie disponible ÷ burn rate mensuel." },
  { term: "MRR", def: "Monthly Recurring Revenue — Chiffre d'affaires récurrent mensuel généré par les abonnements actifs. Indicateur clé pour les SaaS." },
  { term: "ARR", def: "Annual Recurring Revenue — MRR × 12. Permet de comparer la taille d'une startup SaaS avec des entreprises plus matures." },
  { term: "CAC", def: "Customer Acquisition Cost — Coût moyen pour acquérir un nouveau client. Inclut marketing, sales, et temps passé." },
  { term: "LTV", def: "Lifetime Value — Revenu total généré par un client sur toute sa durée de vie. Un ratio LTV/CAC > 3 est généralement sain." },
  { term: "Churn", def: "Taux d'attrition — Pourcentage de clients ou de revenus perdus sur une période. Un churn mensuel de 5% = perte de la moitié des clients en 1 an." },
  { term: "PMF", def: "Product-Market Fit — Stade où votre produit répond vraiment à un besoin du marché. Signal clé : rétention organique et demande non sollicitée." },
  { term: "MVP", def: "Minimum Viable Product — Version minimale du produit qui permet de valider des hypothèses avec de vrais utilisateurs, sans sur-investir." },
  { term: "Go-to-market", def: "Stratégie pour lancer un produit sur le marché : canaux d'acquisition, positionnement, cible, message. Souvent abrégé GTM." },
  { term: "Pivot", def: "Changement significatif de la stratégie produit ou business suite à un apprentissage. Ne pas confondre avec une itération (ajustement mineur)." },
  { term: "Pre-seed", def: "Premier tour de financement, souvent pour financer la R&D et le MVP. Montants typiques : 50k€ à 500k€, souvent auprès de business angels." },
  { term: "Seed", def: "Tour de financement pour lancer le produit sur le marché après validation initiale. Montants : 500k€ à 2M€ en France, souvent avec des fonds early-stage." },
  { term: "Series A", def: "Premier grand tour institutionnel pour scaler un modèle validé. Montants : 2M€ à 15M€+. Requiert en général un MRR solide et une croissance prouvée." },
  { term: "Term sheet", def: "Document non contraignant qui résume les conditions d'un investissement avant la rédaction des actes définitifs. Base de la négociation." },
  { term: "Cap table", def: "Tableau de capitalisation — Liste de tous les actionnaires avec leur pourcentage de détention. Évolue à chaque levée et émission de BSPCE." },
  { term: "Dilution", def: "Réduction du pourcentage de détention des actionnaires existants lors d'une nouvelle émission d'actions. Inévitable lors d'une levée." },
  { term: "BSPCE", def: "Bons de Souscription de Parts de Créateur d'Entreprise — Équivalent français des stock options. Permet d'associer les salariés au capital à prix préférentiel." },
  { term: "Vesting", def: "Mécanisme par lequel des actions ou BSPCE sont acquis progressivement dans le temps, pour fidéliser fondateurs et employés clés." },
  { term: "Cliff", def: "Période minimale à effectuer avant que le vesting commence. Typiquement 1 an : pas d'actions si départ avant 12 mois, puis acquisition progressive." },
  { term: "SAFE", def: "Simple Agreement for Future Equity — Instrument de financement qui se convertit en actions lors d'un prochain tour, sans valorisation fixée à l'avance." },
  { term: "OKR", def: "Objectives & Key Results — Méthode de gestion des objectifs popularisée par Google. Objective = direction qualitative, Key Results = métriques mesurables." },
  { term: "KPI", def: "Key Performance Indicator — Indicateur clé de performance. Chaque fonction a ses KPIs : taux de conversion (ventes), churn (produit), burn rate (finance)." },
  { term: "NPS", def: "Net Promoter Score — Mesure la fidélité client via la question : 'Recommanderiez-vous ce produit ?' Score de -100 à +100. >50 est excellent." },
  { term: "Unit economics", def: "Rentabilité à l'échelle d'une unité (1 client, 1 transaction). Principaux indicateurs : CAC, LTV, marge brute, payback period." },
  { term: "Payback period", def: "Temps nécessaire pour récupérer le coût d'acquisition d'un client. Formule : CAC ÷ revenu mensuel par client. Idéalement < 12 mois." },
  { term: "Pipeline", def: "Ensemble des opportunités commerciales en cours, classées par stade (prospection, démo, négociation, closing). Se gère dans un CRM." },
  { term: "Churn rate", def: "Voir Churn. Le taux mensuel se calcule : clients perdus ÷ clients début de période × 100." },
  { term: "ARR run rate", def: "Projection annuelle du revenu basée sur les derniers chiffres mensuels. Utile pour anticiper la valorisation lors d'une levée." },
  { term: "Due diligence", def: "Audit réalisé par un investisseur avant d'investir : finances, juridique, produit, équipe. Peut durer de 2 semaines à 3 mois." },
  { term: "TAM", def: "Total Addressable Market — Taille totale du marché si 100% des clients potentiels dans le monde adoptaient votre solution. Sert à calibrer l'ambition et à convaincre les investisseurs." },
  { term: "SAM", def: "Serviceable Addressable Market — Portion du TAM que vous pouvez réellement cibler avec votre modèle actuel (zone géographique, segment, canal). Sous-ensemble du TAM." },
  { term: "SOM", def: "Serviceable Obtainable Market — Part du SAM que vous pouvez raisonnablement capturer à court terme compte tenu de vos ressources et de la concurrence. C'est votre objectif réaliste." },
  { term: "GMV", def: "Gross Merchandise Value — Volume total des transactions sur une marketplace. Ce n'est pas le CA : le CA = GMV × taux de commission (take rate)." },
  { term: "Take rate", def: "Taux de commission prélevé par une marketplace sur chaque transaction. Varie de 5% (immobilier) à 30% (app stores)." },
  { term: "TRL", def: "Technology Readiness Level — Échelle de 1 à 9 qui mesure la maturité d'une technologie : 1 = recherche fondamentale, 9 = production industrielle." },
  { term: "CIR", def: "Crédit d'Impôt Recherche — Aide fiscale française qui rembourse 30% des dépenses de R&D éligibles. Très utilisé par les startups DeepTech." },
  { term: "ARPU", def: "Average Revenue Per User — Revenu moyen par utilisateur. Se calcule : CA total ÷ nombre de clients actifs sur la période." },
  { term: "ICP", def: "Ideal Customer Profile — Profil type du client idéal : secteur, taille, rôle décideur, budget, problème. Sert à cibler les efforts commerciaux." },
  { term: "TJM", def: "Taux Journalier Moyen — Tarif de facturation par jour pour les activités de services et conseil. Base du modèle économique des ESN et cabinets." },
  { term: "ETP", def: "Équivalent Temps Plein — Unité de mesure de la charge de travail. 1 ETP = 1 personne à temps plein. 0.5 ETP = mi-temps." },
  { term: "EBITDA", def: "Earnings Before Interest, Taxes, Depreciation and Amortization — Résultat opérationnel avant charges financières et amortissements. Mesure la rentabilité opérationnelle." },
  { term: "P&L", def: "Profit & Loss — Compte de résultat. Résume les revenus, les charges et le résultat net sur une période." },
  { term: "OPEX", def: "Operating Expenses — Dépenses opérationnelles courantes (loyer, outils, marketing). Se distingue du CAPEX (investissements)." },
  { term: "CAPEX", def: "Capital Expenditure — Investissements en immobilisations (matériel, brevets, logiciels). Amortis sur plusieurs années." },
  { term: "B2B", def: "Business to Business — Entreprise qui vend à d'autres entreprises. Cycles de vente plus longs mais paniers plus élevés." },
  { term: "B2C", def: "Business to Consumer — Entreprise qui vend directement aux particuliers. Volume élevé, panier moyen plus faible." },
  { term: "B2B2C", def: "Business to Business to Consumer — Entreprise qui passe par un partenaire B2B pour toucher le consommateur final." },
  { term: "ROI", def: "Return On Investment — Retour sur investissement. Formule : (gains - coût de l'investissement) ÷ coût × 100." },
  { term: "RACI", def: "Responsible, Accountable, Consulted, Informed — Matrice de répartition des responsabilités sur un projet ou processus." },
  { term: "GTM", def: "Go-To-Market — Stratégie de mise sur le marché : cible, canaux, message, pricing. Plan d'action pour lancer ou scaler un produit." },
  { term: "POC", def: "Proof of Concept — Démonstration de faisabilité technique. Étape clé avant le MVP, surtout en DeepTech." },
  { term: "LOI", def: "Letter of Intent — Lettre d'intention. Document non engageant qui exprime l'intérêt d'un client ou investisseur potentiel." },
  { term: "COGS", def: "Cost of Goods Sold — Coût des marchandises vendues. Inclut les coûts directs de production. CA - COGS = marge brute." },
];

const helpItems = [
  {
    q: "À quoi servent les 5 agents ?",
    a: "Chaque agent couvre un domaine : Maya (Stratégie), Alex (Vente), Sam (Finance), Léo (Produit/Tech), Marc (Opérations). Posez-leur des questions dans leur panneau respectif.",
  },
  {
    q: "C'est quoi le mode CODIR ?",
    a: "En mode CODIR, les 5 agents dialoguent ensemble autour d'une question complexe. Idéal pour les décisions qui impactent plusieurs domaines à la fois.",
  },
  {
    q: "Pourquoi renseigner mon projet ?",
    a: "Le champ 'Parlez-nous de votre projet' donne du contexte à tous vos agents. Plus il est précis, plus leurs réponses seront pertinentes et personnalisées.",
  },
  {
    q: "Mes données sont-elles confidentielles ?",
    a: "Oui. Vos informations sont isolées dans votre espace et ne sont jamais utilisées pour entraîner des modèles ou partagées avec d'autres utilisateurs.",
  },
  {
    q: "Par où commencer ?",
    a: "Consultez le guide de démarrage pour un parcours pas-à-pas adapté à votre profil.",
    link: "/guide",
    linkLabel: "Ouvrir le guide",
  },
];

export default function HelpBubble() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("aide");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-200 flex items-center justify-center text-2xl transition-all hover:scale-110"
        aria-label="Aide"
      >
        ?
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full sm:w-[420px] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900 text-lg">Centre d&apos;aide</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-4 gap-2 flex-shrink-0">
              <button
                onClick={() => setTab("aide")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  tab === "aide"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Aide rapide
              </button>
              <button
                onClick={() => setTab("dico")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  tab === "dico"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Dictionnaire startup
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === "aide" && (
                <div className="space-y-3">
                  {helpItems.map((item) => (
                    <div
                      key={item.q}
                      className="border-2 border-gray-100 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpanded(expanded === item.q ? null : item.q)
                        }
                        className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-800">
                          {item.q}
                        </span>
                        <span
                          className={`text-gray-400 text-xs transition-transform flex-shrink-0 ${
                            expanded === item.q ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {expanded === item.q && (
                        <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                          {item.a}
                          {"link" in item && item.link && (
                            <a href={item.link as string} className="block mt-2 text-violet-600 font-semibold hover:underline text-xs">
                              {(item as { linkLabel?: string }).linkLabel ?? "En savoir plus"} →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "dico" && (
                <div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un terme… ex: runway, churn, MRR"
                    className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm mb-4 transition-colors"
                  />
                  {filtered.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                      Aucun terme trouvé pour &quot;{search}&quot;
                    </p>
                  )}
                  <div className="space-y-2">
                    {filtered.map((g) => (
                      <div
                        key={g.term}
                        className="border-2 border-gray-100 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpanded(
                              expanded === g.term ? null : g.term
                            )
                          }
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-black text-gray-900">
                            {g.term}
                          </span>
                          <span
                            className={`text-gray-400 text-xs transition-transform flex-shrink-0 ${
                              expanded === g.term ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>
                        {expanded === g.term && (
                          <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                            {g.def}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 text-center">
                Une autre question ?{" "}
                <a href="mailto:support@founderai.io" className="text-violet-600 font-semibold hover:underline">
                  Contactez le support
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
