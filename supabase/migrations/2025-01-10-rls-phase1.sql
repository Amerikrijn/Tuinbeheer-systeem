-- ==========================================
-- RLS Phase 1 Migration: Tenant Isolation
-- ==========================================
-- This migration implements proper multi-tenant security
-- Each user can only access gardens they are a member of

-- First, create garden_members table for access control
CREATE TABLE IF NOT EXISTS public.garden_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique membership per user per garden
    UNIQUE(garden_id, user_id)
);

-- Index for performance
CREATE INDEX idx_garden_members_garden_id ON public.garden_members(garden_id);
CREATE INDEX idx_garden_members_user_id ON public.garden_members(user_id);
CREATE INDEX idx_garden_members_active ON public.garden_members(user_id, is_active);

-- Enable RLS on garden_members
ALTER TABLE public.garden_members ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Gardens are viewable by everyone" ON public.gardens;
DROP POLICY IF EXISTS "Gardens are insertable by authenticated users" ON public.gardens;
DROP POLICY IF EXISTS "Gardens are updatable by authenticated users" ON public.gardens;
DROP POLICY IF EXISTS "Gardens are deletable by authenticated users" ON public.gardens;

DROP POLICY IF EXISTS "Plant beds are viewable by everyone" ON public.plant_beds;
DROP POLICY IF EXISTS "Plant beds are insertable by authenticated users" ON public.plant_beds;
DROP POLICY IF EXISTS "Plant beds are updatable by authenticated users" ON public.plant_beds;
DROP POLICY IF EXISTS "Plant beds are deletable by authenticated users" ON public.plant_beds;

DROP POLICY IF EXISTS "Plants are viewable by everyone" ON public.plants;
DROP POLICY IF EXISTS "Plants are insertable by authenticated users" ON public.plants;
DROP POLICY IF EXISTS "Plants are updatable by authenticated users" ON public.plants;
DROP POLICY IF EXISTS "Plants are deletable by authenticated users" ON public.plants;

DROP POLICY IF EXISTS "Logbook entries are viewable by everyone" ON public.logbook_entries;
DROP POLICY IF EXISTS "Logbook entries are insertable by authenticated users" ON public.logbook_entries;
DROP POLICY IF EXISTS "Logbook entries are updatable by authenticated users" ON public.logbook_entries;
DROP POLICY IF EXISTS "Logbook entries are deletable by authenticated users" ON public.logbook_entries;

-- ==========================================
-- NEW SECURE RLS POLICIES
-- ==========================================

-- garden_members: users can only see their own memberships
CREATE POLICY garden_members_read ON public.garden_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY garden_members_insert ON public.garden_members
FOR INSERT
WITH CHECK (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.garden_members gm 
  WHERE gm.garden_id = garden_members.garden_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('owner', 'admin')
));

-- gardens: only members can access
CREATE POLICY gardens_read ON public.gardens
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  WHERE gm.garden_id = gardens.id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
));

CREATE POLICY gardens_insert ON public.gardens
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY gardens_update ON public.gardens
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  WHERE gm.garden_id = gardens.id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
    AND gm.is_active = true
));

CREATE POLICY gardens_delete ON public.gardens
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  WHERE gm.garden_id = gardens.id
    AND gm.user_id = auth.uid()
    AND gm.role = 'owner'
    AND gm.is_active = true
));

-- plant_beds: members can read/write within their gardens
CREATE POLICY plant_beds_rw ON public.plant_beds
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  WHERE gm.garden_id = plant_beds.garden_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.garden_members gm
  WHERE gm.garden_id = plant_beds.garden_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
));

-- plants: members can read/write plants in their gardens
CREATE POLICY plants_rw ON public.plants
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  JOIN public.plant_beds pb ON pb.garden_id = gm.garden_id
  WHERE pb.id = plants.plant_bed_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.garden_members gm
  JOIN public.plant_beds pb ON pb.garden_id = gm.garden_id
  WHERE pb.id = plants.plant_bed_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
));

-- logbook_entries: members can read/write entries in their gardens
CREATE POLICY logbook_entries_rw ON public.logbook_entries
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.garden_members gm
  JOIN public.plant_beds pb ON pb.garden_id = gm.garden_id
  WHERE pb.id = logbook_entries.plant_bed_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.garden_members gm
  JOIN public.plant_beds pb ON pb.garden_id = gm.garden_id
  WHERE pb.id = logbook_entries.plant_bed_id
    AND gm.user_id = auth.uid()
    AND gm.is_active = true
));

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to add a user to a garden
CREATE OR REPLACE FUNCTION add_garden_member(
  p_garden_id UUID,
  p_user_id UUID,
  p_role VARCHAR DEFAULT 'member',
  p_invited_by UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  new_member_id UUID;
BEGIN
  -- Check if inviter has admin/owner role
  IF NOT EXISTS (
    SELECT 1 FROM public.garden_members 
    WHERE garden_id = p_garden_id 
      AND user_id = p_invited_by 
      AND role IN ('owner', 'admin')
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Only garden owners/admins can invite members';
  END IF;
  
  -- Insert new member
  INSERT INTO public.garden_members (garden_id, user_id, role, invited_by, joined_at)
  VALUES (p_garden_id, p_user_id, p_role, p_invited_by, CURRENT_TIMESTAMP)
  RETURNING id INTO new_member_id;
  
  RETURN new_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MIGRATION NOTES
-- ==========================================

/*
To apply this migration:

1. Run this SQL in Supabase SQL Editor
2. Verify RLS is working: 
   - Non-members should see 0 rows
   - Members should only see their garden data
3. Add existing users to gardens via garden_members table
4. Test with different users to ensure isolation

Example test queries:
- SELECT * FROM gardens; (should only show user's gardens)
- SELECT * FROM plant_beds; (should only show beds from user's gardens)
*/