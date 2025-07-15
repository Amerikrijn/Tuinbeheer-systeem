-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0
-- File: 008_visual_garden_data_update.sql
-- ===================================================================
-- Updates existing data with default visual garden values
-- ===================================================================

-- ===================================================================
-- 6. INITIAL DATA SETUP
-- ===================================================================

-- Update existing plant_beds with default positions
UPDATE plant_beds 
SET 
    position_x = (RANDOM() * 15)::DECIMAL(10,2),
    position_y = (RANDOM() * 15)::DECIMAL(10,2),
    visual_width = CASE 
        WHEN size ~ '^[0-9]+(\.[0-9]+)?$' THEN GREATEST(size::DECIMAL(10,2), 1)
        WHEN size ~ '^[0-9]+(\.[0-9]+)?x[0-9]+(\.[0-9]+)?$' THEN 
            GREATEST(SPLIT_PART(size, 'x', 1)::DECIMAL(10,2), 1)
        ELSE 2
    END,
    visual_height = CASE 
        WHEN size ~ '^[0-9]+(\.[0-9]+)?$' THEN GREATEST(size::DECIMAL(10,2), 1)
        WHEN size ~ '^[0-9]+(\.[0-9]+)?x[0-9]+(\.[0-9]+)?$' THEN 
            GREATEST(SPLIT_PART(size, 'x', 2)::DECIMAL(10,2), 1)
        ELSE 2
    END,
    color_code = CASE 
        WHEN LOWER(name) LIKE '%bloem%' THEN '#f59e0b'
        WHEN LOWER(name) LIKE '%groente%' THEN '#22c55e'
        WHEN LOWER(name) LIKE '%fruit%' THEN '#dc2626'
        WHEN LOWER(name) LIKE '%kruid%' THEN '#8b5cf6'
        WHEN LOWER(name) LIKE '%moestuin%' THEN '#16a34a'
        WHEN LOWER(name) LIKE '%zomer%' THEN '#eab308'
        ELSE '#22c55e'
    END,
    visual_updated_at = now()
WHERE position_x IS NULL OR position_y IS NULL OR position_x = 0 OR position_y = 0;

-- Update existing gardens with default canvas configuration
UPDATE gardens 
SET 
    canvas_width = 20,
    canvas_height = 20,
    grid_size = 1,
    default_zoom = 1,
    show_grid = true,
    snap_to_grid = true,
    background_color = '#f8fafc'
WHERE canvas_width IS NULL;

-- ===================================================================
-- DATA UPDATE VERIFICATION
-- ===================================================================

-- Show updated data summary
SELECT 
    'Visual garden data updated successfully!' as message,
    (SELECT COUNT(*) FROM plant_beds WHERE position_x > 0 AND position_y > 0) as positioned_plant_beds,
    (SELECT COUNT(*) FROM gardens WHERE canvas_width IS NOT NULL) as configured_gardens;

-- Show color distribution
SELECT 
    'Color distribution:' as info,
    color_code,
    COUNT(*) as count
FROM plant_beds 
GROUP BY color_code
ORDER BY count DESC;