-- Mise à jour de portfolio_plan_allowances : remplacement de "custom" par starter/growth/scale
-- dans les licences des partenaires et des startups

-- Partenaires
UPDATE partners
SET license_config = jsonb_set(
  license_config - 'portfolio_plan_allowances',
  '{portfolio_plan_allowances}',
  jsonb_build_object(
    'starter', COALESCE((license_config->'portfolio_plan_allowances'->>'custom')::int, 10),
    'growth',  5,
    'scale',   2
  )
)
WHERE license_config ? 'portfolio_plan_allowances';

-- Startups
UPDATE startups
SET license_config = jsonb_set(
  license_config - 'portfolio_plan_allowances',
  '{portfolio_plan_allowances}',
  jsonb_build_object(
    'starter', COALESCE((license_config->'portfolio_plan_allowances'->>'custom')::int, 10),
    'growth',  5,
    'scale',   2
  )
)
WHERE license_config ? 'portfolio_plan_allowances';

-- Mise à jour de la valeur par défaut pour les nouvelles lignes
ALTER TABLE partners
  ALTER COLUMN license_config SET DEFAULT '{
    "available_agents": ["strategie","vente","finance","technique","codir"],
    "conversational_memory_enabled": true,
    "conversational_memory_window": 10,
    "max_chat_messages_per_day": 200,
    "max_codir_sessions_per_month": 30,
    "portfolio_plan_allowances": {"starter": 10, "growth": 5, "scale": 2}
  }'::jsonb;

ALTER TABLE startups
  ALTER COLUMN license_config SET DEFAULT '{
    "available_agents": ["strategie","vente","finance","technique","codir"],
    "conversational_memory_enabled": true,
    "conversational_memory_window": 10,
    "max_chat_messages_per_day": 200,
    "max_codir_sessions_per_month": 30,
    "portfolio_plan_allowances": {"starter": 10, "growth": 5, "scale": 2}
  }'::jsonb;
