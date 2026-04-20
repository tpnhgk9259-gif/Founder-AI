-- ─────────────────────────────────────────
-- Partners (incubateurs, studios, fonds…)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'incubator'
                     CHECK (type IN ('incubator', 'studio', 'fund', 'accelerator', 'other')),
  logo_url         TEXT,
  -- Personnalisation des noms d'agents
  agent_names      JSONB NOT NULL DEFAULT
                     '{"strategie":"Maya","vente":"Alex","finance":"Sam","technique":"Léo"}'::jsonb,
  -- Personnalisation du Startup Manager
  manager_persona  JSONB NOT NULL DEFAULT
                     '{"name":"Victor","title":"Startup Manager","emoji":"🎯","style":"Direct et engagé, parle à la première personne, assume ses positions sans hésiter","prompt_extra":""}'::jsonb,
  license_config   JSONB NOT NULL DEFAULT
                    '{
                      "available_agents":["strategie","vente","finance","technique","codir"],
                      "conversational_memory_enabled":true,
                      "conversational_memory_window":10,
                      "max_chat_messages_per_day":200,
                      "max_codir_sessions_per_month":30,
                      "portfolio_plan_allowances":{"starter":10,"pro":3}
                    }'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Membres d'un partner (admins + utilisateurs du portefeuille)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'portfolio' CHECK (role IN ('admin', 'portfolio')),
  granted_plan TEXT NOT NULL DEFAULT 'starter' CHECK (granted_plan IN ('starter', 'pro')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(partner_id, email)
);

-- Lier les startups à un partner
ALTER TABLE startups ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners_select_member" ON partners
  FOR SELECT USING (
    id IN (SELECT partner_id FROM partner_members WHERE user_id = auth.uid())
  );

CREATE POLICY "partner_members_select_own" ON partner_members
  FOR SELECT USING (
    partner_id IN (SELECT partner_id FROM partner_members WHERE user_id = auth.uid())
  );
