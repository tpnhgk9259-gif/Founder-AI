"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  plan: string;
  created_at: string;
};

type StartupRow = {
  id: string;
  user_id: string;
  name: string | null;
  sector: string | null;
  stage: string | null;
  partner_id: string | null;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
};

type PartnerRow = {
  id: string;
  name: string;
  type: string;
  active: boolean;
  max_custom_agents: number;
  created_at: string;
  admin_count: number;
  portfolio_count: number;
};

type LicenseConfig = {
  available_agents: ("strategie" | "vente" | "finance" | "technique" | "codir")[];
  conversational_memory_enabled: boolean;
  conversational_memory_window: number;
  max_chat_messages_per_day: number;
  max_codir_sessions_per_month: number;
  portfolio_plan_allowances: {
    starter: number;
    growth: number;
    scale: number;
  };
};

type LicensePartnerRow = {
  id: string;
  name: string;
  license_config: LicenseConfig;
};

type LicenseStartupRow = {
  id: string;
  name: string | null;
  partner_id: string | null;
  license_config: LicenseConfig;
};

type PartnerMemberRow = {
  id: string;
  partner_id: string;
  email: string;
  role: string;
  user_id: string | null;
  granted_plan?: string;
  invited_at: string;
};

type OverviewPayload = {
  users: UserRow[];
  startups: StartupRow[];
  partners: PartnerRow[];
  partnerMembers: PartnerMemberRow[];
  generatedAt: string;
  viewerEmail: string;
};
type LicensePayload = {
  partners: LicensePartnerRow[];
  startups: LicenseStartupRow[];
};

type TabId = "resume" | "users" | "startups" | "partners" | "members" | "licenses" | "conversations" | "agents";

type MessageRow = {
  id: string;
  role: "user" | "agent";
  content: string;
  created_at: string;
  model?: string;
};

