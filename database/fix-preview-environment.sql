-- 🚨 FIX FOR PREVIEW ENVIRONMENT
-- This script fixes the database schema mismatches and disables RLS for preview

-- ========================================
-- STEP 1: FIX LOGBOOK_ENTRIES TABLE
-- ========================================

-- Add content column (app expects this instead of notes)
ALTER TABLE public.logbook_entries 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Copy existing notes to content
UPDATE public.logbook_entries 
SET content = notes 
WHERE content IS NULL AND notes IS NOT NULL;

-- Add garden_id column if missing
ALTER TABLE public.logbook_entries 
ADD COLUMN IF NOT EXISTS garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE;

-- ========================================
-- STEP 2: ENSURE ALL REQUIRED COLUMNS EXIST
-- ========================================

-- Ensure plants table has all required columns
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS position_x FLOAT,
ADD COLUMN IF NOT EXISTS position_y FLOAT;

-- Ensure plant_beds has plants relation working
-- This is handled by the foreign key already

-- ========================================
-- STEP 3: DISABLE RLS FOR PREVIEW
-- ========================================

-- Disable RLS on all tables for preview environment
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logbook_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: VERIFICATION
-- ========================================

-- Check if everything is working
SELECT 
    'logbook_entries' as table_name,
    COUNT(*) as row_count,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'logbook_entries' AND column_name = 'content') as has_content_column,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'logbook_entries' AND column_name = 'garden_id') as has_garden_id_column
FROM public.logbook_entries

UNION ALL

SELECT 
    'RLS Status' as table_name,
    0 as row_count,
    NOT EXISTS(SELECT 1 FROM pg_tables WHERE tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks') AND rowsecurity = true) as has_content_column,
    true as has_garden_id_column;

-- ========================================
-- EXPECTED RESULTS:
-- ========================================
-- All tables should show:
-- - has_content_column: true (for logbook_entries)
-- - has_garden_id_column: true (for logbook_entries)
-- - RLS Status should show true (meaning RLS is disabled)