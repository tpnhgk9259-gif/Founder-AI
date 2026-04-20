-- FounderAI — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase

-- Extension pgvector pour le RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────
-- Utilisateurs (id = auth.users.id)
-- ─────────────────────────────────────────
CREATE TABLE users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  plan         TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Startups (1:1 avec users pour l'instant)
-- ─────────────────────────────────────────
CREATE TABLE startups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT,

  -- Champs structurés du profil startup
  sector       TEXT,
  stage        TEXT CHECK (stage IN ('idea', 'pre-seed', 'seed', 'series-a', 'series-b+')),
  team_size    INTEGER CHECK (team_size > 0),
  business_model TEXT,                 -- ex: SaaS B2B, marketplace, freemium…

  -- Tableaux structurés stockés en JSONB
  key_kpis     JSONB DEFAULT '[]',     -- [{name, value, unit, trend}]
  recent_decisions JSONB DEFAULT '[]', -- [{date, description, owner}]
  current_issues   JSONB DEFAULT '[]', -- [{title, priority, context}]

  -- Texte libre de présentation (champ "Parlez-nous de votre projet")
  description  TEXT,
  license_config JSONB NOT NULL DEFAULT
    '{
      "available_agents":["strategie","vente","finance","technique","codir"],
      "conversational_memory_enabled":true,
      "conversational_memory_window":10,
      "max_chat_messages_per_day":200,
      "max_codir_sessions_per_month":30,
      "portfolio_plan_allowances":{"starter":10,"pro":3}
    }'::jsonb,

  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────
-- Conversations (une par agent par startup)
-- ─────────────────────────────────────────
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  agent_key   TEXT NOT NULL CHECK (agent_key IN ('strategie', 'vente', 'finance', 'technique')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(startup_id, agent_key)
);

-- ─────────────────────────────────────────
-- Messages
-- ─────────────────────────────────────────
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  content         TEXT NOT NULL,
  model           TEXT,  -- modèle Claude utilisé (audit des coûts)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_conversation_id_created_at
  ON messages(conversation_id, created_at);

-- ─────────────────────────────────────────
-- Résumés de conversations (historique compressé)
-- ─────────────────────────────────────────
CREATE TABLE conversation_summaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,        -- texte du résumé
  covered_up_to   UUID NOT NULL REFERENCES messages(id),  -- dernier message résumé
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Sessions CODIR
-- ─────────────────────────────────────────
CREATE TABLE codir_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id      UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  agent_analyses  JSONB,   -- [{agentKey, content}, ...]
  synthesis       TEXT,
  status          TEXT NOT NULL DEFAULT 'dispatching'
                    CHECK (status IN ('dispatching', 'synthesizing', 'done', 'error')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Base de connaissances RAG (pgvector)
-- ─────────────────────────────────────────
CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key   TEXT NOT NULL,      -- quel agent utilise ce chunk
  content     TEXT NOT NULL,      -- texte du framework / playbook
  embedding   vector(1536),       -- embedding OpenAI text-embedding-3-small ou équivalent
  source      TEXT,               -- nom du framework (ex: "AARRR", "Porter's Five Forces")
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour la recherche vectorielle (cosinus)
CREATE INDEX knowledge_chunks_embedding_idx
  ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX knowledge_chunks_agent_key_idx
  ON knowledge_chunks(agent_key);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE codir_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks      ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- Politiques RLS
-- ─────────────────────────────────────────

-- users : lecture/modification de son propre profil
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- startups : accès uniquement à sa propre startup
CREATE POLICY "startups_select_own" ON startups FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "startups_update_own" ON startups FOR UPDATE USING (user_id = auth.uid());

-- conversations : via la startup
CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT USING (
    startup_id IN (SELECT id FROM startups WHERE user_id = auth.uid())
  );

-- messages : via la conversation
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN startups s ON s.id = c.startup_id
      WHERE s.user_id = auth.uid()
    )
  );

-- conversation_summaries : via la conversation
CREATE POLICY "summaries_select_own" ON conversation_summaries
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN startups s ON s.id = c.startup_id
      WHERE s.user_id = auth.uid()
    )
  );

-- codir_sessions : via la startup
CREATE POLICY "codir_sessions_select_own" ON codir_sessions
  FOR SELECT USING (
    startup_id IN (SELECT id FROM startups WHERE user_id = auth.uid())
  );

-- knowledge_chunks : lecture publique (pas de données sensibles)
CREATE POLICY "knowledge_chunks_read_all" ON knowledge_chunks FOR SELECT USING (true);

-- Note : les API routes utilisent la service role key (contourne RLS).
-- RLS protège les accès directs depuis le client (anon key).
