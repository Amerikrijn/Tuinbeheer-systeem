-- ===================================================================
-- VISUAL GARDEN DESIGNER DATABASE MIGRATION
-- ===================================================================
-- Deze migratie voegt de benodigde kolommen toe voor de Visual Garden Designer
-- functionaliteit, inclusief positionering en canvas configuratie.

-- Versie: 1.0.0
-- Datum: 2024-01-15
-- Auteur: Tuinbeheer Systeem Team
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. PLANT_BEDS TABLE UITBREIDINGEN
-- ===================================================================

-- Voeg positionering kolommen toe aan plant_beds
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_width DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS visual_height DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS rotation DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS z_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color_code VARCHAR(7) DEFAULT '#22c55e';

-- Voeg timestamp voor visual updates toe
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ===================================================================
-- 2. GARDENS TABLE UITBREIDINGEN  
-- ===================================================================

-- Voeg canvas configuratie kolommen toe aan gardens
ALTER TABLE gardens
ADD COLUMN IF NOT EXISTS canvas_width DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS canvas_height DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS grid_size DECIMAL(10,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_zoom DECIMAL(5,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS snap_to_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#f8fafc';

-- ===================================================================
-- 3. PERFORMANCE INDICES
-- ===================================================================

-- Indices voor snelle positionering queries
CREATE INDEX IF NOT EXISTS idx_plant_beds_position 
ON plant_beds(position_x, position_y);

CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_position 
ON plant_beds(garden_id, position_x, position_y);

CREATE INDEX IF NOT EXISTS idx_plant_beds_z_index 
ON plant_beds(garden_id, z_index);

CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated 
ON plant_beds(visual_updated_at);

-- ===================================================================
-- 4. CONSTRAINTS EN VALIDATIES
-- ===================================================================

-- Positionering constraints
ALTER TABLE plant_beds 
ADD CONSTRAINT check_position_x_positive CHECK (position_x >= 0),
ADD CONSTRAINT check_position_y_positive CHECK (position_y >= 0),
ADD CONSTRAINT check_visual_width_positive CHECK (visual_width > 0),
ADD CONSTRAINT check_visual_height_positive CHECK (visual_height > 0),
ADD CONSTRAINT check_rotation_range CHECK (rotation >= -180 AND rotation <= 180);

-- Canvas configuratie constraints
ALTER TABLE gardens
ADD CONSTRAINT check_canvas_width_positive CHECK (canvas_width > 0),
ADD CONSTRAINT check_canvas_height_positive CHECK (canvas_height > 0),
ADD CONSTRAINT check_grid_size_positive CHECK (grid_size > 0),
ADD CONSTRAINT check_default_zoom_positive CHECK (default_zoom > 0);

-- ===================================================================
-- 5. TRIGGERS VOOR AUTOMATISCHE UPDATES
-- ===================================================================

-- Functie om visual_updated_at automatisch bij te werken
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger voor plant_beds visual updates
DROP TRIGGER IF EXISTS trigger_update_visual_updated_at ON plant_beds;
CREATE TRIGGER trigger_update_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code
    ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- ===================================================================
-- 6. INITIËLE DATA SETUP
-- ===================================================================

-- Update bestaande plant_beds met standaard posities
UPDATE plant_beds 
SET 
    position_x = (RANDOM() * 15)::DECIMAL(10,2),
    position_y = (RANDOM() * 15)::DECIMAL(10,2),
    visual_width = GREATEST(size_m2::DECIMAL(10,2), 1),
    visual_height = GREATEST(size_m2::DECIMAL(10,2), 1),
    color_code = CASE 
        WHEN LOWER(name) LIKE '%bloem%' THEN '#f59e0b'
        WHEN LOWER(name) LIKE '%groente%' THEN '#22c55e'
        WHEN LOWER(name) LIKE '%fruit%' THEN '#dc2626'
        WHEN LOWER(name) LIKE '%kruid%' THEN '#8b5cf6'
        ELSE '#22c55e'
    END,
    visual_updated_at = now()
WHERE position_x IS NULL OR position_y IS NULL;

-- Update bestaande gardens met standaard canvas configuratie
UPDATE gardens 
SET 
    canvas_width = 20,
    canvas_height = 20,
    grid_size = 1,
    default_zoom = 1,
    show_grid = true,
    snap_to_grid = true,
    background_color = '#f8fafc'
WHERE canvas_width IS NULL;

-- ===================================================================
-- 7. VIEWS VOOR VISUAL GARDEN DATA
-- ===================================================================

-- View voor complete visual garden data
CREATE OR REPLACE VIEW visual_garden_data AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.canvas_width,
    g.canvas_height,
    g.grid_size,
    g.default_zoom,
    g.show_grid,
    g.snap_to_grid,
    g.background_color,
    pb.id as plant_bed_id,
    pb.name as plant_bed_name,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.rotation,
    pb.z_index,
    pb.color_code,
    pb.visual_updated_at,
    COUNT(p.id) as plant_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, 
         g.default_zoom, g.show_grid, g.snap_to_grid, g.background_color,
         pb.id, pb.name, pb.position_x, pb.position_y, pb.visual_width, 
         pb.visual_height, pb.rotation, pb.z_index, pb.color_code, pb.visual_updated_at;

-- ===================================================================
-- 8. FUNCTIES VOOR COLLISION DETECTION
-- ===================================================================

-- Functie om overlapping te detecteren
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count
    FROM plant_beds pb
    WHERE pb.garden_id = p_garden_id
      AND pb.id != p_plant_bed_id
      AND (
          -- Rechthoek overlap detectie
          p_position_x < pb.position_x + pb.visual_width AND
          p_position_x + p_visual_width > pb.position_x AND
          p_position_y < pb.position_y + pb.visual_height AND
          p_position_y + p_visual_height > pb.position_y
      );
    
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Functie om canvas boundaries te checken
CREATE OR REPLACE FUNCTION check_canvas_boundaries(
    p_garden_id UUID,
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    canvas_width DECIMAL(10,2);
    canvas_height DECIMAL(10,2);
BEGIN
    SELECT g.canvas_width, g.canvas_height 
    INTO canvas_width, canvas_height
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    RETURN (
        p_position_x >= 0 AND
        p_position_y >= 0 AND
        p_position_x + p_visual_width <= canvas_width AND
        p_position_y + p_visual_height <= canvas_height
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 9. RLS (ROW LEVEL SECURITY) UPDATES
-- ===================================================================

-- Voeg RLS policies toe voor visual garden data (als niet al aanwezig)
-- Let op: Dit hangt af van je bestaande auth setup

-- ===================================================================
-- 10. MIGRATIE VERIFICATIE
-- ===================================================================

-- Verificatie query's
-- Controleer of alle kolommen zijn toegevoegd
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name IN ('position_x', 'position_y', 'visual_width', 'visual_height', 'rotation', 'z_index', 'color_code', 'visual_updated_at')
ORDER BY column_name;

SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'gardens' 
  AND column_name IN ('canvas_width', 'canvas_height', 'grid_size', 'default_zoom', 'show_grid', 'snap_to_grid', 'background_color')
ORDER BY column_name;

-- Controleer indices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('plant_beds', 'gardens')
  AND indexname LIKE 'idx_%position%' OR indexname LIKE 'idx_%visual%' OR indexname LIKE 'idx_%z_index%';

-- Controleer constraints
SELECT 
    conname,
    contype,
    conrelid::regclass,
    confrelid::regclass,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid IN ('plant_beds'::regclass, 'gardens'::regclass)
  AND conname LIKE 'check_%';

-- Test functies
SELECT check_plant_bed_collision(
    (SELECT id FROM gardens LIMIT 1),
    'TEST001',
    5::DECIMAL(10,2),
    5::DECIMAL(10,2),
    2::DECIMAL(10,2),
    2::DECIMAL(10,2)
) as collision_test;

COMMIT;

-- ===================================================================
-- ROLLBACK SCRIPT (Voor noodgevallen)
-- ===================================================================

/*
-- ROLLBACK SCRIPT - ALLEEN UITVOEREN BIJ PROBLEMEN
BEGIN;

-- Verwijder views
DROP VIEW IF EXISTS visual_garden_data;

-- Verwijder functies
DROP FUNCTION IF EXISTS check_plant_bed_collision;
DROP FUNCTION IF EXISTS check_canvas_boundaries;
DROP FUNCTION IF EXISTS update_visual_updated_at;

-- Verwijder triggers
DROP TRIGGER IF EXISTS trigger_update_visual_updated_at ON plant_beds;

-- Verwijder constraints
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS check_position_x_positive;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS check_position_y_positive;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS check_visual_width_positive;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS check_visual_height_positive;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS check_rotation_range;

ALTER TABLE gardens DROP CONSTRAINT IF EXISTS check_canvas_width_positive;
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS check_canvas_height_positive;
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS check_grid_size_positive;
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS check_default_zoom_positive;

-- Verwijder indices
DROP INDEX IF EXISTS idx_plant_beds_position;
DROP INDEX IF EXISTS idx_plant_beds_garden_position;
DROP INDEX IF EXISTS idx_plant_beds_z_index;
DROP INDEX IF EXISTS idx_plant_beds_visual_updated;

-- Verwijder kolommen
ALTER TABLE plant_beds 
DROP COLUMN IF EXISTS position_x,
DROP COLUMN IF EXISTS position_y,
DROP COLUMN IF EXISTS visual_width,
DROP COLUMN IF EXISTS visual_height,
DROP COLUMN IF EXISTS rotation,
DROP COLUMN IF EXISTS z_index,
DROP COLUMN IF EXISTS color_code,
DROP COLUMN IF EXISTS visual_updated_at;

ALTER TABLE gardens
DROP COLUMN IF EXISTS canvas_width,
DROP COLUMN IF EXISTS canvas_height,
DROP COLUMN IF EXISTS grid_size,
DROP COLUMN IF EXISTS default_zoom,
DROP COLUMN IF EXISTS show_grid,
DROP COLUMN IF EXISTS snap_to_grid,
DROP COLUMN IF EXISTS background_color;

COMMIT;
*/