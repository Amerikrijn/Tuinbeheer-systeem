-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0
-- File: 010_visual_garden_functions.sql
-- ===================================================================
-- Creates utility functions for visual garden collision detection and validation
-- ===================================================================

-- ===================================================================
-- 8. FUNCTIONS FOR COLLISION DETECTION
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

-- Function to find optimal position for a plant bed
CREATE OR REPLACE FUNCTION find_optimal_position(
    p_garden_id UUID,
    p_plant_bed_id UUID,
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS TABLE(suggested_x DECIMAL(10,2), suggested_y DECIMAL(10,2)) AS $$
DECLARE
    canvas_width DECIMAL(10,2);
    canvas_height DECIMAL(10,2);
    grid_size DECIMAL(10,2);
    test_x DECIMAL(10,2);
    test_y DECIMAL(10,2);
    step_size DECIMAL(10,2);
BEGIN
    -- Get canvas properties
    SELECT g.canvas_width, g.canvas_height, g.grid_size
    INTO canvas_width, canvas_height, grid_size
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    step_size := GREATEST(grid_size, 1);
    
    -- Try positions in a grid pattern
    FOR test_y IN 0..FLOOR(canvas_height - p_visual_height) BY step_size LOOP
        FOR test_x IN 0..FLOOR(canvas_width - p_visual_width) BY step_size LOOP
            -- Check if position is valid
            IF NOT check_plant_bed_collision(
                p_garden_id, 
                p_plant_bed_id, 
                test_x, 
                test_y, 
                p_visual_width, 
                p_visual_height
            ) THEN
                suggested_x := test_x;
                suggested_y := test_y;
                RETURN NEXT;
                RETURN;
            END IF;
        END LOOP;
    END LOOP;
    
    -- If no position found, return null
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to get plant bed neighbors
CREATE OR REPLACE FUNCTION get_plant_bed_neighbors(
    p_plant_bed_id UUID,
    p_distance_threshold DECIMAL(10,2) DEFAULT 2.0
) RETURNS TABLE(
    neighbor_id UUID,
    neighbor_name VARCHAR(255),
    distance DECIMAL(10,2),
    direction VARCHAR(10)
) AS $$
DECLARE
    source_bed RECORD;
BEGIN
    -- Get source plant bed info
    SELECT pb.id, pb.position_x, pb.position_y, pb.visual_width, pb.visual_height, pb.garden_id
    INTO source_bed
    FROM plant_beds pb
    WHERE pb.id = p_plant_bed_id;
    
    -- Find neighboring plant beds
    RETURN QUERY
    SELECT 
        pb.id as neighbor_id,
        pb.name as neighbor_name,
        SQRT(
            POWER(pb.position_x - source_bed.position_x, 2) + 
            POWER(pb.position_y - source_bed.position_y, 2)
        ) as distance,
        CASE 
            WHEN pb.position_x > source_bed.position_x THEN 'right'
            WHEN pb.position_x < source_bed.position_x THEN 'left'
            WHEN pb.position_y > source_bed.position_y THEN 'below'
            WHEN pb.position_y < source_bed.position_y THEN 'above'
            ELSE 'same'
        END as direction
    FROM plant_beds pb
    WHERE pb.garden_id = source_bed.garden_id
      AND pb.id != source_bed.id
      AND SQRT(
          POWER(pb.position_x - source_bed.position_x, 2) + 
          POWER(pb.position_y - source_bed.position_y, 2)
      ) <= p_distance_threshold
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- FUNCTION COMMENTS
-- ===================================================================

COMMENT ON FUNCTION check_plant_bed_collision IS 'Detects if a plant bed would overlap with existing plant beds';
COMMENT ON FUNCTION check_canvas_boundaries IS 'Validates that a plant bed fits within canvas boundaries';
COMMENT ON FUNCTION find_optimal_position IS 'Finds the first available position for a plant bed';
COMMENT ON FUNCTION get_plant_bed_neighbors IS 'Returns neighboring plant beds within a specified distance';