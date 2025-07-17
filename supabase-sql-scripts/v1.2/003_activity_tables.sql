-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 003_activity_tables.sql
-- ===================================================================
-- Activity tracking and session management tables
-- ===================================================================

-- ===================================================================
-- ACTIVITY AND SESSION TABLES
-- ===================================================================

-- Garden sessions for volunteer activities
CREATE TABLE garden_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(100),
    
    -- Scheduling
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/60) STORED,
    
    -- Capacity and registration
    max_participants INTEGER DEFAULT 10,
    min_participants INTEGER DEFAULT 1,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Status and requirements
    status task_status DEFAULT 'pending',
    skill_requirements TEXT[],
    equipment_needed TEXT[],
    weather_dependent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    coordinator_id UUID REFERENCES users(id),
    
    -- Session results
    actual_participants INTEGER,
    completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    session_notes TEXT,
    weather_conditions weather_condition,
    
    -- Recurring sessions
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    parent_session_id UUID REFERENCES garden_sessions(id)
);

-- Session registrations
CREATE TABLE session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration details
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'registered',
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    attended BOOLEAN DEFAULT FALSE,
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Special requirements
    special_requirements TEXT,
    emergency_contact_override VARCHAR(255),
    
    UNIQUE(session_id, user_id)
);

-- Tasks for garden management
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    plant_bed_id UUID REFERENCES plant_beds(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES garden_sessions(id) ON DELETE SET NULL,
    
    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100),
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    
    -- Scheduling
    due_date DATE,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    
    -- Requirements
    required_skills TEXT[],
    required_tools TEXT[],
    weather_dependent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completion_notes TEXT,
    
    -- Recurring tasks
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    parent_task_id UUID REFERENCES tasks(id)
);

-- Task comments for collaboration
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Comment content
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Threading
    parent_comment_id UUID REFERENCES task_comments(id),
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Plant care logs for detailed tracking
CREATE TABLE plant_care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Care details
    care_type care_type NOT NULL,
    care_date DATE NOT NULL,
    care_time TIME,
    
    -- Specifics
    amount_used DECIMAL(8,2),
    unit VARCHAR(50),
    product_used VARCHAR(255),
    
    -- Conditions
    weather_condition weather_condition,
    temperature_celsius DECIMAL(4,1),
    humidity_percentage INTEGER,
    
    -- Results and notes
    plant_response TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Follow-up
    next_care_date DATE,
    requires_follow_up BOOLEAN DEFAULT FALSE
);

-- Plant growth tracking
CREATE TABLE plant_growth_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Measurement details
    measurement_date DATE NOT NULL,
    measurement_time TIME,
    
    -- Growth measurements
    height_cm DECIMAL(6,2),
    width_cm DECIMAL(6,2),
    leaf_count INTEGER,
    flower_count INTEGER,
    fruit_count INTEGER,
    
    -- Health indicators
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    color_quality VARCHAR(50),
    pest_presence BOOLEAN DEFAULT FALSE,
    disease_signs BOOLEAN DEFAULT FALSE,
    
    -- Environmental conditions
    weather_condition weather_condition,
    temperature_celsius DECIMAL(4,1),
    soil_moisture_percentage INTEGER,
    
    -- Notes and observations
    observations TEXT,
    concerns TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Photos reference (for future photo table)
    photo_urls TEXT[]
);

-- User activity log for audit trail
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    
    -- Context
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    
    -- Session info
    session_id VARCHAR(255),
    
    -- Additional context
    additional_data JSONB
);

-- Notifications for user engagement
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    
    -- Priority and status
    priority task_priority DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- Delivery
    delivery_method VARCHAR(50),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Context
    related_table VARCHAR(100),
    related_id UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Actions
    action_url VARCHAR(500),
    action_text VARCHAR(100)
);

-- Progress entries for tracking achievements
CREATE TABLE progress_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Progress details
    activity_type VARCHAR(100) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    hours_contributed DECIMAL(5,2),
    
    -- Context
    description TEXT,
    achievement_date DATE NOT NULL,
    
    -- Related entities
    task_id UUID REFERENCES tasks(id),
    session_id UUID REFERENCES garden_sessions(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Verification
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional data
    additional_data JSONB
);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Activity tables created successfully for v1.2' as status;