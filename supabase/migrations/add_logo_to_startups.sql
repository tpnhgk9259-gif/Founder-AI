-- Ajoute la colonne logo à la table startups
-- Stocke le logo sous forme de data URL base64 (image légère)
ALTER TABLE startups
  ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT NULL;
