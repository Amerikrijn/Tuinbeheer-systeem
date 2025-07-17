-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 002_core_tables.sql
-- ===================================================================
-- Enhanced core database tables with improved structure
-- ===================================================================

-- ===================================================================
-- CORE TABLES
-- ===================================================================

-- Users table with enhanced fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'volunteer',
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    skills TEXT[],
    availability JSONB,
    profile_image_url VARCHAR(500),
    bio TEXT,
    experience_level VARCHAR(50),
    preferred_tasks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}'::jsonb
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Plant varieties table for better plant management
CREATE TABLE plant_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100),
    planting_season VARCHAR(50),
    harvest_season VARCHAR(50),
    growth_duration_days INTEGER,
    spacing_cm INTEGER,
    water_requirements VARCHAR(50),
    sun_requirements VARCHAR(50),
    soil_ph_min DECIMAL(3,1),
    soil_ph_max DECIMAL(3,1),
    companion_plants TEXT[],
    incompatible_plants TEXT[],
    care_instructions TEXT,
    common_pests TEXT[],
    common_diseases TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Enhanced gardens table with visual designer support
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    coordinates POINT,
    total_area DECIMAL(10,2),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    garden_type garden_type DEFAULT 'mixed',
    maintenance_level VARCHAR(100),
    soil_condition TEXT,
    soil_ph DECIMAL(3,1),
    watering_system VARCHAR(200),
    has_greenhouse BOOLEAN DEFAULT FALSE,
    has_composting BOOLEAN DEFAULT FALSE,
    established_date DATE,
    
    -- Visual designer fields
    canvas_width DECIMAL(8,2) DEFAULT 10.0,
    canvas_height DECIMAL(8,2) DEFAULT 10.0,
    canvas_scale DECIMAL(5,2) DEFAULT 1.0,
    background_image_url VARCHAR(500),
    grid_enabled BOOLEAN DEFAULT TRUE,
    grid_size DECIMAL(4,2) DEFAULT 0.5,
    
    -- Enhanced metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    weather_station_id VARCHAR(100),
    
    -- Performance fields
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100)
);

-- Garden zones for better organization
CREATE TABLE garden_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone_type VARCHAR(100),
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    width DECIMAL(8,2) NOT NULL,
    height DECIMAL(8,2) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#e5e7eb',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced plant beds table with visual designer improvements
CREATE TABLE plant_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Physical properties
    size_m2 DECIMAL(8,2),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    depth DECIMAL(5,2),
    
    -- Visual designer properties
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    visual_width DECIMAL(8,2) NOT NULL,
    visual_height DECIMAL(8,2) NOT NULL,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 1,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    border_style VARCHAR(50) DEFAULT 'solid',
    opacity DECIMAL(3,2) DEFAULT 1.0,
    
    -- Bed properties
    bed_type VARCHAR(100),
    soil_type VARCHAR(100),
    soil_ph DECIMAL(3,1),
    drainage_quality VARCHAR(50),
    sun_exposure VARCHAR(50),
    irrigation_type VARCHAR(100),
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_occupied BOOLEAN DEFAULT FALSE,
    last_planted_date DATE,
    last_harvested_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    notes TEXT,
    
    -- Performance tracking
    productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
    maintenance_difficulty VARCHAR(50)
);

-- Enhanced plants table with growth tracking
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id UUID NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    variety_id UUID REFERENCES plant_varieties(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    common_name VARCHAR(255),
    
    -- Plant details
    quantity INTEGER DEFAULT 1,
    spacing_cm INTEGER,
    planted_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    
    -- Position within bed
    position_x DECIMAL(8,2),
    position_y DECIMAL(8,2),
    
    -- Status and health
    status plant_status DEFAULT 'planted',
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    growth_stage VARCHAR(50),
    
    -- Care requirements
    watering_frequency_days INTEGER,
    fertilizing_frequency_days INTEGER,
    last_watered_date DATE,
    last_fertilized_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Harvest tracking
    estimated_yield DECIMAL(8,2),
    actual_yield DECIMAL(8,2),
    yield_unit VARCHAR(50),
    
    -- Problems tracking
    current_issues TEXT[],
    pest_problems TEXT[],
    disease_problems TEXT[]
);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Core tables created successfully for v1.2' as status;