-- Create Missing Tables for Tasks and Logbook
-- This script creates the tables that are referenced in the code but don't exist in the database

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
    plant_bed_id UUID REFERENCES public.plant_beds(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'pest_control', 'general')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create logbook_entries table
CREATE TABLE IF NOT EXISTS public.logbook_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_bed_id UUID NOT NULL REFERENCES public.plant_beds(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    notes TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_plant_id ON public.tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plant_bed_id ON public.tasks(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_logbook_entries_plant_bed_id ON public.logbook_entries(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_plant_id ON public.logbook_entries(plant_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_entry_date ON public.logbook_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_created_by ON public.logbook_entries(created_by);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_logbook_entries_updated_at ON public.logbook_entries;
CREATE TRIGGER update_logbook_entries_updated_at
    BEFORE UPDATE ON public.logbook_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS temporarily for these tables (can be enabled later with proper policies)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logbook_entries DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.logbook_entries TO authenticated;

-- Insert some sample data for testing (optional)
INSERT INTO public.tasks (title, description, due_date, plant_bed_id, priority, task_type) VALUES
('Water plants', 'Water all plants in the garden', CURRENT_DATE + INTERVAL '1 day', 
 (SELECT id FROM public.plant_beds LIMIT 1), 'high', 'watering')
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
    'tasks' as table_name,
    COUNT(*) as row_count
FROM public.tasks
UNION ALL
SELECT 
    'logbook_entries' as table_name,
    COUNT(*) as row_count
FROM public.logbook_entries;