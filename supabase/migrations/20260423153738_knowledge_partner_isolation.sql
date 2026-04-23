-- Cloisonnement des bases de connaissances par partenaire
-- Les connaissances globales (partner_id IS NULL) sont visibles par tous
-- Les connaissances partenaire (partner_id = X) ne sont visibles que par ses startups

ALTER TABLE public.agent_knowledge ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) DEFAULT NULL;
ALTER TABLE public.knowledge_chunks ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) DEFAULT NULL;

-- PK + index unique
ALTER TABLE public.agent_knowledge ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS agent_knowledge_agent_partner_uniq
  ON public.agent_knowledge (agent_key, COALESCE(partner_id, '00000000-0000-0000-0000-000000000000'));

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_partner ON public.knowledge_chunks(partner_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_partner ON public.agent_knowledge(partner_id);

-- Mettre à jour la fonction de recherche pour filtrer par partenaire
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(1024),
  agent_key_filter text,
  match_count int DEFAULT 5,
  partner_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  agent_key text,
  content text,
  source text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kc.id,
    kc.agent_key,
    kc.content,
    kc.source,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.agent_key = agent_key_filter
    AND kc.embedding IS NOT NULL
    AND (kc.partner_id IS NULL OR kc.partner_id = partner_id_filter)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
$$;
