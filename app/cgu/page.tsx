export const metadata = {
  title: "Conditions Générales d'Utilisation — FounderAI",
  description: "Conditions générales d'utilisation de la plateforme FounderAI.",
};

export default function CguPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* En-tête */}
        <div className="mb-12">
          <a href="/" className="text-sm text-violet-600 hover:underline font-semibold">
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl font-black text-gray-900 mt-6 mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-gray-500 text-lg">FounderAI — Plateforme SaaS d'accompagnement IA pour startups</p>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : avril 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 leading-relaxed">

          {/* 1. Définitions */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">1. Définitions</h2>
            <ul className="space-y-3 text-sm">
              {[
                ["Abonnement", "désigne un droit d'accès à toutes ou une partie des fonctionnalités de la Plateforme, accordé au Client en fonction du forfait sélectionné (Starter, Growth ou Scale) lors de sa souscription en ligne. Les caractéristiques du forfait, les fonctionnalités mises à disposition, le nombre d'Agents IA accessibles et le prix de l'Abonnement sont décrits sur la page tarifaire de la Plateforme."],
                ["Agent(s) IA", "désigne les assistants virtuels spécialisés intégrés à la Plateforme, chacun doté d'un domaine d'expertise propre (commercial, stratégie, finance, technique). Les Agents IA fournissent des conseils, analyses et recommandations générés par intelligence artificielle. Ils ne constituent en aucun cas des conseillers professionnels agréés."],
                ["Client(s)", "désigne toute personne physique ou morale ayant souscrit un Abonnement à la Plateforme FounderAI."],
                ["Contenu Généré", "désigne l'ensemble des textes, analyses, recommandations, documents et livrables produits par les Agents IA en réponse aux sollicitations du Client."],
                ["Donnée(s)", "désigne toute donnée personnelle ou professionnelle renseignée ou collectée par le Client dans le cadre de l'utilisation de la Plateforme, incluant les informations relatives à sa startup, ses projets, ses indicateurs financiers et toute information communiquée aux Agents IA."],
                ["Durée d'abonnement", "désigne la période durant laquelle l'Abonnement à la Plateforme est effectif, telle qu'elle est précisée lors de la souscription (mensuelle ou annuelle)."],
                ["Éditeur", "désigne la société Deep Sight Consulting, éditrice et propriétaire de la Plateforme FounderAI."],
                ["Mode CODIR", "désigne la fonctionnalité permettant de soumettre une question stratégique à l'ensemble des Agents IA simultanément afin d'obtenir une analyse croisée et une recommandation synthétisée."],
                ["Plateforme", "désigne le logiciel SaaS FounderAI accessible à l'adresse https://app.founderai.com (ou toute autre URL communiquée par l'Éditeur), proposant les Services aux Clients en fonction de leur Abonnement."],
                ["Service(s)", "désigne l'ensemble des fonctionnalités de la Plateforme, comprenant notamment les conversations avec les Agents IA, le mode CODIR, les outils d'innovation (Lean Canvas, SWOT, Business Plan, etc.), la génération de Contenu Généré et les tableaux de bord de suivi."],
                ["Accord", "désigne le présent document qui constitue les Conditions Générales d'Utilisation (ci-après « les CGU ») et qui a pour objet de définir les modalités d'utilisation de la Plateforme à destination du Client."],
              ].map(([term, def]) => (
                <li key={term} className="flex gap-2">
                  <span className="font-bold text-gray-900 shrink-0">« {term} »</span>
                  <span>{def}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Objet */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">2. Objet des conditions générales</h2>
            <div className="space-y-3 text-sm">
              <p>Les présentes CGU entrent en vigueur à leur date de mise en ligne et s'appliquent dès la première utilisation de la Plateforme. Elles constituent un accord ayant force obligatoire entre le Client et l'Éditeur.</p>
              <p>Tout accès ou utilisation de la Plateforme suppose l'acceptation concomitante et sans réserve par le Client des termes des présentes CGU. Le Client s'engage à respecter les CGU décrites ci-après.</p>
              <p>Ces CGU sont accessibles à tout moment sur la Plateforme et prévaudront, le cas échéant, sur toute autre version ou tout autre document contradictoire. Le Client est invité à prendre régulièrement connaissance de la dernière version des CGU applicables. Toute modification des CGU est notifiée électroniquement au Client qui est libre d'en refuser l'application et mettre ainsi un terme à son Abonnement. En l'absence de refus exprès du Client dans un délai de trente (30) jours suivant la notification, les CGU modifiées seront réputées acceptées.</p>
              <p>Si une ou plusieurs stipulations des CGU sont tenues non valides ou déclarées comme telles en application d'une loi, règlement ou à la suite d'une décision d'une juridiction compétente, elles seront réputées non écrites mais les autres demeureront en vigueur.</p>
            </div>
          </section>

          {/* 3. Utilisation des Services */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">3. Utilisation des Services</h2>

            <h3 className="text-base font-bold text-gray-900 mb-2">a) Accès à la Plateforme</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Tout au long de la Durée d'abonnement, l'Éditeur donne accès au Client à la Plateforme et à ses Services en fonction du forfait souscrit (Starter, Growth ou Scale).</p>
              <p>L'Éditeur se réserve le droit d'offrir un accès gratuit à toutes ou une partie des fonctionnalités de la Plateforme à certains utilisateurs sur une période limitée (essai gratuit, offre freemium) et de restreindre ou bloquer cet accès à tout moment.</p>
              <p>Les frais de télécommunication lors de l'accès à internet et de l'utilisation de la Plateforme sont à la charge du Client.</p>
              <p>L'Éditeur se réserve le droit, sans préavis ni indemnité, de fermer temporairement la Plateforme ou l'accès à un ou plusieurs Services pour effectuer une mise à jour, une maintenance ou des modifications. L'Éditeur s'efforcera de réaliser ces opérations en dehors des heures ouvrables et d'en informer les Clients dans la mesure du possible.</p>
              <p>L'Éditeur se réserve également le droit d'apporter à la Plateforme et à ses Services toutes les modifications et améliorations qu'il jugera nécessaires ou utiles dans le cadre du bon fonctionnement de la Plateforme.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">b) Nature des Services et limites de l'intelligence artificielle</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Le Client reconnaît et accepte que les Services reposent sur des technologies d'intelligence artificielle générative fournies par des prestataires tiers (notamment Anthropic). À ce titre, le Client est informé que :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Les Agents IA fournissent des conseils et analyses à titre informatif uniquement. Ils ne se substituent en aucun cas à l'avis d'un professionnel qualifié (avocat, expert-comptable, conseiller financier, architecte technique, etc.).</li>
                <li>Le Contenu Généré peut contenir des inexactitudes, des approximations ou des informations obsolètes. Le Client est seul responsable de la vérification et de la validation des informations fournies avant toute prise de décision.</li>
                <li>Les performances et la disponibilité des Agents IA dépendent en partie de prestataires tiers (fournisseurs de modèles d'IA, hébergeurs cloud) sur lesquels l'Éditeur n'exerce pas un contrôle total.</li>
                <li>Les réponses des Agents IA ne constituent pas des garanties de résultat, de succès commercial, de rentabilité ou de faisabilité technique des projets du Client.</li>
              </ul>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">c) Exclusion de garanties et limites de responsabilité</h3>
            <div className="space-y-3 text-sm">
              <p>L'Éditeur, ainsi que ses filiales, prestataires et agents, ne font aucune déclaration ni n'offrent aucune garantie en ce qui concerne l'adéquation, la fiabilité, la disponibilité, la rapidité, la sécurité ou l'exactitude des Services, du Contenu Généré et des données fournis par la Plateforme et les Agents IA.</p>
              <p>Dans la mesure autorisée par la loi, les Services fournis par la Plateforme sont fournis en l'état sans garantie ou condition d'aucune sorte. L'Éditeur exclut toute garantie et condition de toute sorte, que ce soit expressément ou implicitement, y compris toutes les garanties implicites ou conditions de qualité marchande, d'adéquation à un usage particulier, de titre et de non-contrefaçon.</p>
              <p>Dans la mesure autorisée par la loi, en aucun cas l'Éditeur ne peut être tenu responsable des dommages indirects, accessoires, punitifs ou consécutifs, de la perte de profits, de revenus, de données ou d'opportunités commerciales découlant de l'utilisation de la Plateforme, de ses Services ou du Contenu Généré, ou découlant du présent Accord.</p>
              <p>En particulier, l'Éditeur ne saurait être tenu responsable de toute décision prise par le Client sur la base du Contenu Généré par les Agents IA, y compris mais sans s'y limiter, les décisions d'investissement, de recrutement, de choix technologiques, de stratégie commerciale ou de structuration juridique et fiscale.</p>
              <p>Si, nonobstant les autres conditions du présent Accord, l'Éditeur est tenu comme responsable d'un dommage envers le Client, les parties conviennent que la responsabilité agrégée sera limitée à un montant égal au total des montants que le Client a versés au titre de son Abonnement dans les douze (12) mois précédant l'incident. Si le Client n'utilise que les Services gratuits, la responsabilité agrégée de l'Éditeur sera limitée à cent (100) euros.</p>
              <p>Le Client comprend et accepte que sans son accord concernant cette limitation de responsabilité, il n'aura pas accès à la Plateforme.</p>
            </div>
          </section>

          {/* 4. Données */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">4. Utilisation des Données et Vie privée</h2>

            <h3 className="text-base font-bold text-gray-900 mb-2">a) Traitement des Données des Clients</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>L'utilisation de la Plateforme par le Client implique le recueil de certaines Données personnelles lors de l'inscription : nom, prénom, adresse email, nom de la startup et secteur d'activité. La finalité de cette collecte est de permettre au Client de s'authentifier, de personnaliser l'expérience des Agents IA en fonction du contexte de sa startup, et de le tenir informé des actualités relatives à la Plateforme.</p>
              <p>Sont également collectées les Données communiquées par le Client aux Agents IA dans le cadre des conversations, comprenant les informations relatives à sa startup, ses projets, ses indicateurs financiers, ses problématiques stratégiques et toute autre information partagée volontairement.</p>
              <p>Le Client est informé que ses Données sont hébergées sur des serveurs sécurisés au sein de l'Union européenne et qu'un dispositif de sécurité incluant le chiffrement des données en transit (TLS) et au repos est mis en œuvre.</p>
              <p>Les Données collectées sont conservées pour la durée nécessaire à l'utilisation de la Plateforme. À compter de la date de suppression du compte du Client, toutes les Données associées seront conservées pendant une durée maximale de deux (2) ans, sauf obligation légale contraire. Le Client dispose d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant ses Données, exerçable sur simple demande adressée à l'Éditeur par email à <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">contact@deepsight-consulting.eu</a>.</p>
              <p>La Plateforme se conforme aux dispositions de la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, ainsi qu'à celles du Règlement européen 2016/679 du 27 avril 2016 (RGPD) relatif à la protection des données personnelles.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">b) Données transmises aux fournisseurs d'IA</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Le Client est informé et accepte que les informations communiquées aux Agents IA dans le cadre des conversations sont transmises aux fournisseurs de modèles d'intelligence artificielle (notamment Anthropic) pour le traitement des requêtes. L'Éditeur s'assure contractuellement que ces fournisseurs :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ne conservent pas les données des conversations au-delà du temps nécessaire au traitement de la requête</li>
                <li>N'utilisent pas les données des Clients pour entraîner ou améliorer leurs modèles d'IA</li>
                <li>Mettent en œuvre des mesures de sécurité conformes aux standards de l'industrie</li>
              </ul>
              <p>Le Client s'engage à ne pas communiquer aux Agents IA des données sensibles au sens du RGPD (données de santé, origines ethniques, opinions politiques, etc.), des numéros de carte bancaire, mots de passe ou toute information dont la divulgation pourrait lui porter préjudice.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">c) Limites concernant l'Éditeur</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>L'Éditeur n'utilisera ni ne permettra à quiconque d'utiliser les Données du Client dans le but de communiquer avec une personne ou une entreprise tierce, sauf instruction contraire ou autorisation de la part du Client.</p>
              <p>L'Éditeur n'utilisera les Données du Client que pour fournir les Services dans les limites permises par la loi en vigueur, par le présent Accord et par la politique de confidentialité.</p>
              <p>L'Éditeur peut exploiter les Données du Client de manière anonymisée et agrégée à des fins d'amélioration des Services et d'analyse statistique, à condition que ces données ne permettent pas d'identifier le Client.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">d) Publicité</h3>
            <p className="text-sm">Le Client accorde à l'Éditeur le droit d'ajouter son nom et le logo de son entreprise à sa liste de clients et sur son site web, sauf opposition expresse du Client adressée à <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">contact@deepsight-consulting.eu</a>.</p>
          </section>

          {/* 5. Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">5. Propriété intellectuelle</h2>

            <h3 className="text-base font-bold text-gray-900 mb-2">a) Propriété de la Plateforme</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Tous les éléments de propriété intellectuelle composant la Plateforme sont protégés par les lois relatives à la propriété intellectuelle. La Plateforme et tous ses éléments, notamment les codes source, les algorithmes, les prompts système des Agents IA, les textes, les images, les marques, les logos et les noms de domaine sont la propriété exclusive de l'Éditeur.</p>
              <p>Toute reproduction ou représentation, même partielle, par quelque procédé que ce soit, toute requête automatisée ou non visant la récupération des données publiées sur cette Plateforme, faites sans l'autorisation de l'Éditeur, sont illicites et constituent une contrefaçon.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">b) Contenu Généré</h3>
            <div className="space-y-3 text-sm">
              <p>Le Contenu Généré par les Agents IA en réponse aux sollicitations du Client lui est concédé sous licence non exclusive, mondiale et perpétuelle pour son usage propre. Le Client est libre d'utiliser, modifier et distribuer le Contenu Généré dans le cadre de son activité.</p>
              <p>Toutefois, le Client reconnaît que le Contenu Généré est produit par intelligence artificielle et qu'il ne bénéficie pas nécessairement de la protection au titre du droit d'auteur. L'Éditeur ne garantit pas l'originalité du Contenu Généré et ne saurait être tenu responsable en cas de similitude avec des contenus existants.</p>
            </div>
          </section>

          {/* 6. Abonnement */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">6. Conditions de l'Abonnement</h2>

            <h3 className="text-base font-bold text-gray-900 mb-2">a) Souscription et durée</h3>
            <p className="text-sm mb-6">L'Abonnement est souscrit en ligne sur la Plateforme par le Client. Le Client choisit son forfait (Starter, Growth ou Scale) et sa périodicité de facturation (mensuelle ou annuelle). L'Abonnement prend effet à la date de paiement de la première échéance.</p>

            <h3 className="text-base font-bold text-gray-900 mb-2">b) Renouvellement</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Sauf résiliation par le Client avant la fin de la Durée d'abonnement en cours, le renouvellement de l'Abonnement est automatique pour une durée identique à la période initiale.</p>
              <p>Le Client peut désactiver le renouvellement automatique à tout moment depuis les paramètres de son compte sur la Plateforme ou sur simple demande adressée à <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">contact@deepsight-consulting.eu</a>, au moins un (1) jour avant la fin de la Durée d'abonnement en cours.</p>
              <p>Le Client sera informé par email au moins trente (30) jours avant la fin de sa Durée d'abonnement des termes du renouvellement et des conditions tarifaires applicables.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">c) Ajustements tarifaires</h3>
            <p className="text-sm mb-6">L'Éditeur peut modifier les tarifs de l'Abonnement. Le Client en sera informé au moins trente (30) jours avant la date de renouvellement. Les nouveaux tarifs s'appliqueront à la Durée d'abonnement suivante. Si le Client s'oppose à cette modification, il peut ne pas renouveler son Abonnement dans les conditions prévues ci-dessus.</p>

            <h3 className="text-base font-bold text-gray-900 mb-2">d) Résiliation par le Client</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Le Client peut résilier son Abonnement à tout moment depuis les paramètres de son compte ou par email à <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">contact@deepsight-consulting.eu</a>. La résiliation prend effet à la fin de la période d'Abonnement en cours. Aucun remboursement ne sera effectué pour la période restante.</p>
              <p>Dans le cas où l'Abonnement n'est pas renouvelé, les données sauvegardées sur le compte du Client seront conservées pendant trente (30) jours après la fin de la Durée d'abonnement, passé ce délai elles seront supprimées.</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">e) Résiliation pour juste cause</h3>
            <div className="space-y-3 text-sm mb-6">
              <p>Chaque partie peut mettre fin au présent Accord suivant un préavis de trente (30) jours donné à l'autre partie en cas de violation substantielle des CGU, si ladite violation n'est pas résolue à l'expiration de ce délai.</p>
              <p>L'Éditeur peut également résilier l'Abonnement sans préavis en cas d'utilisation de la Plateforme d'une manière qui porte atteinte aux lois applicables, aux droits de tiers ou aux termes du présent Accord, ou en cas d'utilisation abusive des Agents IA (tentatives de contournement des guardrails, génération de contenu illicite, etc.).</p>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">f) Suspension pour défaut de paiement</h3>
            <p className="text-sm mb-6">L'Éditeur envoie un avis de défaut de paiement pour toute somme due. À moins que la somme ne soit réglée, l'Éditeur peut suspendre l'accès à la Plateforme dix (10) jours après l'envoi dudit avis.</p>

            <h3 className="text-base font-bold text-gray-900 mb-2">g) Services gratuits</h3>
            <p className="text-sm">L'Éditeur peut suspendre, limiter ou résilier à tout moment les Services gratuits pour quelque motif que ce soit sans préavis, notamment en cas d'inactivité prolongée du Client.</p>
          </section>

          {/* 7. Obligations */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">7. Obligations du Client</h2>
            <p className="text-sm mb-3">Le Client s'engage à :</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Utiliser la Plateforme conformément à sa destination et aux présentes CGU</li>
              <li>Ne pas tenter de contourner les mesures de sécurité, les guardrails des Agents IA ou les limitations techniques de la Plateforme</li>
              <li>Ne pas utiliser la Plateforme pour générer du contenu illicite, diffamatoire, frauduleux ou portant atteinte aux droits de tiers</li>
              <li>Ne pas procéder à l'extraction automatisée (scraping) des réponses des Agents IA à des fins de constitution de bases de données ou d'entraînement de modèles d'IA concurrents</li>
              <li>Ne pas partager ses identifiants de connexion avec des tiers non autorisés</li>
              <li>Vérifier et valider le Contenu Généré par les Agents IA avant toute utilisation, en particulier pour les aspects financiers, juridiques et réglementaires</li>
            </ul>
          </section>

          {/* 8. Confidentialité */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">8. Confidentialité</h2>
            <p className="text-sm">Le Client et l'Éditeur s'engagent à conserver confidentielles les informations et documents concernant l'autre partie, de quelque nature qu'ils soient, financiers, techniques, sociaux ou commerciaux, qui ont pu être accessibles au cours de l'exécution du présent Accord.</p>
          </section>

          {/* 9. Litiges */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">9. Litiges, droit applicable et juridiction compétente</h2>
            <div className="space-y-3 text-sm">
              <p>Les présentes CGU ainsi que l'ensemble des informations contractuelles mentionnées sur la Plateforme sont rédigées en langue française et soumises à la loi française.</p>
              <p>En cas de différend ou litige entre les parties, celles-ci s'efforceront, de bonne foi, de parvenir à un accord amiable.</p>
              <p>Si aucune solution amiable n'est trouvée, les tribunaux compétents du ressort de la Cour d'appel de Paris seront exclusivement compétents.</p>
            </div>
          </section>

          {/* 10. Mentions légales */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">10. Mentions légales</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-gray-900">Propriétaire et éditeur de la Plateforme</p>
                <p>La société DEEP SIGHT CONSULTING, société par actions simplifiée unipersonnelle (SASU), immatriculée au registre du commerce et des sociétés de Paris sous le numéro SIREN 938 031 671, ayant son siège social au 60 rue François Ier, 75008 Paris, prise en la personne de son Président.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Directeur de la publication</p>
                <p>Monsieur Stéphane Donnet, Président de la société DEEP SIGHT CONSULTING.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Contact</p>
                <p>E-mail : <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">contact@deepsight-consulting.eu</a></p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Hébergeur</p>
                <p>Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis (frontend et API). Supabase Inc., 970 Toa Payoh North #07-04, Singapour (base de données). Les données sont hébergées dans des centres de données situés au sein de l'Union européenne.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Développeur</p>
                <p>La société DEEP SIGHT CONSULTING.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
