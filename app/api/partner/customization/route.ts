import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

/** PUT /api/partner/customization — met à jour agent_names et/ou manager_persona */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { partnerId, agent_names, manager_persona } = await req.json();
    if (!partnerId) {
      return Response.json({ error: "partnerId requis" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Vérifier que l'user est admin du partner
    const { data: membership } = await supabase
      .from("partner_members")
      .select("id")
      .eq("partner_id", partnerId)
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!membership) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (agent_names) patch.agent_names = agent_names;
    if (manager_persona) patch.manager_persona = manager_persona;

    const { error } = await supabase
      .from("partners")
      .update(patch)
      .eq("id", partnerId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}
