-- Migration: Architecture improvements
-- 1. Supabase Storage bucket pour les documents
-- 2. Indexes manquants
-- 3. pgvector HNSW index + RLS sur knowledge_chunks
-- 4. Fonction de recherche par similarité

-- ── 1. Bucket Storage ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'startup-documents', 'startup-documents', false, 10485760,
  ARRAY['application/pdf','text/plain','text/markdown','text/csv','application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS Storage (documents startups)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='startup_docs_insert') THEN
    CREATE POLICY "startup_docs_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'startup-documents' AND
        (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.startups WHERE user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='startup_docs_select') THEN
    CREATE POLICY "startup_docs_select" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'startup-documents' AND
        (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.startups WHERE user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='startup_docs_delete') THEN
    CREATE POLICY "startup_docs_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'startup-documents' AND
        (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.startups WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── 2. Indexes manquants ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON public.startups(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_members_user_id ON public.partner_members(user_id);

-- ── 3. pgvector : index HNSW + index agent_key + RLS ──────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- Migrer la dimension de vector(1536) vers vector(1024) pour Voyage AI voyage-3
DROP INDEX IF EXISTS knowledge_chunks_embedding_cosine_idx;
ALTER TABLE public.knowledge_chunks ALTER COLUMN embedding TYPE vector(1024);

CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS knowledge_chunks_agent_key_idx ON public.knowledge_chunks(agent_key);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='knowledge_chunks' AND policyname='knowledge_chunks_read') THEN
    CREATE POLICY "knowledge_chunks_read" ON public.knowledge_chunks
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 4. Fonction de recherche par similarité (pgvector) ────────────────────────
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(1024),
  agent_key_filter text,
  match_count int DEFAULT 5
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
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
$$;
