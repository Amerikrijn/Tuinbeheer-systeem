-- Migratie: Status waarden naar Nederlandse termen
-- Datum: 2024
-- Beschrijving: Vervangt Engelse status waarden door Nederlandse equivalenten

-- Begin transactie
BEGIN;

-- Stap 1: Update bestaande data
UPDATE plants 
SET status = CASE 
    WHEN status = 'healthy' THEN 'gezond'
    WHEN status = 'needs_attention' THEN 'aandacht_nodig'
    WHEN status = 'diseased' THEN 'ziek'
    WHEN status = 'dead' THEN 'dood'
    WHEN status = 'harvested' THEN 'geoogst'
    ELSE status
END
WHERE status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested');

-- Stap 2: Drop bestaande constraint
ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_status_check;

-- Stap 3: Voeg nieuwe constraint toe met Nederlandse waarden
ALTER TABLE plants ADD CONSTRAINT plants_status_check 
CHECK (status IN ('gezond', 'aandacht_nodig', 'ziek', 'dood', 'geoogst'));

-- Verificatie: Toon alle unieke status waarden
SELECT DISTINCT status, COUNT(*) as count 
FROM plants 
GROUP BY status 
ORDER BY status;

-- Commit transactie
COMMIT;

-- Rollback instructies (voor noodgeval):
-- BEGIN;
-- UPDATE plants SET status = CASE 
--     WHEN status = 'gezond' THEN 'healthy'
--     WHEN status = 'aandacht_nodig' THEN 'needs_attention'
--     WHEN status = 'ziek' THEN 'diseased'
--     WHEN status = 'dood' THEN 'dead'
--     WHEN status = 'geoogst' THEN 'harvested'
--     ELSE status
-- END;
-- ALTER TABLE plants DROP CONSTRAINT plants_status_check;
-- ALTER TABLE plants ADD CONSTRAINT plants_status_check 
-- CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested'));
-- COMMIT;