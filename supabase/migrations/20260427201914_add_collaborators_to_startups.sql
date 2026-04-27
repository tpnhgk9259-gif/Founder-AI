-- Liste des collaborateurs de la startup.
-- Utilisé pour l'affectation dans les OKR et plans d'action.
-- Format : [{name, role, department}]

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS collaborators JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN startups.collaborators IS 'Liste des collaborateurs [{name, role, department}]';
