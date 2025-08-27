-- STAP 2: Geef ID kolom een automatische UUID generator
-- Dit lost het hoofdprobleem op!

ALTER TABLE plant_beds 
ALTER COLUMN id SET DEFAULT gen_random_uuid();