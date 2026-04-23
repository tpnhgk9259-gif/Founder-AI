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
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError("Configuration Supabase manquante. Contactez l'administrateur.");
        return;
      }

      const supabase = createBrowserClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(`Email ou mot de passe incorrect. (${signInError.message})`);
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

      // Récupérer le profil — ne pas bloquer le login si ça échoue
      let startupId: string | null = null;
      let isPartnerAdmin = false;
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          startupId = data.startupId ?? null;
          isPartnerAdmin = Boolean(data.isPartnerAdmin);
        }
      } catch (meErr) {
        console.warn("[connexion] /api/auth/me indisponible :", meErr);
      }

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

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[connexion] Erreur :", err);
      setError(`Une erreur inattendue s'est produite. ${err instanceof Error ? err.message : ""}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--uf-paper)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2.5 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
            <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
          </a>
          <h1 className="mt-6 mb-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 40, lineHeight: 0.82 }}>
            Bon retour
          </h1>
          <p style={{ color: "var(--uf-muted)" }}>
            Vos agents vous attendent.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="marie@startup.io"
              className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm transition-colors focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--uf-r-md)" }}>
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <a href="/mot-de-passe-oublie" className="text-xs hover:underline" style={{ color: "var(--uf-orange)" }}>
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-[15px] font-medium rounded-full disabled:opacity-60 hover:-translate-y-px transition-transform"
            style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
          >
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--uf-muted)" }}>
          Pas encore de compte ?{" "}
          <a href="/inscription" className="font-semibold hover:underline" style={{ color: "var(--uf-orange)" }}>
            Créer un compte
          </a>
        </p>
        <p className="text-center text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
          Partenaire (incubateur, fonds…) ?{" "}
          <a href="/partenaires/inscription" className="font-semibold hover:underline" style={{ color: "var(--uf-orange)" }}>
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
