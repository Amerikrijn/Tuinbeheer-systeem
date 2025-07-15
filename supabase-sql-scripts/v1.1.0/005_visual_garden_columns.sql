-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0
-- File: 005_visual_garden_columns.sql
-- ===================================================================
-- Adds visual positioning and canvas configuration columns for the Visual Garden Designer
-- ===================================================================

-- ===================================================================
-- 1. PLANT_BEDS TABLE EXTENSIONS
-- ===================================================================

-- Add positioning columns to plant_beds
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_width DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS visual_height DECIMAL(10,2) DEFAULT 2,
ADD COLUMN IF NOT EXISTS rotation DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS z_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color_code VARCHAR(7) DEFAULT '#22c55e';

-- Add timestamp for visual updates
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ===================================================================
-- 2. GARDENS TABLE EXTENSIONS  
-- ===================================================================

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
-- COLUMN COMMENTS
-- ===================================================================

COMMENT ON COLUMN plant_beds.position_x IS 'X coordinate on canvas (meters)';
COMMENT ON COLUMN plant_beds.position_y IS 'Y coordinate on canvas (meters)';
COMMENT ON COLUMN plant_beds.visual_width IS 'Visual width on canvas (meters)';
COMMENT ON COLUMN plant_beds.visual_height IS 'Visual height on canvas (meters)';
COMMENT ON COLUMN plant_beds.rotation IS 'Rotation angle (0-359 degrees)';
COMMENT ON COLUMN plant_beds.z_index IS 'Layer order (higher = on top)';
COMMENT ON COLUMN plant_beds.color_code IS 'Color for visual representation (#RRGGBB)';
COMMENT ON COLUMN plant_beds.visual_updated_at IS 'Last visual update timestamp';

COMMENT ON COLUMN gardens.canvas_width IS 'Canvas width in meters';
COMMENT ON COLUMN gardens.canvas_height IS 'Canvas height in meters';
COMMENT ON COLUMN gardens.grid_size IS 'Grid size for snapping (meters)';
COMMENT ON COLUMN gardens.default_zoom IS 'Default zoom level';
COMMENT ON COLUMN gardens.show_grid IS 'Show grid in designer';
COMMENT ON COLUMN gardens.snap_to_grid IS 'Enable grid snapping';
COMMENT ON COLUMN gardens.background_color IS 'Canvas background color (#RRGGBB)';