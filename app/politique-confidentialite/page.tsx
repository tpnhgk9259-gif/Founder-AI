export const metadata = {
  title: "Politique de confidentialité — FounderAI",
  description: "Comment FounderAI collecte, utilise et protège vos données personnelles.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <a href="/" className="text-sm text-violet-600 hover:underline font-semibold">
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl font-black text-gray-900 mt-6 mb-2">
            Politique de confidentialité
          </h1>
          <p className="text-gray-500 text-lg">FounderAI — Plateforme SaaS d'accompagnement IA pour startups</p>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : avril 2026</p>
        </div>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement de vos données personnelles est la société{" "}
              <strong>DEEP SIGHT CONSULTING</strong>, SASU immatriculée au RCS de Paris
              sous le numéro SIREN 938 031 671, dont le siège social est situé au
              60 rue François Ier, 75008 Paris.
            </p>
            <p className="mt-2">
              Contact DPO :{" "}
              <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">
                contact@deepsight-consulting.eu
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. Données collectées</h2>
            <p className="mb-3">Nous collectons les données suivantes :</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Donnée</th>
                    <th className="px-4 py-3 text-left">Finalité</th>
                    <th className="px-4 py-3 text-left">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Nom, prénom, email", "Création et gestion du compte", "Exécution du contrat"],
                    ["Nom de la startup, secteur", "Personnalisation des agents IA", "Exécution du contrat"],
                    ["Conversations avec les agents IA", "Fourniture du service, mémoire contextuelle", "Exécution du contrat"],
                    ["Données financières et stratégiques partagées volontairement", "Personnalisation des réponses des agents", "Consentement"],
                    ["Données de navigation (logs)", "Sécurité et amélioration du service", "Intérêt légitime"],
                  ].map(([data, purpose, basis]) => (
                    <tr key={data} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{data}</td>
                      <td className="px-4 py-3 text-gray-600">{purpose}</td>
                      <td className="px-4 py-3 text-gray-600">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. Hébergement et transferts de données</h2>
            <p className="mb-3">
              Vos données sont hébergées au sein de l'Union européenne et protégées par chiffrement TLS en transit et au repos.
            </p>
            <p className="mb-3">
              Dans le cadre de la fourniture du service, certaines données (contenu des conversations) sont transmises à{" "}
              <strong>Anthropic</strong> (fournisseur des modèles d'IA) uniquement pour le traitement de vos requêtes.
              Anthropic s'engage contractuellement à :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ne pas conserver les données au-delà du traitement de la requête</li>
              <li>Ne pas utiliser vos données pour entraîner ses modèles</li>
              <li>Mettre en œuvre des mesures de sécurité conformes aux standards de l'industrie</li>
            </ul>
            <p className="mt-3">
              <strong>Prestataires d'infrastructure :</strong> Vercel (frontend, API) et Supabase (base de données) —
              données hébergées dans des datacenters situés en Union européenne.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Données de compte actif :</strong> conservées pendant toute la durée de l'abonnement</li>
              <li><strong>Après suppression du compte :</strong> conservation maximale de 2 ans, sauf obligation légale contraire</li>
              <li><strong>Après non-renouvellement de l'abonnement :</strong> données conservées 30 jours puis supprimées</li>
              <li><strong>Logs de sécurité :</strong> 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. Vos droits (RGPD)</h2>
            <p className="mb-3">Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">
                contact@deepsight-consulting.eu
              </a>. Nous répondons dans un délai d'un mois.
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :{" "}
              <span className="text-gray-500">www.cnil.fr</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. Cookies</h2>
            <p className="mb-3">FounderAI utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookie de session :</strong> maintient votre connexion sécurisée (Supabase Auth)</li>
              <li><strong>Préférences utilisateur :</strong> mémorise certains paramètres d'affichage (localStorage)</li>
            </ul>
            <p className="mt-3">
              Nous n'utilisons pas de cookies publicitaires, de traceurs tiers ou d'outils d'analytics invasifs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement TLS en transit, chiffrement au repos, contrôle d'accès strict, authentification sécurisée
              via Supabase Auth. En cas de violation de données, les personnes concernées et la CNIL seront notifiées
              conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. En cas de modification substantielle, vous serez notifié par email.
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