type ConversationRow = {
  id: string;
  agent_key: string;
  created_at: string;
  messages: MessageRow[];
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// ─── Panneau connaissances agents ─────────────────────────────────────────────

const AGENT_TABS = [
  { key: "strategie",  label: "Maya", role: "Directrice Stratégie",      emoji: "🧭" },
  { key: "vente",      label: "Alex", role: "Directeur Commercial",      emoji: "🚀" },
  { key: "finance",    label: "Sam",  role: "Directeur Financier",       emoji: "📊" },
  { key: "technique",  label: "Léo",  role: "Directeur Produit",         emoji: "⚙️" },
  { key: "operations", label: "Marc", role: "Directeur des Opérations",  emoji: "📋" },
] as const;

function AgentKnowledgePanel() {
  const [activeAgent, setActiveAgent] = useState<"strategie" | "vente" | "finance" | "technique" | "operations">("strategie");
  const [contents, setContents] = useState<Record<string, string>>({ strategie: "", vente: "", finance: "", technique: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/agent-knowledge")
      .then((r) => r.json())
      .then(({ knowledge }) => {
        if (Array.isArray(knowledge)) {
          const map: Record<string, string> = {};
          for (const row of knowledge) map[row.agent_key] = row.content ?? "";
          setContents((prev) => ({ ...prev, ...map }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/agent-knowledge", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentKey: activeAgent, content: contents[activeAgent] }),
    });
    setSaving(false);
    setSaved(true);
    setContents((prev) => ({ ...prev, [activeAgent]: "" }));
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");

    const form = new FormData();
    form.append("agentKey", activeAgent);
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/agent-knowledge/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Erreur lors de l'extraction.");
      } else {
        // Ajouter le texte extrait à la suite du contenu existant
        setContents((prev) => {
          const existing = prev[activeAgent].trim();
          const separator = existing ? `\n\n--- ${json.fileName} ---\n` : `--- ${json.fileName} ---\n`;
          return { ...prev, [activeAgent]: existing + separator + json.text };
        });
        if (json.truncated) {
          setUploadError("Document tronqué à 400 000 caractères (~100k tokens) pour tenir dans le contexte du modèle.");
        }
      }
    } catch {
      setUploadError("Erreur réseau.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const agentMeta = AGENT_TABS.find((a) => a.key === activeAgent)!;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
      <div>
        <h2 className="text-lg font-black text-white">Connaissances métier des agents</h2>
        <p className="text-sm text-slate-400 mt-1">
          Ces contenus sont injectés dans le system prompt de chaque agent pour toutes les startups.
          Ajoutez des données sectorielles, benchmarks, méthodologies, ou tout contexte métier utile — par texte ou via un document (PDF, TXT, MD).
        </p>
      </div>

      {/* Sélecteur d'agent */}
      <div className="flex gap-2 flex-wrap">
        {AGENT_TABS.map((a) => (
          <button
            key={a.key}
            onClick={() => setActiveAgent(a.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeAgent === a.key
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>{a.emoji}</span>
            <span>{a.label}</span>
            <span className={`text-xs font-normal ${activeAgent === a.key ? "text-violet-200" : "text-slate-500"}`}>
              {a.role}
            </span>
          </button>
        ))}
      </div>

      {/* Éditeur */}
      {loading ? (
        <p className="text-slate-400 text-sm">Chargement…</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Connaissances de {agentMeta.label}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{contents[activeAgent].length} caractères</span>
              {/* Bouton upload document */}
              <label className={`flex items-center gap-1.5 cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? "Extraction…" : "Importer un document"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{uploadError}</p>
          )}

          <textarea
            value={contents[activeAgent]}
            onChange={(e) => setContents((prev) => ({ ...prev, [activeAgent]: e.target.value }))}
            rows={20}
            placeholder={`Exemples pour ${agentMeta.label} :\n- Données de marché sectorielles\n- Benchmarks et chiffres de référence\n- Méthodologies propriétaires\n- Cas d'usage et exemples concrets\n- Contexte réglementaire\n- Tendances et signaux faibles\n\nOu importez directement un PDF, TXT ou MD via le bouton "Importer un document".`}
            className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-y font-mono leading-relaxed"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            {saved && (
              <span className="text-emerald-400 text-sm font-semibold">✓ Enregistré</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("resume");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "401" | "403" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [licenses, setLicenses] = useState<LicensePayload | null>(null);
  const [licenseType, setLicenseType] = useState<"partner" | "startup">("partner");
  const [licenseTargetId, setLicenseTargetId] = useState("");
  const [licenseForm, setLicenseForm] = useState<LicenseConfig | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<"idle" | "loading" | "saving" | "ok" | "error">("idle");
  const [licenseError, setLicenseError] = useState("");
  const [detail, setDetail] = useState<{ type: "partner" | "startup"; id: string } | null>(null);
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");
  const [convStartupId, setConvStartupId] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[] | null>(null);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState("");
  const [openConvId, setOpenConvId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 401) {
        setStatus("401");
        return;
      }
      if (res.status === 403) {
        setStatus("403");
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErrorMsg(j.error ?? `Erreur ${res.status}`);
        setStatus("error");
        return;
      }
      const json = (await res.json()) as OverviewPayload;
      setData(json);
      setStatus("ok");
    } catch {
      setErrorMsg("Réseau ou serveur injoignable.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadLicenses = useCallback(async () => {
    setLicenseStatus("loading");
    setLicenseError("");
    try {
      const res = await fetch("/api/admin/licenses", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLicenseError(j.error ?? `Erreur ${res.status}`);
        setLicenseStatus("error");
        return;
      }
      setLicenses(j as LicensePayload);
      setLicenseStatus("idle");
    } catch {
      setLicenseError("Impossible de charger les licences.");
      setLicenseStatus("error");
    }
  }, []);

  useEffect(() => {
    if (status === "ok" && tab === "licenses" && !licenses) {
      loadLicenses();
    }
  }, [status, tab, licenses, loadLicenses]);

  const detailName = useMemo(() => {
    if (!detail || !data) return "";
    if (detail.type === "partner") return data.partners.find((p) => p.id === detail.id)?.name ?? detail.id;
    return data.startups.find((s) => s.id === detail.id)?.name ?? detail.id;
  }, [detail, data]);

  const partnerPortfolio = useMemo(() => {
    if (!detail || detail.type !== "partner" || !data) return [];
    return data.startups.filter((s) => s.partner_id === detail.id);
  }, [detail, data]);

  const attachableStartups = useMemo(() => {
    if (!detail || detail.type !== "partner" || !data) return [];
    const q = portfolioSearch.trim().toLowerCase();
    return data.startups
      .filter((s) => s.partner_id !== detail.id)
      .filter(
        (s) =>
          !q ||
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.owner_email ?? "").toLowerCase().includes(q)
      );
  }, [detail, data, portfolioSearch]);

  const q = query.trim().toLowerCase();

  const filter = useCallback(
    <T,>(rows: T[], pick: (row: T) => string) => {
      if (!q) return rows;
      return rows.filter((row) => pick(row).toLowerCase().includes(q));
    },
    [q]
  );

  const usersF = useMemo(
    () =>
      data
        ? filter(data.users, (u) =>
            [u.email, u.first_name, u.last_name, u.id, u.plan].join(" ")
          )
        : [],
    [data, filter]
  );

  const startupsF = useMemo(
    () =>
      data
        ? filter(data.startups, (s) =>
            [s.name, s.owner_email, s.owner_name, s.id, s.sector, s.stage].join(" ")
          )
        : [],
    [data, filter]
  );

  const partnersF = useMemo(
    () =>
      data
        ? filter(data.partners, (p) => [p.name, p.type, p.id].join(" "))
        : [],
    [data, filter]
  );

  const membersF = useMemo(
    () =>
      data
        ? filter(data.partnerMembers, (m) => [m.email, m.role, m.partner_id, m.id].join(" "))
        : [],
    [data, filter]
  );

  useEffect(() => {
    if (!licenses) return;
    const targets = licenseType === "partner" ? licenses.partners : licenses.startups;
    if (targets.length === 0) {
      setLicenseTargetId("");
      setLicenseForm(null);
      return;
    }
    const existing = targets.find((t) => t.id === licenseTargetId);
    const current = existing ?? targets[0];
    setLicenseTargetId(current.id);
    setLicenseForm(current.license_config);
  }, [licenses, licenseType, licenseTargetId]);

  const openDetail = useCallback(
    (type: "partner" | "startup", id: string) => {
      setDetail({ type, id });
      setPortfolioSearch("");
      setPortfolioError("");
      setLicenseType(type);
      setLicenseTargetId(id);
      if (!licenses && licenseStatus !== "loading") loadLicenses();
    },
    [licenses, licenseStatus, loadLicenses]
  );

  const loadConversations = useCallback(async (startupId: string) => {
    if (!startupId) return;
    setConvLoading(true);
    setConvError("");
    setConversations(null);
    try {
      const res = await fetch(`/api/admin/conversations?startupId=${startupId}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setConvError(j.error ?? `Erreur ${res.status}`); return; }
      setConversations(j as ConversationRow[]);
    } catch {
      setConvError("Erreur réseau.");
    } finally {
      setConvLoading(false);
    }
  }, []);

  const deleteUser = useCallback(
    async (userId: string, email: string) => {
      if (!confirm(`Supprimer définitivement le compte ${email} et sa startup ?`)) return;
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "Erreur lors de la suppression.");
        return;
      }
      await load();
    },
    [load]
  );

  const assignStartup = useCallback(
    async (startupId: string, partnerId: string | null) => {
      setPortfolioLoading(true);
      setPortfolioError("");
      try {
        const res = await fetch("/api/admin/assign-startup", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId, partnerId }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          setPortfolioError(j.error ?? `Erreur ${res.status}`);
          return;
        }
        await load();
      } catch {
        setPortfolioError("Erreur réseau.");
      } finally {
        setPortfolioLoading(false);
      }
    },
    [load]
  );

  if (status === "401") {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-4xl">🔐</p>
          <h1 className="text-2xl font-black">Connexion requise</h1>
          <p className="text-slate-400 text-sm">
            Connectez-vous avec un compte autorisé, puis revenez sur cette page.
          </p>
          <a
            href="/connexion?redirect=/admin"
            className="inline-block bg-violet-600 hover:bg-violet-500 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Se connecter
          </a>
        </div>
      </main>
    );
  }

  if (status === "403") {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-4">
          <p className="text-4xl">⛔</p>
          <h1 className="text-2xl font-black">Accès super-admin</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Votre session est valide, mais votre email n&apos;est pas dans la liste des
            super-administrateurs. Ajoutez votre email dans{" "}
            <code className="text-violet-300 bg-white/10 px-1.5 py-0.5 rounded">
              SUPER_ADMIN_EMAILS
            </code>{" "}
            (fichier <code className="text-violet-300">.env.local</code>), redémarrez Next.js,
            puis reconnectez-vous.
          </p>
          <a href="/" className="text-violet-400 hover:underline text-sm font-semibold">
            ← Retour à l&apos;accueil
          </a>
        </div>
      </main>
    );
  }

  if (status === "loading" || status === "error" || !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          {status === "loading" ? (
            <>
              <div className="w-10 h-10 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Chargement de la supervision…</p>
            </>
          ) : (
            <>
              <p className="text-red-400 font-semibold">{errorMsg}</p>
              <button
                type="button"
                onClick={load}
                className="text-violet-400 hover:underline text-sm font-bold"
              >
                Réessayer
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "resume", label: "Résumé", count: 0 },
    { id: "users", label: "Comptes", count: data.users.length },
    { id: "startups", label: "Startups", count: data.startups.length },
    { id: "partners", label: "Partenaires", count: data.partners.length },
    { id: "members", label: "Membres partenaires", count: data.partnerMembers.length },
    { id: "licenses", label: "Licences", count: 0 },
    { id: "conversations", label: "Conversations", count: 0 },
    { id: "agents", label: "Agents IA", count: 0 },
  ];

  const partnerName = (id: string) => data.partners.find((p) => p.id === id)?.name ?? id.slice(0, 8);
  const licenseTargets = licenseType === "partner" ? licenses?.partners ?? [] : licenses?.startups ?? [];

  const updateAgent = (agent: LicenseConfig["available_agents"][number], checked: boolean) => {
    setLicenseForm((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.available_agents);
      if (checked) next.add(agent);
      else next.delete(agent);
      return { ...prev, available_agents: Array.from(next) as LicenseConfig["available_agents"] };
    });
  };

  const saveLicense = async () => {
    if (!licenseForm || !licenseTargetId) return;
    setLicenseStatus("saving");
    setLicenseError("");
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: licenseType,
          targetId: licenseTargetId,
          license: licenseForm,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLicenseError(j.error ?? `Erreur ${res.status}`);
        setLicenseStatus("error");
        return;
      }
      setLicenseStatus("ok");
      await loadLicenses();
    } catch {
      setLicenseError("Impossible d'enregistrer la licence.");
      setLicenseStatus("error");
    }
  };

  return (
    <>
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] uppercase mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-lime)" }}>
              Supervision
            </p>
            <h1 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 24, color: "#fff" }}>FounderAI — Console admin</h1>
            <p className="text-xs text-slate-500 mt-1">
              Connecté en tant que <span className="text-slate-300">{data.viewerEmail}</span>
              {" · "}
              Données du {formatDate(data.generatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer les tableaux…"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <button
              type="button"
              onClick={load}
              className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-xs opacity-80">({t.count})</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {tab === "resume" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Comptes (profils)" value={data.users.length} hint="Table users" />
            <StatCard label="Startups" value={data.startups.length} hint="Profils entreprise" />
            <StatCard label="Organisations partenaires" value={data.partners.length} hint="Incubateurs, fonds…" />
            <StatCard
              label="Lignes membres partenaires"
              value={data.partnerMembers.length}
              hint="Admins + portefeuille"
            />
          </div>
        )}

        {tab === "resume" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Derniers comptes créés">
              <ul className="divide-y divide-slate-800">
                {data.users.slice(0, 8).map((u) => (
                  <li key={u.id} className="py-3 flex justify-between gap-4 text-sm">
                    <span className="text-slate-200 font-medium truncate">{u.email}</span>
                    <span className="text-slate-500 shrink-0">{formatDate(u.created_at)}</span>
                  </li>
                ))}
                {data.users.length === 0 && (
                  <li className="py-6 text-center text-slate-500 text-sm">Aucun compte.</li>
                )}
              </ul>
            </Panel>
            <Panel title="Dernières startups">
              <ul className="divide-y divide-slate-800">
                {data.startups.slice(0, 8).map((s) => (
                  <li key={s.id} className="py-3 flex justify-between gap-4 text-sm">
                    <span className="truncate">
                      <span className="text-slate-200 font-medium">{s.name ?? "—"}</span>
                      <span className="text-slate-500 block text-xs truncate">{s.owner_email}</span>
                    </span>
                    <span className="text-slate-500 shrink-0">{formatDate(s.created_at)}</span>
                  </li>
                ))}
                {data.startups.length === 0 && (
                  <li className="py-6 text-center text-slate-500 text-sm">Aucune startup.</li>
                )}
              </ul>
            </Panel>
          </div>
        )}

        {tab === "users" && (
          <DataTable
            columns={["Email", "Nom", "Plan", "Créé le", "ID"]}
            rows={usersF.map((u) => [
              u.email,
              `${u.first_name} ${u.last_name}`,
              u.plan,
              formatDate(u.created_at),
              u.id,
            ])}
            empty="Aucun compte ne correspond au filtre."
            onDelete={(i) => deleteUser(usersF[i].id, usersF[i].email)}
          />
        )}

        {tab === "startups" && (
          <DataTable
            columns={["Startup", "Propriétaire", "Email", "Secteur", "Stade", "Créé le", "ID"]}
            rows={startupsF.map((s) => [
              s.name ?? "—",
              s.owner_name ?? "—",
              s.owner_email ?? "—",
              s.sector ?? "—",
              s.stage ?? "—",
              formatDate(s.created_at),
              s.id,
            ])}
            empty="Aucune startup ne correspond au filtre."
            onRowClick={(i) => openDetail("startup", startupsF[i].id)}
          />
        )}

        {tab === "partners" && (
          <div>
            <DataTable
              columns={["Organisation", "Type", "Admins", "Portefeuille", "Agents custom", "Statut", "Créé le", "ID"]}
              rows={partnersF.map((p) => [
                p.name,
                p.type,
                String(p.admin_count),
                String(p.portfolio_count),
                String(p.max_custom_agents),
                p.active ? "✅ Actif" : "⏳ En attente",
                formatDate(p.created_at),
                p.id,
              ])}
              empty="Aucun partenaire ne correspond au filtre."
              onRowClick={(i) => openDetail("partner", partnersF[i].id)}
            />
            <div className="mt-4 grid gap-2">
              {partnersF.filter((p) => !p.active).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--uf-ink)", border: "1px solid var(--uf-ink)" }}>
                  <div>
                    <span className="font-bold text-sm" style={{ color: "var(--uf-paper)" }}>{p.name}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--uf-lime)" }}>— en attente d&apos;activation</span>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/partner-activate", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ partnerId: p.id, active: true }),
                      });
                      if (res.ok) window.location.reload();
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-full" style={{ background: "var(--uf-lime)", color: "var(--uf-ink)" }}
                  >
                    Activer ce partenaire
                  </button>
                </div>
              ))}
            </div>

            {/* Modifier le quota d'agents custom */}
            <div className="mt-4 grid gap-2">
              {partnersF.map((p) => (
                <div key={`quota-${p.id}`} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)" }}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm" style={{ color: "var(--uf-ink)" }}>{p.name}</span>
                    <span className="text-xs" style={{ color: "var(--uf-muted)" }}>— Agents custom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      defaultValue={p.max_custom_agents}
                      className="w-16 px-2 py-1 text-sm text-center focus:outline-none"
                      style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                      onBlur={async (e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val === p.max_custom_agents) return;
                        await fetch("/api/admin/partner-activate", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ partnerId: p.id, max_custom_agents: val }),
                        });
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "members" && (
          <DataTable
            columns={["Email", "Rôle", "Plan accordé", "Organisation", "User lié", "Invité le", "ID"]}
            rows={membersF.map((m) => [
              m.email,
              m.role,
              m.granted_plan ?? "custom",
              partnerName(m.partner_id),
              m.user_id ?? "—",
              formatDate(m.invited_at),
              m.id,
            ])}
            empty="Aucun membre ne correspond au filtre."
          />
        )}

        {tab === "licenses" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-white mr-auto">Configuration des licences</h2>
              <button
                type="button"
                onClick={loadLicenses}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold px-3 py-2 rounded-lg transition-colors"
              >
                Recharger
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cible
                </label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as "partner" | "startup")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="partner">Partenaire</option>
                  <option value="startup">Startup</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Entité
                </label>
                <select
                  value={licenseTargetId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setLicenseTargetId(nextId);
                    const target = licenseTargets.find((t) => t.id === nextId);
                    setLicenseForm(target?.license_config ?? null);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  {licenseTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || "(sans nom)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {licenseStatus === "loading" && (
              <p className="text-sm text-slate-400">Chargement des licences…</p>
            )}

            {licenseError && (
              <p className="text-sm text-red-400">{licenseError}</p>
            )}

            {licenseForm && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Agents disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["strategie", "vente", "finance", "technique", "codir"] as const).map((agent) => {
                      const checked = licenseForm.available_agents.includes(agent);
                      return (
                        <label
                          key={agent}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                            checked
                              ? "bg-violet-600/20 border-violet-500 text-violet-200"
                              : "bg-slate-800 border-slate-700 text-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateAgent(agent, e.target.checked)}
                            className="accent-violet-500"
                          />
                          {agent}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <input
                        type="checkbox"
                        checked={licenseForm.conversational_memory_enabled}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev ? { ...prev, conversational_memory_enabled: e.target.checked } : prev
                          )
                        }
                        className="accent-violet-500"
                      />
                      Mémoire conversationnelle active
                    </label>
                    <label className="block text-xs text-slate-400">
                      Fenêtre mémoire (messages)
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={licenseForm.conversational_memory_window}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  conversational_memory_window: Number.parseInt(e.target.value || "1", 10),
                                }
                              : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <label className="block text-xs text-slate-400">
                      Limite messages chat / jour
                      <input
                        type="number"
                        min={1}
                        value={licenseForm.max_chat_messages_per_day}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  max_chat_messages_per_day: Number.parseInt(e.target.value || "1", 10),
                                }
                              : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block text-xs text-slate-400">
                      Limite sessions CODIR / mois
                      <input
                        type="number"
                        min={1}
                        value={licenseForm.max_codir_sessions_per_month}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  max_codir_sessions_per_month: Number.parseInt(e.target.value || "1", 10),
                                }
                              : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                    {licenseType === "partner" && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quotas startups par forfait</p>
                        {(["starter", "growth", "scale"] as const).map((p) => (
                          <label key={p} className="flex items-center justify-between gap-3 text-xs text-slate-400">
                            <span className="capitalize">{p}</span>
                            <input
                              type="number"
                              min={0}
                              value={licenseForm.portfolio_plan_allowances[p]}
                              onChange={(e) =>
                                setLicenseForm((prev) =>
                                  prev ? { ...prev, portfolio_plan_allowances: { ...prev.portfolio_plan_allowances, [p]: Number.parseInt(e.target.value || "0", 10) } } : prev
                                )
                              }
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white text-right"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveLicense}
                    disabled={licenseStatus === "saving" || !licenseTargetId}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    {licenseStatus === "saving" ? "Enregistrement…" : "Enregistrer la licence"}
                  </button>
                  {licenseStatus === "ok" && (
                    <span className="text-sm text-emerald-400 font-semibold">✓ Licence mise à jour</span>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "conversations" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
            <h2 className="text-lg font-black text-white">Conversations</h2>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Startup
                </label>
                <select
                  value={convStartupId}
                  onChange={(e) => setConvStartupId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="">— Sélectionner une startup —</option>
                  {data.startups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? "Sans nom"} {s.owner_email ? `(${s.owner_email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => loadConversations(convStartupId)}
                disabled={!convStartupId || convLoading}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {convLoading ? "Chargement…" : "Afficher"}
              </button>
            </div>

            {convError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">{convError}</p>
            )}

            {conversations !== null && conversations.length === 0 && (
              <p className="text-center text-slate-500 py-12 text-sm border border-dashed border-slate-700 rounded-2xl">
                Aucune conversation pour cette startup.
              </p>
            )}

            {conversations !== null && conversations.length > 0 && (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div key={conv.id} className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenConvId(openConvId === conv.id ? null : conv.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-900/30 px-2 py-0.5 rounded-lg">
                          {conv.agent_key}
                        </span>
                        <span className="text-sm text-slate-400">{conv.messages.length} message{conv.messages.length > 1 ? "s" : ""}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(conv.created_at)} {openConvId === conv.id ? "▲" : "▼"}</span>
                    </button>

                    {openConvId === conv.id && (
                      <div className="border-t border-slate-700 divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                        {conv.messages.map((msg) => (
                          <div key={msg.id} className={`px-4 py-3 ${msg.role === "user" ? "bg-slate-800/40" : "bg-slate-900/40"}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-xs font-bold uppercase ${msg.role === "user" ? "text-sky-400" : "text-emerald-400"}`}>
                                {msg.role === "user" ? "Utilisateur" : "Agent"}
                              </span>
                              <span className="text-xs text-slate-500">{formatDate(msg.created_at)}</span>
                              {msg.model && <span className="text-xs text-slate-600 font-mono">{msg.model}</span>}
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "agents" && <AgentKnowledgePanel />}
      </div>
    </main>

    {detail && (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex justify-end"
        onClick={() => setDetail(null)}
      >
        <aside
          className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-0.5">
                {detail.type === "partner" ? "Partenaire" : "Startup"}
              </p>
              <h2 className="text-lg font-black text-white truncate">{detailName || "…"}</h2>
            </div>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="shrink-0 text-slate-400 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-6 flex-1">
            {/* Licence */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Licence</h3>

              {licenseStatus === "loading" && (
                <p className="text-sm text-slate-400">Chargement…</p>
              )}
              {licenseError && <p className="text-sm text-red-400">{licenseError}</p>}

              {licenseForm && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Agents disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(["strategie", "vente", "finance", "technique", "codir"] as const).map((agent) => {
                        const checked = licenseForm.available_agents.includes(agent);
                        return (
                          <label
                            key={agent}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                              checked
                                ? "bg-violet-600/20 border-violet-500 text-violet-200"
                                : "bg-slate-800 border-slate-700 text-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => updateAgent(agent, e.target.checked)}
                              className="accent-violet-500"
                            />
                            {agent}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs text-slate-400">
                      Messages chat / jour
                      <input
                        type="number"
                        min={1}
                        value={licenseForm.max_chat_messages_per_day}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev ? { ...prev, max_chat_messages_per_day: Number.parseInt(e.target.value || "1", 10) } : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block text-xs text-slate-400">
                      Sessions CODIR / mois
                      <input
                        type="number"
                        min={1}
                        value={licenseForm.max_codir_sessions_per_month}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev ? { ...prev, max_codir_sessions_per_month: Number.parseInt(e.target.value || "1", 10) } : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block text-xs text-slate-400">
                      Fenêtre mémoire (messages)
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={licenseForm.conversational_memory_window}
                        onChange={(e) =>
                          setLicenseForm((prev) =>
                            prev ? { ...prev, conversational_memory_window: Number.parseInt(e.target.value || "1", 10) } : prev
                          )
                        }
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </label>
                    {detail.type === "partner" && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quotas startups par forfait</p>
                        {(["starter", "growth", "scale"] as const).map((p) => (
                          <label key={p} className="flex items-center justify-between gap-3 text-xs text-slate-400">
                            <span className="capitalize">{p}</span>
                            <input
                              type="number"
                              min={0}
                              value={licenseForm.portfolio_plan_allowances[p]}
                              onChange={(e) =>
                                setLicenseForm((prev) =>
                                  prev ? { ...prev, portfolio_plan_allowances: { ...prev.portfolio_plan_allowances, [p]: Number.parseInt(e.target.value || "0", 10) } } : prev
                                )
                              }
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white text-right"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={licenseForm.conversational_memory_enabled}
                      onChange={(e) =>
                        setLicenseForm((prev) =>
                          prev ? { ...prev, conversational_memory_enabled: e.target.checked } : prev
                        )
                      }
                      className="accent-violet-500"
                    />
                    Mémoire conversationnelle active
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveLicense}
                      disabled={licenseStatus === "saving"}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {licenseStatus === "saving" ? "Enregistrement…" : "Enregistrer la licence"}
                    </button>
                    {licenseStatus === "ok" && (
                      <span className="text-sm text-emerald-400 font-semibold">✓ Mis à jour</span>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Portefeuille (partenaire uniquement) */}
            {detail.type === "partner" && (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Portefeuille</h3>

                {portfolioError && <p className="text-sm text-red-400">{portfolioError}</p>}

                {partnerPortfolio.length > 0 ? (
                  <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden">
                    {partnerPortfolio.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/60">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-white truncate">{s.name ?? "—"}</span>
                          <span className="block text-xs text-slate-500 truncate">{s.owner_email ?? s.id}</span>
                        </span>
                        <button
                          type="button"
                          disabled={portfolioLoading}
                          onClick={() => assignStartup(s.id, null)}
                          className="shrink-0 text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-40"
                        >
                          Détacher
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Aucune startup dans le portefeuille.</p>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Attacher une startup</p>
                  <input
                    type="search"
                    value={portfolioSearch}
                    onChange={(e) => setPortfolioSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                  {attachableStartups.length > 0 ? (
                    <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                      {attachableStartups.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/40">
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-white truncate">{s.name ?? "—"}</span>
                            <span className="block text-xs text-slate-500 truncate">
                              {s.owner_email ?? s.id}
                              {s.partner_id && (
                                <span className="ml-1 text-amber-500">(déjà chez {partnerName(s.partner_id)})</span>
                              )}
                            </span>
                          </span>
                          <button
                            type="button"
                            disabled={portfolioLoading}
                            onClick={() => assignStartup(s.id, detail.id)}
                            className="shrink-0 text-xs font-bold text-violet-400 hover:text-violet-300 disabled:opacity-40"
                          >
                            Attacher
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    portfolioSearch && <p className="text-sm text-slate-500">Aucun résultat.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    )}
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-3xl font-black text-white tabular-nums">{value}</p>
      <p className="text-sm font-bold text-slate-300 mt-1">{label}</p>
      <p className="text-xs text-slate-500 mt-2">{hint}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <h2 className="text-sm font-black text-white">{title}</h2>
      </div>
      <div className="px-4">{children}</div>
    </section>
  );
}

function DataTable({
  columns,
  rows,
  empty,
  onRowClick,
  onDelete,
}: {
  columns: string[];
  rows: string[][];
  empty: string;
  onRowClick?: (index: number) => void;
  onDelete?: (index: number) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-slate-500 py-16 text-sm border border-dashed border-slate-700 rounded-2xl">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 whitespace-nowrap">
                {c}
              </th>
            ))}
            {onDelete && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((cells, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(i)}
              className={`hover:bg-slate-800/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {cells.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 text-slate-300 max-w-[14rem] truncate ${j === 0 ? "font-medium text-white" : ""}`}
                  title={cell}
                >
                  {cell}
                </td>
              ))}
              {onDelete && (
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(i); }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-900/30 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
