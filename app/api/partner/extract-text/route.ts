import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text.trim();
    } catch {
      throw new Error("Le fichier PDF est corrompu ou illisible.");
    }
  }
  return (await file.text()).trim();
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  // Vérifier que l'utilisateur est admin partenaire
  const supabase = createServerClient();
  const { data: member } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!member) return Response.json({ error: "Accès réservé aux admins partenaires" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "Fichier requis" }, { status: 400 });

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_SIZE) return Response.json({ error: "Fichier trop volumineux (max 20 Mo)" }, { status: 413 });

  try {
    const text = await extractText(file);
    const MAX_TEXT = 200_000;
    return Response.json({ text: text.slice(0, MAX_TEXT), truncated: text.length > MAX_TEXT });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 422 });
  }
}
