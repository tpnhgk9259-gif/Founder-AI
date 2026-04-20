import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { startupId } = await req.json();
  if (!startupId) {
    return Response.json({ error: "startupId requis" }, { status: 400 });
  }

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data: startup } = await supabase
    .from("startups")
    .select("name, sector, stage, business_model, description, key_kpis, recent_decisions, current_issues, documents")
    .eq("id", startupId)
    .single();

  if (!startup) {
    return Response.json({ error: "Startup introuvable" }, { status: 404 });
  }

  // Récupérer les dernières conversations CODIR pour enrichir le contexte
  const { data: conversations } = await supabase
    .from("conversations")
    .select("agent_key, messages")
    .eq("startup_id", startupId)
    .order("updated_at", { ascending: false })
    .limit(8);

  const contextParts: string[] = [];

  if (startup.name) contextParts.push(`Nom : ${startup.name}`);
  if (startup.sector) contextParts.push(`Secteur : ${startup.sector}`);
  if (startup.stage) contextParts.push(`Stade : ${startup.stage}`);
  if (startup.business_model) contextParts.push(`Modèle économique : ${startup.business_model}`);
  if (startup.description) contextParts.push(`Description : ${startup.description}`);

  if (Array.isArray(startup.key_kpis) && startup.key_kpis.length > 0) {
    const kpis = (startup.key_kpis as { name: string; value: string }[])
      .map((k) => `${k.name}: ${k.value}`)
      .join(", ");
    contextParts.push(`KPIs : ${kpis}`);
  }

  if (Array.isArray(startup.recent_decisions) && startup.recent_decisions.length > 0) {
    const decisions = (startup.recent_decisions as { description: string }[])
      .map((d) => d.description)
      .join("; ");
    contextParts.push(`Décisions récentes : ${decisions}`);
  }

  if (Array.isArray(startup.current_issues) && startup.current_issues.length > 0) {
    const issues = (startup.current_issues as { description: string }[])
      .map((i) => i.description)
      .join("; ");
    contextParts.push(`Enjeux actuels : ${issues}`);
  }

  if (Array.isArray(conversations) && conversations.length > 0) {
    const excerpts: string[] = [];
    for (const conv of conversations) {
      const msgs = (conv.messages as { role: string; content: string }[]) ?? [];
      const relevant = msgs.slice(-4);
      if (relevant.length > 0) {
        const snippet = relevant.map((m) => `${m.role === "user" ? "Fondateur" : conv.agent_key}: ${m.content.slice(0, 200)}`).join("\n");
        excerpts.push(snippet);
      }
    }
    if (excerpts.length > 0) {
      contextParts.push(`\nExtraits des conversations avec les agents :\n${excerpts.join("\n\n")}`);
    }
  }

  const context = contextParts.join("\n");

  const prompt = `Tu es un expert en stratégie d'entreprise. À partir du contexte ci-dessous sur une startup, remplis un Lean Canvas complet.

Contexte startup :
${context}

Réponds UNIQUEMENT avec un objet JSON valide contenant ces 9 clés (sans markdown, sans commentaires) :
{
  "probleme": "...",
  "solution": "...",
  "proposition_valeur": "...",
  "avantage_concurrentiel": "...",
  "segments_clients": "...",
  "metriques_cles": "...",
  "canaux": "...",
  "structure_couts": "...",
  "sources_revenus": "..."
}

Chaque valeur doit être concise (2-4 phrases ou une liste à puces), directement exploitable, et basée sur le contexte fourni. Si une information manque, fais une hypothèse raisonnable basée sur le secteur et le stade.`;

  try {
    const response = await claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Réponse IA invalide" }, { status: 500 });
    }

    const sections = JSON.parse(jsonMatch[0]);
    return Response.json({ sections });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
