-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Anyone can view plant images" ON storage.objects
FOR SELECT USING (bucket_id = 'plant-images');

CREATE POLICY "Authenticated users can upload plant images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'plant-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own plant images" ON storage.objects
FOR UPDATE USING (bucket_id = 'plant-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own plant images" ON storage.objects
FOR DELETE USING (bucket_id = 'plant-images' AND auth.role() = 'authenticated');