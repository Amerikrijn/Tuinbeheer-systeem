-- ===========================================
-- DISABLE RLS FOR STORAGE (LAST RESORT)
-- ===========================================

-- ⚠️ WARNING: This disables Row Level Security for storage
-- Only use this for development/testing environments!

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for plant images" ON storage.objects;

-- Ensure bucket is public and configured correctly
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'plant-images';

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 
  'Bucket Configuration' as check_type,
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'plant-images'

UNION ALL

SELECT 
  'RLS Status' as check_type,
  'storage' as id,
  'objects' as name,
  NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')) as public,
  NULL as file_size_limit,
  NULL as allowed_mime_types;

-- ===========================================
-- NOTES
-- ===========================================

/*
⚠️ WAARSCHUWING: Dit script schakelt RLS uit voor storage!

Dit is alleen voor development/testing. Voor productie moet je
proper RLS policies gebruiken.

Na het uitvoeren van dit script zou foto upload zeker moeten werken
omdat alle security checks zijn uitgeschakeld.

GEBRUIK ALLEEN ALS LAATSTE REDMIDDEL!
*/