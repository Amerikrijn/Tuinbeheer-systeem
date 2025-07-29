-- Database migratie voor Takensysteem
-- Versie: 1.0
-- Datum: 2024

-- Enable UUID extension (als nog niet gedaan)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TASKS TABLE
-- ===========================================

-- Tasks (Taken) table - gekoppeld aan bloemen
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'pest_control', 'general')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Tasks indexes voor performance
CREATE INDEX idx_tasks_plant_id ON tasks(plant_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_due_date_completed ON tasks(due_date, completed);

-- Samengestelde index voor wekelijkse taken
CREATE INDEX idx_tasks_week_view ON tasks(due_date, completed, priority);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Trigger voor updated_at timestamp
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger om completed_at te zetten wanneer taak wordt afgerond
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_set_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_completed_at();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS op tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Tasks are viewable by everyone" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Tasks are insertable by authenticated users" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tasks are updatable by authenticated users" ON tasks
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Tasks are deletable by authenticated users" ON tasks
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===========================================
-- VIEWS VOOR GEMAKKELIJKE QUERIES
-- ===========================================

-- View voor taken met bloem informatie
CREATE OR REPLACE VIEW tasks_with_plant_info AS
SELECT 
    t.*,
    p.name as plant_name,
    p.color as plant_color,
    pb.name as plant_bed_name,
    g.name as garden_name
FROM tasks t
JOIN plants p ON t.plant_id = p.id
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
WHERE pb.is_active = true AND g.is_active = true;

-- View voor wekelijkse taken (huidige week)
CREATE OR REPLACE VIEW weekly_tasks AS
SELECT 
    t.*,
    p.name as plant_name,
    p.color as plant_color,
    pb.name as plant_bed_name,
    g.name as garden_name,
    EXTRACT(DOW FROM t.due_date) as day_of_week,
    CASE 
        WHEN t.due_date < CURRENT_DATE THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'today'
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
        ELSE 'future'
    END as status_category
FROM tasks t
JOIN plants p ON t.plant_id = p.id
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
WHERE 
    pb.is_active = true 
    AND g.is_active = true
    AND t.due_date >= CURRENT_DATE - INTERVAL '7 days'
    AND t.due_date <= CURRENT_DATE + INTERVAL '14 days'
ORDER BY t.due_date ASC, t.priority DESC, t.created_at ASC;

-- View voor taken statistieken per bloem
CREATE OR REPLACE VIEW plant_task_stats AS
SELECT 
    p.id as plant_id,
    p.name as plant_name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.completed = false AND t.due_date < CURRENT_DATE THEN 1 END) as overdue_tasks,
    COUNT(CASE WHEN t.completed = false AND t.due_date = CURRENT_DATE THEN 1 END) as today_tasks,
    COUNT(CASE WHEN t.completed = false AND t.due_date > CURRENT_DATE THEN 1 END) as upcoming_tasks
FROM plants p
LEFT JOIN tasks t ON p.id = t.plant_id
GROUP BY p.id, p.name;

-- ===========================================
-- FUNCTIES VOOR APPLICATIE
-- ===========================================

-- Functie om taken voor een specifieke week op te halen
CREATE OR REPLACE FUNCTION get_tasks_for_week(week_start DATE)
RETURNS TABLE (
    task_id UUID,
    plant_id UUID,
    title VARCHAR(255),
    description TEXT,
    due_date DATE,
    completed BOOLEAN,
    priority VARCHAR(10),
    task_type VARCHAR(50),
    plant_name VARCHAR(255),
    plant_color VARCHAR(100),
    plant_bed_name VARCHAR(255),
    garden_name VARCHAR(255),
    day_of_week INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.plant_id,
        t.title,
        t.description,
        t.due_date,
        t.completed,
        t.priority,
        t.task_type,
        p.name,
        p.color,
        pb.name,
        g.name,
        EXTRACT(DOW FROM t.due_date)::INTEGER
    FROM tasks t
    JOIN plants p ON t.plant_id = p.id
    JOIN plant_beds pb ON p.plant_bed_id = pb.id
    JOIN gardens g ON pb.garden_id = g.id
    WHERE 
        t.due_date >= week_start 
        AND t.due_date < week_start + INTERVAL '7 days'
        AND pb.is_active = true 
        AND g.is_active = true
    ORDER BY t.due_date ASC, t.priority DESC, t.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Functie om automatisch terugkerende taken te maken
CREATE OR REPLACE FUNCTION create_recurring_task(
    p_plant_id UUID,
    p_title VARCHAR(255),
    p_description TEXT,
    p_task_type VARCHAR(50),
    p_priority VARCHAR(10),
    p_start_date DATE,
    p_interval_days INTEGER,
    p_occurrences INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER := 0;
    task_date DATE := p_start_date;
BEGIN
    WHILE i < p_occurrences LOOP
        INSERT INTO tasks (plant_id, title, description, task_type, priority, due_date)
        VALUES (p_plant_id, p_title, p_description, p_task_type, p_priority, task_date);
        
        task_date := task_date + (p_interval_days || ' days')::INTERVAL;
        i := i + 1;
    END LOOP;
    
    RETURN p_occurrences;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SEED DATA (VOORBEELDEN)
-- ===========================================

-- Uncomment onderstaande regels voor test data

/*
-- Voorbeeld taken voor bestaande bloemen
DO $$
DECLARE
    plant_record RECORD;
BEGIN
    -- Voor elke bloem enkele voorbeeldtaken maken
    FOR plant_record IN SELECT id, name FROM plants LIMIT 3 LOOP
        -- Water geven (wekelijks)
        INSERT INTO tasks (plant_id, title, description, due_date, task_type, priority)
        VALUES (
            plant_record.id,
            'Water geven aan ' || plant_record.name,
            'Controleer de grond en geef water indien nodig',
            CURRENT_DATE + INTERVAL '1 day',
            'watering',
            'high'
        );
        
        -- Bemesten (maandelijks)
        INSERT INTO tasks (plant_id, title, description, due_date, task_type, priority)
        VALUES (
            plant_record.id,
            'Bemesten ' || plant_record.name,
            'Geef bloemenvoeding volgens instructies',
            CURRENT_DATE + INTERVAL '7 days',
            'fertilizing',
            'medium'
        );
        
        -- Dode bloemen verwijderen
        INSERT INTO tasks (plant_id, title, description, due_date, task_type, priority)
        VALUES (
            plant_record.id,
            'Uitgebloeide bloemen verwijderen',
            'Knip uitgebloeide bloemen weg voor nieuwe bloei',
            CURRENT_DATE + INTERVAL '3 days',
            'pruning',
            'low'
        );
    END LOOP;
END $$;
*/

-- ===========================================
-- OPMERKINGEN
-- ===========================================

/*
BELANGRIJKE PUNTEN:

1. Taken zijn gekoppeld aan individuele bloemen (plants tabel)
2. Elke taak heeft een datum, prioriteit en type
3. Views maken het gemakkelijk om taken per week op te halen
4. Automatische timestamps en completion tracking
5. RLS policies voor beveiliging
6. Indexes voor goede performance
7. Functies voor terugkerende taken en wekelijkse overzichten

GEBRUIK:

1. Run deze SQL in Supabase SQL Editor
2. Test met de seed data (uncomment indien gewenst)
3. Gebruik de views voor gemakkelijke queries
4. Gebruik de functies voor complexere operaties

VOLGENDE STAPPEN:

1. Frontend componenten maken voor taken beheer
2. Mobiel-vriendelijke wekelijkse takenlijst
3. Notificaties voor vervallen taken
4. Bulk acties voor taken
*/