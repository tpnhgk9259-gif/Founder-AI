-- Multi-utilisateurs par startup
-- Chaque startup peut avoir plusieurs membres avec des rôles différents.

CREATE TABLE IF NOT EXISTS startup_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL si invitation en attente
  email       TEXT NOT NULL,                                 -- email de l'invité (résolu ou non)
  role        TEXT NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('owner', 'editor', 'viewer')),
  invite_token TEXT,                                         -- token unique pour accepter l'invitation
  invited_by  UUID REFERENCES users(id),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at   TIMESTAMPTZ,                                   -- NULL tant que pas accepté
  UNIQUE(startup_id, email)
);

-- Index pour les lookups fréquents
CREATE INDEX IF NOT EXISTS idx_startup_members_user ON startup_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_startup_members_startup ON startup_members(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_members_token ON startup_members(invite_token) WHERE invite_token IS NOT NULL;

-- RLS
ALTER TABLE startup_members ENABLE ROW LEVEL SECURITY;

-- Les membres peuvent voir les autres membres de leur startup
CREATE POLICY startup_members_select ON startup_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid())
  );

-- Seul l'owner peut insérer/modifier/supprimer des membres
CREATE POLICY startup_members_insert ON startup_members
  FOR INSERT WITH CHECK (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner')
    OR NOT EXISTS (SELECT 1 FROM startup_members WHERE startup_id = startup_members.startup_id)  -- premier membre (owner)
  );

CREATE POLICY startup_members_update ON startup_members
  FOR UPDATE USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY startup_members_delete ON startup_members
  FOR DELETE USING (
    startup_id IN (SELECT startup_id FROM startup_members WHERE user_id = auth.uid() AND role = 'owner')
    OR user_id = auth.uid()  -- un membre peut se retirer lui-même
  );

-- Seed : migrer les owners existants depuis startups.user_id
INSERT INTO startup_members (startup_id, user_id, email, role, joined_at)
SELECT
  s.id,
  s.user_id,
  COALESCE(u.email, 'unknown@founderai.com'),
  'owner',
  s.created_at
FROM startups s
JOIN users u ON u.id = s.user_id
WHERE s.user_id IS NOT NULL
ON CONFLICT (startup_id, email) DO NOTHING;
