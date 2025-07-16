-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 006_sample_data.sql
-- ===================================================================
-- Creates sample data for testing and demonstration
-- ===================================================================

-- ===================================================================
-- 1. SAMPLE USERS
-- ===================================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role, phone, skills, is_active, email_verified) VALUES
('admin@garden.com', 'Garden Admin', crypt('admin123', gen_salt('bf')), 'admin', '+31612345678', 'Garden management, Plant identification, Tool maintenance', true, true),
('alice@garden.com', 'Alice Volunteer', crypt('password123', gen_salt('bf')), 'volunteer', '+31687654321', 'Weeding, Planting, Watering', true, true),
('bob@garden.com', 'Bob Volunteer', crypt('password123', gen_salt('bf')), 'volunteer', '+31698765432', 'Composting, Heavy lifting, Tool repair', true, true),
('charlie@garden.com', 'Charlie Green', crypt('password123', gen_salt('bf')), 'volunteer', '+31676543210', 'Photography, Social media, Event planning', true, true),
('diana@garden.com', 'Diana Plant', crypt('password123', gen_salt('bf')), 'volunteer', '+31665432109', 'Herb gardening, Seed saving, Organic methods', true, true),
('edward@garden.com', 'Edward Bloom', crypt('password123', gen_salt('bf')), 'volunteer', '+31654321098', 'Rose care, Pruning, Pest control', true, true);

-- ===================================================================
-- 2. SAMPLE GARDENS
-- ===================================================================

-- Insert main garden
INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, created_by, notes) VALUES
('Community Garden', 'A beautiful community garden where volunteers come together to grow plants and vegetables', '123 Garden Street, Green City', 450.00, 30.00, 15.00, 'Community garden', 'Medium - regular maintenance', 'Well-drained, fertile soil with good organic content', 'Drip irrigation + manual', '2020-03-15', (SELECT id FROM users WHERE email = 'admin@garden.com'), 'The garden is divided into multiple plant beds with different themes and purposes.');

-- Insert second garden
INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, created_by, notes) VALUES
('Herb Garden', 'Specialized garden for culinary and medicinal herbs', '456 Herb Lane, Green City', 120.00, 12.00, 10.00, 'Herb garden', 'Low - minimal maintenance', 'Sandy loam with good drainage', 'Manual watering', '2021-05-20', (SELECT id FROM users WHERE email = 'admin@garden.com'), 'Focus on herbs for cooking and natural remedies.');

-- ===================================================================
-- 3. SAMPLE PLANT BEDS
-- ===================================================================

-- Insert plant beds for main garden
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, created_by, position_x, position_y, visual_width, visual_height, color_code) VALUES
('A', (SELECT id FROM gardens WHERE name = 'Community Garden'), 'Rose Garden', 'Front entrance area', 'Large (15-30m²)', 'Clay soil with compost', 'full-sun', 'Beautiful rose garden at the main entrance', (SELECT id FROM users WHERE email = 'admin@garden.com'), 2.0, 2.0, 4.0, 3.0, '#f59e0b'),
('B', (SELECT id FROM gardens WHERE name = 'Community Garden'), 'Herb Garden', 'Near the kitchen area', 'Medium (5-15m²)', 'Humus-rich soil', 'partial-sun', 'Culinary herbs for cooking', (SELECT id FROM users WHERE email = 'admin@garden.com'), 7.0, 2.0, 3.0, 2.0, '#8b5cf6'),
('C', (SELECT id FROM gardens WHERE name = 'Community Garden'), 'Vegetable Patch', 'South side of garden', 'Extra large (> 30m²)', 'Sandy soil with compost', 'full-sun', 'Seasonal vegetables and crops', (SELECT id FROM users WHERE email = 'admin@garden.com'), 2.0, 6.0, 6.0, 4.0, '#22c55e'),
('D', (SELECT id FROM gardens WHERE name = 'Community Garden'), 'Flower Border', 'Along the fence', 'Small (< 5m²)', 'Standard garden soil', 'partial-sun', 'Colorful flower border for pollinators', (SELECT id FROM users WHERE email = 'admin@garden.com'), 9.0, 6.0, 2.0, 1.5, '#ec4899'),
('E', (SELECT id FROM gardens WHERE name = 'Community Garden'), 'Greenhouse Area', 'North corner', 'Medium (5-15m²)', 'Potting mix', 'shade', 'Protected growing area for seedlings', (SELECT id FROM users WHERE email = 'admin@garden.com'), 12.0, 2.0, 3.0, 2.5, '#06b6d4');

