-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.0.0
-- File: 003_security_configuration.sql
-- ===================================================================
-- Configures Row Level Security (RLS) settings
-- ===================================================================

-- ===================================================================
-- DISABLE RLS FOR DEVELOPMENT
-- ===================================================================

-- Disable RLS for development to allow easy data manipulation
-- IMPORTANT: Enable RLS for production environments
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- PRODUCTION RLS POLICIES (COMMENTED OUT)
-- ===================================================================

-- Uncomment and modify these policies for production use
-- These are example policies - adjust according to your authentication setup

/*
-- Enable RLS for production
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Garden policies
CREATE POLICY "Users can view all gardens" ON gardens FOR SELECT USING (true);
CREATE POLICY "Users can insert gardens" ON gardens FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update gardens" ON gardens FOR UPDATE USING (true);
CREATE POLICY "Users can delete gardens" ON gardens FOR DELETE USING (true);

-- Plant bed policies
CREATE POLICY "Users can view all plant beds" ON plant_beds FOR SELECT USING (true);
CREATE POLICY "Users can insert plant beds" ON plant_beds FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update plant beds" ON plant_beds FOR UPDATE USING (true);
CREATE POLICY "Users can delete plant beds" ON plant_beds FOR DELETE USING (true);

-- Plant policies
CREATE POLICY "Users can view all plants" ON plants FOR SELECT USING (true);
CREATE POLICY "Users can insert plants" ON plants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update plants" ON plants FOR UPDATE USING (true);
CREATE POLICY "Users can delete plants" ON plants FOR DELETE USING (true);
*/

-- ===================================================================
-- ADVANCED RLS POLICIES (EXAMPLES)
-- ===================================================================

-- Example: User-specific access (if you have user authentication)
/*
-- Assuming you have a users table and auth setup
CREATE POLICY "Users can only access their own gardens" ON gardens 
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can access plant beds in their gardens" ON plant_beds 
    FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE auth.uid() = created_by));

CREATE POLICY "Users can access plants in their plant beds" ON plants 
    FOR ALL USING (plant_bed_id IN (
        SELECT pb.id FROM plant_beds pb 
        JOIN gardens g ON pb.garden_id = g.id 
        WHERE auth.uid() = g.created_by
    ));
*/

-- ===================================================================
-- GRANTS AND PERMISSIONS
-- ===================================================================

-- Grant usage on sequences (if any are added later)
-- These will be needed if you switch to integer primary keys

-- Grant permissions for authenticated users (adjust as needed)
-- GRANT ALL ON gardens TO authenticated;
-- GRANT ALL ON plant_beds TO authenticated;
-- GRANT ALL ON plants TO authenticated;

-- Grant permissions for service role (for server-side operations)
-- GRANT ALL ON gardens TO service_role;
-- GRANT ALL ON plant_beds TO service_role;
-- GRANT ALL ON plants TO service_role;

-- ===================================================================
-- SECURITY NOTES
-- ===================================================================

-- 1. RLS is currently DISABLED for development
-- 2. For production, enable RLS and create appropriate policies
-- 3. Consider adding user-specific policies if you have authentication
-- 4. Test all policies thoroughly before deployment
-- 5. Use the principle of least privilege
-- 6. Consider using service_role for administrative operations