import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { jsonrepair } from "jsonrepair";

export interface MvpLot {
  titre: string;
  description: string;
  fonctionnalites: string[];
  impact_client: string;
  impact_autres: string;
  effort: "Faible" | "Moyen" | "Élevé";
  effort_detail: string;
  budget_min: number;
  budget_max: number;
  priorite: "Indispensable" | "Important" | "Souhaitable";
}

export interface MvpReport {
  synthese: string;
  lots: MvpLot[];
  budget_total_min: number;
  budget_total_max: number;
  effort_total: string;
  recommandation: string;
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { sections, startupName, startupId } = await req.json() as {
    sections: Record<string, string>;
    startupName?: string;
    startupId?: string;
  };

  if (!sections || Object.values(sections).every((v) => !v?.trim())) {
    return Response.json({ error: "Formulaire vide" }, { status: 400 });
  }

  // Récupérer le contexte startup : décisions + conversations Léo
  const contextParts: string[] = [];
  if (startupId) {
    const allowed = await userOwnsStartup(userId, startupId);
    if (allowed) {
      const supabase = createServerClient();

      const [{ data: startup }, { data: convs }] = await Promise.all([
        supabase
          .from("startups")
          .select("business_model, description, recent_decisions, current_issues")
          .eq("id", startupId)
          .single(),
        supabase
          .from("conversations")
          .select("agent_key, messages")
          .eq("startup_id", startupId)
          .in("agent_key", ["technique", "codir"])
          .order("updated_at", { ascending: false })
          .limit(6),
      ]);

      if (startup?.recent_decisions?.length) {
        const decisions = (startup.recent_decisions as { description: string; date?: string }[])
          .map((d) => `- ${d.date ? `[${d.date}] ` : ""}${d.description}`)
          .join("\n");
        contextParts.push(`Décisions prises par l'équipe :\n${decisions}`);
      }

      if (startup?.current_issues?.length) {
        const actions = (startup.current_issues as { title: string; status: string }[])
          .map((a) => `- [${a.status}] ${a.title}`)
          .join("\n");
        contextParts.push(`Plan d'action en cours :\n${actions}`);
      }

      if (startup?.description) {
        contextParts.push(`Description du projet : ${startup.description}`);
      }
      if (startup?.business_model) {
        contextParts.push(`Modèle économique : ${startup.business_model}`);
      }

      if (convs?.length) {
        const excerpts: string[] = [];
        for (const conv of convs) {
          const msgs = (conv.messages as { role: string; content: string }[]) ?? [];
          const relevant = msgs.slice(-6).filter((m) => m.role === "assistant");
          if (relevant.length) {
            const label = conv.agent_key === "technique" ? "Léo (Produit/Technique)" : "CODIR";
            excerpts.push(`${label} :\n${relevant.map((m) => m.content.slice(0, 400)).join("\n")}`);
          }
        }
        if (excerpts.length) {
          contextParts.push(`Recommandations des agents :\n${excerpts.join("\n\n")}`);
        }
      }
    }
  }

  const startupContext = contextParts.length
    ? `\nContexte et décisions de la startup :\n${contextParts.join("\n\n")}\n`
    : "";

  const formContext = [
    sections.cible            && `Cible : ${sections.cible}`,
    sections.probleme         && `Problème à résoudre : ${sections.probleme}`,
    sections.fonctions_client && `Fonctions indispensables pour le client idéal : ${sections.fonctions_client}`,
    sections.fonctions_autres && `Fonctions indispensables pour les autres utilisateurs : ${sections.fonctions_autres}`,
    sections.no_go_client     && `Ce que le client ne veut pas : ${sections.no_go_client}`,
    sections.no_go_autres     && `Ce que les autres utilisateurs ne veulent pas : ${sections.no_go_autres}`,
  ].filter(Boolean).join("\n");

  const prompt = `Tu es un expert en product management et en estimation de coûts de développement.
${startupName ? `Tu travailles sur le MVP de la startup "${startupName}".` : ""}
${startupContext}
Cadrage du MVP :
${formContext}

IMPORTANT : Tu dois impérativement tenir compte des décisions et recommandations ci-dessus pour calibrer les estimations (stack technique choisie, approche no-code/low-code si décidée, contraintes budgétaires, recommandations de Léo, etc.).

Génère un rapport structuré avec des lots fonctionnels. Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans commentaires) :
{
  "synthese": "Résumé exécutif en 3-4 phrases, mentionnant les choix techniques retenus",
  "lots": [
    {
      "titre": "Nom court du lot",
      "description": "Description en 1-2 phrases",
      "fonctionnalites": ["Fonctionnalité 1", "Fonctionnalité 2", "Fonctionnalité 3"],
      "impact_client": "Impact concret sur le client idéal",
      "impact_autres": "Impact concret sur les autres utilisateurs",
      "effort": "Faible|Moyen|Élevé",
      "effort_detail": "ex: 2-3 semaines, outil no-code Bubble",
      "budget_min": 3000,
      "budget_max": 6000,
      "priorite": "Indispensable|Important|Souhaitable"
    }
  ],
  "budget_total_min": 15000,
  "budget_total_max": 30000,
  "effort_total": "ex: 6-8 semaines avec Bubble + 1 développeur no-code",
  "recommandation": "Recommandation sur la séquence et les arbitrages clés en 3-4 phrases"
}

Règles :
- 3 à 5 lots maximum
- Budgets cohérents avec la stack choisie (no-code = 2 à 5x moins cher que du dev custom)
- Sois concis (1-2 phrases max par champ texte, 2 à 4 fonctionnalités max par lot)
- Classe du plus indispensable au plus souhaitable`;

  try {
    const response = await claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";

    // Extraire le bloc JSON (entre la première { et la dernière })
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return Response.json({ error: "Réponse IA invalide — aucun JSON trouvé." }, { status: 500 });
    }
    const raw = rawText.slice(start, end + 1);

    let report: MvpReport;
    try {
      // jsonrepair corrige guillemets non échappés, virgules manquantes, troncatures, etc.
      const repaired = jsonrepair(raw);
      report = JSON.parse(repaired);
    } catch (parseErr) {
      console.error("[mvp-report] JSON parse failed:", parseErr, "\nRaw (first 500):", raw.slice(0, 500));
      return Response.json({ error: "Le rapport généré est invalide. Réessayez." }, { status: 500 });
    }

    return Response.json({ report });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
