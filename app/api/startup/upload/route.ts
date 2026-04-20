import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const BUCKET = "startup-documents";
const MAX_DOCS_PER_STARTUP = 30;

export type StoredDocument = {
  id: string;
  name: string;
  text: string;
  uploadedAt: string;
  storage_path?: string; // chemin dans le bucket (documents uploadés manuellement)
  deleted_at?: string;   // soft delete — null = actif
};

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text.trim();
    } catch (err) {
      console.error("[upload] Erreur extraction PDF :", err);
      throw new Error("Le fichier PDF est corrompu ou illisible.");
    }
  }
  return (await file.text()).trim();
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Rate limit : 10 uploads / minute par utilisateur
    const rl = checkRateLimit("upload", userId, 10, 60_000);
    if (!rl.ok) {
      return Response.json(
        { error: `Trop de requêtes. Réessayez dans ${rl.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const form = await req.formData();
    const startupId = form.get("startupId") as string | null;
    const file = form.get("file") as File | null;
    const providedText = form.get("text") as string | null; // texte pré-extrait (documents générés)

    if (!startupId || !file) {
      return Response.json({ error: "startupId et file requis" }, { status: 400 });
    }

    const allowed = await userOwnsStartup(userId, startupId);
    if (!allowed) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
    }

    const text = providedText?.trim() ?? (await extractText(file));
    if (!providedText && !text) {
      return Response.json({ error: "Impossible d'extraire le texte du fichier" }, { status: 422 });
    }

    const docId = crypto.randomUUID();
    const supabase = createServerClient();

    // Upload vers Supabase Storage uniquement pour les fichiers manuels (pas les docs générés)
    let storagePath: string | undefined;
    if (!providedText) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      storagePath = `${startupId}/${docId}_${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        return Response.json({ error: `Erreur Storage : ${uploadError.message}` }, { status: 500 });
      }
    }

    // Récupérer les documents existants en nettoyant les éventuels dataUrls résiduels
    let existing: StoredDocument[] = [];
    try {
      const { data: startup } = await supabase
        .from("startups")
        .select("documents")
        .eq("id", startupId)
        .single();
      existing = ((startup?.documents as StoredDocument[]) ?? [])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ dataUrl: _du, ...rest }: StoredDocument & { dataUrl?: string }) => rest as StoredDocument);
    } catch {
      existing = [];
    }

    const activeDocs = existing.filter((d) => !d.deleted_at);
    if (activeDocs.length >= MAX_DOCS_PER_STARTUP) {
      return Response.json(
        { error: `Limite de ${MAX_DOCS_PER_STARTUP} documents atteinte. Supprimez un document avant d'en ajouter un nouveau.` },
        { status: 400 }
      );
    }

    const newDoc: StoredDocument = {
      id: docId,
      name: file.name,
      text: (text ?? "").slice(0, 20000),
      uploadedAt: new Date().toISOString(),
      ...(storagePath ? { storage_path: storagePath } : {}),
    };

    const updated = [...existing, newDoc];

    let updateError: string | null = null;
    try {
      const { error } = await supabase
        .from("startups")
        .update({ documents: updated, updated_at: new Date().toISOString() })
        .eq("id", startupId);
      if (error) updateError = error.message;
    } catch (e) {
      updateError = String(e);
    }

    if (updateError) {
      // Rollback : supprimer le fichier Storage si l'update DB a échoué
      if (storagePath) {
        await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      }
      return Response.json({ error: updateError }, { status: 500 });
    }

    logAudit({ userId, action: "document.upload", entityType: "document", entityId: docId, metadata: { startupId, fileName: file.name } });
    return Response.json({ document: newDoc });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const startupId = req.nextUrl.searchParams.get("startupId");
    const docId = req.nextUrl.searchParams.get("docId");

    if (!startupId || !docId) {
      return Response.json({ error: "startupId et docId requis" }, { status: 400 });
    }

    const allowed = await userOwnsStartup(userId, startupId);
    if (!allowed) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const supabase = createServerClient();

    let existing: StoredDocument[] = [];
    try {
      const { data: startup } = await supabase
        .from("startups")
        .select("documents")
        .eq("id", startupId)
        .single();
      existing = ((startup?.documents as StoredDocument[]) ?? [])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ dataUrl: _du, ...rest }: StoredDocument & { dataUrl?: string }) => rest as StoredDocument);
    } catch {
      existing = [];
    }

    // Soft delete : marquer le document avec deleted_at au lieu de le supprimer
    const updated = existing.map((d) =>
      d.id === docId ? { ...d, deleted_at: new Date().toISOString() } : d
    );

    const { error } = await supabase
      .from("startups")
      .update({ documents: updated, updated_at: new Date().toISOString() })
      .eq("id", startupId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Supprimer le fichier du Storage (le binaire n'a plus besoin d'être accessible)
    const deletedDoc = existing.find((d) => d.id === docId);
    if (deletedDoc?.storage_path) {
      await supabase.storage.from(BUCKET).remove([deletedDoc.storage_path]).catch(() => {});
    }

    logAudit({ userId, action: "document.delete", entityType: "document", entityId: docId, metadata: { startupId, fileName: deletedDoc?.name } });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}
