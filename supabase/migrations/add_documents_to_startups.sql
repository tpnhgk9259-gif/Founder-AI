-- Ajoute la colonne documents à la table startups
-- Chaque document : { id, name, text, uploadedAt }
ALTER TABLE startups
  ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb;
