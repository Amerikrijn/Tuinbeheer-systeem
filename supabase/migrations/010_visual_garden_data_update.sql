-- ===================================================================
-- MIGRATION 010: VISUAL GARDEN DATA UPDATE
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
        ELSE 2
    END,
    visual_height = CASE 
        WHEN size ~ '^[0-9]+(\.[0-9]+)?$' THEN GREATEST(size::DECIMAL(10,2), 1)
        ELSE 2
    END,
    color_code = CASE 
        WHEN LOWER(name) LIKE '%bloem%' THEN '#f59e0b'
        WHEN LOWER(name) LIKE '%groente%' THEN '#22c55e'
        WHEN LOWER(name) LIKE '%fruit%' THEN '#dc2626'
        WHEN LOWER(name) LIKE '%kruid%' THEN '#8b5cf6'
        ELSE '#22c55e'
    END,
    visual_updated_at = now()
WHERE position_x IS NULL OR position_y IS NULL;

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