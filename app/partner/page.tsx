"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentNames {
  strategie: string;
  vente: string;
  finance: string;
  technique: string;
  operations: string;
}

interface ManagerPersona {
  name: string;
  title: string;
  emoji: string;
  style: string;
  prompt_extra: string;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  active: boolean;
  license_config?: {
    portfolio_plan_allowances?: { starter: number; growth: number; scale: number };
  };
  agent_names: AgentNames;
  manager_persona: ManagerPersona;
  max_custom_agents: number;
  created_at: string;
}

interface PartnerMember {
  id: string;
  email: string;
  role: string;
  user_id: string | null;
  invited_at: string;
  granted_plan: "starter" | "growth" | "scale";
  startup: { id: string; name: string | null } | null;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const AGENT_META = {
  strategie: { label: "Stratégie", role: "Directrice Stratégie", emoji: "🧭", gradient: "from-violet-500 to-indigo-500" },
  vente:     { label: "Commercial", role: "Directeur Commercial", emoji: "🚀", gradient: "from-orange-400 to-pink-500" },
  finance:   { label: "Finance", role: "Directeur Financier", emoji: "📊", gradient: "from-emerald-400 to-teal-500" },
  technique:  { label: "Produit & Tech", role: "Chief Product Officer",     emoji: "⚙️", gradient: "from-sky-400 to-blue-500" },
  operations: { label: "Opérations",    role: "Directeur des Opérations", emoji: "📋", gradient: "from-amber-400 to-orange-500" },
} as const;

type AgentKey = keyof typeof AGENT_META;

const PARTNER_TYPES = [
  { value: "incubator", label: "Incubateur" },
  { value: "studio",    label: "Startup Studio" },
  { value: "fund",      label: "Fonds d'investissement" },
  { value: "accelerator", label: "Accélérateur" },
  { value: "other",     label: "Autre" },
];

const DEFAULT_AGENT_NAMES: AgentNames = { strategie: "Maya", vente: "Alex", finance: "Sam", technique: "Léo", operations: "Marc" };
const DEFAULT_MANAGER: ManagerPersona = {
  name: "Victor",
  title: "Startup Manager",
  emoji: "🎯",
  style: "Direct et engagé, parle à la première personne, assume ses positions sans hésiter",
  prompt_extra: "",
};

type PartnerView = "apercu" | "portefeuille" | "personnalisation" | "agents";
type PersoTab = "agents" | "manager";

// ─── Page principale ─────────────────────────────────────────────────────────

export default function PartnerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [members, setMembers] = useState<PartnerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PartnerView>("apercu");

