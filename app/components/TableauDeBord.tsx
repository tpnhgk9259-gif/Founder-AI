"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpi {
  name: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
}

interface Decision {
  id: string;
  date: string;
  description: string;
  owner: string;
  agentKey: "strategie" | "vente" | "finance" | "technique" | "operations" | "codir" | "";
}

interface Action {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  description: string;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface StartupData {
  name: string;
  sector: string;
  stage: string;
  team_size: number | string;
  business_model: string;
  description: string;
  logo?: string;
  key_kpis: Kpi[];
  recent_decisions: Decision[];
  current_issues: Action[];
  collaborators: Collaborator[];
}

// ─── Constantes visuelles ─────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  strategie: { label: "Maya · Stratégie", color: "text-violet-600 bg-violet-50" },
  vente:     { label: "Alex · Commercial", color: "text-orange-600 bg-orange-50" },
  finance:   { label: "Sam · Finance",     color: "text-emerald-600 bg-emerald-50" },
  technique:  { label: "Léo · Produit",      color: "text-sky-600 bg-sky-50" },
  operations: { label: "Marc · Opérations", color: "text-amber-600 bg-amber-50" },
  codir:      { label: "CODIR",             color: "text-gray-600 bg-gray-100" },
  "":        { label: "Interne",           color: "text-gray-500 bg-gray-50" },
};

const STATUS_STYLES = {
  "todo":        "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  "done":        "bg-emerald-100 text-emerald-700",
};
const STATUS_LABELS = { "todo": "À faire", "in-progress": "En cours", "done": "Terminé" };
const STATUS_ICONS  = { "todo": "○", "in-progress": "◐", "done": "●" };

const TREND_ICONS  = { up: "↑", down: "↓", stable: "→" };
const TREND_COLORS = { up: "text-emerald-500", down: "text-red-500", stable: "text-gray-400" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 22, color: "var(--uf-ink)" }}>{title}</h3>
      {action}
    </div>
  );
}

// ─── Section Profil ───────────────────────────────────────────────────────────

