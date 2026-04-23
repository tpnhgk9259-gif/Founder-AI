/**
 * Module RAG — Retrieval-Augmented Generation pour les bases de connaissances agents.
 *
 * Flux :
 *   Admin sauvegarde knowledge → indexAgentKnowledge() → chunks + embeddings dans knowledge_chunks
 *   User envoie message → retrieveRelevantChunks() → top-K chunks injectés dans le system prompt
 *
 * Provider d'embeddings : Voyage AI (voyage-3, output_dimension=1536 pour compatibilité pgvector)
 * Fallback : si VOYAGE_API_KEY absent, on retourne null et le système tombe sur l'injection complète.
 */

import { createServerClient } from "./supabase";

const VOYAGE_MODEL = "voyage-3";
const EMBED_DIM = 1024; // doit correspondre à knowledge_chunks.embedding vector(1024)
const CHUNK_SIZE = 900; // caractères
const CHUNK_OVERLAP = 150; // chevauchement pour ne pas couper le sens
const TOP_K = 5; // nombre de chunks retournés par requête
const MIN_SIMILARITY = 0.3; // seuil minimum de pertinence (cosine similarity)

// Import dynamique pour éviter les erreurs ESM de voyageai au build Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getVoyageClient(): Promise<any | null> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) return null;
  const { VoyageAIClient } = await import("voyageai");
  return new VoyageAIClient({ apiKey: key });
}

/**
 * Découpe un texte en chunks avec chevauchement.
 * Découpe aux fins de paragraphes/phrases quand possible.
 */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE;

    if (end < text.length) {
      // Chercher une coupure naturelle (double saut de ligne, puis saut de ligne, puis espace)
      const searchArea = text.slice(start, end + 100);
      const paraBreak = searchArea.lastIndexOf("\n\n");
      const lineBreak = searchArea.lastIndexOf("\n");
      const spaceBreak = searchArea.lastIndexOf(" ");

      if (paraBreak > CHUNK_SIZE * 0.6) {
        end = start + paraBreak;
      } else if (lineBreak > CHUNK_SIZE * 0.6) {
        end = start + lineBreak;
      } else if (spaceBreak > CHUNK_SIZE * 0.6) {
        end = start + spaceBreak;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) { // ignorer les micro-chunks
      chunks.push(chunk);
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * Génère un embedding pour un texte via Voyage AI.
 * Retourne null si la clé API est absente.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const voyage = await getVoyageClient();
  if (!voyage) return null;

  const result = await voyage.embed({
    model: VOYAGE_MODEL,
    input: [text],
    outputDimension: EMBED_DIM,
  });

  return (result.data?.[0]?.embedding as number[]) ?? null;
}

/**
 * Génère des embeddings en batch (max 128 inputs par appel Voyage AI).
 */
async function embedBatch(texts: string[]): Promise<(number[] | null)[]> {
  const voyage = await getVoyageClient();
  if (!voyage) return texts.map(() => null);

  const BATCH = 128;
  const results: (number[] | null)[] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const result = await voyage.embed({
      model: VOYAGE_MODEL,
      input: batch,
      outputDimension: EMBED_DIM,
    });
    for (const item of result.data ?? []) {
      results.push((item.embedding as number[]) ?? null);
    }
  }

  return results;
}

/**
 * (Ré)indexe la base de connaissances d'un agent.
 * Supprime les anciens chunks, découpe le contenu, embedde, insère.
 *
 * Appelé automatiquement quand l'admin sauvegarde agent_knowledge via PUT.
 * Opération idempotente.
 */
export async function indexAgentKnowledge(
  agentKey: string,
  content: string,
  source: string = "admin",
  partnerId: string | null = null
): Promise<{ chunksIndexed: number }> {
  const supabase = createServerClient();

  // 1. Supprimer les chunks existants pour cet agent + ce partenaire
  let deleteQuery = supabase.from("knowledge_chunks").delete().eq("agent_key", agentKey);
  if (partnerId) {
    deleteQuery = deleteQuery.eq("partner_id", partnerId);
  } else {
    deleteQuery = deleteQuery.is("partner_id", null);
  }
  await deleteQuery;

  if (!content.trim()) return { chunksIndexed: 0 };

  const voyage = await getVoyageClient();
  if (!voyage) {
    const chunks = chunkText(content);
    const rows = chunks.map((chunk) => ({
      agent_key: agentKey,
      content: chunk,
      source,
      embedding: null,
      partner_id: partnerId,
    }));
    await supabase.from("knowledge_chunks").insert(rows);
    return { chunksIndexed: chunks.length };
  }

  // 2. Découper
  const chunks = chunkText(content);

  // 3. Embedder en batch
  const embeddings = await embedBatch(chunks);

  // 4. Insérer avec partner_id
  const rows = chunks.map((chunk, i) => ({
    agent_key: agentKey,
    content: chunk,
    source,
    embedding: embeddings[i] ?? null,
    partner_id: partnerId,
  }));

  const { error } = await supabase.from("knowledge_chunks").insert(rows);
  if (error) throw new Error(`Erreur insertion chunks : ${error.message}`);

  return { chunksIndexed: chunks.length };
}

/**
 * Retrouve les chunks les plus pertinents pour une requête utilisateur.
 *
 * Retourne null si :
 *  - Pas de clé Voyage AI
 *  - Aucun chunk indexé pour cet agent
 * Dans ce cas, l'appelant doit tomber sur l'injection complète (comportement actuel).
 */
export async function retrieveRelevantChunks(
  agentKey: string,
  query: string,
  topK: number = TOP_K,
  partnerId: string | null = null
): Promise<string[] | null> {
  const queryEmbedding = await embedText(query);
  if (!queryEmbedding) return null;

  const supabase = createServerClient();

  // Recherche cosine similarity — chunks globaux + chunks du partenaire
  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    agent_key_filter: agentKey,
    match_count: topK,
    partner_id_filter: partnerId,
  });

  if (error) {
    console.error("[RAG] Erreur match_knowledge_chunks :", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Filtrer les chunks sous le seuil de pertinence
  const relevant = (data as { content: string; similarity: number }[])
    .filter((row) => row.similarity >= MIN_SIMILARITY);

  if (relevant.length === 0) return null;

  return relevant.map((row) => row.content);
}
