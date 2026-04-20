export const metadata = {
  title: "Mentions légales — FounderAI",
  description: "Mentions légales de la plateforme FounderAI.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <a href="/" className="text-sm text-violet-600 hover:underline font-semibold">
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl font-black text-gray-900 mt-6 mb-2">Mentions légales</h1>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : avril 2026</p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Éditeur de la plateforme</h2>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
              <p><span className="font-semibold text-gray-900">Raison sociale :</span> DEEP SIGHT CONSULTING</p>
              <p><span className="font-semibold text-gray-900">Forme juridique :</span> Société par actions simplifiée unipersonnelle (SASU)</p>
              <p><span className="font-semibold text-gray-900">SIREN :</span> 938 031 671</p>
              <p><span className="font-semibold text-gray-900">Siège social :</span> 60 rue François Ier, 75008 Paris, France</p>
              <p>
                <span className="font-semibold text-gray-900">Contact :</span>{" "}
                <a href="mailto:contact@deepsight-consulting.eu" className="text-violet-600 hover:underline">
                  contact@deepsight-consulting.eu
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Directeur de la publication</h2>
            <p>Monsieur Stéphane Donnet, Président de la société DEEP SIGHT CONSULTING.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Hébergement</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="font-semibold text-gray-900 mb-1">Frontend & API</p>
                <p>Vercel Inc.</p>
                <p className="text-gray-500">340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                <p className="text-gray-500 text-xs mt-1">Les données sont traitées dans des datacenters situés au sein de l'Union européenne.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="font-semibold text-gray-900 mb-1">Base de données</p>
                <p>Supabase Inc.</p>
                <p className="text-gray-500">970 Toa Payoh North #07-04, Singapour</p>
                <p className="text-gray-500 text-xs mt-1">Les données sont hébergées dans des datacenters situés au sein de l'Union européenne.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments constituant la plateforme FounderAI (textes, graphismes, logiciels, code source,
              algorithmes, prompts système) est la propriété exclusive de DEEP SIGHT CONSULTING et est protégé par les
              lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mt-3">
              Toute reproduction, représentation, diffusion ou utilisation non autorisée, même partielle, est strictement
              interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Limitation de responsabilité</h2>
            <p>
              Les informations et contenus générés par les agents IA de FounderAI sont fournis à titre informatif
              uniquement et ne constituent pas des conseils professionnels (juridiques, financiers, comptables ou autres).
              DEEP SIGHT CONSULTING ne saurait être tenue responsable des décisions prises sur la base de ces contenus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents
              du ressort de la Cour d'appel de Paris seront exclusivement compétents.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <a href="/cgu" className="hover:text-violet-600 transition-colors">Conditions générales d'utilisation</a>
            <span>·</span>
            <a href="/politique-confidentialite" className="hover:text-violet-600 transition-colors">Politique de confidentialité</a>
          </div>

        </div>
      </div>
    </main>
  );
}
