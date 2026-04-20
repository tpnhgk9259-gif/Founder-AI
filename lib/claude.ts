import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Routing des modèles :
 * - INTENT  : Haiku  — détection d'intention (rapide, peu coûteux)
 * - CHAT    : Sonnet — conversations standard avec les agents
 * - CODIR   : Opus   — sessions CODIR et livrables complexes
 */
export const MODELS = {
  INTENT: "claude-haiku-4-5",
  CHAT: "claude-sonnet-4-6",
  CODIR: "claude-opus-4-6",
} as const;

/** Encode une donnée en événement SSE. */
export function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}
