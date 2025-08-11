-- 🏦 BANKING-COMPLIANT USERS TABLE SETUP
-- Essential users table and functions for the tuinbeheer system

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    -- Banking compliance fields
    force_password_change BOOLEAN DEFAULT FALSE,
    password_changed_at TIMESTAMPTZ
);

-- Create user_garden_access table for garden permissions
CREATE TABLE IF NOT EXISTS public.user_garden_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, garden_id)
);

-- Create system_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    context TEXT,
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_garden_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users" 
ON public.users FOR ALL 
TO service_role 
USING (true);

-- RLS Policies for user_garden_access
DROP POLICY IF EXISTS "Users can read own garden access" ON public.user_garden_access;
CREATE POLICY "Users can read own garden access" 
ON public.user_garden_access FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage garden access" ON public.user_garden_access;
CREATE POLICY "Service role can manage garden access" 
ON public.user_garden_access FOR ALL 
TO service_role 
USING (true);

-- RLS Policies for system_logs (read-only for users, full access for service_role)
DROP POLICY IF EXISTS "Users can read own logs" ON public.system_logs;
CREATE POLICY "Users can read own logs" 
ON public.system_logs FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service role can manage logs" ON public.system_logs;
CREATE POLICY "Service role can manage logs" 
ON public.system_logs FOR ALL 
TO service_role 
USING (true);

-- Create function for creating user profiles (called from invite flow)
CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_role TEXT DEFAULT 'user',
    p_status TEXT DEFAULT 'pending'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, status, created_at)
    VALUES (p_user_id, p_email, p_full_name, p_role, p_status, NOW())
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = NOW();
        
    -- Log the action
    INSERT INTO public.system_logs (level, message, context, user_id)
    VALUES ('INFO', 'User profile created/updated: ' || p_email, 'user-management', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for batch user creation (for manual setup)
CREATE OR REPLACE FUNCTION create_batch_users(
    p_users JSONB
)
RETURNS TABLE(created_count INTEGER, errors TEXT[]) AS $$
DECLARE
    user_record JSONB;
    created_count INTEGER := 0;
    errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOR user_record IN SELECT * FROM jsonb_array_elements(p_users)
    LOOP
        BEGIN
            INSERT INTO public.users (
                id, email, full_name, role, status, created_at
            ) VALUES (
                (user_record->>'id')::UUID,
                user_record->>'email',
                user_record->>'full_name',
                COALESCE(user_record->>'role', 'user'),
                COALESCE(user_record->>'status', 'active'),
                NOW()
            ) ON CONFLICT (id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                role = EXCLUDED.role,
                status = EXCLUDED.status,
                updated_at = NOW();
                
            created_count := created_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            errors := array_append(errors, 'Error for ' || (user_record->>'email') || ': ' || SQLERRM);
        END;
    END LOOP;
    
    RETURN QUERY SELECT created_count, errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.user_garden_access TO authenticated;
GRANT SELECT ON public.system_logs TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Log setup completion
INSERT INTO public.system_logs (level, message, context, created_at)
VALUES ('INFO', 'Users table setup completed - Banking compliance', 'database-setup', NOW())
ON CONFLICT DO NOTHING;