"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Erreur lors de l'envoi. Réessayez.");
      }
    } catch {
      setError("Une erreur inattendue s'est produite.");
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
          <h1 className="mt-6 mb-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 32, lineHeight: 0.82 }}>
            Mot de passe oublié
          </h1>
          <p style={{ color: "var(--uf-muted)" }}>
            Entrez votre email, nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="p-8 text-center" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <p className="text-3xl mb-4">📬</p>
            <p className="font-bold" style={{ color: "var(--uf-ink)" }}>Email envoyé !</p>
            <p className="text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-xs mt-4" style={{ color: "var(--uf-muted-2)" }}>
              Pensez à vérifier vos spams.
            </p>
            <a href="/connexion" className="inline-block mt-6 text-sm font-medium" style={{ color: "var(--uf-orange)" }}>
              ← Retour à la connexion
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@startup.io"
                className="w-full px-4 py-3 text-sm transition-colors focus:outline-none"
                style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 px-4 py-3" style={{ background: "#fef2f2", borderRadius: "var(--uf-r-md)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-[15px] font-medium rounded-full disabled:opacity-60 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              {loading ? "Envoi en cours…" : "Envoyer le lien →"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: "var(--uf-muted)" }}>
          <a href="/connexion" className="font-semibold hover:underline" style={{ color: "var(--uf-orange)" }}>
            ← Retour à la connexion
          </a>
        </p>
      </div>
    </main>
  );
}
