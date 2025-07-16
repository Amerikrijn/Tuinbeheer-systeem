-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0 - UPGRADE FROM v1.0.0
-- ===================================================================
-- Upgrade script to add Visual Garden Designer features to existing v1.0.0 installation
-- 
-- IMPORTANT: This script assumes you have a working v1.0.0 installation
-- 
-- Release Date: January 15, 2024
-- Description: Adds Visual Garden Designer to existing core database
-- ===================================================================

-- ===================================================================
-- PRE-UPGRADE VERIFICATION
-- ===================================================================

-- Check if v1.0.0 is installed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gardens') THEN
        RAISE EXCEPTION 'v1.0.0 not found! Please install v1.0.0 first or use the complete-setup-v1.1.0.sql script.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_beds' AND column_name = 'position_x') THEN
        RAISE EXCEPTION 'Visual Garden Designer features already installed! This appears to be v1.1.0 or later.';
    END IF;
END
$$;

-- Show current installation status
SELECT 
    'Starting upgrade from v1.0.0 to v1.1.0...' as message,
    (SELECT COUNT(*) FROM gardens) as existing_gardens,
    (SELECT COUNT(*) FROM plant_beds) as existing_plant_beds,
    (SELECT COUNT(*) FROM plants) as existing_plants;

-- ===================================================================
-- 1. ADD VISUAL GARDEN COLUMNS
-- ===================================================================

-- Add positioning columns to plant_beds
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_width DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS visual_height DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS rotation DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS z_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color_code VARCHAR(7) DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add canvas configuration columns to gardens
ALTER TABLE gardens
ADD COLUMN IF NOT EXISTS canvas_width DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS canvas_height DECIMAL(10,2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS grid_size DECIMAL(10,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_zoom DECIMAL(5,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS snap_to_grid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#f8fafc';

-- ===================================================================
-- 2. ADD CONSTRAINTS AND VALIDATION
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
-- 3. ADD PERFORMANCE INDICES
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

-- Function to update visual_updated_at timestamp
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for visual updates
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
-- 6. ADD VISUAL GARDEN VIEWS
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

-- View for plant bed positions summary
CREATE OR REPLACE VIEW plant_bed_positions AS
SELECT 
    pb.id,
    pb.name,
    pb.garden_id,
    g.name as garden_name,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.rotation,
    pb.z_index,
    pb.color_code,
    pb.visual_updated_at,
    pb.position_x + pb.visual_width as right_edge,
    pb.position_y + pb.visual_height as bottom_edge,
    pb.position_x + (pb.visual_width / 2) as center_x,
    pb.position_y + (pb.visual_height / 2) as center_y,
    pb.visual_width * pb.visual_height as visual_area
FROM plant_beds pb
JOIN gardens g ON pb.garden_id = g.id
ORDER BY pb.garden_id, pb.z_index, pb.position_y, pb.position_x;

-- ===================================================================
-- 7. UPDATE EXISTING DATA
-- ===================================================================

-- Update existing gardens with default canvas configuration
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

-- Update existing plant_beds with default positions
UPDATE plant_beds 
SET 
    position_x = (RANDOM() * 15)::DECIMAL(10,2),
    position_y = (RANDOM() * 15)::DECIMAL(10,2),
    visual_width = CASE 
        WHEN size ~ '^[0-9]+(\.[0-9]+)?$' THEN GREATEST(size::DECIMAL(10,2), 1)
        WHEN size ~ '^[0-9]+(\.[0-9]+)?x[0-9]+(\.[0-9]+)?$' THEN 
            GREATEST(SPLIT_PART(size, 'x', 1)::DECIMAL(10,2), 1)
        ELSE 2
    END,
    visual_height = CASE 
        WHEN size ~ '^[0-9]+(\.[0-9]+)?$' THEN GREATEST(size::DECIMAL(10,2), 1)
        WHEN size ~ '^[0-9]+(\.[0-9]+)?x[0-9]+(\.[0-9]+)?$' THEN 
            GREATEST(SPLIT_PART(size, 'x', 2)::DECIMAL(10,2), 1)
        ELSE 2
    END,
    color_code = CASE 
        WHEN LOWER(name) LIKE '%bloem%' THEN '#f59e0b'
        WHEN LOWER(name) LIKE '%groente%' THEN '#22c55e'
        WHEN LOWER(name) LIKE '%fruit%' THEN '#dc2626'
        WHEN LOWER(name) LIKE '%kruid%' THEN '#8b5cf6'
        WHEN LOWER(name) LIKE '%moestuin%' THEN '#16a34a'
        WHEN LOWER(name) LIKE '%zomer%' THEN '#eab308'
        ELSE '#22c55e'
    END,
    visual_updated_at = now()
WHERE position_x IS NULL OR position_y IS NULL OR position_x = 0 OR position_y = 0;

-- ===================================================================
-- 8. UPGRADE VERIFICATION
-- ===================================================================

-- Verify upgrade completion
SELECT 
    'v1.1.0 upgrade completed successfully!' as message,
    now() as upgrade_time,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants,
    (SELECT COUNT(*) FROM plant_beds WHERE position_x > 0 AND position_y > 0) as positioned_plant_beds;

-- Verify new columns exist
SELECT 
    'New visual garden columns added:' as check_type,
    COUNT(*) as visual_columns_added
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name IN ('position_x', 'position_y', 'visual_width', 'visual_height', 'rotation', 'z_index', 'color_code', 'visual_updated_at');

-- Verify new functions exist
SELECT 
    'New functions added:' as check_type,
    COUNT(*) as functions_added
FROM pg_proc 
WHERE proname IN ('check_plant_bed_collision', 'check_canvas_boundaries', 'update_visual_updated_at');

-- Verify new views exist
SELECT 
    'New views added:' as check_type,
    COUNT(*) as views_added
FROM pg_views 
WHERE viewname IN ('visual_garden_data', 'plant_bed_positions');

-- Test new functionality
SELECT 'Testing new functionality:' as test_type;

-- Test collision detection
SELECT 'Collision detection test:' as test_result,
       check_plant_bed_collision(
           (SELECT id FROM gardens LIMIT 1),
           '00000000-0000-0000-0000-000000000000'::UUID,
           100::DECIMAL(10,2),
           100::DECIMAL(10,2),
           1::DECIMAL(10,2),
           1::DECIMAL(10,2)
       ) as collision_detected;

-- Show visual garden data
SELECT 'Visual garden data sample:' as data_type;
SELECT garden_name, plant_bed_name, position_x, position_y, visual_width, visual_height, color_code 
FROM visual_garden_data 
WHERE plant_bed_id IS NOT NULL
ORDER BY garden_name, plant_bed_name
LIMIT 5;

-- ===================================================================
-- UPGRADE COMPLETE!
-- ===================================================================
-- Your database has been successfully upgraded from v1.0.0 to v1.1.0!
-- 
-- New features added:
-- ✅ Visual Garden Designer with positioning and canvas config
-- ✅ Collision detection and boundary validation
-- ✅ Visual garden views for designer interface
-- ✅ Auto-positioning for existing plant beds
-- ✅ Color coding based on plant bed names
-- ✅ Performance indexes for positioning queries
-- 
-- Your existing data has been preserved and enhanced with visual positioning.
-- 
-- Next steps:
-- 1. Test the new visual garden views in your application
-- 2. Use the collision detection functions for drag-and-drop
-- 3. Customize plant bed positions using the visual garden interface
-- ===================================================================