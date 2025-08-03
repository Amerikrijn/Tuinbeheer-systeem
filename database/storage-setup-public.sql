-- ===========================================
-- PUBLIC STORAGE BUCKET SETUP (FOR TESTING)
-- ===========================================

-- Create storage bucket for plant images with full public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- PUBLIC STORAGE POLICIES (FOR TESTING)
-- ===========================================

-- Allow public read access to all images
CREATE POLICY "Public read access for plant images" ON storage.objects
FOR SELECT USING (bucket_id = 'plant-images');

-- Allow public upload access (FOR TESTING ONLY!)
CREATE POLICY "Public upload access for plant images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'plant-images');

-- Allow public update access (FOR TESTING ONLY!)
CREATE POLICY "Public update access for plant images" ON storage.objects
FOR UPDATE USING (bucket_id = 'plant-images');

-- Allow public delete access (FOR TESTING ONLY!)
CREATE POLICY "Public delete access for plant images" ON storage.objects
FOR DELETE USING (bucket_id = 'plant-images');

-- ===========================================
-- NOTES
-- ===========================================

/*
⚠️  WAARSCHUWING: ALLEEN VOOR TESTING!

Deze configuratie geeft volledige publieke toegang tot de storage bucket.
Dit is NIET veilig voor productie gebruik!

Voor productie gebruik de storage-setup.sql met authenticatie.

GEBRUIK:

1. Run dit script in de Supabase SQL Editor
2. Test de foto upload functionaliteit
3. Vervang later door storage-setup.sql voor productie
*/