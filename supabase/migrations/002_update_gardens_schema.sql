-- Update gardens table with additional fields
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS length TEXT,
ADD COLUMN IF NOT EXISTS width TEXT,
ADD COLUMN IF NOT EXISTS garden_type TEXT,
ADD COLUMN IF NOT EXISTS maintenance_level TEXT,
ADD COLUMN IF NOT EXISTS soil_condition TEXT,
ADD COLUMN IF NOT EXISTS watering_system TEXT,
ADD COLUMN IF NOT EXISTS established_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update plant_beds table to ensure garden_id is properly referenced
ALTER TABLE plant_beds 
ADD CONSTRAINT fk_plant_beds_garden 
FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);

-- Insert sample garden if none exists
INSERT INTO gardens (id, name, location, description, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, notes, is_active)
SELECT 
  gen_random_uuid(),
  'Voorbeeldtuin',
  'Hoofdstraat 123, Amsterdam',
  'Een mooie gemeenschapstuin voor iedereen',
  '500m²',
  '25m',
  '20m',
  'Community garden',
  'Medium - regular maintenance',
  'Goede potgrond met compost',
  'Drip irrigation + manual',
  '2024-01-01',
  'Deze tuin is aangemaakt als voorbeeld',
  true
WHERE NOT EXISTS (SELECT 1 FROM gardens WHERE is_active = true);
