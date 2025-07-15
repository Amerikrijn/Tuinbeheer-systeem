-- ===================================================================
-- MIGRATION 013: MIGRATION VERIFICATION
-- ===================================================================
-- Verification queries to ensure all migrations were applied correctly
-- ===================================================================

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Show created tables and record counts
SELECT 
    'Migration verification - Tables created successfully!' as message,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;

-- Verify visual garden columns were added to plant_beds
SELECT 
    'plant_beds visual columns:' as table_info,
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name IN ('position_x', 'position_y', 'visual_width', 'visual_height', 'rotation', 'z_index', 'color_code', 'visual_updated_at')
ORDER BY column_name;

-- Verify canvas columns were added to gardens
SELECT 
    'gardens canvas columns:' as table_info,
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'gardens' 
  AND column_name IN ('canvas_width', 'canvas_height', 'grid_size', 'default_zoom', 'show_grid', 'snap_to_grid', 'background_color')
ORDER BY column_name;

-- Check indexes
SELECT 
    'Indexes created:' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('plant_beds', 'gardens', 'plants')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check functions
SELECT 
    'Functions created:' as info,
    proname as function_name,
    pronargs as arg_count
FROM pg_proc 
WHERE proname IN ('check_plant_bed_collision', 'check_canvas_boundaries', 'update_updated_at_column', 'update_visual_updated_at')
ORDER BY proname;

-- Check views
SELECT 
    'Views created:' as info,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'visual_garden_data';

-- Test basic functionality
SELECT 'Sample data verification:' as info;
SELECT 'Gardens:' as type, id, name, location, canvas_width, canvas_height FROM gardens LIMIT 3;
SELECT 'Plant beds:' as type, id, name, position_x, position_y, visual_width, visual_height FROM plant_beds LIMIT 3;
SELECT 'Plants:' as type, name, scientific_name, status, plant_bed_id FROM plants LIMIT 3;