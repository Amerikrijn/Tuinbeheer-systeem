-- ===================================================================
-- MIGRATION 005: SECURITY CONFIGURATION
-- ===================================================================
-- Configures Row Level Security (RLS) settings
-- ===================================================================

-- ===================================================================
-- CONFIGURE SECURITY (DISABLE RLS FOR DEVELOPMENT)
-- ===================================================================

-- Disable RLS for now to allow inserts (you can enable this later for production)
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- TODO: Enable RLS for production and create appropriate policies
-- Example policies (uncomment and modify as needed):
--
-- ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view all gardens" ON gardens FOR SELECT USING (true);
-- CREATE POLICY "Users can insert gardens" ON gardens FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update gardens" ON gardens FOR UPDATE USING (true);
-- CREATE POLICY "Users can delete gardens" ON gardens FOR DELETE USING (true);