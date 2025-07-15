-- ===================================================================
-- MIGRATION 007: VISUAL GARDEN COLUMNS
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