-- Insert plant beds for herb garden
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, created_by, position_x, position_y, visual_width, visual_height, color_code) VALUES
('H1', (SELECT id FROM gardens WHERE name = 'Herb Garden'), 'Culinary Herbs', 'Main herb section', 'Medium (5-15m²)', 'Well-drained soil', 'partial-sun', 'Herbs for cooking and seasoning', (SELECT id FROM users WHERE email = 'admin@garden.com'), 1.0, 1.0, 4.0, 3.0, '#8b5cf6'),
('H2', (SELECT id FROM gardens WHERE name = 'Herb Garden'), 'Medicinal Herbs', 'Back section', 'Medium (5-15m²)', 'Rich organic soil', 'partial-sun', 'Herbs for natural remedies', (SELECT id FROM users WHERE email = 'admin@garden.com'), 6.0, 1.0, 4.0, 3.0, '#10b981'),
('H3', (SELECT id FROM gardens WHERE name = 'Herb Garden'), 'Tea Garden', 'Side section', 'Small (< 5m²)', 'Acidic soil', 'shade', 'Herbs for tea making', (SELECT id FROM users WHERE email = 'admin@garden.com'), 1.0, 5.0, 2.0, 2.0, '#f59e0b');

-- ===================================================================
-- 4. SAMPLE PLANTS
-- ===================================================================

