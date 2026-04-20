-- Licences configurables par partenaire / startup

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS license_config JSONB NOT NULL DEFAULT
  '{
    "available_agents":["strategie","vente","finance","technique","codir"],
    "conversational_memory_enabled":true,
    "conversational_memory_window":10,
    "max_chat_messages_per_day":200,
    "max_codir_sessions_per_month":30,
    "portfolio_plan_allowances":{"custom":10}
  }'::jsonb;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS license_config JSONB NOT NULL DEFAULT
  '{
    "available_agents":["strategie","vente","finance","technique","codir"],
    "conversational_memory_enabled":true,
    "conversational_memory_window":10,
    "max_chat_messages_per_day":200,
    "max_codir_sessions_per_month":30,
    "portfolio_plan_allowances":{"custom":10}
  }'::jsonb;

ALTER TABLE partner_members
ADD COLUMN IF NOT EXISTS granted_plan TEXT NOT NULL DEFAULT 'custom'
  CHECK (granted_plan IN ('custom'));
