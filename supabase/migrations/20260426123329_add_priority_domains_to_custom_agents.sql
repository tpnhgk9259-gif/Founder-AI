-- Ajoute les domaines de priorité pour les agents custom des partenaires.
-- Quand un agent custom a un domaine prioritaire, il remplace l'agent standard
-- pour les slides correspondantes lors du remplissage automatique du pitch deck.

ALTER TABLE custom_agents
ADD COLUMN IF NOT EXISTS priority_domains TEXT[] DEFAULT '{}';

COMMENT ON COLUMN custom_agents.priority_domains IS
  'Domaines sur lesquels cet agent prend la priorité. Valeurs possibles : strategy, market, product, finance, operations, regulatory, clinical, technology';
