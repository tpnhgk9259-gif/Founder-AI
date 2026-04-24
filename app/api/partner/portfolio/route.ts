import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const supabase = createServerClient();

  // Vérifier que l'utilisateur est admin partenaire
  const { data: adminMember } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminMember) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const partnerId = adminMember.partner_id;

  // Récupérer toutes les startups liées au partenaire
  const { data: startups } = await supabase
    .from("startups")
    .select("id, name, sector, stage, description, key_kpis, recent_decisions, current_issues, documents, logo, updated_at, user_id")
    .eq("partner_id", partnerId)
    .order("updated_at", { ascending: false });

  // Récupérer les membres pour avoir le plan et l'email
  const { data: members } = await supabase
    .from("partner_members")
    .select("email, user_id, granted_plan")
    .eq("partner_id", partnerId)
    .eq("role", "portfolio");

  // Récupérer les agents custom du partenaire
  const { data: customAgents } = await supabase
    .from("custom_agents")
    .select("id, name, emoji, role")
    .eq("partner_id", partnerId);

  // Récupérer les assignations agent ↔ startup
  const startupIds = (startups ?? []).map((s) => s.id);
  const { data: assignments } = startupIds.length > 0
    ? await supabase.from("startup_custom_agents").select("startup_id, custom_agent_id").in("startup_id", startupIds)
    : { data: [] };

  // Enrichir les startups avec l'email du fondateur, le plan et les agents assignés
  const enriched = (startups ?? []).map((s) => {
    const member = members?.find((m) => m.user_id === s.user_id);
    const docs = Array.isArray(s.documents)
      ? (s.documents as { id: string; name: string; uploadedAt: string; deleted_at?: string }[])
          .filter((d) => !d.deleted_at)
      : [];
    const assignedAgentIds = (assignments ?? [])
      .filter((a) => a.startup_id === s.id)
      .map((a) => a.custom_agent_id);
    return {
      ...s,
      documents: docs,
      founderEmail: member?.email ?? null,
      grantedPlan: member?.granted_plan ?? "starter",
      assignedAgentIds,
    };
  });

  return Response.json({
    startups: enriched,
    customAgents: customAgents ?? [],
  });
}
