export type AgentKey = "strategie" | "vente" | "finance" | "technique" | "operations" | "codir";
export type PlanKey = "starter" | "growth" | "scale";

export type LicenseConfig = {
  available_agents: AgentKey[];
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

export const DEFAULT_LICENSE_CONFIG: LicenseConfig = {
  available_agents: ["strategie", "vente", "finance", "technique", "operations", "codir"],
  conversational_memory_enabled: true,
  conversational_memory_window: 10,
  max_chat_messages_per_day: 200,
  max_codir_sessions_per_month: 30,
  portfolio_plan_allowances: {
    starter: 10,
    growth: 5,
    scale: 2,
  },
};

export const PLAN_PRESETS: Record<PlanKey, LicenseConfig> = {
  starter: {
    available_agents: ["strategie", "technique", "vente"],
    conversational_memory_enabled: true,
    conversational_memory_window: 5,
    max_chat_messages_per_day: 20,
    max_codir_sessions_per_month: 0,
    portfolio_plan_allowances: { starter: 10, growth: 5, scale: 2 },
  },
  growth: {
    available_agents: ["strategie", "technique", "vente", "finance", "codir"],
    conversational_memory_enabled: true,
    conversational_memory_window: 20,
    max_chat_messages_per_day: 9999,
    max_codir_sessions_per_month: 20,
    portfolio_plan_allowances: { starter: 10, growth: 5, scale: 2 },
  },
  scale: {
    available_agents: ["strategie", "technique", "vente", "finance", "operations", "codir"],
    conversational_memory_enabled: true,
    conversational_memory_window: 50,
    max_chat_messages_per_day: 9999,
    max_codir_sessions_per_month: 9999,
    portfolio_plan_allowances: { starter: 10, growth: 5, scale: 2 },
  },
};

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? Math.round(value) : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function sanitizeAgents(value: unknown): AgentKey[] {
  if (!Array.isArray(value)) return DEFAULT_LICENSE_CONFIG.available_agents;
  const allowed: AgentKey[] = ["strategie", "vente", "finance", "technique", "operations", "codir"];
  const uniq = new Set<AgentKey>();
  for (const item of value) {
    if (typeof item === "string" && allowed.includes(item as AgentKey)) {
      uniq.add(item as AgentKey);
    }
  }
  return uniq.size > 0 ? Array.from(uniq) : DEFAULT_LICENSE_CONFIG.available_agents;
}

export function normalizeLicenseConfig(input: unknown): LicenseConfig {
  const raw = (input ?? {}) as Record<string, unknown>;
  const allowances = (raw.portfolio_plan_allowances ?? {}) as Record<string, unknown>;
  return {
    available_agents: sanitizeAgents(raw.available_agents),
    conversational_memory_enabled:
      typeof raw.conversational_memory_enabled === "boolean"
        ? raw.conversational_memory_enabled
        : DEFAULT_LICENSE_CONFIG.conversational_memory_enabled,
    conversational_memory_window: clampInt(
      raw.conversational_memory_window,
      DEFAULT_LICENSE_CONFIG.conversational_memory_window,
      1,
      100
    ),
    max_chat_messages_per_day: clampInt(
      raw.max_chat_messages_per_day,
      DEFAULT_LICENSE_CONFIG.max_chat_messages_per_day,
      1,
      100000
    ),
    max_codir_sessions_per_month: clampInt(
      raw.max_codir_sessions_per_month,
      DEFAULT_LICENSE_CONFIG.max_codir_sessions_per_month,
      1,
      100000
    ),
    portfolio_plan_allowances: {
      starter: clampInt(allowances.starter, DEFAULT_LICENSE_CONFIG.portfolio_plan_allowances.starter, 0, 100000),
      growth: clampInt(allowances.growth, DEFAULT_LICENSE_CONFIG.portfolio_plan_allowances.growth, 0, 100000),
      scale: clampInt(allowances.scale, DEFAULT_LICENSE_CONFIG.portfolio_plan_allowances.scale, 0, 100000),
    },
  };
}
