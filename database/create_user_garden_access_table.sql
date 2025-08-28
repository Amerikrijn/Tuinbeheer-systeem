-- Create user_garden_access table for managing user access to gardens
-- This table is referenced in the code but doesn't exist in the database

-- Create user_garden_access table
CREATE TABLE IF NOT EXISTS public.user_garden_access (
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

-- Create updated_at trigger function if it doesn't exist
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

-- Disable RLS temporarily for this table (can be enabled later with proper policies)
ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.user_garden_access TO authenticated;

-- Insert some sample data for testing (optional)
-- This will give the first user access to the first garden if they exist
INSERT INTO public.user_garden_access (user_id, garden_id, access_level) 
SELECT 
    u.id as user_id,
    g.id as garden_id,
    'admin' as access_level
FROM public.users u, public.gardens g
WHERE u.is_active = true AND g.is_active = true
LIMIT 1
ON CONFLICT (user_id, garden_id) DO NOTHING;

-- Verify table was created
SELECT 
    'user_garden_access' as table_name,
    COUNT(*) as row_count
FROM public.user_garden_access;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' 
ORDER BY ordinal_position;