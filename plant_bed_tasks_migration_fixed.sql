-- Migration to add plant bed level tasks support (CORRECTED VERSION)
-- This extends the existing tasks table to allow tasks at plant bed level

-- First, let's check and ensure the correct data types
-- Add plant_bed_id column to tasks table with correct UUID type
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS plant_bed_id UUID;

-- Add the foreign key constraint separately to ensure proper typing
ALTER TABLE tasks ADD CONSTRAINT tasks_plant_bed_id_fkey 
FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;

-- Make plant_id nullable since tasks can now be either plant-specific or plant bed-specific
ALTER TABLE tasks ALTER COLUMN plant_id DROP NOT NULL;

-- Add constraint to ensure a task is associated with either a plant OR a plant bed, but not both
ALTER TABLE tasks ADD CONSTRAINT tasks_plant_or_bed_check 
CHECK ((plant_id IS NOT NULL AND plant_bed_id IS NULL) OR (plant_id IS NULL AND plant_bed_id IS NOT NULL));

-- Add index for plant_bed_id for performance
CREATE INDEX IF NOT EXISTS idx_tasks_plant_bed_id ON tasks(plant_bed_id);

-- Update the tasks_with_plant_info view to include plant bed tasks
CREATE OR REPLACE VIEW tasks_with_plant_info AS
SELECT 
    t.*,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN p.name
        ELSE 'Plantvak taak'
    END as plant_name,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN p.color
        ELSE pb_direct.color
    END as plant_color,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN pb_plant.name
        ELSE pb_direct.name
    END as plant_bed_name,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN g_plant.name
        ELSE g_direct.name
    END as garden_name
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb_plant ON p.plant_bed_id = pb_plant.id
LEFT JOIN gardens g_plant ON pb_plant.garden_id = g_plant.id
LEFT JOIN plant_beds pb_direct ON t.plant_bed_id = pb_direct.id
LEFT JOIN gardens g_direct ON pb_direct.garden_id = g_direct.id;

-- Update weekly_tasks view to include plant bed tasks
CREATE OR REPLACE VIEW weekly_tasks AS
SELECT 
    t.*,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN p.name
        ELSE 'Plantvak taak'
    END as plant_name,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN p.color
        ELSE pb_direct.color
    END as plant_color,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN pb_plant.name
        ELSE pb_direct.name
    END as plant_bed_name,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN g_plant.name
        ELSE g_direct.name
    END as garden_name,
    EXTRACT(DOW FROM t.due_date::date) as day_of_week,
    CASE 
        WHEN t.due_date < CURRENT_DATE THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'today'
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
        ELSE 'future'
    END as status_category
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb_plant ON p.plant_bed_id = pb_plant.id
LEFT JOIN gardens g_plant ON pb_plant.garden_id = g_plant.id
LEFT JOIN plant_beds pb_direct ON t.plant_bed_id = pb_direct.id
LEFT JOIN gardens g_direct ON pb_direct.garden_id = g_direct.id;

-- Drop existing RLS policies that might conflict
DROP POLICY IF EXISTS "Users can view plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete plant bed tasks" ON tasks;

-- Add RLS policies for plant bed tasks
CREATE POLICY "Users can view plant bed tasks" ON tasks
    FOR SELECT USING (
        (plant_bed_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM plant_beds pb 
            JOIN gardens g ON pb.garden_id = g.id 
            WHERE pb.id = plant_bed_id
        )) OR plant_id IS NOT NULL
    );

CREATE POLICY "Users can create plant bed tasks" ON tasks
    FOR INSERT WITH CHECK (
        (plant_bed_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM plant_beds pb 
            JOIN gardens g ON pb.garden_id = g.id 
            WHERE pb.id = plant_bed_id
        )) OR plant_id IS NOT NULL
    );

CREATE POLICY "Users can update plant bed tasks" ON tasks
    FOR UPDATE USING (
        (plant_bed_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM plant_beds pb 
            JOIN gardens g ON pb.garden_id = g.id 
            WHERE pb.id = plant_bed_id
        )) OR plant_id IS NOT NULL
    );

CREATE POLICY "Users can delete plant bed tasks" ON tasks
    FOR DELETE USING (
        (plant_bed_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM plant_beds pb 
            JOIN gardens g ON pb.garden_id = g.id 
            WHERE pb.id = plant_bed_id
        )) OR plant_id IS NOT NULL
    );

-- Add comment for clarity
COMMENT ON COLUMN tasks.plant_bed_id IS 'Optional reference to plant bed for plant bed-level tasks. Either plant_id or plant_bed_id must be set, but not both.';