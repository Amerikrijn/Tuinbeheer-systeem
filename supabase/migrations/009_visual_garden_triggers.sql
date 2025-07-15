-- ===================================================================
-- MIGRATION 009: VISUAL GARDEN TRIGGERS
-- ===================================================================
-- Creates triggers for visual garden functionality
-- ===================================================================

-- ===================================================================
-- 5. TRIGGERS FOR VISUAL UPDATES
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