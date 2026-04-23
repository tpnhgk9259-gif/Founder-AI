/**
 * Service centralisé de vérification des licences.
 *
 * Regroupe les contrôles d'accès et de quotas qui étaient dispersés
 * dans les routes chat et codir.
 */

import { createServerClient } from "@/lib/supabase";
import type { AgentKey } from "@/lib/supabase";
import { getEffectiveStartupLicense } from "@/lib/licenses-server";
import type { LicenseConfig } from "@/lib/licenses";

export type LicenseCheckResult =
  | { ok: true; license: LicenseConfig; quotaPercent?: number }
  | { ok: false; error: string; status: 403 | 429 };

/**
 * Vérifie qu'un startup peut envoyer un message à un agent :
 *  - l'agent est inclus dans la licence
 *  - le quota quotidien de messages n'est pas dépassé
 */
export async function checkChatAccess(
  startupId: string,
  agentKey: AgentKey | string
): Promise<LicenseCheckResult> {
  const license = await getEffectiveStartupLicense(startupId);

  // Les agents custom (custom_*) sont autorisés s'ils existent — le check se fait côté DB
  if (!agentKey.startsWith("custom_") && !license.available_agents.includes(agentKey as AgentKey)) {
    return { ok: false, error: "Cet agent n'est pas inclus dans votre licence.", status: 403 };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const supabase = createServerClient();
  const { data: convos } = await supabase
    .from("conversations")
    .select("id")
    .eq("startup_id", startupId);

  const convoIds = convos?.map((c) => c.id) ?? [];

  if (convoIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", startOfDay.toISOString())
      .in("conversation_id", convoIds);

    const used = count ?? 0;
    if (used >= license.max_chat_messages_per_day) {
      return { ok: false, error: "Limite quotidienne de messages atteinte pour cette licence.", status: 429 };
    }
    const quotaPercent = Math.round((used / license.max_chat_messages_per_day) * 100);
    return { ok: true, license, quotaPercent };
  }

  return { ok: true, license };
}

/**
 * Vérifie qu'un startup peut lancer une session CODIR :
 *  - le mode CODIR est inclus dans la licence
 *  - le quota mensuel de sessions n'est pas dépassé
 */
export async function checkCodirAccess(
  startupId: string
): Promise<LicenseCheckResult> {
  const license = await getEffectiveStartupLicense(startupId);

  if (!license.available_agents.includes("codir")) {
    return { ok: false, error: "Le mode CODIR n'est pas inclus dans votre licence.", status: 403 };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const supabase = createServerClient();
  const { count } = await supabase
    .from("codir_sessions")
    .select("id", { count: "exact", head: true })
    .eq("startup_id", startupId)
    .gte("created_at", monthStart.toISOString());

  if ((count ?? 0) >= license.max_codir_sessions_per_month) {
    return { ok: false, error: "Limite mensuelle de sessions CODIR atteinte pour cette licence.", status: 429 };
  }

  return { ok: true, license };
}
