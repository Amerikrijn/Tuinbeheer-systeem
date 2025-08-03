-- ===========================================
-- FIX STORAGE POLICIES - RLS ISSUE RESOLVER
-- ===========================================

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete plant images" ON storage.objects;

-- Ensure the bucket exists with correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ===========================================
-- PERMISSIVE STORAGE POLICIES (TESTING)
-- ===========================================

-- Allow everyone to read images (public bucket)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'plant-images');

-- Allow everyone to upload images (for testing)
CREATE POLICY "Allow public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'plant-images');

-- Allow everyone to update images (for testing)
CREATE POLICY "Allow public update access" ON storage.objects
FOR UPDATE USING (bucket_id = 'plant-images');

-- Allow everyone to delete images (for testing)
CREATE POLICY "Allow public delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'plant-images');

-- ===========================================
-- ENABLE RLS (Required for policies to work)
-- ===========================================

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check if bucket exists and is public
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'plant-images';

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ===========================================
-- NOTES
-- ===========================================

/*
Dit script lost het RLS probleem op door:

1. Alle bestaande policies te verwijderen
2. De bucket opnieuw te configureren als public
3. Nieuwe permissive policies aan te maken
4. RLS correct in te schakelen

Na het uitvoeren van dit script zou foto upload moeten werken.

Als het nog steeds niet werkt, probeer dan het alternative script hieronder.
*/