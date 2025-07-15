-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0
-- File: 006_visual_garden_constraints.sql
-- ===================================================================
-- Adds constraints and validation for visual garden positioning
-- ===================================================================

-- ===================================================================
-- 3. CONSTRAINTS AND VALIDATION
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
-- 4. PERFORMANCE INDICES
-- ===================================================================

-- Indices for fast positioning queries
CREATE INDEX IF NOT EXISTS idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_position ON plant_beds(garden_id, position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_z_index ON plant_beds(garden_id, z_index);
CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated ON plant_beds(visual_updated_at);

-- Index for canvas queries
CREATE INDEX IF NOT EXISTS idx_gardens_canvas_config ON gardens(canvas_width, canvas_height);

-- ===================================================================
-- INDEX COMMENTS
-- ===================================================================

COMMENT ON INDEX idx_plant_beds_position IS 'Fast lookup for plant bed positions';
COMMENT ON INDEX idx_plant_beds_garden_position IS 'Fast lookup for plant beds by garden and position';
COMMENT ON INDEX idx_plant_beds_z_index IS 'Fast lookup for plant bed layering';
COMMENT ON INDEX idx_plant_beds_visual_updated IS 'Fast lookup for recently updated visual elements';
COMMENT ON INDEX idx_gardens_canvas_config IS 'Fast lookup for canvas configuration';