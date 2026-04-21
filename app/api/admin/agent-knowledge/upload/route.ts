import { NextRequest } from "next/server";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

const VALID_AGENTS = ["strategie", "vente", "finance", "technique", "operations"] as const;
type AgentKey = (typeof VALID_AGENTS)[number];

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text.trim();
  }
  return (await file.text()).trim();
}

export async function POST(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const form = await req.formData();
  const agentKey = form.get("agentKey") as AgentKey | null;
  const file = form.get("file") as File | null;

  if (!agentKey || !VALID_AGENTS.includes(agentKey)) {
    return Response.json({ error: "agentKey invalide" }, { status: 400 });
  }
  if (!file) {
    return Response.json({ error: "Fichier requis" }, { status: 400 });
  }

  const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
  }

  try {
    const text = await extractText(file);
    if (!text) {
      return Response.json({ error: "Impossible d'extraire le texte du fichier." }, { status: 422 });
    }
    const MAX_TEXT = 400_000; // ~100k tokens — limite raisonnable pour un system prompt
    return Response.json({ text: text.slice(0, MAX_TEXT), fileName: file.name, truncated: text.length > MAX_TEXT });
  } catch (err) {
    return Response.json({ error: `Erreur d'extraction : ${String(err)}` }, { status: 500 });
  }
}
