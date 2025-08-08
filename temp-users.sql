
-- Create default users for Tuinbeheer system
INSERT INTO users (email, full_name, role, status, created_at, updated_at)
VALUES 
  ('admin@tuinbeheer.nl', 'System Administrator', 'admin', 'active', NOW(), NOW()),
  ('gebruiker@tuinbeheer.nl', 'Test Gebruiker', 'user', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create corresponding auth users in Supabase Auth
-- Note: This needs to be done via Supabase dashboard or API
