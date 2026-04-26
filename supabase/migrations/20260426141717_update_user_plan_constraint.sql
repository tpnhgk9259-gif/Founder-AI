-- Met à jour le CHECK constraint sur users.plan pour supporter starter/growth/scale.
-- Migre les anciens plans "pro" vers "growth".

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('starter', 'growth', 'scale'));

-- Migrer les plans "pro" existants vers "growth"
UPDATE users SET plan = 'growth' WHERE plan = 'pro';
