-- Performance improvements for Tuinbeheer Systeem
-- Run this in Supabase SQL Editor

-- Add index on users.email for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Add index on users.status for admin queries
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Add index on user_garden_access for faster garden filtering
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);

-- Add index on tasks for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_plant_id ON public.tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plant_bed_id ON public.tasks(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);

-- Add index on logbook_entries for better performance  
CREATE INDEX IF NOT EXISTS idx_logbook_entries_plant_bed_id ON public.logbook_entries(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_entry_date ON public.logbook_entries(entry_date);

-- Analyze tables for query optimization
ANALYZE public.users;
ANALYZE public.user_garden_access;
ANALYZE public.tasks;
ANALYZE public.logbook_entries;