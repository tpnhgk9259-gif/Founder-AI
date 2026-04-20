import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { StartupKpi, StartupDecision, StartupIssue } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const startupId = req.nextUrl.searchParams.get("startupId");
  if (!startupId) {
    return Response.json({ error: "startupId requis" }, { status: 400 });
  }

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("startups")
      .select("*, partners(name)")
      .eq("id", startupId)
      .single();

    if (error) return Response.json({ error: error.message }, { status: 404 });

    // Filtrer les documents supprimés (soft delete) et enrichir avec des URLs signées
    if (Array.isArray(data.documents)) {
      type DocRow = { id: string; name: string; text: string; uploadedAt: string; storage_path?: string; dataUrl?: string; deleted_at?: string };
      const activeDocs = (data.documents as DocRow[]).filter((d) => !d.deleted_at);
      data.documents = await Promise.all(
        activeDocs.map(async ({ dataUrl: _du, deleted_at: _da, ...doc }) => {
          if (!doc.storage_path) return doc;
          const { data: urlData } = await supabase.storage
            .from("startup-documents")
            .createSignedUrl(doc.storage_path, 3600);
          return { ...doc, signedUrl: urlData?.signedUrl ?? null };
        })
      );
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body: {
      startupId: string;
      name?: string;
      sector?: string;
      stage?: string;
      team_size?: number;
      business_model?: string;
      key_kpis?: StartupKpi[];
      recent_decisions?: StartupDecision[];
      current_issues?: StartupIssue[];
      description?: string;
      logo?: string;
    } = await req.json();

    const { startupId, ...fields } = body;
    if (!startupId) {
      return Response.json({ error: "startupId requis" }, { status: 400 });
    }

    const allowed = await userOwnsStartup(userId, startupId);
    if (!allowed) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("startups")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", startupId)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}
