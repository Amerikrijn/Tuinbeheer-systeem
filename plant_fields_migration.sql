-- Plant Fields Migration
-- Voegt extra velden toe aan de plants tabel
-- Versie: 1.0

-- Add new columns to plants table (most already exist, but let's make sure)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS latin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS plant_height DECIMAL(5,2), -- in cm
ADD COLUMN IF NOT EXISTS plant_color VARCHAR(100),
ADD COLUMN IF NOT EXISTS plants_per_sqm INTEGER, -- aantal planten per vierkante meter
ADD COLUMN IF NOT EXISTS sun_preference VARCHAR(20) CHECK (sun_preference IN ('full-sun', 'partial-sun', 'shade'));

-- Update existing scientific_name column to latin_name if needed
UPDATE plants SET latin_name = scientific_name WHERE latin_name IS NULL AND scientific_name IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN plants.latin_name IS 'Latijnse/wetenschappelijke naam van de plant';
COMMENT ON COLUMN plants.plant_height IS 'Hoogte van de plant in centimeters';
COMMENT ON COLUMN plants.plant_color IS 'Kleur van de bloemen';
COMMENT ON COLUMN plants.plants_per_sqm IS 'Aantal planten per vierkante meter';
COMMENT ON COLUMN plants.sun_preference IS 'Zonvoorkeur: full-sun, partial-sun, of shade';

-- Create index for sun preference filtering
CREATE INDEX IF NOT EXISTS idx_plants_sun_preference ON plants(sun_preference);
CREATE INDEX IF NOT EXISTS idx_plants_color ON plants(plant_color);

-- Update existing plants with default values if needed
UPDATE plants 
SET 
    plants_per_sqm = COALESCE(plants_per_sqm, 4),
    sun_preference = COALESCE(sun_preference, 'partial-sun')
WHERE plants_per_sqm IS NULL OR sun_preference IS NULL;

-- Create a view for plant information with calculated area needs
CREATE OR REPLACE VIEW plants_with_area_info AS
SELECT 
    p.*,
    pb.name as plant_bed_name,
    pb.size as plant_bed_size,
    g.name as garden_name,
    -- Calculate recommended area per plant
    CASE 
        WHEN p.plants_per_sqm > 0 THEN ROUND(10000.0 / p.plants_per_sqm, 0) -- cm² per plant
        ELSE NULL 
    END as area_per_plant_cm2,
    -- Calculate spacing between plants
    CASE 
        WHEN p.plants_per_sqm > 0 THEN ROUND(SQRT(10000.0 / p.plants_per_sqm), 1) -- cm spacing
        ELSE NULL 
    END as plant_spacing_cm
FROM plants p
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
WHERE pb.is_active = true AND g.is_active = true;