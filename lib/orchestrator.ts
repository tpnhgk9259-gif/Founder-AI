import Anthropic from "@anthropic-ai/sdk";
import {
  createServerClient,
  type AgentKey,
  type Message,
  type StartupProfile,
} from "./supabase";
import { claude, MODELS } from "./claude";

const VERBATIM_WINDOW = 10; // messages récents injectés verbatim
const SUMMARIZE_AT = VERBATIM_WINDOW; // déclenche le résumé quand on atteint cette limite

/**
 * Récupère ou crée une conversation pour un agent donné dans une startup.
 */
export async function getOrCreateConversation(
  startupId: string,
  agentKey: AgentKey | string
): Promise<string> {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("startup_id", startupId)
    .eq("agent_key", agentKey)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ startup_id: startupId, agent_key: agentKey })
    .select("id")
    .single();

  if (error || !created) throw new Error("Impossible de créer la conversation");
  return created.id;
}

/**
 * Assemble le tableau de messages Anthropic à partir de l'historique DB.
 * Ordre : [résumé compressé?] + [N derniers messages verbatim]
 */
export async function buildConversationMessages(
  conversationId: string,
  windowSize = VERBATIM_WINDOW
): Promise<Anthropic.MessageParam[]> {
  const supabase = createServerClient();

  // Dernier résumé disponible
  const { data: summaries } = await supabase
    .from("conversation_summaries")
    .select("content, covered_up_to, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestSummary = summaries?.[0];

  // Messages récents (après le résumé, ou tous si pas de résumé)
  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (latestSummary) {
    query = query.gt("created_at", latestSummary.created_at);
  }

  const { data: recentMessages } = await query.limit(windowSize);
  const messages: Message[] = recentMessages ?? [];

  const result: Anthropic.MessageParam[] = [];

  // Injecter le résumé comme contexte si disponible
  if (latestSummary) {
    result.push({
      role: "user",
      content: `[Résumé des échanges précédents]\n${latestSummary.content}`,
    });
    result.push({
      role: "assistant",
      content: "Bien noté, je garde ce contexte en mémoire.",
    });
  }

  // Injecter les messages récents verbatim
  for (const msg of messages) {
    result.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  }

  return result;
}

/**
 * Persiste un message en base.
 */
export async function saveMessage(
  conversationId: string,
  role: "user" | "agent",
  content: string,
  model?: string
): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    model: model ?? null,
  });
}

/**
 * Vérifie si un résumé doit être généré pour cette conversation.
 * Déclenché quand le nombre de messages depuis le dernier résumé atteint SUMMARIZE_AT.
 * Les résumés sont chaînés : chaque nouveau résumé consolide le précédent.
 * Retry automatique une fois en cas d'échec transitoire.
 */
export async function maybeSummarize(conversationId: string): Promise<void> {
  try {
    await runSummarize(conversationId);
  } catch (err) {
    console.error(`[maybeSummarize] Échec initial pour conversation ${conversationId} :`, err);
    // Retry une fois après 2s
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await runSummarize(conversationId);
    } catch (retryErr) {
      console.error(`[maybeSummarize] Échec retry pour conversation ${conversationId} :`, retryErr);
      // La conversation continuera sans résumé — la fenêtre verbatim prend le relais
    }
  }
}

async function runSummarize(conversationId: string): Promise<void> {
  const supabase = createServerClient();

  // 1. Dernier résumé existant
  const { data: summaries } = await supabase
    .from("conversation_summaries")
    .select("id, content, covered_up_to, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestSummary = summaries?.[0] ?? null;

  // 2. Messages depuis le dernier résumé
  let query = supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (latestSummary) {
    query = query.gt("created_at", latestSummary.created_at);
  }

  const { data: messages } = await query;
  if (!messages || messages.length < SUMMARIZE_AT) return;

  // 3. Construire le prompt de résumé (résumé chaîné si résumé précédent)
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Fondateur" : "Agent"} : ${m.content}`)
    .join("\n\n");

  const previousSection = latestSummary
    ? `## Résumé des échanges précédents\n${latestSummary.content}\n\n`
    : "";

  const response = await claude.messages.create({
    model: MODELS.INTENT, // Haiku — rapide et économique pour la synthèse
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content:
          `${previousSection}## Nouveaux échanges\n${transcript}\n\n` +
          `Produis un résumé consolidé en 4-6 points clés. ` +
          `Retiens : informations importantes sur la startup, problèmes identifiés, ` +
          `recommandations faites, décisions prises. Réponds en français.`,
      },
    ],
  });

  const summaryContent = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const lastMessageId = messages[messages.length - 1].id;

  await supabase.from("conversation_summaries").insert({
    conversation_id: conversationId,
    content: summaryContent,
    covered_up_to: lastMessageId,
  });
}

