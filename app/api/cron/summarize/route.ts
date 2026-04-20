import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { maybeSummarize } from "@/lib/orchestrator";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Endpoint cron : rattrape les conversations qui n'ont pas été résumées.
 * Appelé par pg_cron toutes les 10 minutes via pg_net.
 *
 * Sécurisé par un header Authorization Bearer CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  // Vérification du secret (protège contre les appels non autorisés)
  const auth = req.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Trouver les conversations avec > 10 messages non résumés
  // On compare le nombre de messages avec le dernier résumé
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id");

  if (!conversations?.length) {
    return Response.json({ processed: 0 });
  }

  let processed = 0;
  let errors = 0;

  for (const conv of conversations) {
    try {
      await maybeSummarize(conv.id);
      processed++;
    } catch {
      errors++;
    }
  }

  console.log(`[cron/summarize] ${processed} conversations traitées, ${errors} erreurs`);
  return Response.json({ processed, errors });
}
