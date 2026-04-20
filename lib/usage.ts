/**
 * Module de tracking d'usage API — log les tokens consommés par chaque appel Claude.
 * Fire-and-forget : ne jamais bloquer l'action principale.
 */

import { createServerClient } from "./supabase";

export function logUsage(params: {
  startupId?: string | null;
  userId?: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  endpoint: string;
}): void {
  const supabase = createServerClient();
  supabase
    .from("api_usage_log")
    .insert({
      startup_id: params.startupId ?? null,
      user_id: params.userId ?? null,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      endpoint: params.endpoint,
    })
    .then(({ error }) => {
      if (error) console.error("[usage] Échec log :", error.message);
    });
}
