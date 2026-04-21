"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HelpBubble from "../components/HelpBubble";
import TableauDeBord from "../components/TableauDeBord";
import { createBrowserClient } from "@/lib/supabase";

type Tab = "agents" | "tableau" | "documents";
type ActiveView = "strategie" | "vente" | "finance" | "technique" | "operations" | "codir";
type Message = { from: "user" | "agent"; text: string; createdAt?: string };
type StoredDocument = { id: string; name: string; text: string; uploadedAt: string; storage_path?: string; signedUrl?: string };

function groupDocumentsByKind(documents: StoredDocument[]) {
  const pitchDeck: StoredDocument[] = [];
  const businessPlan: StoredDocument[] = [];
  const others: StoredDocument[] = [];

  for (const doc of documents) {
    const normalized = doc.name.toLowerCase();
    if (normalized.includes("pitch") || normalized.includes("deck")) {
      pitchDeck.push(doc);
      continue;
    }
    if (normalized.includes("bp") || normalized.includes("business plan") || normalized.includes("plan")) {
      businessPlan.push(doc);
      continue;
    }
    others.push(doc);
  }

  return { pitchDeck, businessPlan, others };
}

// ─── Données agents (source unique de vérité) ─────────────────────────────────

const AGENTS = [
  {
    key: "strategie" as const,
    agent: "Maya",
    role: "Directrice Stratégie",
    skills: ["Positionnement", "OKR", "Pivot", "Concurrence"],
    emoji: "🧭",
    gradient: "from-violet-500 to-indigo-500",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    ring: "ring-violet-300",
    placeholder: "Ex: Quel marché cibler en priorité pour notre expansion ?",
    suggestions: [
      "Analyser notre positionnement concurrentiel",
      "Définir nos OKR du prochain trimestre",
      "Évaluer une opportunité de pivot",
    ],
  },
  {
    key: "vente" as const,
    agent: "Alex",
    role: "Directeur Commercial",
    skills: ["Go-to-market", "Pipeline", "Pricing", "Acquisition"],
    emoji: "🚀",
    gradient: "from-orange-400 to-pink-500",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    ring: "ring-orange-300",
    placeholder: "Ex: Comment améliorer notre taux de conversion ?",
    suggestions: [
      "Optimiser notre stratégie go-to-market",
      "Revoir notre pricing",
      "Identifier de nouveaux canaux d'acquisition",
    ],
  },
  {
    key: "finance" as const,
    agent: "Sam",
    role: "Directeur Financier",
    skills: ["Runway", "Métriques SaaS", "Levée de fonds", "Burn rate"],
    emoji: "📊",
    gradient: "from-emerald-400 to-teal-500",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-300",
    placeholder: "Ex: Combien de mois de runway nous reste-t-il ?",
    suggestions: [
      "Modéliser notre plan financier 18 mois",
      "Préparer un deck investisseur",
      "Optimiser notre burn rate",
    ],
  },
  {
    key: "technique" as const,
    agent: "Léo",
    role: "Directeur Produit",
    skills: ["Roadmap", "Discovery", "Priorisation", "Build vs buy"],
    emoji: "⚙️",
    gradient: "from-sky-400 to-blue-500",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    ring: "ring-sky-300",
    placeholder: "Ex: Comment prioriser notre roadmap produit ?",
    suggestions: [
      "Revoir notre stratégie de discovery",
      "Prioriser les fonctionnalités Q2",
      "Build vs buy : quelle décision ?",
    ],
  },
  {
    key: "operations" as const,
    agent: "Marc",
    role: "Directeur des Opérations",
    skills: ["OKR", "Recrutement", "Process", "Organisation"],
    emoji: "📋",
    gradient: "from-amber-400 to-orange-500",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-300",
    placeholder: "Ex: Comment structurer mon équipe pour passer à 15 personnes ?",
    suggestions: [
      "Définir nos OKR du trimestre",
      "Structurer le recrutement de notre prochain hire",
      "Mettre en place les rituels d'équipe",
    ],
  },
];

// ─── Types Web Speech API ─────────────────────────────────────────────────────

interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
}
interface ISpeechRecognitionAlternative {
  transcript: string;
}
interface ISpeechRecognitionEvent {
  results: { [index: number]: ISpeechRecognitionAlternative }[];
}
interface ISpeechRecognitionCtor {
  new(): ISpeechRecognition;
}

// ─── Bouton micro (Web Speech API) ───────────────────────────────────────────

