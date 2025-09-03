-- Check if user_garden_access table exists and create if needed
-- This script ensures the table exists with the correct schema

-- Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_garden_access'
    ) THEN
        RAISE NOTICE 'Creating user_garden_access table...';
        
        -- Create the table
        CREATE TABLE public.user_garden_access (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
            granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Ensure unique user-garden combinations
            UNIQUE(user_id, garden_id)
        );
        
        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);
        CREATE INDEX IF NOT EXISTS idx_user_garden_access_active ON public.user_garden_access(is_active);
        
        -- Disable RLS temporarily
        ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;
        
        -- Grant permissions
        GRANT ALL ON public.user_garden_access TO authenticated;
        
        RAISE NOTICE 'user_garden_access table created successfully';
    ELSE
        RAISE NOTICE 'user_garden_access table already exists';
    END IF;
END $$;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' 
ORDER BY ordinal_position;
