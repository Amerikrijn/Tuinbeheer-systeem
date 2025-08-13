-- Storage bucket setup (no RLS policies yet)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'plant-images'
  ) THEN
    PERFORM storage.create_bucket('plant-images', public := true);
  END IF;
END $$;

-- Verification (optional)
SELECT name, public FROM storage.buckets WHERE name = 'plant-images';