/**
 * Récupère le profil complet de la startup.
 */
export async function getStartupProfile(
  startupId: string
): Promise<StartupProfile | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("startups")
    .select("*")
    .eq("id", startupId)
    .single();
  return (data as StartupProfile) ?? null;
}

type StoredDocument = { id: string; name: string; text: string; uploadedAt: string; dataUrl?: string };

/**
 * Sérialise le profil startup en texte structuré pour l'injection dans le system prompt.
 */
export function formatStartupContext(profile: StartupProfile): string {
  const lines: string[] = [];

  if (profile.name) lines.push(`Startup : ${profile.name}`);
  if (profile.sector) lines.push(`Secteur : ${profile.sector}`);
  if (profile.stage) lines.push(`Stade : ${profile.stage}`);
  if (profile.team_size) lines.push(`Taille d'équipe : ${profile.team_size} personnes`);
  if (profile.business_model) lines.push(`Modèle économique : ${profile.business_model}`);
  if (profile.description) lines.push(`\nDescription :\n${profile.description}`);

  if (profile.key_kpis?.length) {
    lines.push("\nKPIs clés :");
    for (const kpi of profile.key_kpis) {
      const trend = kpi.trend ? ` (${kpi.trend})` : "";
      lines.push(`  - ${kpi.name} : ${kpi.value} ${kpi.unit}${trend}`);
    }
  }

  if (profile.recent_decisions?.length) {
    lines.push("\nDécisions récentes :");
    for (const d of profile.recent_decisions) {
      const owner = d.owner ? ` [${d.owner}]` : "";
      lines.push(`  - ${d.date}${owner} : ${d.description}`);
    }
  }

  if (profile.current_issues?.length) {
    lines.push("\nPlan d'action :");
    for (const action of profile.current_issues) {
      const owner = action.owner ? ` (${action.owner})` : "";
      const due = action.dueDate ? ` — échéance ${action.dueDate}` : "";
      const desc = action.description ? ` — ${action.description}` : "";
      const status = action.status ?? "todo";
      lines.push(`  - [${status.toUpperCase()}] ${action.title}${owner}${due}${desc}`);
    }
  }

  const docs = (profile.documents as (StoredDocument & { deleted_at?: string })[] | undefined)
    ?.filter((d) => !d.deleted_at);
  if (docs?.length) {
    lines.push("\n--- Documents joints ---");
    for (const doc of docs) {
      if (doc.text?.trim()) {
        lines.push(`\n[${doc.name}]\n${doc.text.slice(0, 8000)}`);
      }
    }
    lines.push("--- Fin des documents ---");
  }

  return lines.join("\n");
}

/** @deprecated Utiliser getStartupProfile + formatStartupContext */
export async function getStartupDescription(
  startupId: string
): Promise<string | null> {
  const profile = await getStartupProfile(startupId);
  if (!profile) return null;
  return formatStartupContext(profile);
}

/**
 * Persiste ou met à jour une session CODIR.
 */
export async function saveCodirSession(params: {
  startupId: string;
  question: string;
  agentAnalyses?: { agentKey: string; content: string }[];
  synthesis?: string;
  status: "dispatching" | "synthesizing" | "done" | "error";
}): Promise<string> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("codir_sessions")
    .insert({
      startup_id: params.startupId,
      question: params.question,
      agent_analyses: params.agentAnalyses ?? null,
      synthesis: params.synthesis ?? null,
      status: params.status,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Impossible de créer la session CODIR");
  return data.id;
}

export async function updateCodirSession(
  sessionId: string,
  updates: {
    agentAnalyses?: { agentKey: string; content: string }[];
    synthesis?: string;
    status?: "dispatching" | "synthesizing" | "done" | "error";
  }
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("codir_sessions")
    .update({
      ...(updates.agentAnalyses !== undefined && {
        agent_analyses: updates.agentAnalyses,
      }),
      ...(updates.synthesis !== undefined && { synthesis: updates.synthesis }),
      ...(updates.status !== undefined && { status: updates.status }),
    })
    .eq("id", sessionId);
}
