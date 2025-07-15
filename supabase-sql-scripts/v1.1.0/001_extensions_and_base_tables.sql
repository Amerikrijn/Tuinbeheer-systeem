-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.0.0
-- File: 001_extensions_and_base_tables.sql
-- ===================================================================
-- Creates the core extensions and base table structure
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- CREATE CORE TABLES
-- ===================================================================

-- Create gardens table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    total_area VARCHAR(100),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create plant_beds table
CREATE TABLE IF NOT EXISTS plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    size VARCHAR(100),
    soil_type VARCHAR(200),
    sun_exposure VARCHAR(20) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')) DEFAULT 'full-sun',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(8,2),
    stem_length DECIMAL(8,2),
    photo_url TEXT,
    category VARCHAR(50) DEFAULT 'eenjarig',
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')) DEFAULT 'healthy',
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABLE COMMENTS
-- ===================================================================

COMMENT ON TABLE gardens IS 'Main garden entities with location and basic configuration';
COMMENT ON TABLE plant_beds IS 'Individual planting areas within gardens';
COMMENT ON TABLE plants IS 'Individual plants within plant beds';

COMMENT ON COLUMN plants.stem_length IS 'Steellengte in cm';
COMMENT ON COLUMN plants.photo_url IS 'URL naar foto van de plant';
COMMENT ON COLUMN plants.category IS 'Categorie: eenjarig, vaste_planten, etc.';
COMMENT ON COLUMN plants.bloom_period IS 'Bloeiperiode';
COMMENT ON COLUMN plants.watering_frequency IS 'days between watering';