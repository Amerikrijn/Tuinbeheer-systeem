-- FIX AUDIT_LOG TABEL - Voeg ontbrekende kolommen toe
-- Run dit EERST voordat je het hoofdscript draait

-- Check en voeg ontbrekende kolommen toe aan audit_log
DO $$ 
BEGIN
    -- Voeg action kolom toe als deze niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_log' AND column_name = 'action'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN action VARCHAR(20) NOT NULL DEFAULT 'UPDATE' CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'));
    END IF;
    
    -- Voeg old_values kolom toe als deze niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_log' AND column_name = 'old_values'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN old_values JSONB;
    END IF;
    
    -- Voeg new_values kolom toe als deze niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_log' AND column_name = 'new_values'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN new_values JSONB;
    END IF;
    
    -- Voeg ip_address kolom toe als deze niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_log' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN ip_address INET;
    END IF;
    
    -- Voeg user_agent kolom toe als deze niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_log' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN user_agent TEXT;
    END IF;
    
    RAISE NOTICE 'Audit log table updated successfully';
END $$;