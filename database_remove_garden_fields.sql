-- ===================================================================
-- GARDEN FIELDS REMOVAL MIGRATION
-- ===================================================================
-- This script removes the following fields from the gardens table:
-- - maintenance_level
-- - soil_condition  
-- - watering_system
-- ===================================================================

-- Remove maintenance_level column
ALTER TABLE gardens DROP COLUMN IF EXISTS maintenance_level;

-- Remove soil_condition column
ALTER TABLE gardens DROP COLUMN IF EXISTS soil_condition;

-- Remove watering_system column
ALTER TABLE gardens DROP COLUMN IF EXISTS watering_system;

-- Add comment to track the change
COMMENT ON TABLE gardens IS 'Garden management table - maintenance_level, soil_condition, and watering_system fields removed';