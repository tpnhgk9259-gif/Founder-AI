"use client";

import { useState } from "react";

const ORGANIZATION_TYPES = [
  { value: "incubator", label: "Incubateur" },
  { value: "studio", label: "Startup studio" },
  { value: "fund", label: "Fonds d'investissement" },
  { value: "accelerator", label: "Accélérateur" },
  { value: "other", label: "Autre" },
] as const;

export default function PartenaireInscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const firstName = data.get("prenom") as string;
    const lastName = data.get("nom") as string;
    const email = data.get("email") as string;
    const phone = data.get("telephone") as string;
    const password = data.get("password") as string;
    const organizationName = data.get("organisation") as string;
    const organizationType = data.get("type_organisation") as string;

    try {
      const res = await fetch("/api/auth/partner-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          password,
          firstName,
          lastName,
          organizationName,
          organizationType,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const hint =
          json.details && typeof json.details === "string"
            ? ` (${json.details})`
            : "";
        setError((json.error ?? "Erreur lors de la création du compte.") + hint);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🏢
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Demande bien recue
          </h2>
          <p className="text-gray-500 mb-8">
            Nous avons bien reçu votre demande de création de compte, notre service
            commercial va prendre très rapidement contact avec vous.
          </p>
          <a
            href="/"
            className="block bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition-opacity"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <a href="/" className="text-2xl font-black text-gray-900">
            Founder<span className="text-indigo-600">AI</span>
          </a>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mt-6 mb-2">
            Partenaires
          </p>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Créer un compte partenaire
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            Incubateurs, studios, fonds ou accélérateurs : gérez votre portefeuille et
            adaptez les agents à votre programme.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8 space-y-5"
        >
          <div className="space-y-1.5">
            <label htmlFor="organisation" className="text-sm font-semibold text-gray-700">
              Nom de l&apos;organisation
            </label>
            <input
              id="organisation"
              name="organisation"
              type="text"
              required
              placeholder="ex : Station F, Partech, Bpifrance…"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="type_organisation" className="text-sm font-semibold text-gray-700">
              Type d&apos;organisation
            </label>
            <select
              id="type_organisation"
              name="type_organisation"
              required
              defaultValue="incubator"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 bg-white transition-colors"
            >
              {ORGANIZATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prenom" className="text-sm font-semibold text-gray-700">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                placeholder="Marie"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                placeholder="Dupont"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email professionnel
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="marie@structure.com"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telephone" className="text-sm font-semibold text-gray-700">
              Numéro de téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+33 6 12 34 56 78"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              8 caractères minimum — même règles que pour un compte fondateur.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-all hover:scale-[1.01] shadow-lg shadow-indigo-200/60 mt-2"
          >
            {loading ? "Création en cours…" : "Devenir partenaire"}
          </button>

          <p className="text-xs text-gray-400 text-center pt-1">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="underline hover:text-gray-600">
              CGU
            </a>{" "}
            et notre{" "}
            <a href="#" className="underline hover:text-gray-600">
              politique de confidentialité
            </a>
            .
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Compte startup / fondateur ?{" "}
          <a href="/inscription" className="font-semibold text-indigo-600 hover:underline">
            Inscription fondateur
          </a>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Déjà un compte ?{" "}
          <a href="/connexion" className="font-semibold text-indigo-600 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
