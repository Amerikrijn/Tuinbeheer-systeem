-- Implement Missing Parts of Plantvak Letter System
-- This script only adds what's missing, based on current database status

-- Step 1: Add letter_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'letter_code'
    ) THEN
        ALTER TABLE plant_beds ADD COLUMN letter_code VARCHAR(10);
        RAISE NOTICE 'Added letter_code column';
    ELSE
        RAISE NOTICE 'letter_code column already exists';
    END IF;
END $$;

-- Step 2: Create assign_plantvak_letter_code function if it doesn't exist
CREATE OR REPLACE FUNCTION assign_plantvak_letter_code(garden_id_param UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
    next_letter VARCHAR(10);
    letter_count INTEGER;
    char_code INTEGER;
BEGIN
    -- Find the next available letter (A, B, C, ..., Z)
    FOR char_code IN 65..90 LOOP  -- ASCII 65-90 = A-Z
        next_letter := CHR(char_code);
        
        -- Check if this letter is already used in this garden
        SELECT COUNT(*) INTO letter_count
        FROM plant_beds 
        WHERE garden_id = garden_id_param 
        AND letter_code = next_letter
        AND is_active = true;
        
        -- If letter is not used, return it
        IF letter_count = 0 THEN
            RETURN next_letter;
        END IF;
    END LOOP;
    
    -- If all letters A-Z are used, return null (should not happen in practice)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_assign_plantvak_letter_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign letter code if it's not already set
    IF NEW.letter_code IS NULL OR NEW.letter_code = '' THEN
        NEW.letter_code := assign_plantvak_letter_code(NEW.garden_id);
    END IF;
    
    -- Generate name based on letter code
    NEW.name := 'Plantvak ' || NEW.letter_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_assign_plantvak_letter_code'
    ) THEN
        CREATE TRIGGER trigger_assign_plantvak_letter_code
            BEFORE INSERT ON plant_beds
            FOR EACH ROW
            EXECUTE FUNCTION trigger_assign_plantvak_letter_code();
        RAISE NOTICE 'Created letter assignment trigger';
    ELSE
        RAISE NOTICE 'Letter assignment trigger already exists';
    END IF;
END $$;

-- Step 5: Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_garden_letter_code'
    ) THEN
        ALTER TABLE plant_beds ADD CONSTRAINT unique_garden_letter_code UNIQUE (garden_id, letter_code);
        RAISE NOTICE 'Added unique constraint';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Step 6: Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_letter_code ON plant_beds (garden_id, letter_code);

-- Step 7: Create deleted_plantvakken table if it doesn't exist
CREATE TABLE IF NOT EXISTS deleted_plantvakken (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_id VARCHAR NOT NULL,
    garden_id UUID NOT NULL,
    letter_code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    size VARCHAR(100),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(100),
    description TEXT,
    position_x NUMERIC,
    position_y NUMERIC,
    visual_width NUMERIC,
    visual_height NUMERIC,
    rotation NUMERIC,
    z_index INTEGER,
    color_code VARCHAR(7),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by UUID,
    deletion_reason TEXT,
    FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
);

-- Step 8: Create indexes for deleted_plantvakken if they don't exist
CREATE INDEX IF NOT EXISTS idx_deleted_plantvakken_garden_id ON deleted_plantvakken (garden_id);
CREATE INDEX IF NOT EXISTS idx_deleted_plantvakken_deleted_at ON deleted_plantvakken (deleted_at);

-- Step 9: Create log_deleted_plantvak function if it doesn't exist
CREATE OR REPLACE FUNCTION log_deleted_plantvak(plantvak_id VARCHAR, deleted_by_user UUID DEFAULT NULL, reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO deleted_plantvakken (
        original_id,
        garden_id,
        letter_code,
        name,
        location,
        size,
        soil_type,
        sun_exposure,
        description,
        position_x,
        position_y,
        visual_width,
        visual_height,
        rotation,
        z_index,
        color_code,
        deleted_by,
        deletion_reason
    )
    SELECT 
        id,
        garden_id,
        letter_code,
        name,
        location,
        size,
        soil_type,
        sun_exposure,
        description,
        position_x,
        position_y,
        visual_width,
        visual_height,
        rotation,
        z_index,
        color_code,
        deleted_by_user,
        reason
    FROM plant_beds 
    WHERE id = plantvak_id;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger function for logging if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_log_deleted_plantvak()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the deleted plantvak before it's marked as inactive
    IF OLD.is_active = true AND NEW.is_active = false THEN
        PERFORM log_deleted_plantvak(OLD.id, NULL, 'Soft delete');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create logging trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_log_deleted_plantvak'
    ) THEN
        CREATE TRIGGER trigger_log_deleted_plantvak
            BEFORE UPDATE ON plant_beds
            FOR EACH ROW
            EXECUTE FUNCTION trigger_log_deleted_plantvak();
        RAISE NOTICE 'Created deletion logging trigger';
    ELSE
        RAISE NOTICE 'Deletion logging trigger already exists';
    END IF;
END $$;

-- Step 12: Add comments if they don't exist
COMMENT ON COLUMN plant_beds.letter_code IS 'Unique letter code (A, B, C, etc.) for plantvak identification within a garden';
COMMENT ON COLUMN plant_beds.name IS 'Auto-generated name based on letter code (e.g., Plantvak A)';
COMMENT ON TABLE deleted_plantvakken IS 'Log of deleted plantvakken for admin review';

-- Step 13: Update existing plant_beds with letter codes if they don't have them
DO $$
DECLARE
    bed RECORD;
    next_letter VARCHAR(10);
BEGIN
    FOR bed IN 
        SELECT id, garden_id 
        FROM plant_beds 
        WHERE letter_code IS NULL OR letter_code = ''
        AND is_active = true
    LOOP
        next_letter := assign_plantvak_letter_code(bed.garden_id);
        IF next_letter IS NOT NULL THEN
            UPDATE plant_beds 
            SET 
                letter_code = next_letter,
                name = 'Plantvak ' || next_letter,
                updated_at = NOW()
            WHERE id = bed.id;
            RAISE NOTICE 'Updated plant_bed % with letter code %', bed.id, next_letter;
        ELSE
            RAISE NOTICE 'Could not assign letter code to plant_bed % - no letters available', bed.id;
        END IF;
    END LOOP;
END $$;

-- Step 14: Verify the setup
SELECT 
    'Implementation complete' as status,
    COUNT(*) as plant_beds_count,
    COUNT(CASE WHEN letter_code IS NOT NULL THEN 1 END) as plant_beds_with_letters,
    'Ready for letter code system' as message
FROM plant_beds 
WHERE is_active = true;