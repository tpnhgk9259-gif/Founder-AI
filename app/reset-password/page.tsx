"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createBrowserClient();

      // Extraire les tokens du hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        // Établir la session manuellement
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!sessionError) {
          setReady(true);
          // Nettoyer le hash de l'URL
          window.history.replaceState(null, "", "/reset-password");
        }
      } else {
        // Vérifier si on a déjà une session
        const { data } = await supabase.auth.getSession();
        if (data.session) setReady(true);
      }

      setChecking(false);
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("8 caractères minimum"); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setDone(true);
      }
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--uf-paper)" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--uf-line)", borderTopColor: "var(--uf-orange)" }} />
      </main>
    );
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
            Nouveau mot de passe
          </h1>
        </div>

        {done ? (
          <div className="p-8 text-center" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <p className="text-3xl mb-4">✅</p>
            <p className="font-bold" style={{ color: "var(--uf-ink)" }}>Mot de passe modifié !</p>
            <p className="text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <a href="/connexion" className="inline-block mt-6 px-6 py-3 rounded-full text-sm font-medium" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              Se connecter →
            </a>
          </div>
        ) : !ready ? (
          <div className="p-8 text-center" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <p className="text-3xl mb-4">⏳</p>
            <p className="font-bold" style={{ color: "var(--uf-ink)" }}>Lien invalide ou expiré</p>
            <p className="text-sm mt-2" style={{ color: "var(--uf-muted)" }}>
              Ce lien de réinitialisation n&apos;est plus valide. Demandez-en un nouveau.
            </p>
            <a href="/mot-de-passe-oublie" className="inline-block mt-6 px-6 py-3 rounded-full text-sm font-medium" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              Demander un nouveau lien →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>
                Nouveau mot de passe
              </label>
              <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum"
                className="w-full px-4 py-3 text-sm transition-colors focus:outline-none"
                style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium" style={{ color: "var(--uf-ink)" }}>
                Confirmer le mot de passe
              </label>
              <input id="confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Répétez le mot de passe"
                className="w-full px-4 py-3 text-sm transition-colors focus:outline-none"
                style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>

            {error && (
              <p className="text-sm text-red-600 px-4 py-3" style={{ background: "#fef2f2", borderRadius: "var(--uf-r-md)" }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 text-[15px] font-medium rounded-full disabled:opacity-60 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              {loading ? "Modification…" : "Changer le mot de passe →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
