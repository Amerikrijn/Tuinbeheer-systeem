-- ===========================================
-- STORAGE BUCKET SETUP FOR TUINBEHEER SYSTEEM
-- ===========================================

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- STORAGE POLICIES
-- ===========================================

-- Allow public read access to all images
CREATE POLICY "Public read access for plant images" ON storage.objects
FOR SELECT USING (bucket_id = 'plant-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload plant images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'plant-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update plant images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'plant-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete plant images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'plant-images' AND
  auth.role() = 'authenticated'
);

-- ===========================================
-- NOTES
-- ===========================================

/*
STORAGE BUCKET CONFIGURATIE:

1. Bucket naam: 'plant-images'
2. Public toegang: Ja (voor het tonen van afbeeldingen)
3. Bestandsgrootte limiet: 5MB
4. Toegestane formaten: JPEG, PNG, WebP, GIF

POLICIES:

1. Iedereen kan afbeeldingen bekijken (public read)
2. Alleen geauthenticeerde gebruikers kunnen uploaden
3. Alleen geauthenticeerde gebruikers kunnen bewerken/verwijderen

GEBRUIK:

Run dit script in de Supabase SQL Editor om de storage bucket aan te maken.
*/