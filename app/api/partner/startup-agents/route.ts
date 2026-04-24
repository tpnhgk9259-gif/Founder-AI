import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

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

// POST — assigner un agent custom à une startup
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = await getPartnerAdmin(userId);
  if (!partnerId) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const { startupId, customAgentId } = await req.json();
  if (!startupId || !customAgentId) return Response.json({ error: "startupId et customAgentId requis" }, { status: 400 });

  const supabase = createServerClient();

  // Vérifier que la startup appartient au partenaire
  const { data: startup } = await supabase.from("startups").select("id").eq("id", startupId).eq("partner_id", partnerId).maybeSingle();
  if (!startup) return Response.json({ error: "Startup non trouvée dans votre portefeuille" }, { status: 404 });

  // Vérifier que l'agent appartient au partenaire
  const { data: agent } = await supabase.from("custom_agents").select("id").eq("id", customAgentId).eq("partner_id", partnerId).maybeSingle();
  if (!agent) return Response.json({ error: "Agent non trouvé" }, { status: 404 });

  const { error } = await supabase.from("startup_custom_agents").upsert({ startup_id: startupId, custom_agent_id: customAgentId });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

// DELETE — retirer un agent custom d'une startup
export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const partnerId = await getPartnerAdmin(userId);
  if (!partnerId) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const startupId = req.nextUrl.searchParams.get("startupId");
  const customAgentId = req.nextUrl.searchParams.get("customAgentId");
  if (!startupId || !customAgentId) return Response.json({ error: "startupId et customAgentId requis" }, { status: 400 });

  const supabase = createServerClient();
  await supabase.from("startup_custom_agents").delete().eq("startup_id", startupId).eq("custom_agent_id", customAgentId);

  return Response.json({ ok: true });
}