function MicButton({ onTranscript, disabled = false }: { onTranscript: (text: string) => void; disabled?: boolean }) {
  const [listening, setListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
    setMounted(true);
  }, []);

  function toggle() {
    if (!supported) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const w = window as unknown as { SpeechRecognition?: ISpeechRecognitionCtor; webkitSpeechRecognition?: ISpeechRecognitionCtor };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition!;
    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) onTranscript(transcript as string);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  // Même arbre serveur / 1er rendu client : évite le mismatch (sans window, supported était false côté SSR mais true côté client).
  if (!mounted) {
    return (
      <div
        className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gray-100 opacity-0 pointer-events-none"
        aria-hidden
      />
    );
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Arrêter l'écoute" : "Dicter un message"}
      className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 ${
        listening
          ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-105"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {listening ? (
        <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.5 9a.75.75 0 0 1 .75.75A7.25 7.25 0 0 1 12.75 18v2.25h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2V18A7.25 7.25 0 0 1 4.75 10.75a.75.75 0 0 1 1.5 0A5.75 5.75 0 0 0 12 16.5a5.75 5.75 0 0 0 5.75-5.75.75.75 0 0 1 .75-.75z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.5 9a.75.75 0 0 1 .75.75A7.25 7.25 0 0 1 12.75 18v2.25h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2V18A7.25 7.25 0 0 1 4.75 10.75a.75.75 0 0 1 1.5 0A5.75 5.75 0 0 0 12 16.5a5.75 5.75 0 0 0 5.75-5.75.75.75 0 0 1 .75-.75z"/>
        </svg>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  activeView,
  onSelect,
}: {
  activeView: ActiveView;
  onSelect: (v: ActiveView) => void;
}) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Agents */}
      <div className="px-3 pt-5 pb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Agents
        </p>
        <div className="space-y-0.5">
          {AGENTS.map((a) => {
            const isActive = activeView === a.key;
            return (
              <button
                key={a.key}
                onClick={() => onSelect(a.key)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? `${a.bg} ${a.border} border`
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-lg flex-shrink-0 shadow-sm ${isActive ? `ring-2 ${a.ring}` : ""}`}
                >
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                    {a.agent}
                  </p>
                  <p className={`text-xs truncate ${isActive ? a.color : "text-gray-400"}`}>
                    {a.role}
                  </p>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 my-3 border-t border-gray-100" />

      {/* CODIR */}
      <div className="px-3 pb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Séance plénière
        </p>
        <button
          onClick={() => onSelect("codir")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            activeView === "codir"
              ? "bg-violet-50 border border-violet-200"
              : "hover:bg-gray-50"
          }`}
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-sm relative ${activeView === "codir" ? "ring-2 ring-violet-300" : ""}`}>
            <div className="flex -space-x-1">
              {["🧭", "🚀"].map((e, i) => (
                <span key={i} className="text-[10px]">{e}</span>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold ${activeView === "codir" ? "text-gray-900" : "text-gray-700"}`}>
              Mode CODIR
            </p>
            <p className={`text-xs truncate ${activeView === "codir" ? "text-violet-600" : "text-gray-400"}`}>
              Les agents délibèrent entre eux
            </p>
          </div>
          {activeView === "codir" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Nudges profil par agent ──────────────────────────────────────────────────

const AGENT_NUDGES: Record<string, { check: (p: Record<string, unknown>) => boolean; message: string }> = {
  strategie: {
    check: (p) => !p.sector || !p.stage || !p.description,
    message: "Pour affiner mes recommandations stratégiques, complétez votre profil — secteur, stade et description m'aident à contextualiser mes conseils.",
  },
  vente: {
    check: (p) => !p.description || !p.business_model,
    message: "Renseignez votre modèle économique et une description de votre startup dans le profil pour que je puisse cibler mes recommandations commerciales.",
  },
  finance: {
    check: (p) => !Array.isArray(p.key_kpis) || (p.key_kpis as unknown[]).length === 0,
    message: "Ajoutez vos KPIs dans le tableau de bord — chiffre d'affaires, burn rate, marge… — pour que je puisse analyser votre situation financière.",
  },
  technique: {
    check: (p) => !p.description,
    message: "Une description de votre produit dans le profil me permettrait de mieux cadrer mes recommandations techniques et produit.",
  },
  operations: {
    check: (p) => !p.team_size || !p.stage,
    message: "Renseignez la taille de votre équipe et le stade de votre startup pour que je puisse adapter mes recommandations organisationnelles.",
  },
};

// ─── Vue conversation unique ──────────────────────────────────────────────────

function ConversationView({
  agent,
  messages,
  onAppend,
  startupId,
  startupProfile,
  autoSendMessage,
  onAutoSendDone,
}: {
  agent: (typeof AGENTS)[0];
  messages: Message[];
  onAppend: (updater: (prev: Message[]) => Message[]) => void;
  startupId: string | null;
  startupProfile?: Record<string, unknown>;
  autoSendMessage?: string | null;
  onAutoSendDone?: () => void;
}) {
  const nudgeDef = AGENT_NUDGES[agent.key];
  const showNudge = messages.length === 0 && nudgeDef && startupProfile && nudgeDef.check(startupProfile);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [intentSuggestion, setIntentSuggestion] = useState<{ suggestion: string; reason: string } | null>(null);
  const [apiWarning, setApiWarning] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Annuler le fetch en cours si on change d'agent
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function openHistory() {
    setShowHistory(true);
    if (!startupId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/chat/history?startupId=${startupId}&agentKey=${agent.key}&days=30`);
      const data = await res.json();
      setHistoryMessages(data.messages ?? []);
    } catch { /* silencieux */ } finally {
      setHistoryLoading(false);
    }
  }

  // Auto-envoi du message d'onboarding — attend que startupId soit chargé
  const autoSendFired = useRef(false);
  useEffect(() => {
    if (autoSendMessage && startupId && !autoSendFired.current) {
      autoSendFired.current = true;
      onAutoSendDone?.();
      sendMessage(autoSendMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading || streaming) return;
    onAppend((prev) => [...prev, { from: "user", text }]);
    setIntentSuggestion(null);
    setApiWarning("");
    setInput("");
    setLoading(true);

    // Détection d'intention en parallèle
    fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, agentKey: agent.key }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestion && data.suggestion !== "same") {
          setIntentSuggestion(data);
        }
      })
      .catch(() => {});

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentKey: agent.key,
          message: text,
          ...(startupId ? { startupId } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({} as { error?: string }));
        const warning =
          payload.error ??
          (res.status === 429
            ? "Limite d'utilisation atteinte pour votre licence."
            : "Erreur de connexion à l'agent.");
        setApiWarning(warning);
        onAppend((prev) => [...prev, { from: "agent", text: warning }]);
        return;
      }

      setLoading(false);
      setStreaming(true);
      onAppend((prev) => [...prev, { from: "agent", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              onAppend((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  from: "agent",
                  text: updated[updated.length - 1].text + event.text,
                };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        onAppend((prev) => [...prev, { from: "agent", text: "Une erreur s'est produite." }]);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header conversation */}
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-xl shadow-sm`}>
          {agent.emoji}
        </div>
        <div>
          <h2 className="font-black text-gray-900 text-base leading-tight">{agent.agent}</h2>
          <p className={`text-xs font-semibold ${agent.color}`}>{agent.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {startupId && (
            <button
              onClick={openHistory}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 px-3 py-1.5 rounded-lg transition-all"
            >
              🕐 Historique
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">En ligne</span>
          </div>
        </div>
      </div>

      {/* Modal historique */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm`}>
                  {agent.emoji}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{agent.agent} — Historique</h3>
                  <p className="text-xs text-gray-400">30 derniers jours</p>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {historyLoading && (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-6 h-6 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
              {!historyLoading && historyMessages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-12">Aucune conversation dans les 30 derniers jours.</p>
              )}
              {!historyLoading && historyMessages.length > 0 && (() => {
                let lastDate = "";
                return historyMessages.map((msg, i) => {
                  const date = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
                    : "";
                  const showDate = date && date !== lastDate;
                  if (showDate) lastDate = date;
                  return (
                    <div key={i}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-3">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-xs font-semibold text-gray-400 capitalize">{date}</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      )}
                      <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.from === "user"
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {apiWarning && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold">
          ⚠️ {apiWarning}
        </div>
      )}

      {/* Banner intention */}
      {intentSuggestion && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2.5 flex-shrink-0">
          <span className="text-base flex-shrink-0">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">
              {intentSuggestion.suggestion === "codir"
                ? "Question transversale — le mode CODIR serait plus adapté"
                : `Cette question semble relever de l'agent ${intentSuggestion.suggestion}`}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{intentSuggestion.reason}</p>
          </div>
          <button onClick={() => setIntentSuggestion(null)} className="text-amber-400 hover:text-amber-600 text-sm flex-shrink-0">×</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Suggestions pour démarrer
            </p>
            {agent.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className={`w-full max-w-md text-left text-sm px-4 py-3 rounded-2xl ${agent.bg} border ${agent.border} hover:opacity-80 transition-opacity text-gray-700 font-medium`}
              >
                {s}
              </button>
            ))}
            {/* Skills */}
            <div className="pt-4 flex flex-wrap gap-2">
              {agent.skills.map((s) => (
                <span key={s} className={`text-xs font-semibold px-3 py-1 rounded-full ${agent.bg} ${agent.color}`}>
                  {s}
                </span>
              ))}
            </div>

            {/* Nudge profil */}
            {showNudge && (
              <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 max-w-md">
                <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-800 mb-1">Pour de meilleurs conseils</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{nudgeDef.message}</p>
                  <a
                    href="/dashboard?tab=tableau"
                    className="inline-block mt-2 text-xs font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900"
                  >
                    Compléter le profil →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "agent" && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                {agent.emoji}
              </div>
            )}
            <div className={`max-w-[72%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {msg.from === "agent" && (
                <span className={`text-xs font-bold ${agent.color} ml-1`}>{agent.agent}</span>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.from === "user"
                  ? `bg-gradient-to-br ${agent.gradient} text-white rounded-br-sm`
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
              }`}>
                {msg.text}
                {streaming && i === messages.length - 1 && msg.from === "agent" && (
                  <span className="inline-block w-0.5 h-3.5 bg-gray-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
              {agent.emoji}
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={agent.placeholder}
            className="flex-1 text-sm border-2 border-gray-200 focus:border-violet-400 focus:outline-none rounded-2xl px-4 py-3 placeholder-gray-400 text-gray-900 transition-colors"
          />
          <MicButton
            onTranscript={(text) => setInput((prev) => prev ? `${prev} ${text}` : text)}
            disabled={loading || streaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || streaming}
            className={`bg-gradient-to-br ${agent.gradient} text-white px-5 py-3 rounded-2xl font-bold text-sm disabled:opacity-40 transition-opacity flex-shrink-0 shadow-sm`}
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Vue CODIR ────────────────────────────────────────────────────────────────

const AGENT_META: Record<string, { agent: string; emoji: string; color: string; gradient: string; label: string }> = {
  strategie: { agent: "Maya",  emoji: "🧭", color: "text-violet-400", gradient: "from-violet-500 to-indigo-500", label: "Stratégie" },
  vente:     { agent: "Alex",  emoji: "🚀", color: "text-orange-400", gradient: "from-orange-400 to-pink-500",  label: "Commercial" },
  finance:   { agent: "Sam",   emoji: "📊", color: "text-emerald-400", gradient: "from-emerald-400 to-teal-500", label: "Finance" },
  technique:  { agent: "Léo",  emoji: "⚙️", color: "text-sky-400",    gradient: "from-sky-400 to-blue-500",     label: "Produit" },
  operations: { agent: "Marc", emoji: "📋", color: "text-amber-400",  gradient: "from-amber-400 to-orange-500", label: "Opérations" },
};
const AGENT_KEYS = ["strategie", "vente", "finance", "technique", "operations"] as const;

type CodirPhase = "idle" | "dispatching" | "synthesizing" | "manager" | "done" | "error";
interface AgentResult { agentKey: string; content: string }

function CodirView({ startupId }: { startupId: string | null }) {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<CodirPhase>("idle");
  const [agentsDone, setAgentsDone] = useState<Set<string>>(new Set());
  const [agentsStarted, setAgentsStarted] = useState<Set<string>>(new Set());
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [synthStreamed, setSynthStreamed] = useState("");
  const [managerStreamed, setManagerStreamed] = useState("");
  const [analyses, setAnalyses] = useState<AgentResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  function reset() {
    setPhase("idle");
    setAgentsDone(new Set());
    setAgentsStarted(new Set());
    setExpandedAgent(null);
    setSynthStreamed("");
    setManagerStreamed("");
    setAnalyses([]);
    setErrorMsg("");
  }

  async function startCodir() {
    if (!topic.trim() || phase !== "idle") return;
    reset();
    setPhase("dispatching");

    try {
      const res = await fetch("/api/codir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: topic, ...(startupId ? { startupId } : {}) }),
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({} as { error?: string }));
        setErrorMsg(
          payload.error ??
            (res.status === 429
              ? "Limite d'utilisation atteinte pour votre licence."
              : "Erreur de connexion à l'API.")
        );
        setPhase("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            handleEvent(event);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      setErrorMsg(String(err));
      setPhase("error");
    }
  }

  function handleEvent(event: Record<string, unknown>) {
    switch (event.type) {
      case "agent_start":
        setAgentsStarted((prev) => new Set([...prev, event.agentKey as string]));
        break;
      case "agent_done":
      case "agent_error":
        setAgentsDone((prev) => new Set([...prev, event.agentKey as string]));
        break;
      case "synthesis_start":
        setPhase("synthesizing");
        break;
      case "manager_start":
        setPhase("manager");
        break;
      case "text":
        if (event.phase === "manager") {
          setManagerStreamed((prev) => prev + (event.text as string));
        } else {
          setSynthStreamed((prev) => prev + (event.text as string));
        }
        break;
      case "done":
        setAnalyses((event.analyses as AgentResult[]) ?? []);
        setPhase("done");
        break;
      case "error":
        setErrorMsg(event.message as string);
        setPhase("error");
        break;
    }
  }

  const isBusy = phase === "dispatching" || phase === "synthesizing" || phase === "manager";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-sm">
          <span className="text-lg">🏛️</span>
        </div>
        <div>
          <h2 className="font-black text-gray-900 text-base leading-tight">Mode CODIR</h2>
          <p className="text-xs font-semibold text-violet-600">Les agents délibèrent entre eux</p>
        </div>
        {isBusy && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {phase === "manager" ? "Victor délibère…" : "En séance…"}
          </span>
        )}
        {phase === "done" && (
          <button onClick={reset} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
            Nouvelle séance
          </button>
        )}
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startCodir()}
            disabled={isBusy}
            placeholder="Ex : Faut-il lever maintenant ou attendre un meilleur MRR ?"
            className="flex-1 border-2 border-gray-200 focus:border-violet-400 focus:outline-none rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors disabled:opacity-50 bg-white"
          />
          <MicButton
            onTranscript={(text) => setTopic((prev) => prev ? `${prev} ${text}` : text)}
            disabled={isBusy}
          />
          <button
            onClick={startCodir}
            disabled={!topic.trim() || isBusy}
            className="bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-40 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all whitespace-nowrap shadow-sm"
          >
            Lancer →
          </button>
        </div>

        {/* Dispatch */}
        {(phase === "dispatching" || phase === "synthesizing" || phase === "done") && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {AGENT_KEYS.map((key) => {
              const m = AGENT_META[key];
              const done = agentsDone.has(key);
              const started = agentsStarted.has(key);
              return (
                <div key={key} className={`bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2 border transition-all ${done ? "border-emerald-200" : "border-gray-100"}`}>
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-xs flex-shrink-0`}>
                    {m.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{m.agent}</p>
                    <p className={`text-xs ${done ? "text-emerald-500" : started ? "text-amber-500" : "text-gray-400"}`}>
                      {done ? "✓ prêt" : started ? "analyse…" : "en attente"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Synthèse streaming */}
        {(phase === "synthesizing" || phase === "manager" || phase === "done") && synthStreamed && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-black text-violet-600 uppercase tracking-wider">Synthèse CODIR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {synthStreamed}
                {phase === "synthesizing" && (
                  <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                )}
              </p>
            </div>
          </div>
        )}

        {/* Victor — Startup Manager */}
        {(phase === "manager" || phase === "done") && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Startup Manager</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-zinc-800 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">🎯</div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">Victor</p>
                  <p className="text-slate-400 text-xs font-semibold">Startup Manager</p>
                </div>
              </div>
              <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-line">
                {managerStreamed}
                {phase === "manager" && (
                  <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
                )}
              </p>
            </div>
          </div>
        )}

        {/* Analyses individuelles */}
        {phase === "done" && analyses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Analyses individuelles</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="space-y-2">
              {analyses.map((a) => {
                const m = AGENT_META[a.agentKey] ?? { agent: a.agentKey, emoji: "🤖", color: "text-gray-500", gradient: "from-gray-400 to-gray-500", label: a.agentKey };
                return (
                  <div key={a.agentKey} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedAgent(expandedAgent === a.agentKey ? null : a.agentKey)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                        {m.emoji}
                      </div>
                      <span className={`text-sm font-black ${m.color}`}>{m.agent}</span>
                      <span className="text-xs text-gray-400 ml-1">{m.label}</span>
                      <span className={`ml-auto text-gray-400 text-xs transition-transform ${expandedAgent === a.agentKey ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {expandedAgent === a.agentKey && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{a.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Erreur */}
        {phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
            {errorMsg || "Une erreur s'est produite."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("agents");
  const [activeView, setActiveView] = useState<ActiveView>("strategie");
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [startupId, setStartupId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [descSaving, setDescSaving] = useState(false);
  const [descSaved, setDescSaved] = useState(false);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState("starter");
  const [startupProfile, setStartupProfile] = useState<Record<string, unknown>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ startupId: id, isSuperAdmin: isAdmin, plan }) => {
        if (id) {
          localStorage.setItem("founderai_startup_id", id);
          setStartupId(id);
          loadDescription(id);
        }
        if (isAdmin) setIsSuperAdmin(true);
        if (plan) setUserPlan(plan);
      })
      .catch(() => {
        const stored = localStorage.getItem("founderai_startup_id");
        if (stored) { setStartupId(stored); loadDescription(stored); }
      });

    // Onglet initial depuis l'URL (?tab=documents)
    const urlTab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (urlTab && ["agents", "tableau", "documents"].includes(urlTab)) setTab(urlTab);

    // Onboarding : agent et message à auto-envoyer
    const onboardingAgent = sessionStorage.getItem("founderai_onboarding_agent");
    const onboardingMessage = sessionStorage.getItem("founderai_onboarding_message");
    if (onboardingAgent) {
      setActiveView(onboardingAgent as ActiveView);
      sessionStorage.removeItem("founderai_onboarding_agent");
    }
    if (onboardingMessage) {
      setOnboardingMessage(onboardingMessage);
      sessionStorage.removeItem("founderai_onboarding_message");
    }
  }, []);

  async function loadDescription(id: string) {
    try {
      const res = await fetch(`/api/startup?startupId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
        if (data.documents) setDocuments(data.documents as StoredDocument[]);
        if (data.partners?.name) setPartnerName(data.partners.name);
        setStartupProfile(data);
      }
    } catch { /* silencieux */ }
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !startupId || uploading) return;
    e.target.value = "";

    setUploading(true);
    try {
      const form = new FormData();
      form.append("startupId", startupId);
      form.append("file", file);
      const res = await fetch("/api/startup/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.document) {
        setDocuments((prev) => [...prev, data.document as StoredDocument]);
      }
    } catch { /* silencieux */ } finally {
      setUploading(false);
    }
  }, [startupId, uploading]);

  const deleteDocument = useCallback(async (docId: string) => {
    if (!startupId) return;
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    try {
      await fetch(`/api/startup/upload?startupId=${startupId}&docId=${docId}`, { method: "DELETE" });
    } catch { /* silencieux */ }
  }, [startupId]);

  async function saveDescription() {
    if (!startupId || !description.trim() || descSaving) return;
    setDescSaving(true);
    setDescSaved(false);
    try {
      await fetch("/api/startup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, description }),
      });
      setDescSaved(true);
      setTimeout(() => setDescSaved(false), 2500);
    } catch { /* silencieux */ } finally {
      setDescSaving(false);
    }
  }

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    localStorage.removeItem("founderai_startup_id");
    window.location.href = "/connexion";
  }

  // Charger les 7 derniers jours de messages quand on ouvre un agent pour la première fois
  useEffect(() => {
    if (!startupId || !activeView || activeView === "codir") return;
    if (allMessages[activeView]?.length) return; // déjà chargé
    fetch(`/api/chat/history?startupId=${startupId}&agentKey=${activeView}&days=7`)
      .then((r) => r.json())
      .then((data) => {
        const msgs: Message[] = data.messages ?? [];
        if (msgs.length > 0) {
          setAllMessages((prev) => ({
            ...prev,
            [activeView]: prev[activeView]?.length ? prev[activeView] : msgs,
          }));
        }
      })
      .catch(() => {});
  }, [activeView, startupId]); // eslint-disable-line react-hooks/exhaustive-deps

  function appendMessages(agentKey: string, updater: (prev: Message[]) => Message[]) {
    setAllMessages((prev) => ({
      ...prev,
      [agentKey]: updater(prev[agentKey] ?? []),
    }));
  }

  const activeAgent = AGENTS.find((a) => a.key === activeView);
  const docGroups = groupDocumentsByKind(documents);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <header className="flex-shrink-0 z-10" style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
            <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
          </a>

          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: "var(--uf-paper-2)" }}>
            <button
              onClick={() => setTab("agents")}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all" style={{
                background: tab === "agents" ? "var(--uf-card)" : "transparent",
                color: tab === "agents" ? "var(--uf-ink)" : "var(--uf-muted)",
                border: tab === "agents" ? "1px solid var(--uf-line)" : "1px solid transparent",
              }}
            >
              Mon équipe
            </button>
            <button
              onClick={() => setTab("tableau")}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all" style={{
                background: tab === "tableau" ? "var(--uf-card)" : "transparent",
                color: tab === "tableau" ? "var(--uf-ink)" : "var(--uf-muted)",
                border: tab === "tableau" ? "1px solid var(--uf-line)" : "1px solid transparent",
              }}
            >
              Mon tableau de bord
            </button>
            <button
              onClick={() => setTab("documents")}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all" style={{
                background: tab === "documents" ? "var(--uf-card)" : "transparent",
                color: tab === "documents" ? "var(--uf-ink)" : "var(--uf-muted)",
                border: tab === "documents" ? "1px solid var(--uf-line)" : "1px solid transparent",
              }}
            >
              Mes documents
            </button>
            {isSuperAdmin && (
              <a
                href="/admin"
                className="px-4 py-1.5 rounded-lg text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Admin
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">4 agents actifs</span>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Corps */}
      {tab === "agents" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeView={activeView} onSelect={setActiveView} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Description du projet */}
            <div className="bg-white border-b border-violet-100 px-5 pt-3 pb-2 flex-shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Description du projet
              </p>
              <div className="flex items-start gap-3">
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-violet-400 text-base flex-shrink-0">✦</span>
                  <textarea
                    rows={1}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre projet — vos agents s'en serviront comme contexte…"
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none bg-transparent leading-relaxed"
                    style={{ minHeight: "1.5rem", maxHeight: "4rem", overflow: "auto" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 64) + "px";
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {descSaved && (
                    <span className="text-xs text-emerald-600 font-semibold">✓ Sauvegardé</span>
                  )}
                  {/* Bouton attacher un document */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !startupId}
                    title="Joindre un document (PDF, TXT, MD, CSV)"
                    className="text-gray-400 hover:text-violet-600 disabled:opacity-40 transition-colors p-1.5 rounded-lg hover:bg-violet-50"
                  >
                    {uploading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={saveDescription}
                    disabled={!description.trim() || descSaving || !startupId}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700 disabled:opacity-40 transition-colors px-3 py-1.5 bg-violet-50 hover:bg-violet-100 rounded-lg"
                  >
                    {descSaving ? "…" : "Envoyer aux agents"}
                  </button>
                </div>
              </div>

              {/* Documents joints */}
              {documents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 pl-7">
                  {documents.map((doc) => (
                    <span
                      key={doc.id}
                      className="inline-flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-2.5 py-1 font-medium"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {doc.name}
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-violet-400 hover:text-red-500 transition-colors ml-0.5"
                        title="Supprimer ce document"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {activeView === "codir" ? (
              <CodirView startupId={startupId} />
            ) : activeAgent ? (
              <ConversationView
                key={activeView}
                agent={activeAgent}
                messages={allMessages[activeView] ?? []}
                onAppend={(updater) => appendMessages(activeView, updater)}
                startupId={startupId}
                startupProfile={startupProfile}
                autoSendMessage={onboardingMessage}
                onAutoSendDone={() => setOnboardingMessage(null)}
              />
            ) : null}
          </div>
        </div>
      ) : tab === "tableau" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Mon tableau de bord</h1>
              <p className="text-gray-500 mt-1">Profil de votre startup, KPIs, décisions et problématiques en cours.</p>
            </div>
            <TableauDeBord startupId={startupId} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Mes documents</h1>
                <p className="text-gray-500 mt-1">
                  Retrouvez ici vos pitch decks, business plans et autres documents utilises par les agents.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !startupId}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
                >
                  {uploading ? "Import..." : "Ajouter un document"}
                </button>
              </div>
            </div>

            {documents.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl px-6 py-12 text-center">
                <p className="text-4xl mb-2">📄</p>
                <p className="text-gray-600 font-semibold">Aucun document pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez un pitch deck, un BP ou tout autre document pour enrichir votre projet.
                </p>
              </div>
            )}

            {documents.length > 0 && (
              <div className="space-y-6">
                <DocumentSection
                  title="Pitch decks"
                  emoji="🚀"
                  docs={docGroups.pitchDeck}
                  onDelete={deleteDocument}
                />
                <DocumentSection
                  title="Business plans (BP)"
                  emoji="📈"
                  docs={docGroups.businessPlan}
                  onDelete={deleteDocument}
                />
                <DocumentSection
                  title="Autres documents"
                  emoji="🗂️"
                  docs={docGroups.others}
                  onDelete={deleteDocument}
                />
              </div>
            )}

            <div className="mt-8 space-y-6">
              <TemplateSection
                title="Modèles suggérés par Founder AI"
                emoji="✨"
                plan={userPlan}
                templates={ALL_TEMPLATES}
              />
              {partnerName && (
                <TemplateSection
                  title={`Modèles suggérés par ${partnerName}`}
                  emoji="🤝"
                  templates={[]}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <HelpBubble />
    </div>
  );
}

function DocumentSection({
  title,
  emoji,
  docs,
  onDelete,
}: {
  title: string;
  emoji: string;
  docs: StoredDocument[];
  onDelete: (docId: string) => void;
}) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span>{emoji}</span>
        <h2 className="text-sm font-black text-gray-800">{title}</h2>
        <span className="ml-auto text-xs text-gray-400 font-semibold">{docs.length}</span>
      </div>
      {docs.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400">Aucun document dans cette categorie.</p>
      ) : (
        <div>
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="px-5 py-3.5 border-b border-gray-50 last:border-b-0 flex items-center gap-3"
            >
              <span className="text-lg">📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">
                  Ajouté le {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {doc.signedUrl && (
                <a
                  href={doc.signedUrl}
                  download={doc.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-500 hover:text-violet-700 transition-colors"
                  title="Télécharger ce document"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}
              <button
                onClick={() => onDelete(doc.id)}
                className="text-gray-300 hover:text-red-500 transition-colors text-sm font-bold"
                title="Supprimer ce document"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type DocumentTemplate = {
  name: string;
  description: string;
  emoji: string;
  requiredPlan: "starter" | "growth" | "scale";
};

const ALL_TEMPLATES: DocumentTemplate[] = [
  { emoji: "🎨", name: "Lean Canvas",                    description: "Modélisez votre business model en une page.",                    requiredPlan: "starter" },
  { emoji: "⚡", name: "MVP",                            description: "Cadrage et scope de votre produit minimum viable.",              requiredPlan: "starter" },
  { emoji: "🚀", name: "Pitch Deck Seed",                description: "Structure en 10 slides pour lever en early-stage.",             requiredPlan: "starter" },
  { emoji: "📈", name: "BP Seed",                        description: "Business plan simplifié pour votre première levée.",            requiredPlan: "starter" },
  { emoji: "🎯", name: "Positionnement et compétition",  description: "Analyse concurrentielle et différenciation marché.",            requiredPlan: "growth"  },
  { emoji: "🗺️", name: "Product Roadmap Builder",        description: "Template de roadmap trimestrielle orientée impact.",            requiredPlan: "growth"  },
  { emoji: "💼", name: "Sales Strategy",                 description: "Stratégie commerciale, pipeline et canaux d'acquisition.",      requiredPlan: "growth"  },
  { emoji: "🔒", name: "IP Strategy",                    description: "Stratégie de propriété intellectuelle et brevets.",             requiredPlan: "growth"  },
  { emoji: "🏗️", name: "Operating System Canvas",        description: "Modèle opérationnel pour scaler votre organisation.",          requiredPlan: "scale"   },
  { emoji: "🎯", name: "OKR Planner",                     description: "Définissez vos Objectives & Key Results par trimestre.",        requiredPlan: "scale"   },
  { emoji: "📊", name: "Pitch Deck Série A",             description: "Structure investisseurs pour une levée Série A.",               requiredPlan: "scale"   },
  { emoji: "📋", name: "BP Série A",                     description: "Business plan complet pour une levée Série A.",                 requiredPlan: "scale"   },
];

const PLAN_ORDER: Record<string, number> = { starter: 0, growth: 1, scale: 2 };

function isTemplateAvailable(template: DocumentTemplate, userPlan: string): boolean {
  return (PLAN_ORDER[userPlan] ?? 0) >= PLAN_ORDER[template.requiredPlan];
}

const PLAN_LABELS: Record<string, string> = { starter: "Starter", growth: "Growth", scale: "Scale" };

const TEMPLATE_ROUTES: Record<string, string> = {
  "Lean Canvas": "/dashboard/modeles/lean-canvas",
  "MVP": "/dashboard/modeles/mvp",
  "Pitch Deck Seed": "/dashboard/modeles/pitch-deck-seed",
};

function TemplateSection({
  title,
  emoji,
  templates,
  plan,
}: {
  title: string;
  emoji: string;
  templates: DocumentTemplate[];
  plan?: string;
}) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span>{emoji}</span>
        <h2 className="text-sm font-black text-gray-800">{title}</h2>
        {plan && (
          <span className="ml-auto text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
            {PLAN_LABELS[plan] ?? plan}
          </span>
        )}
      </div>
      {templates.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400">Aucun modèle disponible pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 p-4">
          {templates.map((t) => {
            const available = plan ? isTemplateAvailable(t, plan) : true;
            const route = TEMPLATE_ROUTES[t.name];
            return (
              <div
                key={t.name}
                onClick={() => available && route && (window.location.href = route)}
                className={`relative flex items-start gap-3 border rounded-xl px-4 py-3 transition-colors ${
                  available && route
                    ? "border-gray-100 hover:border-violet-200 hover:bg-violet-50 cursor-pointer"
                    : available
                    ? "border-gray-100 hover:border-gray-200 cursor-default"
                    : "border-gray-100 cursor-default"
                }`}
              >
                <span className={`text-2xl shrink-0 ${!available ? "opacity-40" : ""}`}>{t.emoji}</span>
                <div className={!available ? "opacity-40" : ""}>
                  <p className="text-sm font-bold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                </div>
                {!available && (
                  <div className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-end pr-3">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                      🔒 Forfait {PLAN_LABELS[t.requiredPlan]}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