-- Insert plants for main garden
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, category, bloom_period, planting_date, status, notes, planted_by) VALUES
-- Rose Garden plants
('A', 'Red Rose', 'Rosa rubiginosa', 'Heritage Red', 'Red', 80.00, 'Flowers', 'Spring-Summer', '2024-03-15', 'healthy', 'Blooming well, needs regular pruning', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('A', 'White Rose', 'Rosa alba', 'Pure White', 'White', 75.00, 'Flowers', 'Spring-Summer', '2024-03-15', 'healthy', 'Strong growth, disease resistant', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('A', 'Pink Rose', 'Rosa gallica', 'Maiden Pink', 'Pink', 70.00, 'Flowers', 'Spring-Summer', '2024-04-01', 'healthy', 'Fragrant variety, attracts bees', (SELECT id FROM users WHERE email = 'alice@garden.com')),

-- Herb Garden plants
('B', 'Basil', 'Ocimum basilicum', 'Sweet Basil', 'Green', 25.00, 'Herbs', 'Summer', '2024-04-01', 'healthy', 'Ready for harvest, pinch flowers', (SELECT id FROM users WHERE email = 'alice@garden.com')),
('B', 'Rosemary', 'Rosmarinus officinalis', 'Common Rosemary', 'Green', 40.00, 'Herbs', 'Year-round', '2024-03-20', 'healthy', 'Drought tolerant, trim regularly', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('B', 'Thyme', 'Thymus vulgaris', 'English Thyme', 'Green', 15.00, 'Herbs', 'Summer', '2024-04-10', 'healthy', 'Spreading well, harvest before flowering', (SELECT id FROM users WHERE email = 'bob@garden.com')),
('B', 'Oregano', 'Origanum vulgare', 'Greek Oregano', 'Green', 30.00, 'Herbs', 'Summer', '2024-04-05', 'healthy', 'Very aromatic, dry for winter use', (SELECT id FROM users WHERE email = 'alice@garden.com')),

-- Vegetable Patch plants
('C', 'Tomatoes', 'Solanum lycopersicum', 'Cherry Tomatoes', 'Red', 120.00, 'Vegetables', 'Summer', '2024-05-01', 'healthy', 'Heavy fruiting, needs support stakes', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('C', 'Lettuce', 'Lactuca sativa', 'Butterhead', 'Green', 20.00, 'Vegetables', 'Spring-Fall', '2024-05-15', 'healthy', 'Ready for harvest, succession plant', (SELECT id FROM users WHERE email = 'bob@garden.com')),
('C', 'Carrots', 'Daucus carota', 'Nantes', 'Orange', 5.00, 'Vegetables', 'Summer', '2024-04-20', 'healthy', 'Thinning needed, harvest in 2 weeks', (SELECT id FROM users WHERE email = 'alice@garden.com')),
('C', 'Zucchini', 'Cucurbita pepo', 'Black Beauty', 'Green', 60.00, 'Vegetables', 'Summer', '2024-05-10', 'healthy', 'Good yield, check for pests', (SELECT id FROM users WHERE email = 'charlie@garden.com')),

-- Flower Border plants
('D', 'Sunflowers', 'Helianthus annuus', 'Giant Sunflower', 'Yellow', 200.00, 'Flowers', 'Summer', '2024-05-10', 'healthy', 'Growing rapidly, support may be needed', (SELECT id FROM users WHERE email = 'bob@garden.com')),
('D', 'Marigolds', 'Tagetes patula', 'French Marigold', 'Orange', 30.00, 'Flowers', 'Summer', '2024-05-05', 'healthy', 'Pest deterrent, deadhead regularly', (SELECT id FROM users WHERE email = 'alice@garden.com')),
('D', 'Lavender', 'Lavandula angustifolia', 'English Lavender', 'Purple', 45.00, 'Flowers', 'Summer', '2024-04-15', 'healthy', 'Drought tolerant, attracts pollinators', (SELECT id FROM users WHERE email = 'diana@garden.com')),

-- Greenhouse plants
('E', 'Seedling Trays', 'Various species', 'Mixed Vegetables', 'Green', 10.00, 'Seedlings', 'Spring', '2024-11-01', 'healthy', 'Winter seedlings for spring planting', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('E', 'Pepper Plants', 'Capsicum annuum', 'Bell Peppers', 'Green', 25.00, 'Vegetables', 'Summer', '2024-03-01', 'healthy', 'Growing well under protection', (SELECT id FROM users WHERE email = 'edward@garden.com')),

-- Herb Garden plants
('H1', 'Mint', 'Mentha spicata', 'Spearmint', 'Green', 20.00, 'Herbs', 'Summer', '2024-04-01', 'healthy', 'Invasive, keep contained', (SELECT id FROM users WHERE email = 'diana@garden.com')),
('H1', 'Sage', 'Salvia officinalis', 'Common Sage', 'Green', 35.00, 'Herbs', 'Summer', '2024-03-15', 'healthy', 'Drought tolerant, woody stems', (SELECT id FROM users WHERE email = 'admin@garden.com')),
('H2', 'Chamomile', 'Matricaria chamomilla', 'German Chamomile', 'White', 25.00, 'Herbs', 'Summer', '2024-04-10', 'healthy', 'Good for tea, self-seeding', (SELECT id FROM users WHERE email = 'diana@garden.com')),
('H2', 'Echinacea', 'Echinacea purpurea', 'Purple Coneflower', 'Purple', 60.00, 'Herbs', 'Summer', '2024-03-20', 'healthy', 'Medicinal properties, attracts butterflies', (SELECT id FROM users WHERE email = 'diana@garden.com')),
('H3', 'Lemon Balm', 'Melissa officinalis', 'Common Lemon Balm', 'Green', 30.00, 'Herbs', 'Summer', '2024-04-05', 'healthy', 'Calming tea herb, spreads easily', (SELECT id FROM users WHERE email = 'diana@garden.com')),
('H3', 'Peppermint', 'Mentha piperita', 'Black Peppermint', 'Green', 25.00, 'Herbs', 'Summer', '2024-04-01', 'healthy', 'Strong flavor, digestive aid', (SELECT id FROM users WHERE email = 'diana@garden.com'));

-- ===================================================================
-- 5. SAMPLE GARDEN SESSIONS
-- ===================================================================

-- Insert garden sessions
INSERT INTO garden_sessions (title, description, session_date, start_time, end_time, location, max_volunteers, status, weather_temperature, weather_condition, weather_humidity, weather_wind_speed, created_by) VALUES
('Spring Planting Session', 'Plant new flowers and vegetables for the spring season', '2024-12-20', '09:00:00', '12:00:00', 'Main Garden Area', 8, 'scheduled', 18.5, 'Sunny', 65, 5.2, (SELECT id FROM users WHERE email = 'admin@garden.com')),
('Garden Maintenance', 'General maintenance and weeding', '2024-11-15', '10:00:00', '13:00:00', 'All Plant Beds', 6, 'completed', 15.0, 'Cloudy', 70, 8.1, (SELECT id FROM users WHERE email = 'admin@garden.com')),
('Herb Garden Workshop', 'Learn about growing and caring for herbs', '2024-12-28', '14:00:00', '16:00:00', 'Herb Garden Area', 12, 'scheduled', NULL, NULL, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
('Winter Preparation', 'Prepare garden for winter season', '2024-12-15', '09:30:00', '12:30:00', 'All Areas', 10, 'scheduled', NULL, NULL, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
('Rose Pruning Workshop', 'Learn proper rose pruning techniques', '2024-12-25', '10:00:00', '12:00:00', 'Rose Garden', 8, 'scheduled', NULL, NULL, NULL, NULL, (SELECT id FROM users WHERE email = 'edward@garden.com')),
('Harvest Festival', 'Celebrate the harvest season', '2024-12-30', '14:00:00', '18:00:00', 'Main Garden Area', 20, 'scheduled', NULL, NULL, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com'));

-- ===================================================================
-- 6. SAMPLE SESSION REGISTRATIONS
-- ===================================================================

-- Insert session registrations
INSERT INTO session_registrations (session_id, user_id, attended) VALUES
-- Spring Planting Session registrations
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), (SELECT id FROM users WHERE email = 'alice@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), (SELECT id FROM users WHERE email = 'bob@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), (SELECT id FROM users WHERE email = 'charlie@garden.com'), false),

-- Garden Maintenance registrations
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'alice@garden.com'), true),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'charlie@garden.com'), true),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'diana@garden.com'), true),

