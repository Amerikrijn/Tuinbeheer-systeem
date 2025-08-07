-- =====================================================
-- 04-INVITATIONS-TABLE.SQL
-- =====================================================
-- Description: Adds secure invitation system for user management
-- Version: 1.0.0
-- Author: System
-- Date: 2024
-- =====================================================

-- =======================
-- 1. CREATE INVITATIONS TABLE
-- =======================

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  token TEXT NOT NULL UNIQUE, -- Hashed invitation token
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  garden_access TEXT[] DEFAULT '{}', -- Array of garden IDs for user role
  message TEXT,
  
  -- Constraints
  CONSTRAINT unique_pending_email UNIQUE (email, status) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT valid_expiry CHECK (expires_at > invited_at),
  CONSTRAINT accepted_date_check CHECK (
    (status = 'accepted' AND accepted_at IS NOT NULL) OR 
    (status != 'accepted' AND accepted_at IS NULL)
  )
);

-- =======================
-- 2. CREATE INDEXES
-- =======================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON public.invitations(invited_by);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON public.invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_invitations_status_expires ON public.invitations(status, expires_at);

-- =======================
-- 3. ROW LEVEL SECURITY
-- =======================

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admin can see all invitations
CREATE POLICY "Admins can manage all invitations" ON public.invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- Users can only see invitations sent to their email
CREATE POLICY "Users can see their own invitations" ON public.invitations
  FOR SELECT USING (
    email = (
      SELECT email FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- =======================
-- 4. HELPER FUNCTIONS
-- =======================

-- Function to clean up expired invitations (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update expired invitations
  UPDATE public.invitations 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log cleanup
  INSERT INTO public.system_logs (event_type, message, metadata)
  VALUES (
    'invitation_cleanup',
    'Cleaned up expired invitations',
    jsonb_build_object('expired_count', expired_count)
  );
  
  RETURN expired_count;
END;
$$;

-- Function to get invitation statistics (admin only)
CREATE OR REPLACE FUNCTION get_invitation_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Check admin permission
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Calculate statistics
  SELECT jsonb_build_object(
    'total_invitations', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
    'expired', COUNT(*) FILTER (WHERE status = 'expired'),
    'revoked', COUNT(*) FILTER (WHERE status = 'revoked'),
    'pending_expired', COUNT(*) FILTER (WHERE status = 'pending' AND expires_at < NOW()),
    'recent_invitations', COUNT(*) FILTER (WHERE invited_at > NOW() - INTERVAL '7 days')
  )
  INTO stats
  FROM public.invitations;
  
  RETURN stats;
END;
$$;

-- Function to revoke invitation (admin only)
CREATE OR REPLACE FUNCTION revoke_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permission
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Revoke invitation
  UPDATE public.invitations 
  SET status = 'revoked'
  WHERE id = invitation_id 
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- =======================
-- 5. TRIGGERS
-- =======================

-- Trigger to prevent duplicate pending invitations
CREATE OR REPLACE FUNCTION prevent_duplicate_pending_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only check for pending invitations
  IF NEW.status = 'pending' THEN
    -- Check if there's already a pending invitation for this email
    IF EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE email = NEW.email 
        AND status = 'pending' 
        AND id != COALESCE(NEW.id, uuid_nil())
        AND expires_at > NOW()
    ) THEN
      RAISE EXCEPTION 'Er bestaat al een actieve uitnodiging voor dit email adres';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prevent_duplicate_invitations
  BEFORE INSERT OR UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_pending_invitations();

-- =======================
-- 6. SYSTEM LOGS TABLE (if not exists)
-- =======================

CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Index for system logs
CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON public.system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);

-- =======================
-- 7. GRANT PERMISSIONS
-- =======================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT SELECT, INSERT ON public.system_logs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_invitation_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_invitation(UUID) TO authenticated;

-- =======================
-- 8. SAMPLE DATA (for testing)
-- =======================

-- Insert sample invitation (only in development)
DO $$
BEGIN
  -- Only insert if no invitations exist (fresh install)
  IF NOT EXISTS (SELECT 1 FROM public.invitations LIMIT 1) THEN
    -- This would be created by the invitation service in real usage
    INSERT INTO public.invitations (
      email,
      full_name,
      role,
      status,
      token,
      invited_by,
      expires_at,
      garden_access,
      message
    ) VALUES (
      'test@example.com',
      'Test User',
      'user',
      'pending',
      'sample_hashed_token_for_testing_only',
      (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
      NOW() + INTERVAL '72 hours',
      '{}',
      'Welcome to the garden management system!'
    );
  END IF;
END $$;

-- =======================
-- 9. VERIFICATION
-- =======================

-- Verify table creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'invitations'
  ) THEN
    RAISE EXCEPTION 'Invitations table was not created successfully';
  END IF;
  
  RAISE NOTICE 'Invitations table created successfully';
  RAISE NOTICE 'Invitation system is ready for use';
END $$;