-- ===================================================================
-- MIGRATION 011: VISUAL GARDEN VIEWS
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