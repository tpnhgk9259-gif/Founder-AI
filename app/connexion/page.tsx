"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

function ConnexionForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      const supabase = createBrowserClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      const rawRedirect = searchParams.get("redirect");
      const safeRedirect =
        rawRedirect &&
        rawRedirect.startsWith("/") &&
        !rawRedirect.startsWith("//") &&
        !rawRedirect.includes("://")
          ? rawRedirect
          : null;

      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const { startupId, isPartnerAdmin } = await res.json();
        if (safeRedirect) {
          window.location.href = safeRedirect;
          return;
        }
        if (startupId) {
          localStorage.setItem("founderai_startup_id", startupId);
          window.location.href = "/dashboard";
          return;
        }
        if (isPartnerAdmin) {
          window.location.href = "/partner";
          return;
        }
      }

      window.location.href = safeRedirect ?? "/dashboard";
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="text-2xl font-black text-gray-900">
            Founder<span className="text-violet-600">AI</span>
          </a>
          <h1 className="text-3xl font-black text-gray-900 mt-6 mb-2">
            Bon retour !
          </h1>
          <p className="text-gray-500">
            Vos agents vous attendent.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8 space-y-5"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="marie@startup.io"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
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
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-violet-200"
          >
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <a href="/inscription" className="font-semibold text-violet-600 hover:underline">
            Créer un compte
          </a>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Partenaire (incubateur, fonds…) ?{" "}
          <a href="/partenaires/inscription" className="font-semibold text-violet-600 hover:underline">
            Inscription partenaire
          </a>
        </p>
      </div>
    </main>
  );
}

export default function Connexion() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </main>
      }
    >
      <ConnexionForm />
    </Suspense>
  );
}
