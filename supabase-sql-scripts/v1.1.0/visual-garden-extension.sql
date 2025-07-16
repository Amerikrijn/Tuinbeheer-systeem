-- ===================================================================
-- VISUAL GARDEN EXTENSION v1.1.0
-- ===================================================================
-- Optional visual garden features for the Tuinbeheer System
-- This script should be run AFTER the core setup is working
-- ===================================================================

-- ===================================================================
-- 1. ADD VISUAL GARDEN COLUMNS TO EXISTING TABLES
-- ===================================================================

-- Add visual garden columns to gardens table
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS canvas_width DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS canvas_height DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS grid_size DECIMAL(10,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_zoom DECIMAL(5,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS snap_to_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#f8fafc';

-- Add visual garden columns to plant_beds table
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_width DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS visual_height DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS rotation DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS z_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color_code VARCHAR(7) DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ===================================================================
-- 2. ADD CONSTRAINTS FOR VISUAL GARDEN
-- ===================================================================

-- Add constraints for plant_beds positioning
ALTER TABLE plant_beds 
ADD CONSTRAINT IF NOT EXISTS check_position_x_positive CHECK (position_x >= 0),
ADD CONSTRAINT IF NOT EXISTS check_position_y_positive CHECK (position_y >= 0),
ADD CONSTRAINT IF NOT EXISTS check_visual_width_positive CHECK (visual_width > 0),
ADD CONSTRAINT IF NOT EXISTS check_visual_height_positive CHECK (visual_height > 0),
ADD CONSTRAINT IF NOT EXISTS check_rotation_range CHECK (rotation >= 0 AND rotation < 360);

-- Add constraints for gardens canvas
ALTER TABLE gardens
ADD CONSTRAINT IF NOT EXISTS check_canvas_width_positive CHECK (canvas_width > 0),
ADD CONSTRAINT IF NOT EXISTS check_canvas_height_positive CHECK (canvas_height > 0),
ADD CONSTRAINT IF NOT EXISTS check_grid_size_positive CHECK (grid_size > 0),
ADD CONSTRAINT IF NOT EXISTS check_default_zoom_positive CHECK (default_zoom > 0);

-- ===================================================================
-- 3. ADD VISUAL GARDEN INDEXES
-- ===================================================================

-- Visual garden indexes
CREATE INDEX IF NOT EXISTS idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_position ON plant_beds(garden_id, position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_z_index ON plant_beds(garden_id, z_index);
CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated ON plant_beds(visual_updated_at);
CREATE INDEX IF NOT EXISTS idx_gardens_canvas_config ON gardens(canvas_width, canvas_height);

-- ===================================================================
-- 4. ADD VISUAL GARDEN TRIGGERS
-- ===================================================================

-- Visual updated_at trigger function
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Visual garden trigger
DROP TRIGGER IF EXISTS trigger_update_visual_updated_at ON plant_beds;
CREATE TRIGGER trigger_update_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code
    ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- ===================================================================
-- 5. ADD VISUAL GARDEN FUNCTIONS
-- ===================================================================

-- Function to detect plant bed overlapping
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id UUID,
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
          p_position_x < pb.position_x + pb.visual_width AND
          p_position_x + p_visual_width > pb.position_x AND
          p_position_y < pb.position_y + pb.visual_height AND
          p_position_y + p_visual_height > pb.position_y
      );
    
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check canvas boundaries
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
-- 6. ADD VISUAL GARDEN VIEW
-- ===================================================================

-- View for complete visual garden data
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
-- 7. UPDATE SAMPLE DATA WITH VISUAL POSITIONING
-- ===================================================================

-- Update existing plant beds with visual positioning
UPDATE plant_beds 
SET 
    position_x = 2.5,
    position_y = 2.0,
    visual_width = 3.0,
    visual_height = 2.0,
    color_code = '#22c55e'
WHERE id = 'A1';

UPDATE plant_beds 
SET 
    position_x = 6.0,
    position_y = 3.0,
    visual_width = 2.0,
    visual_height = 1.0,
    color_code = '#8b5cf6'
WHERE id = 'B1';

-- ===================================================================
-- 8. VERIFICATION
-- ===================================================================

-- Show visual garden setup summary
SELECT 
    'Visual garden extension completed successfully!' as status,
    now() as setup_time,
    (SELECT COUNT(*) FROM plant_beds WHERE position_x > 0 AND position_y > 0) as positioned_plant_beds;

-- Test visual garden data
SELECT 'Sample visual garden data:' as data_type;
SELECT garden_name, plant_bed_name, position_x, position_y, visual_width, visual_height, color_code 
FROM visual_garden_data 
WHERE plant_bed_id IS NOT NULL
ORDER BY garden_name, plant_bed_name;