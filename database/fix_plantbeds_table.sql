-- Fix de plant_beds tabel structuur
-- ==================================

-- STAP 1: Check wat er mis kan zijn
-- ----------------------------------

-- Check of ID een default value heeft
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name = 'id';

-- Als ID geen default heeft, voeg die toe:
-- ALTER TABLE plant_beds ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- STAP 2: Maak problematische kolommen optioneel
-- -----------------------------------------------

-- Maak season_year optioneel als het bestaat
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'season_year'
    ) THEN
        ALTER TABLE plant_beds ALTER COLUMN season_year DROP NOT NULL;
        RAISE NOTICE 'season_year is nu optioneel';
    END IF;
END $$;

-- Maak is_active optioneel en geef het een default
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE plant_beds ALTER COLUMN is_active SET DEFAULT true;
        ALTER TABLE plant_beds ALTER COLUMN is_active DROP NOT NULL;
        RAISE NOTICE 'is_active heeft nu default true';
    END IF;
END $$;

-- STAP 3: Zorg dat timestamps automatisch worden ingevuld
-- --------------------------------------------------------

-- created_at moet automatisch NOW() zijn
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE plant_beds ALTER COLUMN created_at SET DEFAULT NOW();
        RAISE NOTICE 'created_at heeft nu default NOW()';
    END IF;
END $$;

-- updated_at moet automatisch NOW() zijn
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE plant_beds ALTER COLUMN updated_at SET DEFAULT NOW();
        RAISE NOTICE 'updated_at heeft nu default NOW()';
    END IF;
END $$;

-- STAP 4: Belangrijkste fix - zorg dat ID automatisch wordt gegenereerd
-- ----------------------------------------------------------------------

ALTER TABLE plant_beds 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- STAP 5: Test of het nu werkt
-- -----------------------------

-- Test insert met alleen verplichte velden
INSERT INTO plant_beds (garden_id, name)
VALUES ('1edb9ffc-9665-46ff-8823-3b68f21a1823', 'TEST_AUTO_ID')
RETURNING *;

-- Verwijder test record
DELETE FROM plant_beds WHERE name = 'TEST_AUTO_ID';