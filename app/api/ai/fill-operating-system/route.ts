import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { getStartupDescription } from "@/lib/orchestrator";
import { buildCodirAgentPrompt } from "@/lib/prompts";
import { retrieveRelevantChunks } from "@/lib/rag";
import { logUsage } from "@/lib/usage";
import { jsonrepair } from "jsonrepair";
import { streamWithHeartbeat } from "@/lib/stream-helper";
import type { AgentKey } from "@/lib/supabase";
import type Anthropic from "@anthropic-ai/sdk";

const PROMPT = `Tu es un expert en operations et scaling de startup. A partir du contexte, genere un Operating System Canvas complet.

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) :

{
  "vision": "Vision a 3 ans, concrete et ambitieuse",
  "mission": "Raison d'exister en 1 phrase",
  "values": ["Valeur1", "Valeur2", "Valeur3", "Valeur4", "Valeur5"],
  "customValues": "",
  "orgChart": "CEO : ...\nCTO : ...\nHead of Growth : ...",
  "processes": [
    { "name": "Acquisition clients", "category": "Commercial", "owner": "Head of Growth", "tools": "HubSpot, Lemlist, LinkedIn Sales Nav", "kpi": "100 leads qualifies/mois", "teamHumans": "1 SDR + 1 AE", "teamAI": "Lemlist sequences auto + ChatGPT emails", "level": "Semi-auto" },
    { "name": "Onboarding clients", "category": "Produit", "owner": "CSM Lead", "tools": "Intercom, Notion, Loom", "kpi": "Time-to-value < 48h", "teamHumans": "1 CSM", "teamAI": "Intercom bot + Loom auto-guides", "level": "Manuel" }
  ],
  "rituals": [
    { "name": "Daily standup", "frequency": "Quotidien", "duration": "15 min", "participants": "Equipe produit" },
    { "name": "Weekly team", "frequency": "Hebdo", "duration": "45 min", "participants": "Toute l'equipe" },
    { "name": "Monthly review", "frequency": "Mensuel", "duration": "2h", "participants": "Cofondateurs + leads" },
    { "name": "Quarterly OKR", "frequency": "Trimestriel", "duration": "Demi-journee", "participants": "Direction" }
  ],
  "metrics": [
    { "name": "MRR", "owner": "CEO", "frequency": "Hebdo", "target": "> 50k" },
    { "name": "Churn", "owner": "CSM", "frequency": "Mensuel", "target": "< 5%" }
  ],
  "hirePlan": [
    { "role": "Dev senior fullstack", "priority": "Haute", "quarter": "T2 26", "budget": "55-65k" },
    { "role": "Head of Sales", "priority": "Haute", "quarter": "T3 26", "budget": "60-75k + variable" }
  ]
}

Regles :
- 5 valeurs max parmi : Transparence, Vitesse d'execution, Obsession client, Frugalite, Autonomie, Data-driven, Impact mesurable, Excellence technique, Bienveillance, Audace, Simplicite, Apprentissage continu, Responsabilite individuelle, Collaboration, Innovation, Integrite, Resilience, Focus, Diversite, Fun
- 6-8 processus avec pour chacun :
  - owner : qui pilote le processus (role, pas nom)
  - tools : outils que le responsable doit maitriser pour piloter
  - kpi : resultat mesurable cible (chiffre concret)
  - teamHumans : dimensionnement humain pour atteindre le KPI (ex: "2 devs fullstack", "1 SDR + 1 AE")
  - teamAI : outils IA/automatisation qui augmentent l'equipe (ex: "Claude Code pair programming", "Lemlist sequences auto")
  - level : Manuel/Semi-auto/Automatise
- Fais le calcul inverse : pour atteindre le KPI avec le niveau d'automatisation donne, combien faut-il de personnes + quels outils IA
- 5-6 metriques ops avec owner et cible chiffree
- 3-5 recrutements priorises avec budget realiste pour le stade
- Tout doit etre specifique au contexte de la startup`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  return streamWithHeartbeat(async (send) => {
    const context = await getStartupDescription(startupId).catch(() => null);
    const chunks = await retrieveRelevantChunks("operations", "organisation processus recrutement outils scaling").catch(() => null);
    const extraKnowledge = chunks?.join("\n\n") ?? null;
    const systemPrompt = buildCodirAgentPrompt("operations" as AgentKey, context, extraKnowledge);

    const response = await claude.messages.create({ model: MODELS.CHAT, max_tokens: 3500, system: systemPrompt, messages: [{ role: "user", content: PROMPT }] });
    const rawText = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");

    logUsage({ startupId, userId, model: response.model, endpoint: "fill-operating-system", inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { send(JSON.stringify({ error: "Reponse IA invalide" })); return; }

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(jsonrepair(jsonMatch[0])); }
    catch { try { parsed = JSON.parse(jsonMatch[0]); } catch { send(JSON.stringify({ error: "Parse error" })); return; } }

    send(JSON.stringify({ data: parsed }));
  });
}
