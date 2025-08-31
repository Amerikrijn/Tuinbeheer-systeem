-- =====================================================
-- COMPLETE FIX FOR USER GARDEN ACCESS SYSTEM
-- =====================================================
-- This script will:
-- 1. Create or fix the user_garden_access table
-- 2. Ensure all required columns exist
-- 3. Set up proper indexes and triggers
-- 4. Grant necessary permissions
-- 5. Show the results
-- =====================================================

-- Start transaction
BEGIN;

-- =====================================================
-- STEP 1: Create table if it doesn't exist
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_garden_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    garden_id UUID NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_level VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Add missing columns if table already exists
-- =====================================================
DO $$
BEGIN
    -- Add granted_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'granted_by'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN granted_by UUID;
        RAISE NOTICE 'Added granted_by column';
    END IF;
    
    -- Add granted_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'granted_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added granted_at column';
    END IF;
    
    -- Add access_level if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'access_level'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN access_level VARCHAR(20) DEFAULT 'admin';
        RAISE NOTICE 'Added access_level column';
    END IF;
    
    -- Add is_active if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- =====================================================
-- STEP 3: Add constraints if missing
-- =====================================================
DO $$
BEGIN
    -- Add foreign key for user_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'user_garden_access' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD CONSTRAINT fk_user_garden_access_user 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for user_id';
    END IF;
    
    -- Add foreign key for garden_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'user_garden_access' 
        AND constraint_name LIKE '%garden_id%'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD CONSTRAINT fk_user_garden_access_garden 
        FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key for garden_id';
    END IF;
    
    -- Add foreign key for granted_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'user_garden_access' 
        AND constraint_name LIKE '%granted_by%'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD CONSTRAINT fk_user_garden_access_granted_by 
        FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key for granted_by';
    END IF;
    
    -- Add unique constraint if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name = 'user_garden_access'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD CONSTRAINT unique_user_garden 
        UNIQUE(user_id, garden_id);
        RAISE NOTICE 'Added unique constraint for user_id, garden_id';
    END IF;
    
    -- Add check constraint for access_level if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%access_level%'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD CONSTRAINT check_access_level 
        CHECK (access_level IN ('read', 'write', 'admin'));
        RAISE NOTICE 'Added check constraint for access_level';
    END IF;
END $$;

-- =====================================================
-- STEP 4: Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id 
ON public.user_garden_access(user_id);

CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id 
ON public.user_garden_access(garden_id);

CREATE INDEX IF NOT EXISTS idx_user_garden_access_active 
ON public.user_garden_access(is_active);

CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_garden 
ON public.user_garden_access(user_id, garden_id);

-- =====================================================
-- STEP 5: Create updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_garden_access_updated_at ON public.user_garden_access;
CREATE TRIGGER update_user_garden_access_updated_at
    BEFORE UPDATE ON public.user_garden_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: Set up RLS and permissions
-- =====================================================
-- Disable RLS for now (can be enabled with policies later)
ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.user_garden_access TO authenticated;
GRANT ALL ON public.user_garden_access TO anon;
GRANT ALL ON public.user_garden_access TO service_role;

-- =====================================================
-- STEP 7: Update existing records to have required fields
-- =====================================================
UPDATE public.user_garden_access 
SET 
    access_level = COALESCE(access_level, 'admin'),
    is_active = COALESCE(is_active, TRUE),
    granted_at = COALESCE(granted_at, created_at, NOW()),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE access_level IS NULL 
   OR is_active IS NULL 
   OR granted_at IS NULL 
   OR created_at IS NULL 
   OR updated_at IS NULL;

-- =====================================================
-- STEP 8: Give Godelieve admin access to all gardens
-- =====================================================
DO $$
DECLARE
    v_user_id UUID;
    v_garden RECORD;
BEGIN
    -- Find Godelieve's user ID
    SELECT id INTO v_user_id 
    FROM public.users 
    WHERE LOWER(email) LIKE '%godelieve%' 
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Give access to all active gardens
        FOR v_garden IN 
            SELECT id FROM public.gardens WHERE is_active = TRUE
        LOOP
            INSERT INTO public.user_garden_access (
                user_id, 
                garden_id, 
                access_level, 
                is_active,
                granted_at,
                created_at
            ) VALUES (
                v_user_id,
                v_garden.id,
                'admin',
                TRUE,
                NOW(),
                NOW()
            )
            ON CONFLICT (user_id, garden_id) 
            DO UPDATE SET 
                access_level = 'admin',
                is_active = TRUE,
                updated_at = NOW();
        END LOOP;
        
        RAISE NOTICE 'Granted Godelieve access to all gardens';
    END IF;
END $$;

-- =====================================================
-- STEP 9: Commit transaction
-- =====================================================
COMMIT;

-- =====================================================
-- STEP 10: Show results
-- =====================================================
-- Show table structure
SELECT 
    '=== TABLE STRUCTURE ===' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' 
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    '=== INDEXES ===' as info;
    
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_garden_access';

-- Show current access data
SELECT 
    '=== CURRENT ACCESS DATA ===' as info;

SELECT 
    u.email as user_email,
    u.full_name,
    u.role as user_role,
    COUNT(DISTINCT uga.garden_id) as garden_count,
    STRING_AGG(g.name, ', ' ORDER BY g.name) as gardens
FROM public.users u
LEFT JOIN public.user_garden_access uga ON u.id = uga.user_id AND uga.is_active = TRUE
LEFT JOIN public.gardens g ON uga.garden_id = g.id AND g.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.email, u.full_name, u.role
ORDER BY u.role DESC, u.email;

-- Show detailed access
SELECT 
    '=== DETAILED ACCESS ===' as info;

SELECT 
    u.email,
    g.name as garden_name,
    uga.access_level,
    uga.is_active,
    uga.granted_at,
    uga.created_at
FROM public.user_garden_access uga
JOIN public.users u ON uga.user_id = u.id
JOIN public.gardens g ON uga.garden_id = g.id
WHERE u.is_active = TRUE AND g.is_active = TRUE
ORDER BY u.email, g.name;

-- Count summary
SELECT 
    '=== SUMMARY ===' as info;

SELECT 
    COUNT(DISTINCT user_id) as total_users_with_access,
    COUNT(DISTINCT garden_id) as total_gardens_with_access,
    COUNT(*) as total_access_records
FROM public.user_garden_access
WHERE is_active = TRUE;