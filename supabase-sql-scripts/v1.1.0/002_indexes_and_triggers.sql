-- ===================================================================
-- INDEXES AND TRIGGERS - SIMPLIFIED VERSION
-- ===================================================================
-- Essential indexes and triggers for performance and data integrity

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Core indexes for gardens
CREATE INDEX IF NOT EXISTS idx_gardens_active ON gardens(is_active);
CREATE INDEX IF NOT EXISTS idx_gardens_name ON gardens(name);
CREATE INDEX IF NOT EXISTS idx_gardens_established_date ON gardens(established_date);

-- Core indexes for plant_beds
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX IF NOT EXISTS idx_plant_beds_name ON plant_beds(name);

-- Core indexes for plants
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
CREATE INDEX IF NOT EXISTS idx_plants_planting_date ON plants(planting_date);
CREATE INDEX IF NOT EXISTS idx_plants_harvest_date ON plants(expected_harvest_date);

-- ===================================================================
-- TRIGGERS AND FUNCTIONS
-- ===================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens;
CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plant_beds_updated_at ON plant_beds;
CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();