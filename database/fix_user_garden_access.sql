-- Fix user_garden_access table structure
-- This script ensures the table has all required columns

-- First check if table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_garden_access'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.user_garden_access (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
            granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            access_level VARCHAR(20) DEFAULT 'admin' CHECK (access_level IN ('read', 'write', 'admin')),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Ensure unique user-garden combinations
            UNIQUE(user_id, garden_id)
        );
        
        RAISE NOTICE 'Created user_garden_access table';
    ELSE
        RAISE NOTICE 'user_garden_access table already exists';
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add granted_by column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'granted_by'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added granted_by column';
    END IF;
    
    -- Add granted_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'granted_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added granted_at column';
    END IF;
    
    -- Add access_level column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'access_level'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN access_level VARCHAR(20) DEFAULT 'admin' CHECK (access_level IN ('read', 'write', 'admin'));
        RAISE NOTICE 'Added access_level column';
    END IF;
    
    -- Add is_active column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_garden_access' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_garden_access 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);
CREATE INDEX IF NOT EXISTS idx_user_garden_access_active ON public.user_garden_access(is_active);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_garden_access_updated_at ON public.user_garden_access;
CREATE TRIGGER update_user_garden_access_updated_at
    BEFORE UPDATE ON public.user_garden_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for this table (can be enabled later with proper policies)
ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.user_garden_access TO authenticated;
GRANT ALL ON public.user_garden_access TO anon;
GRANT ALL ON public.user_garden_access TO service_role;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' 
ORDER BY ordinal_position;

-- Show current data
SELECT 
    uga.id,
    u.email as user_email,
    g.name as garden_name,
    uga.access_level,
    uga.is_active,
    uga.granted_at
FROM public.user_garden_access uga
LEFT JOIN public.users u ON uga.user_id = u.id
LEFT JOIN public.gardens g ON uga.garden_id = g.id
ORDER BY u.email, g.name;