-- Herb Garden Workshop registrations
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), (SELECT id FROM users WHERE email = 'alice@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), (SELECT id FROM users WHERE email = 'bob@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), (SELECT id FROM users WHERE email = 'diana@garden.com'), false),

-- Winter Preparation registrations
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), (SELECT id FROM users WHERE email = 'alice@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), (SELECT id FROM users WHERE email = 'bob@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), (SELECT id FROM users WHERE email = 'charlie@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), (SELECT id FROM users WHERE email = 'edward@garden.com'), false),

-- Rose Pruning Workshop registrations
((SELECT id FROM garden_sessions WHERE title = 'Rose Pruning Workshop'), (SELECT id FROM users WHERE email = 'edward@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Rose Pruning Workshop'), (SELECT id FROM users WHERE email = 'alice@garden.com'), false),

-- Harvest Festival registrations
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), (SELECT id FROM users WHERE email = 'alice@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), (SELECT id FROM users WHERE email = 'bob@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), (SELECT id FROM users WHERE email = 'charlie@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), (SELECT id FROM users WHERE email = 'diana@garden.com'), false),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), (SELECT id FROM users WHERE email = 'edward@garden.com'), false);

-- ===================================================================
-- 7. SAMPLE TASKS
-- ===================================================================

-- Insert tasks
INSERT INTO tasks (session_id, title, description, priority, status, estimated_duration, completed_by, completed_at, created_by) VALUES
-- Spring Planting Session tasks
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), 'Prepare soil in bed A', 'Remove weeds and add compost to rose garden', 'high', 'not-started', 60, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), 'Plant spring flowers', 'Plant tulips and daffodils in designated areas', 'medium', 'not-started', 90, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Spring Planting Session'), 'Set up irrigation', 'Install drip irrigation for new plantings', 'high', 'not-started', 45, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),

