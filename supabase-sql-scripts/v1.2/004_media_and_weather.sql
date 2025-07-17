-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 004_media_and_weather.sql
-- ===================================================================
-- Media management and weather tracking tables
-- ===================================================================

-- ===================================================================
-- MEDIA MANAGEMENT TABLES
-- ===================================================================

-- Photos table for comprehensive media management
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File details
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Image properties
    width_pixels INTEGER,
    height_pixels INTEGER,
    aspect_ratio DECIMAL(5,3),
    
    -- Storage details
    storage_provider VARCHAR(50) DEFAULT 'supabase',
    storage_bucket VARCHAR(100),
    storage_path VARCHAR(500),
    cdn_url VARCHAR(500),
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    alt_text VARCHAR(255),
    tags TEXT[],
    
    -- Technical metadata
    exif_data JSONB,
    camera_make VARCHAR(100),
    camera_model VARCHAR(100),
    taken_at TIMESTAMP WITH TIME ZONE,
    
    -- Context
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Thumbnails
    thumbnail_small_url VARCHAR(500),
    thumbnail_medium_url VARCHAR(500),
    thumbnail_large_url VARCHAR(500),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0
);

-- Garden photos for garden-specific imagery
CREATE TABLE garden_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Photo context
    photo_type VARCHAR(100), -- 'overview', 'detail', 'before', 'after', 'progress'
    capture_date DATE,
    season VARCHAR(20),
    
    -- Location within garden
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    viewing_angle DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Weather context
    weather_condition weather_condition,
    temperature_celsius DECIMAL(4,1),
    
    UNIQUE(photo_id, garden_id)
);

-- Plant bed photos
CREATE TABLE plant_bed_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    plant_bed_id UUID NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    
    -- Photo context
    photo_type VARCHAR(100), -- 'overview', 'planting', 'growth', 'harvest', 'maintenance'
    capture_date DATE,
    growth_stage VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    UNIQUE(photo_id, plant_bed_id)
);

-- Plant photos for individual plant tracking
CREATE TABLE plant_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    
    -- Photo context
    photo_type VARCHAR(100), -- 'seedling', 'growth', 'flowering', 'fruiting', 'harvest', 'problem'
    capture_date DATE,
    plant_age_days INTEGER,
    
    -- Health documentation
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    shows_problem BOOLEAN DEFAULT FALSE,
    problem_type VARCHAR(100),
    
    -- Measurements at time of photo
    height_cm DECIMAL(6,2),
    width_cm DECIMAL(6,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    UNIQUE(photo_id, plant_id)
);

-- Session photos for documenting volunteer activities
CREATE TABLE session_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    
    -- Photo context
    photo_type VARCHAR(100), -- 'before', 'during', 'after', 'group', 'achievement'
    capture_time TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    UNIQUE(photo_id, session_id)
);

-- Task photos for documenting work progress
CREATE TABLE task_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Photo context
    photo_type VARCHAR(100), -- 'before', 'progress', 'after', 'problem', 'solution'
    capture_time TIMESTAMP WITH TIME ZONE,
    task_progress_percentage INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    UNIQUE(photo_id, task_id)
);

-- ===================================================================
-- WEATHER TRACKING TABLES
-- ===================================================================

-- Garden weather data for environmental monitoring
CREATE TABLE garden_weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Timestamp
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data_source VARCHAR(100), -- 'manual', 'weather_api', 'sensor', 'station'
    
    -- Temperature
    temperature_celsius DECIMAL(4,1),
    temperature_feels_like DECIMAL(4,1),
    temperature_min DECIMAL(4,1),
    temperature_max DECIMAL(4,1),
    
    -- Humidity
    humidity_percentage INTEGER CHECK (humidity_percentage >= 0 AND humidity_percentage <= 100),
    
    -- Precipitation
    precipitation_mm DECIMAL(6,2),
    precipitation_type VARCHAR(50), -- 'rain', 'snow', 'sleet', 'hail'
    
    -- Wind
    wind_speed_kmh DECIMAL(5,2),
    wind_direction_degrees INTEGER CHECK (wind_direction_degrees >= 0 AND wind_direction_degrees <= 360),
    wind_gust_kmh DECIMAL(5,2),
    
    -- Pressure
    pressure_hpa DECIMAL(7,2),
    
    -- Visibility and conditions
    visibility_km DECIMAL(5,2),
    weather_condition weather_condition,
    cloud_cover_percentage INTEGER CHECK (cloud_cover_percentage >= 0 AND cloud_cover_percentage <= 100),
    
    -- UV and solar
    uv_index DECIMAL(3,1),
    solar_radiation_wm2 DECIMAL(8,2),
    
    -- Soil conditions (if measured)
    soil_temperature_celsius DECIMAL(4,1),
    soil_moisture_percentage INTEGER CHECK (soil_moisture_percentage >= 0 AND soil_moisture_percentage <= 100),
    
    -- Additional data
    additional_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id),
    
    -- Data quality
    data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Indexing for time-series queries
    UNIQUE(garden_id, recorded_at, data_source)
);

-- Weather alerts for garden management
CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(100) NOT NULL, -- 'frost', 'heat', 'storm', 'drought', 'flood'
    severity VARCHAR(50) NOT NULL, -- 'low', 'moderate', 'high', 'extreme'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timing
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    
    -- Source
    source VARCHAR(100), -- 'weather_service', 'manual', 'sensor'
    source_url VARCHAR(500),
    
    -- Impact assessment
    potential_impact TEXT,
    recommended_actions TEXT[],
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Additional data
    additional_data JSONB
);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Media and weather tables created successfully for v1.2' as status;