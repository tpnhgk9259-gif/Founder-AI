import { createClient } from "@supabase/supabase-js";
import {
  createBrowserClient as createSSRBrowserClient,
} from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Client serveur avec service role key — contourne RLS, usage API routes uniquement */
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase non configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Client navigateur avec anon key.
 * Utilise @supabase/ssr pour stocker la session dans les cookies
 * (lisible par le middleware et les Server Components).
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSSRBrowserClient(url, key);
}

export type AgentKey = "strategie" | "vente" | "finance" | "technique";

export interface StartupKpi {
  name: string;        // ex: "MRR", "CAC", "Churn"
  value: string;       // ex: "12 000"
  unit: string;        // ex: "€", "%", "clients"
  trend?: "up" | "down" | "stable";
}

export interface StartupDecision {
  date: string;        // ISO date, ex: "2026-03-15"
  description: string; // ex: "Pivot vers le marché PME industriel"
  owner?: string;      // ex: "CEO", "CTO"
}

export interface StartupIssue {
  title: string;       // ex: "Churn élevé sur le segment SMB"
  priority: "high" | "medium" | "low";
  context?: string;    // détails supplémentaires
}

export interface StartupProfile {
  id: string;
  user_id: string;
  name: string | null;
  sector: string | null;
  stage: "idea" | "pre-seed" | "seed" | "series-a" | "series-b+" | null;
  team_size: number | null;
  business_model: string | null;
  key_kpis: StartupKpi[];
  recent_decisions: StartupDecision[];
  current_issues: StartupIssue[];
  description: string | null;
  documents: unknown[];
  updated_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "agent";
  content: string;
  model: string | null;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  conversation_id: string;
  content: string;
  covered_up_to: string;
  created_at: string;
}