-- Garden Maintenance tasks
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Weed removal', 'Remove weeds from all plant beds', 'high', 'completed', 120, (SELECT id FROM users WHERE email = 'alice@garden.com'), '2024-11-15 11:30:00', (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Pruning roses', 'Deadhead roses and remove diseased branches', 'medium', 'completed', 45, (SELECT id FROM users WHERE email = 'charlie@garden.com'), '2024-11-15 12:15:00', (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Fertilize vegetables', 'Apply organic fertilizer to vegetable beds', 'medium', 'completed', 60, (SELECT id FROM users WHERE email = 'diana@garden.com'), '2024-11-15 12:45:00', (SELECT id FROM users WHERE email = 'admin@garden.com')),

-- Herb Garden Workshop tasks
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), 'Herb identification tour', 'Guide participants through herb garden', 'low', 'not-started', 30, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), 'Harvesting demonstration', 'Show proper harvesting techniques', 'medium', 'not-started', 45, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Herb Garden Workshop'), 'Drying herbs workshop', 'Demonstrate herb drying methods', 'low', 'not-started', 30, NULL, NULL, (SELECT id FROM users WHERE email = 'diana@garden.com')),

-- Winter Preparation tasks
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), 'Mulch application', 'Apply winter mulch to protect plants', 'high', 'not-started', 90, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), 'Tool maintenance', 'Clean and oil garden tools for winter storage', 'medium', 'not-started', 60, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Winter Preparation'), 'Protect tender plants', 'Cover sensitive plants with frost protection', 'high', 'not-started', 75, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),

-- Rose Pruning Workshop tasks
((SELECT id FROM garden_sessions WHERE title = 'Rose Pruning Workshop'), 'Pruning demonstration', 'Show proper rose pruning techniques', 'medium', 'not-started', 60, NULL, NULL, (SELECT id FROM users WHERE email = 'edward@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Rose Pruning Workshop'), 'Disease inspection', 'Check roses for common diseases', 'high', 'not-started', 45, NULL, NULL, (SELECT id FROM users WHERE email = 'edward@garden.com')),

