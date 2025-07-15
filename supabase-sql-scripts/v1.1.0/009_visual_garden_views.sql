-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0
-- File: 009_visual_garden_views.sql
-- ===================================================================
-- Creates views for visual garden data aggregation
-- ===================================================================

-- ===================================================================
-- 7. VIEWS FOR VISUAL GARDEN DATA
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
    -- Calculate boundaries
    pb.position_x + pb.visual_width as right_edge,
    pb.position_y + pb.visual_height as bottom_edge,
    -- Calculate center point
    pb.position_x + (pb.visual_width / 2) as center_x,
    pb.position_y + (pb.visual_height / 2) as center_y,
    -- Calculate area
    pb.visual_width * pb.visual_height as visual_area
FROM plant_beds pb
JOIN gardens g ON pb.garden_id = g.id
ORDER BY pb.garden_id, pb.z_index, pb.position_y, pb.position_x;

-- View for garden canvas summary
CREATE OR REPLACE VIEW garden_canvas_summary AS
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
    COUNT(pb.id) as total_plant_beds,
    COUNT(CASE WHEN pb.position_x > 0 AND pb.position_y > 0 THEN 1 END) as positioned_plant_beds,
    MIN(pb.position_x) as min_x,
    MAX(pb.position_x + pb.visual_width) as max_x,
    MIN(pb.position_y) as min_y,
    MAX(pb.position_y + pb.visual_height) as max_y,
    -- Calculate used area percentage
    ROUND(
        (SUM(pb.visual_width * pb.visual_height) / (g.canvas_width * g.canvas_height)) * 100, 2
    ) as used_area_percentage
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, 
         g.default_zoom, g.show_grid, g.snap_to_grid, g.background_color;

-- ===================================================================
-- VIEW COMMENTS
-- ===================================================================

COMMENT ON VIEW visual_garden_data IS 'Complete visual garden data for the designer interface';
COMMENT ON VIEW plant_bed_positions IS 'Plant bed positioning and boundary information';
COMMENT ON VIEW garden_canvas_summary IS 'Summary of garden canvas usage and statistics';