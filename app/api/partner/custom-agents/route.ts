import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";
import { indexAgentKnowledge } from "@/lib/rag";
import { logAudit } from "@/lib/audit";

async function getPartnerAdmin(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return data?.partner_id as string | null ?? null;
}

// GET — lister les agents custom du partenaire
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = req.nextUrl.searchParams.get("partnerId");
  if (!partnerId) return Response.json({ error: "partnerId requis" }, { status: 400 });

  const supabase = createServerClient();
  const { data } = await supabase
    .from("custom_agents")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at");

  const { data: partner } = await supabase
    .from("partners")
    .select("max_custom_agents")
    .eq("id", partnerId)
    .maybeSingle();

  return Response.json({
    agents: data ?? [],
    maxAgents: partner?.max_custom_agents ?? 0,
  });
}

// POST — créer un agent custom
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = await getPartnerAdmin(userId);
  if (!partnerId) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const { name, role, emoji, systemPrompt, knowledge } = await req.json();
  if (!name?.trim() || !role?.trim()) {
    return Response.json({ error: "Nom et rôle requis" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Vérifier le quota
  const [{ count }, { data: partner }] = await Promise.all([
    supabase.from("custom_agents").select("id", { count: "exact", head: true }).eq("partner_id", partnerId),
    supabase.from("partners").select("max_custom_agents").eq("id", partnerId).maybeSingle(),
  ]);
  const max = partner?.max_custom_agents ?? 0;
  if ((count ?? 0) >= max) {
    return Response.json({ error: `Limite de ${max} agents custom atteinte. Contactez l'administrateur.` }, { status: 400 });
  }

  const { data: agent, error } = await supabase
    .from("custom_agents")
    .insert({
      partner_id: partnerId,
      name: name.trim(),
      role: role.trim(),
      emoji: emoji || "🤖",
      system_prompt: systemPrompt?.trim() || "",
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Indexer les connaissances si fournies
  if (knowledge?.trim()) {
    const agentKey = `custom_${agent.id}`;
    indexAgentKnowledge(agentKey, knowledge, "partner", partnerId).catch((err) => {
      console.error(`[custom-agent] Indexation échouée pour ${agentKey} :`, err);
    });
  }

  logAudit({ userId, action: "knowledge.update", entityType: "custom_agent", entityId: agent.id, metadata: { name, partnerId } });

  return Response.json({ agent });
}

// PUT — mettre à jour un agent custom
export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = await getPartnerAdmin(userId);
  if (!partnerId) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const { agentId, name, role, emoji, systemPrompt, knowledge } = await req.json();
  if (!agentId) return Response.json({ error: "agentId requis" }, { status: 400 });

  const supabase = createServerClient();

  // Vérifier que l'agent appartient au partenaire
  const { data: existing } = await supabase
    .from("custom_agents")
    .select("id")
    .eq("id", agentId)
    .eq("partner_id", partnerId)
    .maybeSingle();
  if (!existing) return Response.json({ error: "Agent non trouvé" }, { status: 404 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (role !== undefined) updates.role = role.trim();
  if (emoji !== undefined) updates.emoji = emoji;
  if (systemPrompt !== undefined) updates.system_prompt = systemPrompt.trim();

  const { error } = await supabase.from("custom_agents").update(updates).eq("id", agentId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Ré-indexer les connaissances si mises à jour
  if (knowledge !== undefined) {
    const agentKey = `custom_${agentId}`;
    indexAgentKnowledge(agentKey, knowledge ?? "", "partner", partnerId).catch((err) => {
      console.error(`[custom-agent] Ré-indexation échouée pour ${agentKey} :`, err);
    });
  }

  return Response.json({ ok: true });
}

// DELETE — supprimer un agent custom
export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = await getPartnerAdmin(userId);
  if (!partnerId) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) return Response.json({ error: "agentId requis" }, { status: 400 });

  const supabase = createServerClient();

  // Supprimer les chunks de connaissances
  await supabase.from("knowledge_chunks").delete().eq("agent_key", `custom_${agentId}`);
  await supabase.from("agent_knowledge").delete().eq("agent_key", `custom_${agentId}`);

  // Supprimer les conversations liées
  const { data: convos } = await supabase.from("conversations").select("id").eq("agent_key", `custom_${agentId}`);
  if (convos?.length) {
    const ids = convos.map((c) => c.id);
    await supabase.from("conversation_summaries").delete().in("conversation_id", ids);
    await supabase.from("messages").delete().in("conversation_id", ids);
    await supabase.from("conversations").delete().in("id", ids);
  }

  // Supprimer l'agent
  const { error } = await supabase.from("custom_agents").delete().eq("id", agentId).eq("partner_id", partnerId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  logAudit({ userId, action: "document.delete", entityType: "custom_agent", entityId: agentId, metadata: { partnerId } });

  return Response.json({ ok: true });
}