-- Harvest Festival tasks
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), 'Harvest vegetables', 'Harvest ripe vegetables for festival', 'high', 'not-started', 120, NULL, NULL, (SELECT id FROM users WHERE email = 'admin@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), 'Decorate garden', 'Decorate garden for festival', 'medium', 'not-started', 90, NULL, NULL, (SELECT id FROM users WHERE email = 'charlie@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Harvest Festival'), 'Prepare refreshments', 'Prepare garden-themed refreshments', 'low', 'not-started', 60, NULL, NULL, (SELECT id FROM users WHERE email = 'diana@garden.com'));

-- ===================================================================
-- 8. SAMPLE TASK COMMENTS
-- ===================================================================

-- Insert task comments
INSERT INTO task_comments (task_id, user_id, comment) VALUES
((SELECT t.id FROM tasks t JOIN garden_sessions gs ON t.session_id = gs.id WHERE t.title = 'Weed removal' AND gs.title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'alice@garden.com'), 'Completed the weeding in beds A and B. Bed C needs more attention.'),
((SELECT t.id FROM tasks t JOIN garden_sessions gs ON t.session_id = gs.id WHERE t.title = 'Weed removal' AND gs.title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'admin@garden.com'), 'Great work! Please focus on bed C in the next session.'),
((SELECT t.id FROM tasks t JOIN garden_sessions gs ON t.session_id = gs.id WHERE t.title = 'Pruning roses' AND gs.title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'charlie@garden.com'), 'Removed several diseased branches. Roses should recover well.'),
((SELECT t.id FROM tasks t JOIN garden_sessions gs ON t.session_id = gs.id WHERE t.title = 'Pruning roses' AND gs.title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'admin@garden.com'), 'Thanks Charlie! The roses look much healthier now.'),
((SELECT t.id FROM tasks t JOIN garden_sessions gs ON t.session_id = gs.id WHERE t.title = 'Fertilize vegetables' AND gs.title = 'Garden Maintenance'), (SELECT id FROM users WHERE email = 'diana@garden.com'), 'Applied organic fertilizer to all vegetable beds. Tomatoes look great!');

-- ===================================================================
-- 9. SAMPLE PROGRESS ENTRIES
-- ===================================================================

-- Insert progress entries
INSERT INTO progress_entries (session_id, title, description, entry_date, created_by) VALUES
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Weeding completed', 'All beds are now weed-free and ready for winter', '2024-11-15', (SELECT id FROM users WHERE email = 'alice@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Rose pruning finished', 'Roses have been properly pruned and treated', '2024-11-15', (SELECT id FROM users WHERE email = 'charlie@garden.com')),
((SELECT id FROM garden_sessions WHERE title = 'Garden Maintenance'), 'Fertilization complete', 'All vegetable beds have been fertilized with organic material', '2024-11-15', (SELECT id FROM users WHERE email = 'diana@garden.com'));

-- ===================================================================
-- 10. SAMPLE SYSTEM SETTINGS
-- ===================================================================

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Garden Volunteers', 'string', 'Name of the gardening volunteer application', true),
('max_session_volunteers', '15', 'number', 'Maximum number of volunteers per session', false),
('session_reminder_days', '2', 'number', 'Days before session to send reminder', false),
('allow_self_registration', 'true', 'boolean', 'Allow volunteers to register themselves', true),
('garden_location', '123 Garden Street, Green City', 'string', 'Main garden location address', true),
('contact_email', 'admin@garden.com', 'string', 'Main contact email for the garden', true),
('weather_api_key', '', 'string', 'API key for weather service', false),
('instagram_integration', 'false', 'boolean', 'Enable Instagram integration', false),
('default_canvas_width', '20', 'number', 'Default canvas width for new gardens', false),
('default_canvas_height', '20', 'number', 'Default canvas height for new gardens', false),
('default_grid_size', '1', 'number', 'Default grid size for new gardens', false),
('max_photo_size', '10485760', 'number', 'Maximum photo file size in bytes (10MB)', false);

-- ===================================================================
-- 11. SAMPLE NOTIFICATIONS
-- ===================================================================

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url) VALUES
((SELECT id FROM users WHERE email = 'alice@garden.com'), 'Session Reminder', 'Don''t forget about the Spring Planting Session tomorrow at 9:00 AM!', 'info', '/calendar'),
((SELECT id FROM users WHERE email = 'bob@garden.com'), 'New Session Available', 'A new Herb Garden Workshop has been scheduled for December 28th.', 'success', '/calendar'),
((SELECT id FROM users WHERE email = 'charlie@garden.com'), 'Task Completed', 'Your rose pruning task has been marked as completed. Great work!', 'success', '/calendar'),
((SELECT id FROM users WHERE email = 'alice@garden.com'), 'Weather Alert', 'Rain is expected during tomorrow''s session. Please bring appropriate clothing.', 'warning', '/calendar'),
((SELECT id FROM users WHERE email = 'diana@garden.com'), 'Herb Workshop', 'You''ve been assigned to lead the herb identification tour. Please review the herb guide.', 'info', '/tasks'),
((SELECT id FROM users WHERE email = 'edward@garden.com'), 'Rose Workshop', 'Your rose pruning workshop is confirmed for December 25th. Tools will be provided.', 'success', '/calendar');

-- ===================================================================
-- 12. SAMPLE USER ACTIVITY LOG
-- ===================================================================

-- Insert sample activity log entries
INSERT INTO user_activity_log (user_id, action, details, ip_address) VALUES
((SELECT id FROM users WHERE email = 'admin@garden.com'), 'CREATE_gardens', '{"garden_name": "Community Garden"}', '192.168.1.100'),
((SELECT id FROM users WHERE email = 'alice@garden.com'), 'CREATE_plants', '{"plant_name": "Basil", "plant_bed_id": "B"}', '192.168.1.101'),
((SELECT id FROM users WHERE email = 'bob@garden.com'), 'CREATE_plants', '{"plant_name": "Thyme", "plant_bed_id": "B"}', '192.168.1.102'),
((SELECT id FROM users WHERE email = 'charlie@garden.com'), 'UPDATE_plant_beds', '{"plant_bed_id": "A", "position_x": 2.0, "position_y": 2.0}', '192.168.1.103'),
((SELECT id FROM users WHERE email = 'diana@garden.com'), 'CREATE_plants', '{"plant_name": "Mint", "plant_bed_id": "H1"}', '192.168.1.104'),
((SELECT id FROM users WHERE email = 'edward@garden.com'), 'CREATE_garden_sessions', '{"session_title": "Rose Pruning Workshop"}', '192.168.1.105');