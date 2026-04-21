-- Ajout du 5ème agent : Marc (Directeur des Opérations)

-- Mettre à jour la contrainte CHECK sur conversations.agent_key
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_agent_key_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_agent_key_check
  CHECK (agent_key IN ('strategie', 'vente', 'finance', 'technique', 'operations'));

-- Ajouter Marc aux agent_names des partners existants
UPDATE public.partners
SET agent_names = agent_names || '{"operations": "Marc"}'::jsonb
WHERE NOT (agent_names ? 'operations');

-- Ajouter operations aux available_agents des startups existantes
UPDATE public.startups
SET license_config = jsonb_set(
  license_config,
  '{available_agents}',
  (license_config->'available_agents') || '"operations"'::jsonb
)
WHERE license_config IS NOT NULL
  AND license_config->'available_agents' IS NOT NULL
  AND NOT (license_config->'available_agents' @> '"operations"');

-- Ajouter operations aux available_agents des partners existants
UPDATE public.partners
SET license_config = jsonb_set(
  license_config,
  '{available_agents}',
  (license_config->'available_agents') || '"operations"'::jsonb
)
WHERE license_config IS NOT NULL
  AND license_config->'available_agents' IS NOT NULL
  AND NOT (license_config->'available_agents' @> '"operations"');