function ProfilSection({
  data,
  onSave,
}: {
  data: Partial<StartupData>;
  onSave: (fields: Partial<StartupData>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: data.name ?? "",
    sector: data.sector ?? "",
    stage: data.stage ?? "pre-seed",
    team_size: data.team_size ?? "",
    business_model: data.business_model ?? "",
    description: data.description ?? "",
  });
  const [logo, setLogo] = useState<string>(data.logo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync quand les données chargées arrivent
  useEffect(() => {
    setForm({
      name: data.name ?? "",
      sector: data.sector ?? "",
      stage: data.stage ?? "pre-seed",
      team_size: data.team_size ?? "",
      business_model: data.business_model ?? "",
      description: data.description ?? "",
    });
    setLogo(data.logo ?? "");
  }, [data.name, data.sector, data.stage, data.team_size, data.business_model, data.description, data.logo]);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, team_size: form.team_size ? Number(form.team_size) : undefined, logo });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-7" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
      <SectionHeader title="Profil startup" />
      <form onSubmit={handleSave} className="space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors"
            onClick={() => logoInputRef.current?.click()}
            title="Cliquer pour charger le logo"
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl select-none">🏢</span>
            )}
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Logo de la startup</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
              >
                {logo ? "Changer" : "Charger un logo"}
              </button>
              {logo && (
                <button
                  type="button"
                  onClick={() => { setLogo(""); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400">PNG, JPG, SVG — carré recommandé</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nom de la startup</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ma Startup"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Secteur</label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              placeholder="SaaS · IA"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stade</label>
            <select
              value={form.stage}
              onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors bg-white"
            >
              <option value="idea">Idée</option>
              <option value="pre-seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Série A</option>
              <option value="series-b+">Série B+</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Taille équipe</label>
            <input
              type="number"
              value={form.team_size}
              onChange={(e) => setForm((f) => ({ ...f, team_size: e.target.value }))}
              min={1}
              placeholder="3"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Modèle économique</label>
            <input
              type="text"
              value={form.business_model}
              onChange={(e) => setForm((f) => ({ ...f, business_model: e.target.value }))}
              placeholder="SaaS B2B"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Décrivez votre startup, votre marché et vos objectifs…"
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-900 resize-none transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-all ${
              saved ? "bg-emerald-500 text-white" : "bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white"
            }`}
          >
            {saved ? "✓ Sauvegardé" : saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Section KPIs ─────────────────────────────────────────────────────────────

function KpisSection({
  kpis,
  onChange,
}: {
  kpis: Kpi[];
  onChange: (kpis: Kpi[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Kpi>({ name: "", value: "", unit: "", trend: "stable" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Kpi>({ name: "", value: "", unit: "", trend: "stable" });

  function addKpi() {
    if (!form.name || !form.value) return;
    onChange([...kpis, form]);
    setForm({ name: "", value: "", unit: "", trend: "stable" });
    setAdding(false);
  }

  function removeKpi(i: number) {
    onChange(kpis.filter((_, j) => j !== i));
  }

  function startEdit(i: number) {
    setEditingIndex(i);
    setEditForm({ ...kpis[i] });
    setAdding(false);
  }

  function saveEdit() {
    if (!editForm.name || !editForm.value) return;
    onChange(kpis.map((k, i) => (i === editingIndex ? editForm : k)));
    setEditingIndex(null);
  }

  return (
    <div className="p-7" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
      <SectionHeader
        title="KPIs clés"
        action={
          <button
            onClick={() => { setAdding(true); setEditingIndex(null); }}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Ajouter
          </button>
        }
      />

      {kpis.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">Aucun KPI renseigné.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {kpis.map((kpi, i) => (
          editingIndex === i ? (
            <div key={i} className="col-span-2 sm:col-span-4 border-2 border-violet-200 bg-violet-50/50 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-28 space-y-1">
                <label className="text-xs font-bold text-gray-500">Nom</label>
                <input autoFocus value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors" />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-xs font-bold text-gray-500">Valeur</label>
                <input value={editForm.value} onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors" />
              </div>
              <div className="w-20 space-y-1">
                <label className="text-xs font-bold text-gray-500">Unité</label>
                <input value={editForm.unit} onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors" />
              </div>
              <div className="w-28 space-y-1">
                <label className="text-xs font-bold text-gray-500">Tendance</label>
                <select value={editForm.trend} onChange={(e) => setEditForm((f) => ({ ...f, trend: e.target.value as Kpi["trend"] }))}
                  className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors">
                  <option value="up">↑ Hausse</option>
                  <option value="stable">→ Stable</option>
                  <option value="down">↓ Baisse</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">Enregistrer</button>
                <button onClick={() => setEditingIndex(null)} className="bg-white border-2 border-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">Annuler</button>
              </div>
            </div>
          ) : (
          <div key={i} className="bg-gray-50 rounded-2xl p-4 relative group">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(i)} className="w-5 h-5 rounded-full bg-gray-200 hover:bg-violet-100 text-gray-500 hover:text-violet-600 text-xs flex items-center justify-center" title="Modifier">✏️</button>
              <button onClick={() => removeKpi(i)} className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 text-xs flex items-center justify-center" title="Supprimer">×</button>
            </div>
            <p className="text-xs font-semibold text-gray-400 mb-1">{kpi.name}</p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {kpi.value}
              <span className="text-sm font-semibold text-gray-400 ml-1">{kpi.unit}</span>
            </p>
            <p className={`text-xs font-bold mt-1.5 ${TREND_COLORS[kpi.trend]}`}>
              {TREND_ICONS[kpi.trend]}{" "}
              {kpi.trend === "up" ? "En hausse" : kpi.trend === "down" ? "En baisse" : "Stable"}
            </p>
          </div>
          )
        ))}
      </div>

      {adding && (
        <div className="border-2 border-violet-200 bg-violet-50/50 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-28 space-y-1">
            <label className="text-xs font-bold text-gray-500">Nom</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="MRR"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs font-bold text-gray-500">Valeur</label>
            <input
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="8 500"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div className="w-20 space-y-1">
            <label className="text-xs font-bold text-gray-500">Unité</label>
            <input
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              placeholder="€"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div className="w-28 space-y-1">
            <label className="text-xs font-bold text-gray-500">Tendance</label>
            <select
              value={form.trend}
              onChange={(e) => setForm((f) => ({ ...f, trend: e.target.value as Kpi["trend"] }))}
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors"
            >
              <option value="up">↑ Hausse</option>
              <option value="stable">→ Stable</option>
              <option value="down">↓ Baisse</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addKpi} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Ajouter
            </button>
            <button onClick={() => setAdding(false)} className="bg-white border-2 border-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Décisions ────────────────────────────────────────────────────────

function DecisionsSection({
  decisions,
  onChange,
}: {
  decisions: Decision[];
  onChange: (decisions: Decision[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Decision, "id">>({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    owner: "",
    agentKey: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Decision, "id">>({ date: "", description: "", owner: "", agentKey: "" });

  function addDecision() {
    if (!form.description.trim()) return;
    onChange([{ ...form, id: crypto.randomUUID() }, ...decisions]);
    setForm({ date: new Date().toISOString().slice(0, 10), description: "", owner: "", agentKey: "" });
    setAdding(false);
  }

  function removeDecision(id: string) {
    onChange(decisions.filter((d) => d.id !== id));
  }

  function startEdit(d: Decision) {
    setEditingId(d.id);
    setEditForm({ date: d.date, description: d.description, owner: d.owner, agentKey: d.agentKey });
    setAdding(false);
  }

  function saveEdit() {
    if (!editForm.description.trim()) return;
    onChange(decisions.map((d) => d.id === editingId ? { ...d, ...editForm } : d));
    setEditingId(null);
  }

  return (
    <div className="p-7" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
      <SectionHeader
        title="Historique des décisions"
        action={
          <button onClick={() => setAdding(true)} className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
            + Ajouter
          </button>
        }
      />

      {adding && (
        <div className="border-2 border-violet-200 bg-violet-50/50 rounded-2xl p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Responsable</label>
              <input
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                placeholder="CEO, CTO…"
                className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Décision</label>
            <input
              autoFocus
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez la décision prise…"
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Lié à un agent</label>
            <select
              value={form.agentKey}
              onChange={(e) => setForm((f) => ({ ...f, agentKey: e.target.value as Decision["agentKey"] }))}
              className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors"
            >
              <option value="">Aucun (décision interne)</option>
              <option value="strategie">Maya · Stratégie</option>
              <option value="vente">Alex · Commercial</option>
              <option value="finance">Sam · Finance</option>
              <option value="technique">Léo · Produit</option>
              <option value="operations">Marc · Opérations</option>
              <option value="codir">CODIR</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addDecision} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Enregistrer
            </button>
            <button onClick={() => setAdding(false)} className="bg-white border-2 border-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {decisions.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">Aucune décision enregistrée.</p>
      )}

      <div className="space-y-0">
        {decisions.map((d, i) => {
          const agent = AGENT_LABELS[d.agentKey];
          const isEditing = editingId === d.id;
          return (
            <div key={d.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-violet-500 border-2 border-white ring-2 ring-violet-200 mt-1 flex-shrink-0" />
                {i < decisions.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="pb-5 flex-1 min-w-0">
                {isEditing ? (
                  <div className="border-2 border-violet-200 bg-violet-50/50 rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Date</label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                          className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Responsable</label>
                        <input
                          value={editForm.owner}
                          onChange={(e) => setEditForm((f) => ({ ...f, owner: e.target.value }))}
                          placeholder="CEO, CTO…"
                          className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Décision</label>
                      <input
                        autoFocus
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Lié à un agent</label>
                      <select
                        value={editForm.agentKey}
                        onChange={(e) => setEditForm((f) => ({ ...f, agentKey: e.target.value as Decision["agentKey"] }))}
                        className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors"
                      >
                        <option value="">Aucun (décision interne)</option>
                        <option value="strategie">Maya · Stratégie</option>
                        <option value="vente">Alex · Commercial</option>
                        <option value="finance">Sam · Finance</option>
                        <option value="technique">Léo · Produit</option>
                        <option value="codir">CODIR</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                        Enregistrer
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-white border-2 border-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{d.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        {d.owner && (
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{d.owner}</span>
                        )}
                        {d.agentKey && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent.color}`}>{agent.label}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => startEdit(d)}
                        className="text-gray-300 hover:text-violet-500 transition-colors text-sm"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeDecision(d.id)}
                        className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section Plan d'action ────────────────────────────────────────────────────

const EMPTY_ACTION: Omit<Action, "id"> = {
  title: "",
  owner: "",
  dueDate: "",
  status: "todo",
  description: "",
};

function ActionForm({
  values,
  set,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  values: Omit<Action, "id">;
  set: React.Dispatch<React.SetStateAction<Omit<Action, "id">>>;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="border-2 border-violet-200 bg-violet-50/50 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500">Action *</label>
          <input
            value={values.title}
            onChange={(e) => set((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titre de l'action"
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Responsable</label>
          <input
            value={values.owner}
            onChange={(e) => set((f) => ({ ...f, owner: e.target.value }))}
            placeholder="Prénom ou rôle"
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Échéance</label>
          <input
            type="date"
            value={values.dueDate}
            onChange={(e) => set((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Statut</label>
          <select
            value={values.status}
            onChange={(e) => set((f) => ({ ...f, status: e.target.value as Action["status"] }))}
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm bg-white transition-colors"
          >
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Description (optionnelle)</label>
          <input
            value={values.description}
            onChange={(e) => set((f) => ({ ...f, description: e.target.value }))}
            placeholder="Détails supplémentaires…"
            className="w-full border-2 border-gray-200 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-sm transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSubmit} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          {submitLabel}
        </button>
        <button onClick={onCancel} className="bg-white border-2 border-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          Annuler
        </button>
      </div>
    </div>
  );
}

function ActionPlanSection({
  actions,
  onChange,
}: {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Action, "id">>(EMPTY_ACTION);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Action, "id">>(EMPTY_ACTION);

  function addAction() {
    if (!form.title.trim()) return;
    onChange([...actions, { ...form, id: crypto.randomUUID() }]);
    setForm(EMPTY_ACTION);
    setAdding(false);
  }

  function removeAction(id: string) {
    onChange(actions.filter((x) => x.id !== id));
  }

  function startEdit(action: Action) {
    setEditingId(action.id);
    setEditForm({ title: action.title, owner: action.owner, dueDate: action.dueDate, status: action.status, description: action.description });
  }

  function saveEdit() {
    if (!editForm.title.trim() || !editingId) return;
    onChange(actions.map((a) => (a.id === editingId ? { ...editForm, id: editingId } : a)));
    setEditingId(null);
  }

  const STATUS_ORDER: Action["status"][] = ["in-progress", "todo", "done"];
  const sorted = [...actions].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  return (
    <div className="p-7" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
      <SectionHeader
        title="Plan d'action"
        action={
          <button onClick={() => { setAdding(true); setEditingId(null); }} className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
            + Ajouter
          </button>
        }
      />

      {adding && (
        <div className="mb-4">
          <ActionForm
            values={form}
            set={setForm}
            onSubmit={addAction}
            onCancel={() => setAdding(false)}
            submitLabel="Enregistrer"
          />
        </div>
      )}

      {actions.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">Aucune action planifiée.</p>
      )}

      <div className="space-y-3">
        {sorted.map((action) =>
          editingId === action.id ? (
            <ActionForm
              key={action.id}
              values={editForm}
              set={setEditForm}
              onSubmit={saveEdit}
              onCancel={() => setEditingId(null)}
              submitLabel="Enregistrer"
            />
          ) : (
            <div key={action.id} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-colors group">
              <span className={`text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 ${STATUS_STYLES[action.status]}`}>
                {STATUS_ICONS[action.status]} {STATUS_LABELS[action.status]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {action.owner && (
                    <span className="text-xs text-gray-500">👤 {action.owner}</span>
                  )}
                  {action.dueDate && (
                    <span className="text-xs text-gray-500">📅 {new Date(action.dueDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  )}
                </div>
                {action.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{action.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => startEdit(action)}
                  className="text-gray-400 hover:text-violet-600 text-sm p-1 rounded transition-colors"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeAction(action.id)}
                  className="text-gray-300 hover:text-red-500 text-lg leading-none p-1 rounded transition-colors"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

// ─── Section Collaborateurs ──────────────────────────────────────────────────

const DEPARTMENTS = ["Direction", "Produit", "Tech", "Commercial", "Marketing", "Finance", "Ops", "RH", "Support", "Autre"];

function CollaboratorsSection({
  collaborators,
  onChange,
}: {
  collaborators: Collaborator[];
  onChange: (collaborators: Collaborator[]) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", department: "Produit" });

  function startAdd() {
    setForm({ name: "", role: "", department: "Produit" });
    setEditing("new");
  }

  function startEdit(c: Collaborator) {
    setForm({ name: c.name, role: c.role, department: c.department });
    setEditing(c.id);
  }

  function saveEdit() {
    if (!form.name.trim()) return;
    if (editing === "new") {
      onChange([...collaborators, { id: crypto.randomUUID(), ...form }]);
    } else {
      onChange(collaborators.map((c) => (c.id === editing ? { ...c, ...form } : c)));
    }
    setEditing(null);
  }

  function remove(id: string) {
    onChange(collaborators.filter((c) => c.id !== id));
  }

  return (
    <div className="p-7" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
      <SectionHeader
        title="Collaborateurs"
        action={
          <button onClick={startAdd} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "var(--uf-orange)", color: "#fff" }}>
            + Ajouter
          </button>
        }
      />
      <p className="text-xs mb-4" style={{ color: "var(--uf-muted)" }}>
        {"Listez vos collaborateurs pour pouvoir les affecter aux initiatives dans les OKR et plans d'action."}
      </p>

      {editing && (
        <div className="mb-4 p-4 flex items-end gap-3 flex-wrap" style={{ background: "var(--uf-paper)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Nom</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jean Dupont"
              className="w-full px-3 py-2 text-sm focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Poste</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Lead Developer"
              className="w-full px-3 py-2 text-sm focus:outline-none" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }} />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>{"D\u00E9partement"}</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="px-3 py-2 text-sm focus:outline-none cursor-pointer" style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-card)" }}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}>Enregistrer</button>
            <button onClick={() => setEditing(null)} className="text-xs" style={{ color: "var(--uf-muted)" }}>Annuler</button>
          </div>
        </div>
      )}

      {collaborators.length === 0 && !editing ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--uf-muted)" }}>Aucun collaborateur. Ajoutez votre {"équipe"} pour les affecter aux OKR.</p>
      ) : (
        <div className="space-y-1">
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid var(--uf-line)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--uf-orange)", color: "#fff", fontFamily: "var(--uf-display)" }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "var(--uf-ink)" }}>{c.name}</div>
                <div className="text-xs truncate" style={{ color: "var(--uf-muted)" }}>{c.role}</div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--uf-paper-2)", color: "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}>{c.department}</span>
              <button onClick={() => startEdit(c)} className="text-xs" style={{ color: "var(--uf-muted)" }}>Modifier</button>
              <button onClick={() => remove(c.id)} className="text-xs" style={{ color: "var(--uf-muted)" }}>Retirer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TableauDeBord({ startupId }: { startupId: string | null }) {
  const [data, setData] = useState<Partial<StartupData>>({
    key_kpis: [],
    recent_decisions: [],
    current_issues: [],
    collaborators: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startupId) return;
    fetch(`/api/startup?startupId=${startupId}`)
      .then((r) => r.json())
      .then((d) => {
        setData({
          name: d.name ?? "",
          sector: d.sector ?? "",
          stage: d.stage ?? "pre-seed",
          team_size: d.team_size ?? "",
          business_model: d.business_model ?? "",
          description: d.description ?? "",
          key_kpis: d.key_kpis ?? [],
          recent_decisions: (d.recent_decisions ?? []).map((dec: Decision) => ({
            ...dec,
            id: dec.id ?? crypto.randomUUID(),
            agentKey: dec.agentKey ?? "",
          })),
          collaborators: (d.collaborators ?? []).map((c: Collaborator) => ({
            ...c,
            id: c.id ?? crypto.randomUUID(),
          })),
          current_issues: (d.current_issues ?? []).map((a: Action) => ({
            ...a,
            id: a.id ?? crypto.randomUUID(),
            owner: a.owner ?? "",
            dueDate: a.dueDate ?? "",
            status: a.status ?? "todo",
            description: a.description ?? "",
          })),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [startupId]);

  async function save(fields: Partial<StartupData>) {
    if (!startupId) return;
    const updated = { ...data, ...fields };
    setData(updated);
    await fetch("/api/startup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, ...fields }),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfilSection data={data} onSave={save} />
      <KpisSection
        kpis={data.key_kpis ?? []}
        onChange={(kpis) => save({ key_kpis: kpis })}
      />
      <DecisionsSection
        decisions={data.recent_decisions ?? []}
        onChange={(recent_decisions) => save({ recent_decisions })}
      />
      <ActionPlanSection
        actions={data.current_issues ?? []}
        onChange={(current_issues) => save({ current_issues })}
      />
      <CollaboratorsSection
        collaborators={data.collaborators ?? []}
        onChange={(collaborators) => save({ collaborators })}
      />
    </div>
  );
}
