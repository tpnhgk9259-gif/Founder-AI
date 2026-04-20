"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("founderai_cookies_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("founderai_cookies_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <p className="text-sm text-gray-300 flex-1">
          FounderAI utilise uniquement des cookies strictement nécessaires à son fonctionnement
          (authentification, préférences). Aucun cookie publicitaire ni traceur tiers.{" "}
          <a href="/politique-confidentialite" className="text-violet-400 hover:underline">
            En savoir plus
          </a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-violet-600 hover:bg-violet-500 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          J'accepte
        </button>
      </div>
    </div>
  );
}