  // Setup
  const [setupName, setSetupName] = useState("");
  const [setupType, setSetupType] = useState("incubator");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Portefeuille
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePlan, setInvitePlan] = useState<"starter" | "growth" | "scale">("starter");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Personnalisation
  const [persoTab, setPersoTab] = useState<PersoTab>("agents");
  const [agentNames, setAgentNames] = useState<AgentNames>(DEFAULT_AGENT_NAMES);
  const [managerPersona, setManagerPersona] = useState<ManagerPersona>(DEFAULT_MANAGER);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auth
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = "/connexion"; return; }
      setUserId(data.user.id);
    });
  }, []);

  // Chargement du partner
  useEffect(() => {
    if (!userId) return;
    fetch("/api/partner")
      .then((r) => r.json())
      .then((data) => {
        if (data.partner) {
          setPartner(data.partner);
          setMembers(data.members ?? []);
          setAgentNames({ ...DEFAULT_AGENT_NAMES, ...data.partner.agent_names });
          setManagerPersona({ ...DEFAULT_MANAGER, ...data.partner.manager_persona });
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function createPartner() {
    if (!setupName.trim() || !userId) return;
    setSetupLoading(true);
    setSetupError("");
    const res = await fetch("/api/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: setupName, type: setupType }),
    });
    const data = await res.json();
    if (data.partner) {
      setPartner(data.partner);
      setMembers([]);
    } else {
      const extra =
        typeof data.details === "string" && data.details ? ` — ${data.details}` : "";
      setSetupError((data.error ?? "Erreur lors de la création.") + extra);
    }
    setSetupLoading(false);
  }

  async function saveCustomization() {
    if (!partner || !userId) return;
    setSaveLoading(true);
    await fetch("/api/partner/customization", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: partner.id, agent_names: agentNames, manager_persona: managerPersona }),
    });
    setSaveLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !partner || !userId) return;
    setInviteLoading(true);
    setInviteError("");
    const res = await fetch("/api/partner/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: partner.id, email: inviteEmail.trim(), grantedPlan: invitePlan }),
    });
    const data = await res.json();
    if (data.member) {
      setMembers((prev) => [data.member, ...prev]);
      setInviteEmail("");
      setInvitePlan("starter");
    } else {
      setInviteError(data.error ?? "Erreur lors de l'ajout.");
    }
    setInviteLoading(false);
  }

  async function updateMemberPlan(memberId: string, plan: "starter" | "growth" | "scale") {
    if (!partner || !userId) return;
    const res = await fetch("/api/partner/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: partner.id, memberId, grantedPlan: plan }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setInviteError(data.error ?? "Impossible de modifier le plan.");
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, granted_plan: plan } : m))
    );
  }

  async function removeMember(memberId: string) {
    if (!partner || !userId) return;
    await fetch(
      `/api/partner/members?partnerId=${partner.id}&memberId=${memberId}`,
      { method: "DELETE" }
    );
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  // ── Loader ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  // ── En attente d'activation ──────────────────────────────────────────────
  if (partner && !partner.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--uf-paper)" }}>
        <div className="max-w-md w-full text-center p-10" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6" style={{ background: "var(--uf-paper-2)" }}>
            ⏳
          </div>
          <h1 className="uppercase tracking-[-0.015em] mb-3" style={{ fontFamily: "var(--uf-display)", fontSize: 28, lineHeight: 0.82 }}>
            En attente d&apos;activation
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--uf-muted)" }}>
            Votre espace partenaire <strong>{partner.name}</strong> a bien été créé.
            Notre équipe doit valider votre compte avant que vous puissiez accéder à votre portefeuille.
          </p>
          <p className="text-xs" style={{ color: "var(--uf-muted-2)" }}>
            Vous serez notifié par email dès que votre compte sera activé. En général, cela prend moins de 24h.
          </p>
          <a href="/" className="inline-block mt-8 px-6 py-3 rounded-full text-sm font-medium" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  // ── Setup (pas encore de partner) ─────────────────────────────────────────
  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--uf-paper)" }}>
        <div className="p-8 max-w-md w-full" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: "var(--uf-orange)" }}>
              <span className="text-white" style={{ fontFamily: "var(--uf-display)", fontSize: 24 }}>f</span>
            </div>
            <h1 className="uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 28, color: "var(--uf-ink)" }}>Espace Partenaire</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Configurez votre espace pour gérer votre portefeuille et personnaliser l'expérience de vos startups.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Nom de votre organisation
              </label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createPartner()}
                placeholder="ex: Partech, Station F, HEC Paris…"
                className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Type d'organisation
              </label>
              <select
                value={setupType}
                onChange={(e) => setSetupType(e.target.value)}
                className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-900 bg-white transition-colors"
              >
                {PARTNER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {setupError && (
              <p className="text-red-600 text-xs font-medium">{setupError}</p>
            )}
            <button
              onClick={createPartner}
              disabled={!setupName.trim() || setupLoading}
              className="w-full disabled:opacity-40 font-medium px-5 py-3 rounded-full text-sm transition-all hover:-translate-y-px"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              {setupLoading ? "Création…" : "Créer mon espace partenaire →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Interface principale ───────────────────────────────────────────────────
  const portfolioCount = members.filter((m) => m.role === "portfolio").length;
  const registeredCount = members.filter((m) => m.role === "portfolio" && m.user_id).length;
  const starterUsed = members.filter((m) => m.role === "portfolio" && m.granted_plan === "starter").length;
  const growthUsed = members.filter((m) => m.role === "portfolio" && m.granted_plan === "growth").length;
  const scaleUsed = members.filter((m) => m.role === "portfolio" && m.granted_plan === "scale").length;
  const starterAllowance = partner.license_config?.portfolio_plan_allowances?.starter ?? 0;
  const growthAllowance = partner.license_config?.portfolio_plan_allowances?.growth ?? 0;
  const scaleAllowance = partner.license_config?.portfolio_plan_allowances?.scale ?? 0;

  const NAV = [
    { id: "apercu" as PartnerView, label: "Aperçu", icon: "🏠" },
    { id: "portefeuille" as PartnerView, label: "Portefeuille", icon: "🚀" },
    { id: "personnalisation" as PartnerView, label: "Personnalisation", icon: "🎨" },
    { id: "agents" as PartnerView, label: "Mes agents", icon: "🤖" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--uf-paper)" }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="flex flex-col flex-shrink-0" style={{ width: 220, background: "var(--uf-paper-2)", borderRight: "1px solid var(--uf-line)" }}>
        <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--uf-line)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)", color: "#fff" }}>
              f
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--uf-ink)" }}>{partner.name}</p>
              <p className="text-xs font-medium truncate" style={{ color: "var(--uf-muted)" }}>
                {PARTNER_TYPES.find((t) => t.value === partner.type)?.label ?? partner.type}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all text-left"
              style={{
                background: view === item.id ? "var(--uf-card)" : "transparent",
                border: view === item.id ? "1px solid var(--uf-line)" : "1px solid transparent",
                borderRadius: 10,
                color: view === item.id ? "var(--uf-ink)" : "var(--uf-muted)",
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-100">
          <a
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium flex items-center gap-1.5"
          >
            ← Mon dashboard
          </a>
        </div>
      </aside>

      {/* ── Contenu ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* ── Aperçu ──────────────────────────────────────────────────────── */}
        {view === "apercu" && (
          <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Bienvenue, {partner.name}</h1>
            <p className="text-slate-500 text-sm mb-8">
              {PARTNER_TYPES.find((t) => t.value === partner.type)?.label} · Espace partenaire FounderAI
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Startups dans le portefeuille"
                value={portfolioCount}
                icon="🚀"
                color="indigo"
              />
              <StatCard
                label="Comptes activés"
                value={registeredCount}
                icon="✅"
                color="emerald"
              />
              <StatCard
                label="En attente d'inscription"
                value={portfolioCount - registeredCount}
                icon="⏳"
                color="amber"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
              <h2 className="font-black text-slate-800 text-sm mb-3">Configuration actuelle</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agents</p>
                  <div className="space-y-1">
                    {(Object.keys(AGENT_META) as AgentKey[]).map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm">{AGENT_META[key].emoji}</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {agentNames[key]}
                        </span>
                        <span className="text-xs text-slate-400">· {AGENT_META[key].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Startup Manager</p>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{managerPersona.emoji}</span>
                    <div>
                      <p className="text-sm font-black text-slate-800">{managerPersona.name}</p>
                      <p className="text-xs text-slate-500">{managerPersona.title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{managerPersona.style}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setView("portefeuille")}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors border border-indigo-100"
              >
                Gérer le portefeuille →
              </button>
              <button
                onClick={() => setView("personnalisation")}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors border border-slate-200"
              >
                Personnaliser l'expérience →
              </button>
            </div>
          </div>
        )}

        {/* ── Portefeuille ─────────────────────────────────────────────────── */}
        {view === "portefeuille" && (
          <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Portefeuille</h1>
            <p className="text-slate-500 text-sm mb-6">
              Ajoutez les startups de votre portefeuille. Elles bénéficieront de votre personnalisation dès leur connexion.
            </p>

            {/* Invite form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Ajouter une startup</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && inviteMember()}
                  placeholder="email@startup.com"
                  className="flex-1 border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors"
                />
                <select
                  value={invitePlan}
                  onChange={(e) => setInvitePlan(e.target.value as "starter" | "growth" | "scale")}
                  className="border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white"
                >
                  <option value="starter">Plan Starter</option>
                  <option value="growth">Plan Growth</option>
                  <option value="scale">Plan Scale</option>
                </select>
                <button
                  onClick={inviteMember}
                  disabled={!inviteEmail.trim() || inviteLoading}
                  className="bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm whitespace-nowrap"
                >
                  {inviteLoading ? "Ajout…" : "Ajouter"}
                </button>
              </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                Starter {starterUsed}/{starterAllowance}
              </span>
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                Growth {growthUsed}/{growthAllowance}
              </span>
              <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 font-semibold">
                Scale {scaleUsed}/{scaleAllowance}
              </span>
            </div>
              {inviteError && (
                <p className="text-red-600 text-xs mt-2 font-medium">{inviteError}</p>
              )}
            </div>

            {/* Liste */}
            {portfolioCount === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <p className="text-4xl mb-3">🚀</p>
                <p className="text-slate-500 text-sm">Aucune startup dans le portefeuille.</p>
                <p className="text-slate-400 text-xs mt-1">Ajoutez des startups par email ci-dessus.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Startup</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan accordé</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider"></p>
                </div>
                {members
                  .filter((m) => m.role === "portfolio")
                  .map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 px-4 py-3.5 border-b border-slate-50 items-center hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm text-slate-700 font-medium truncate">{m.email}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {m.startup?.name ?? <span className="text-slate-300 italic">—</span>}
                      </p>
                      <select
                        value={m.granted_plan}
                        onChange={(e) => updateMemberPlan(m.id, e.target.value as "starter" | "growth" | "scale")}
                        className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
                      >
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="scale">Scale</option>
                      </select>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          m.user_id
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {m.user_id ? "✓ Inscrit" : "En attente"}
                      </span>
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors text-sm font-bold"
                        title="Retirer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── Personnalisation ─────────────────────────────────────────────── */}
        {view === "personnalisation" && (
          <div className="p-8 max-w-3xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Personnalisation</h1>
                <p className="text-slate-500 text-sm">
                  Adaptez l'expérience FounderAI aux couleurs de votre organisation.
                </p>
              </div>
              <button
                onClick={saveCustomization}
                disabled={saveLoading}
                className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm ${
                  saveSuccess
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 text-white disabled:opacity-40"
                }`}
              >
                {saveSuccess ? "✓ Enregistré" : saveLoading ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
              {(["agents", "manager"] as PersoTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPersoTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    persoTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "agents" ? "🤖 Agents" : "🎯 Startup Manager"}
                </button>
              ))}
            </div>

            {/* Onglet Agents */}
            {persoTab === "agents" && (
              <div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Personnalisez les prénoms de chaque agent. Ils apparaîtront dans toutes les interfaces de vos startups.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(AGENT_META) as AgentKey[]).map((key) => {
                    const meta = AGENT_META[key];
                    return (
                      <div key={key} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-base shadow-sm`}>
                            {meta.emoji}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{meta.label}</p>
                            <p className="text-xs text-slate-400">{meta.role}</p>
                          </div>
                        </div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Prénom affiché
                        </label>
                        <input
                          type="text"
                          value={agentNames[key]}
                          onChange={(e) =>
                            setAgentNames((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={`ex: ${meta.label.split(" ")[0]}`}
                          className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Startup Manager */}
            {persoTab === "manager" && (
              <div className="space-y-5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Le Startup Manager intervient à la fin de chaque CODIR pour donner sa recommandation personnelle.
                  Donnez-lui votre identité ou celle d'un mentor de référence.
                </p>

                {/* Prévisualisation */}
                <div className="bg-gradient-to-br from-slate-700 to-zinc-800 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
                      {managerPersona.emoji || "🎯"}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-tight">
                        {managerPersona.name || "Victor"}
                      </p>
                      <p className="text-slate-400 text-xs font-semibold">
                        {managerPersona.title || "Startup Manager"}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs italic leading-relaxed line-clamp-2">
                    {managerPersona.style || "Style à définir…"}
                  </p>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Prénom / Nom"
                    value={managerPersona.name}
                    onChange={(v) => setManagerPersona((p) => ({ ...p, name: v }))}
                    placeholder="Victor"
                  />
                  <FormField
                    label="Titre / Rôle"
                    value={managerPersona.title}
                    onChange={(v) => setManagerPersona((p) => ({ ...p, title: v }))}
                    placeholder="Startup Manager"
                  />
                </div>
                <FormField
                  label="Emoji"
                  value={managerPersona.emoji}
                  onChange={(v) => setManagerPersona((p) => ({ ...p, emoji: v }))}
                  placeholder="🎯"
                  hint="Un seul emoji affiché dans l'avatar"
                />
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Style et personnalité
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Décrivez le style de communication et la posture du manager (ton, approche, valeurs…)
                  </p>
                  <textarea
                    value={managerPersona.style}
                    onChange={(e) => setManagerPersona((p) => ({ ...p, style: e.target.value }))}
                    rows={3}
                    placeholder="Ex: Pragmatique et bienveillant, encourage la prise de risque calculée, challenge les fondateurs avec bienveillance…"
                    className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Instructions supplémentaires (prompt)
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Contexte métier, règles spécifiques à votre programme, thèses d'investissement… Ces instructions sont injectées dans le prompt du manager.
                  </p>
                  <textarea
                    value={managerPersona.prompt_extra}
                    onChange={(e) => setManagerPersona((p) => ({ ...p, prompt_extra: e.target.value }))}
                    rows={5}
                    placeholder="Ex: Tu représentes le programme d'accélération BPI France. Tu privilégies les startups deeptech avec une forte composante R&D. Tu recommandes systématiquement d'évaluer les aides publiques disponibles…"
                    className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors resize-none font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {/* ── Agents custom ────────────────────────────────────────────── */}
        {view === "agents" && (
          <AgentBuilderView partnerId={partner.id} maxAgents={partner.max_custom_agents ?? 0} />
        )}
      </main>
    </div>
  );
}

// ─── Agent Builder ────────────────────────────────────────────────────────────

type CustomAgent = {
  id: string;
  name: string;
  role: string;
  emoji: string;
  system_prompt: string;
  active: boolean;
  created_at: string;
};

function AgentBuilderView({ partnerId, maxAgents }: { partnerId: string; maxAgents: number }) {
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomAgent | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [emoji, setEmoji] = useState("🤖");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/partner/custom-agents?partnerId=${partnerId}`)
      .then((r) => r.json())
      .then((data) => setAgents(data.agents ?? []))
      .finally(() => setLoading(false));
  }, [partnerId]);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setName("");
    setRole("");
    setEmoji("🤖");
    setSystemPrompt("");
    setKnowledge("");
    setError("");
  }

  function startEdit(agent: CustomAgent) {
    setEditing(agent);
    setCreating(false);
    setName(agent.name);
    setRole(agent.role);
    setEmoji(agent.emoji);
    setSystemPrompt(agent.system_prompt);
    setKnowledge("");
    setError("");
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
    setError("");
  }

  async function save() {
    if (!name.trim() || !role.trim()) { setError("Nom et rôle requis"); return; }
    setSaving(true);
    setError("");
    try {
      const body = { name, role, emoji, systemPrompt, knowledge: knowledge || undefined };
      let res: Response;
      if (editing) {
        res = await fetch("/api/partner/custom-agents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: editing.id, ...body }),
        });
      } else {
        res = await fetch("/api/partner/custom-agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Erreur lors de la sauvegarde");
        return;
      }
      // Recharger la liste
      const listRes = await fetch(`/api/partner/custom-agents?partnerId=${partnerId}`);
      const listData = await listRes.json();
      setAgents(listData.agents ?? []);
      cancel();
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent(agentId: string) {
    if (!confirm("Supprimer cet agent et toutes ses conversations ?")) return;
    await fetch(`/api/partner/custom-agents?agentId=${agentId}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
  }

  const isFormOpen = creating || editing;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 24, color: "var(--uf-ink)" }}>
            Agent Builder
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--uf-muted)" }}>
            Créez des agents spécialisés pour votre programme. Ils seront disponibles pour vos startups dans le chat et le CODIR.
          </p>
        </div>
        <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ fontFamily: "var(--uf-mono)", background: "var(--uf-paper-2)", color: "var(--uf-muted)" }}>
          {agents.length} / {maxAgents}
        </span>
      </div>

      {maxAgents === 0 && (
        <div className="p-6 text-center" style={{ background: "var(--uf-paper-2)", borderRadius: "var(--uf-r-xl)" }}>
          <p className="text-2xl mb-3">🔒</p>
          <p className="font-bold" style={{ color: "var(--uf-ink)" }}>Aucun agent custom autorisé</p>
          <p className="text-sm mt-1" style={{ color: "var(--uf-muted)" }}>Contactez l&apos;administrateur FounderAI pour activer cette fonctionnalité.</p>
        </div>
      )}

      {maxAgents > 0 && !isFormOpen && (
        <>
          {/* Liste des agents */}
          <div className="space-y-3 mb-6">
            {loading && <p className="text-sm" style={{ color: "var(--uf-muted)" }}>Chargement...</p>}
            {!loading && agents.length === 0 && (
              <div className="p-8 text-center" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
                <p className="text-3xl mb-3">🤖</p>
                <p className="font-bold" style={{ color: "var(--uf-ink)" }}>Aucun agent créé</p>
                <p className="text-sm mt-1" style={{ color: "var(--uf-muted)" }}>Créez votre premier agent spécialisé pour enrichir l&apos;expérience de vos startups.</p>
              </div>
            )}
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-4" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: "var(--uf-ink)" }}>{agent.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--uf-muted)" }}>{agent.role}</p>
                </div>
                <button onClick={() => startEdit(agent)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: "1px solid var(--uf-line)", color: "var(--uf-ink)" }}>
                  Modifier
                </button>
                <button onClick={() => deleteAgent(agent.id)} className="text-xs px-2 py-1.5 rounded-full transition-colors hover:text-red-600" style={{ color: "var(--uf-muted)" }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {agents.length < maxAgents && (
            <button onClick={startCreate} className="px-5 py-3 text-sm font-medium rounded-full hover:-translate-y-px transition-transform flex items-center gap-2" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              + Créer un agent
            </button>
          )}
        </>
      )}

      {/* Formulaire création / édition */}
      {isFormOpen && (
        <div className="p-6 space-y-5" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <h3 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 20, color: "var(--uf-ink)" }}>
            {editing ? `Modifier ${editing.name}` : "Nouvel agent"}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Nom de l&apos;agent</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Verte"
                className="w-full px-4 py-2.5 text-sm focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Rôle / spécialité</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Expert en chimie verte"
                className="w-full px-4 py-2.5 text-sm focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Emoji</label>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🤖" maxLength={4}
              className="w-20 px-4 py-2.5 text-sm text-center focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", background: "var(--uf-paper)" }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              System prompt
              <span className="normal-case tracking-normal ml-2 font-normal" style={{ color: "var(--uf-muted-2)" }}>— Décrivez la personnalité, l&apos;expertise et le style de l&apos;agent</span>
            </label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={8}
              placeholder={"Tu es un expert en chimie verte spécialisé dans les procédés durables.\n\nTon expertise couvre :\n- Catalyse verte et solvants alternatifs\n- Économie circulaire moléculaire\n- Réglementation REACH et SVHC\n\nTu guides les startups dans le développement de produits chimiques respectueux de l'environnement."}
              className="w-full px-4 py-3 text-sm focus:outline-none resize-y leading-relaxed" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)", fontFamily: "var(--uf-mono)" }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              Base de connaissances
              <span className="normal-case tracking-normal ml-2 font-normal" style={{ color: "var(--uf-muted-2)" }}>— Collez des contenus que l&apos;agent utilisera comme référence (optionnel)</span>
            </label>
            <textarea value={knowledge} onChange={(e) => setKnowledge(e.target.value)} rows={5}
              placeholder="Collez ici des frameworks, méthodes, données de référence, guides..."
              className="w-full px-4 py-3 text-sm focus:outline-none resize-y leading-relaxed" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-md)", color: "var(--uf-ink)", background: "var(--uf-paper)" }} />
          </div>

          {error && (
            <p className="text-sm text-red-600 px-4 py-3" style={{ background: "#fef2f2", borderRadius: "var(--uf-r-md)" }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-6 py-3 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>
              {saving ? "Sauvegarde…" : editing ? "Enregistrer les modifications" : "Créer l'agent"}
            </button>
            <button onClick={cancel} className="px-4 py-3 text-sm rounded-full" style={{ color: "var(--uf-muted)" }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: "indigo" | "emerald" | "amber";
}) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-xs font-semibold leading-tight opacity-80">{label}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors"
      />
    </div>
  );
}
