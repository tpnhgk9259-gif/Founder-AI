import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import type Anthropic from "@anthropic-ai/sdk";
import { getAuthenticatedUserId } from "@/lib/auth";

type AgentKey = "strategie" | "vente" | "finance" | "technique";
type Suggestion = AgentKey | "codir" | "same";

const AGENT_DESCRIPTIONS = `- strategie : vision, positionnement concurrentiel, pivot, OKR, expansion marché
- vente : acquisition client, pricing, go-to-market, pipeline, partenariats
- finance : trésorerie, runway, métriques SaaS, levée de fonds, burn rate
- technique : produit, roadmap, priorisation, discovery, build vs buy, UX`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  let body: { message: string; agentKey: AgentKey };
  try {
    body = await req.json();
  } catch {
    return Response.json({ suggestion: "same" });
  }

  const { message, agentKey } = body;
  if (!message?.trim()) return Response.json({ suggestion: "same" });

  try {
    const response = await claude.messages.create({
      model: MODELS.INTENT,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content:
            `Tu es un classificateur d'intention pour une application de conseil startup.\n\n` +
            `Domaines disponibles :\n${AGENT_DESCRIPTIONS}\n` +
            `- codir : question transversale impliquant 2 domaines ou plus\n\n` +
            `Question : "${message}"\n` +
            `Agent actuel : ${agentKey}\n\n` +
            `Réponds UNIQUEMENT avec ce JSON (sans markdown) :\n` +
            `{"suggestion":"strategie|vente|finance|technique|codir|same","reason":"max 10 mots"}\n\n` +
            `"same" = la question est bien adressée à l'agent actuel.`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    const parsed = JSON.parse(text) as { suggestion: Suggestion; reason: string };
    return Response.json(parsed);
  } catch {
    return Response.json({ suggestion: "same" });
  }
}
