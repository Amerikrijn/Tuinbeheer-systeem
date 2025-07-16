-- ===================================================================
-- MIGRATION 012: VISUAL GARDEN FUNCTIONS
-- ===================================================================
-- Creates utility functions for visual garden collision detection and validation
-- ===================================================================

-- ===================================================================
-- 8. FUNCTIONS FOR COLLISION DETECTION
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
          -- Rectangle overlap detection
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