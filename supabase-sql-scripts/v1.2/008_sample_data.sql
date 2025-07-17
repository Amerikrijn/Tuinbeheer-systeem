-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 008_sample_data.sql
-- ===================================================================
-- Comprehensive sample data for testing and development
-- ===================================================================

-- ===================================================================
-- SAMPLE DATA INSERTION
-- ===================================================================

-- Insert sample system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"Tuinbeheer Pro"', 'Application name', 'general', true),
('app_version', '"1.2.0"', 'Application version', 'general', true),
('max_file_size_mb', '10', 'Maximum file upload size in MB', 'media', false),
('default_garden_canvas_width', '15.0', 'Default garden canvas width in meters', 'garden', false),
('default_garden_canvas_height', '10.0', 'Default garden canvas height in meters', 'garden', false),
('weather_api_enabled', 'true', 'Enable weather API integration', 'weather', false),
('notification_email_enabled', 'true', 'Enable email notifications', 'notifications', false),
('backup_retention_days', '30', 'Number of days to retain backups', 'system', false);

-- Insert sample users
INSERT INTO users (id, email, name, role, phone, emergency_contact, emergency_phone, skills, bio, experience_level, preferred_tasks, notification_preferences) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@tuinbeheer.nl', 'Emma van der Berg', 'admin', '+31612345678', 'Jan van der Berg', '+31687654321', ARRAY['garden_design', 'plant_care', 'volunteer_coordination'], 'Experienced garden coordinator with 10 years of community gardening experience.', 'expert', ARRAY['coordination', 'planning', 'training'], '{"email": true, "push": true, "sms": false}'),
('550e8400-e29b-41d4-a716-446655440002', 'coordinator@tuinbeheer.nl', 'Pieter Janssen', 'coordinator', '+31623456789', 'Marie Janssen', '+31698765432', ARRAY['organic_gardening', 'composting', 'pest_control'], 'Passionate about sustainable gardening practices.', 'advanced', ARRAY['plant_care', 'soil_management', 'education'], '{"email": true, "push": false, "sms": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'volunteer1@tuinbeheer.nl', 'Lisa de Vries', 'volunteer', '+31634567890', 'Tom de Vries', '+31609876543', ARRAY['watering', 'weeding', 'harvesting'], 'Enthusiastic beginner who loves working with plants.', 'beginner', ARRAY['watering', 'weeding', 'harvesting'], '{"email": true, "push": false, "sms": false}'),
('550e8400-e29b-41d4-a716-446655440004', 'volunteer2@tuinbeheer.nl', 'Mark Bakker', 'volunteer', '+31645678901', 'Anna Bakker', '+31610987654', ARRAY['pruning', 'planting', 'tool_maintenance'], 'Retired carpenter with a green thumb.', 'intermediate', ARRAY['construction', 'maintenance', 'planting'], '{"email": true, "push": true, "sms": false}'),
('550e8400-e29b-41d4-a716-446655440005', 'volunteer3@tuinbeheer.nl', 'Sophie Smit', 'volunteer', '+31656789012', 'David Smit', '+31621098765', ARRAY['seed_starting', 'greenhouse_management'], 'Biology student specializing in plant sciences.', 'intermediate', ARRAY['research', 'plant_care', 'education'], '{"email": true, "push": false, "sms": false}');

-- Insert sample plant varieties
INSERT INTO plant_varieties (id, name, scientific_name, category, planting_season, harvest_season, growth_duration_days, spacing_cm, water_requirements, sun_requirements, soil_ph_min, soil_ph_max, companion_plants, incompatible_plants, care_instructions, common_pests, common_diseases) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Tomaat Cherry', 'Solanum lycopersicum var. cerasiforme', 'vegetables', 'spring', 'summer', 80, 60, 'high', 'full_sun', 6.0, 7.0, ARRAY['basil', 'marigold', 'parsley'], ARRAY['fennel', 'cabbage'], 'Regular watering, support with stakes, remove suckers', ARRAY['aphids', 'whitefly', 'hornworm'], ARRAY['blight', 'mosaic_virus']),
('650e8400-e29b-41d4-a716-446655440002', 'Basilicum', 'Ocimum basilicum', 'herbs', 'spring', 'summer', 60, 25, 'medium', 'full_sun', 6.0, 7.5, ARRAY['tomato', 'pepper', 'oregano'], ARRAY['rue', 'sage'], 'Pinch flowers to encourage leaf growth, harvest regularly', ARRAY['aphids', 'spider_mites'], ARRAY['fusarium_wilt', 'downy_mildew']),
('650e8400-e29b-41d4-a716-446655440003', 'Sla Kropsla', 'Lactuca sativa', 'vegetables', 'spring', 'summer', 45, 30, 'medium', 'partial_shade', 6.0, 7.0, ARRAY['carrots', 'radish', 'onions'], ARRAY['broccoli', 'cabbage'], 'Keep soil consistently moist, harvest outer leaves first', ARRAY['aphids', 'leaf_miners'], ARRAY['downy_mildew', 'lettuce_rot']),
('650e8400-e29b-41d4-a716-446655440004', 'Wortel', 'Daucus carota', 'vegetables', 'spring', 'autumn', 70, 5, 'medium', 'full_sun', 6.0, 7.0, ARRAY['lettuce', 'onions', 'leeks'], ARRAY['dill', 'parsnip'], 'Thin seedlings, keep soil loose and well-drained', ARRAY['carrot_fly', 'aphids'], ARRAY['leaf_blight', 'root_rot']),
('650e8400-e29b-41d4-a716-446655440005', 'Peterselie', 'Petroselinum crispum', 'herbs', 'spring', 'autumn', 90, 15, 'medium', 'partial_shade', 6.0, 7.0, ARRAY['tomato', 'asparagus', 'roses'], ARRAY['lettuce', 'mint'], 'Cut outer stems regularly, protect from frost', ARRAY['aphids', 'caterpillars'], ARRAY['leaf_spot', 'crown_rot']),
('650e8400-e29b-41d4-a716-446655440006', 'Courgette', 'Cucurbita pepo', 'vegetables', 'spring', 'summer', 55, 90, 'high', 'full_sun', 6.0, 7.5, ARRAY['nasturtium', 'marigold', 'radish'], ARRAY['potato', 'aromatic_herbs'], 'Regular watering, harvest when young and tender', ARRAY['squash_bugs', 'cucumber_beetles'], ARRAY['powdery_mildew', 'bacterial_wilt']);

-- Insert sample gardens
INSERT INTO gardens (id, name, description, location, total_area, length, width, garden_type, canvas_width, canvas_height, canvas_scale, grid_enabled, grid_size, established_date, created_by, health_score) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Hoofdtuin', 'De centrale gemeenschapstuin met diverse groentebedden en kruidentuin', 'Parkstraat 45, Amsterdam', 150.0, 15.0, 10.0, 'community', 15.0, 10.0, 1.0, true, 0.5, '2023-03-15', '550e8400-e29b-41d4-a716-446655440001', 85),
('750e8400-e29b-41d4-a716-446655440002', 'Kas Complex', 'Verwarmde kas voor seizoensverlenging en zaailingen', 'Parkstraat 45, Amsterdam', 40.0, 8.0, 5.0, 'greenhouse', 8.0, 5.0, 1.0, true, 0.25, '2023-04-01', '550e8400-e29b-41d4-a716-446655440001', 90),
('750e8400-e29b-41d4-a716-446655440003', 'Bloementuin', 'Kleurrijke bloementuin voor bijen en vlinders', 'Parkstraat 47, Amsterdam', 75.0, 10.0, 7.5, 'flower', 10.0, 7.5, 1.0, true, 0.5, '2023-05-10', '550e8400-e29b-41d4-a716-446655440002', 78);

-- Insert sample garden zones
INSERT INTO garden_zones (id, garden_id, name, description, zone_type, position_x, position_y, width, height, color_code) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Groentevakken', 'Hoofdgebied voor groenteteelt', 'vegetable', 2.0, 2.0, 8.0, 6.0, '#22c55e'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Kruidentuin', 'Gespecialiseerd gebied voor kruiden', 'herb', 11.0, 2.0, 3.0, 4.0, '#84cc16'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'Composthoop', 'Gebied voor compostering', 'composting', 1.0, 8.5, 2.0, 1.0, '#92400e'),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Zaailingen', 'Gebied voor jonge plantjes', 'seedling', 1.0, 1.0, 6.0, 3.0, '#fbbf24'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', 'Bijenvriendelijk', 'Bloemen voor bestuivers', 'pollinator', 2.0, 2.0, 6.0, 4.0, '#f472b6');

-- Insert sample plant beds
INSERT INTO plant_beds (id, garden_id, zone_id, name, description, size_m2, position_x, position_y, visual_width, visual_height, color_code, bed_type, soil_type, drainage_quality, sun_exposure, is_occupied, last_planted_date, created_by, productivity_score) VALUES
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Groentevak A1', 'Hoofdvak voor tomaten en basilicum', 6.0, 2.5, 2.5, 3.0, 2.0, '#22c55e', 'raised', 'loamy', 'good', 'full_sun', true, '2024-04-15', '550e8400-e29b-41d4-a716-446655440002', 85),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Groentevak A2', 'Vak voor bladgroenten', 4.0, 6.0, 2.5, 2.0, 2.0, '#16a34a', 'raised', 'sandy_loam', 'good', 'partial_sun', true, '2024-03-20', '550e8400-e29b-41d4-a716-446655440003', 78),
('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Groentevak B1', 'Vak voor wortels en knollen', 8.0, 2.5, 5.0, 4.0, 2.0, '#15803d', 'ground', 'sandy', 'excellent', 'full_sun', true, '2024-04-01', '550e8400-e29b-41d4-a716-446655440004', 82),
('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Kruiden A', 'Mediterrane kruiden', 3.0, 11.5, 2.5, 2.5, 1.5, '#84cc16', 'raised', 'sandy', 'excellent', 'full_sun', true, '2024-03-25', '550e8400-e29b-41d4-a716-446655440005', 90),
('950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Kruiden B', 'Schaduwminnende kruiden', 2.0, 11.5, 4.5, 2.5, 1.0, '#65a30d', 'raised', 'loamy', 'good', 'partial_shade', true, '2024-04-10', '550e8400-e29b-41d4-a716-446655440002', 88),
('950e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', 'Zaailingen 1', 'Jonge tomatenplantjes', 2.0, 1.5, 1.5, 2.0, 1.0, '#fbbf24', 'container', 'potting_mix', 'good', 'full_sun', true, '2024-02-15', '550e8400-e29b-41d4-a716-446655440005', 92);

-- Insert sample plants
INSERT INTO plants (id, plant_bed_id, variety_id, name, quantity, planted_date, expected_harvest_date, position_x, position_y, status, health_score, growth_stage, watering_frequency_days, fertilizing_frequency_days, last_watered_date, last_fertilized_date, estimated_yield, yield_unit, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Tomaten Rij 1', 4, '2024-04-15', '2024-07-15', 0.5, 0.5, 'growing', 85, 'vegetative', 2, 14, '2024-12-07', '2024-11-25', 8.0, 'kg', '550e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Basilicum Border', 8, '2024-04-15', '2024-08-15', 2.0, 0.2, 'growing', 88, 'mature', 1, 21, '2024-12-07', '2024-11-20', 2.0, 'kg', '550e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Sla Mengsel', 12, '2024-03-20', '2024-05-20', 1.0, 1.0, 'growing', 82, 'mature', 1, 28, '2024-12-07', '2024-11-15', 3.0, 'kg', '550e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 'Wortels Rij A', 20, '2024-04-01', '2024-07-01', 2.0, 1.0, 'growing', 78, 'root_development', 3, 21, '2024-12-06', '2024-11-18', 5.0, 'kg', '550e8400-e29b-41d4-a716-446655440004'),
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', 'Peterselie', 6, '2024-03-25', '2024-09-25', 1.0, 0.5, 'growing', 90, 'mature', 2, 28, '2024-12-07', '2024-11-10', 1.5, 'kg', '550e8400-e29b-41d4-a716-446655440005'),
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'Peterselie Schaduw', 4, '2024-04-10', '2024-10-10', 1.0, 0.3, 'growing', 85, 'mature', 2, 28, '2024-12-07', '2024-11-12', 1.0, 'kg', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample garden sessions
INSERT INTO garden_sessions (id, garden_id, title, description, session_type, start_time, end_time, max_participants, min_participants, status, skill_requirements, equipment_needed, weather_dependent, created_by, coordinator_id) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Voorjaarsplanting Tomaten', 'Samen tomatenplantjes uitplanten in de hoofdtuin', 'planting', '2024-12-15 09:00:00+01', '2024-12-15 12:00:00+01', 8, 3, 'pending', ARRAY['basic_planting'], ARRAY['handschoenen', 'schep', 'gieter'], true, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Onkruid Wieden Sessie', 'Wekelijkse onkruidbeheersing in alle vakken', 'maintenance', '2024-12-18 14:00:00+01', '2024-12-18 16:00:00+01', 6, 2, 'pending', ARRAY['weeding'], ARRAY['schoffel', 'handschoenen'], false, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Kas Onderhoud', 'Maandelijks onderhoud van de kas faciliteiten', 'maintenance', '2024-12-20 10:00:00+01', '2024-12-20 13:00:00+01', 4, 2, 'pending', ARRAY['greenhouse_management'], ARRAY['ladder', 'reinigingsmiddel', 'doeken'], false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005'),
('b50e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', 'Oogst Festival', 'Gezamenlijke oogst van seizoensgroenten', 'harvesting', '2024-12-22 11:00:00+01', '2024-12-22 15:00:00+01', 12, 4, 'pending', ARRAY['harvesting'], ARRAY['manden', 'schaar', 'mes'], false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample session registrations
INSERT INTO session_registrations (id, session_id, user_id, status, attendance_confirmed) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'registered', false),
('c50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440005', 'b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440006', 'b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440007', 'b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440008', 'b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'registered', true),
('c50e8400-e29b-41d4-a716-446655440009', 'b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'registered', false);

-- Insert sample tasks
INSERT INTO tasks (id, garden_id, plant_bed_id, title, description, task_type, priority, status, due_date, estimated_duration_minutes, assigned_to, created_by) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'Tomaten Ondersteuning', 'Plaats stokken en bind tomatenplanten vast', 'plant_care', 'high', 'pending', '2024-12-12', 60, '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),
('d50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'Sla Oogsten', 'Oogst rijpe slabladeren voor wekelijkse distributie', 'harvesting', 'medium', 'pending', '2024-12-10', 30, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('d50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', NULL, 'Irrigatiesysteem Controle', 'Controleer alle druppelslangen en sproeiers', 'maintenance', 'urgent', 'in_progress', '2024-12-09', 90, '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440003', 'Wortel Uitdunnen', 'Dun wortelzaailingen uit voor betere groei', 'plant_care', 'medium', 'pending', '2024-12-14', 45, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002'),
('d50e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', NULL, 'Kas Ventilatie Check', 'Controleer automatische ventilatiesysteem', 'maintenance', 'low', 'completed', '2024-12-05', 30, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample plant care logs
INSERT INTO plant_care_logs (id, plant_id, user_id, care_type, care_date, amount_used, unit, notes, effectiveness_rating, next_care_date) VALUES
('e50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'watering', '2024-12-07', 10.0, 'liter', 'Grond was droog, planten reageerden goed', 5, '2024-12-09'),
('e50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'watering', '2024-12-07', 5.0, 'liter', 'Basilicum houdt van vochtige grond', 4, '2024-12-08'),
('e50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'fertilizing', '2024-11-25', 2.0, 'kg', 'Compost toegevoegd rond de planten', 4, '2024-12-09'),
('e50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'watering', '2024-12-07', 8.0, 'liter', 'Sla heeft regelmatige water nodig', 5, '2024-12-08'),
('e50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'weeding', '2024-12-06', NULL, NULL, 'Onkruid verwijderd rond wortels', 4, '2024-12-13');

-- Insert sample plant growth tracking
INSERT INTO plant_growth_tracking (id, plant_id, user_id, measurement_date, height_cm, health_score, observations) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '2024-12-07', 45.0, 85, 'Tomatenplanten groeien goed, eerste bloemen verschijnen'),
('f50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '2024-12-07', 25.0, 88, 'Basilicum is weelderig en geurig'),
('f50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2024-12-07', 15.0, 82, 'Sla is klaar voor oogst, mooie hoofden gevormd'),
('f50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '2024-12-07', 8.0, 78, 'Wortels ontwikkelen zich goed, loof ziet er gezond uit'),
('f50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '2024-12-07', 20.0, 90, 'Peterselie groeit krachtig, kan geoogst worden');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, notification_type, priority, related_table, related_id, action_url, action_text) VALUES
('1150e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Taak Toegewezen', 'Je hebt een nieuwe taak: Sla Oogsten', 'task_assignment', 'medium', 'tasks', 'd50e8400-e29b-41d4-a716-446655440002', '/tasks/d50e8400-e29b-41d4-a716-446655440002', 'Bekijk Taak'),
('1150e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Urgent Onderhoud', 'Irrigatiesysteem controle is urgent', 'maintenance_alert', 'urgent', 'tasks', 'd50e8400-e29b-41d4-a716-446655440003', '/tasks/d50e8400-e29b-41d4-a716-446655440003', 'Bekijk Taak'),
('1150e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Sessie Bevestiging', 'Bevestig je aanwezigheid voor Voorjaarsplanting Tomaten', 'session_reminder', 'medium', 'garden_sessions', 'b50e8400-e29b-41d4-a716-446655440001', '/sessions/b50e8400-e29b-41d4-a716-446655440001', 'Bevestigen'),
('1150e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Plant Zorg Herinnering', 'Peterselie heeft water nodig', 'care_reminder', 'low', 'plants', 'a50e8400-e29b-41d4-a716-446655440005', '/plants/a50e8400-e29b-41d4-a716-446655440005', 'Bekijk Plant');

-- Insert sample weather data
INSERT INTO garden_weather_data (id, garden_id, recorded_at, data_source, temperature_celsius, humidity_percentage, precipitation_mm, wind_speed_kmh, weather_condition, recorded_by) VALUES
('1250e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '2024-12-07 12:00:00+01', 'weather_api', 8.5, 75, 0.0, 15.0, 'cloudy', '550e8400-e29b-41d4-a716-446655440001'),
('1250e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '2024-12-06 12:00:00+01', 'weather_api', 6.2, 82, 2.5, 12.0, 'rainy', '550e8400-e29b-41d4-a716-446655440001'),
('1250e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '2024-12-05 12:00:00+01', 'weather_api', 9.8, 68, 0.0, 8.0, 'sunny', '550e8400-e29b-41d4-a716-446655440001'),
('1250e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', '2024-12-07 12:00:00+01', 'sensor', 12.5, 65, 0.0, 5.0, 'sunny', '550e8400-e29b-41d4-a716-446655440005'),
('1250e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', '2024-12-07 12:00:00+01', 'manual', 7.8, 78, 0.0, 18.0, 'cloudy', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample progress entries
INSERT INTO progress_entries (id, user_id, garden_id, activity_type, points_earned, hours_contributed, description, achievement_date, task_id, session_id) VALUES
('1350e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'plant_care', 10, 1.5, 'Watering and care of lettuce bed', '2024-12-07', NULL, NULL),
('1350e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', 'maintenance', 15, 2.0, 'Irrigation system maintenance', '2024-12-06', 'd50e8400-e29b-41d4-a716-446655440003', NULL),
('1350e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', 'greenhouse_management', 20, 3.0, 'Greenhouse ventilation system check', '2024-12-05', 'd50e8400-e29b-41d4-a716-446655440005', NULL),
('1350e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'plant_monitoring', 8, 1.0, 'Plant health assessment and measurements', '2024-12-07', NULL, NULL);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Sample data inserted successfully for v1.2' as status;