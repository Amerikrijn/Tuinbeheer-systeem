-- Seed data for the gardening volunteer app
USE gardening_volunteers;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role, phone, skills, is_active, email_verified) VALUES
('admin@garden.com', 'Garden Admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'admin', '+31612345678', 'Garden management, Plant identification, Tool maintenance', TRUE, TRUE),
('alice@garden.com', 'Alice Volunteer', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'volunteer', '+31687654321', 'Weeding, Planting, Watering', TRUE, TRUE),
('bob@garden.com', 'Bob Volunteer', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'volunteer', '+31698765432', 'Composting, Heavy lifting, Tool repair', TRUE, TRUE),
('charlie@garden.com', 'Charlie Green', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'volunteer', '+31676543210', 'Photography, Social media, Event planning', TRUE, TRUE);

-- Insert main garden
INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, created_by, notes) VALUES
('Community Garden', 'A beautiful community garden where volunteers come together to grow plants and vegetables', '123 Garden Street, Green City', 450.00, 30.00, 15.00, 'Community garden', 'Medium - regular maintenance', 'Well-drained, fertile soil with good organic content', 'Drip irrigation + manual', '2020-03-15', 1, 'The garden is divided into multiple plant beds with different themes and purposes.');

-- Insert plant beds
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, created_by) VALUES
('A', 1, 'Rose Garden', 'Front entrance area', 'Large (15-30m²)', 'Clay soil with compost', 'full-sun', 'Beautiful rose garden at the main entrance', 1),
('B', 1, 'Herb Garden', 'Near the kitchen area', 'Medium (5-15m²)', 'Humus-rich soil', 'partial-sun', 'Culinary herbs for cooking', 1),
('C', 1, 'Vegetable Patch', 'South side of garden', 'Extra large (> 30m²)', 'Sandy soil with compost', 'full-sun', 'Seasonal vegetables and crops', 1),
('D', 1, 'Flower Border', 'Along the fence', 'Small (< 5m²)', 'Standard garden soil', 'partial-sun', 'Colorful flower border for pollinators', 1),
('E', 1, 'Greenhouse Area', 'North corner', 'Medium (5-15m²)', 'Potting mix', 'shade', 'Protected growing area for seedlings', 1);

-- Insert plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, planting_date, status, notes, planted_by) VALUES
('A', 'Red Rose', 'Rosa rubiginosa', 'Heritage Red', 'Red', 80.00, '2024-03-15', 'healthy', 'Blooming well, needs regular pruning', 1),
('A', 'White Rose', 'Rosa alba', 'Pure White', 'White', 75.00, '2024-03-15', 'healthy', 'Strong growth, disease resistant', 1),
('A', 'Pink Rose', 'Rosa gallica', 'Maiden Pink', 'Pink', 70.00, '2024-04-01', 'healthy', 'Fragrant variety, attracts bees', 2),
('B', 'Basil', 'Ocimum basilicum', 'Sweet Basil', 'Green', 25.00, '2024-04-01', 'healthy', 'Ready for harvest, pinch flowers', 2),
('B', 'Rosemary', 'Rosmarinus officinalis', 'Common Rosemary', 'Green', 40.00, '2024-03-20', 'healthy', 'Drought tolerant, trim regularly', 1),
('B', 'Thyme', 'Thymus vulgaris', 'English Thyme', 'Green', 15.00, '2024-04-10', 'healthy', 'Spreading well, harvest before flowering', 3),
('B', 'Oregano', 'Origanum vulgare', 'Greek Oregano', 'Green', 30.00, '2024-04-05', 'healthy', 'Very aromatic, dry for winter use', 2),
('C', 'Tomatoes', 'Solanum lycopersicum', 'Cherry Tomatoes', 'Red', 120.00, '2024-05-01', 'healthy', 'Heavy fruiting, needs support stakes', 1),
('C', 'Lettuce', 'Lactuca sativa', 'Butterhead', 'Green', 20.00, '2024-05-15', 'healthy', 'Ready for harvest, succession plant', 3),
('C', 'Carrots', 'Daucus carota', 'Nantes', 'Orange', 5.00, '2024-04-20', 'healthy', 'Thinning needed, harvest in 2 weeks', 2),
('D', 'Sunflowers', 'Helianthus annuus', 'Giant Sunflower', 'Yellow', 200.00, '2024-05-10', 'healthy', 'Growing rapidly, support may be needed', 3),
('D', 'Marigolds', 'Tagetes patula', 'French Marigold', 'Orange', 30.00, '2024-05-05', 'healthy', 'Pest deterrent, deadhead regularly', 2),
('E', 'Seedling Trays', 'Various species', 'Mixed Vegetables', 'Green', 10.00, '2024-11-01', 'healthy', 'Winter seedlings for spring planting', 1);

-- Insert garden sessions
INSERT INTO garden_sessions (title, description, session_date, start_time, end_time, location, max_volunteers, status, weather_temperature, weather_condition, weather_humidity, weather_wind_speed, created_by) VALUES
('Spring Planting Session', 'Plant new flowers and vegetables for the spring season', '2024-12-20', '09:00:00', '12:00:00', 'Main Garden Area', 8, 'scheduled', 18.5, 'Sunny', 65, 5.2, 1),
('Garden Maintenance', 'General maintenance and weeding', '2024-11-15', '10:00:00', '13:00:00', 'All Plant Beds', 6, 'completed', 15.0, 'Cloudy', 70, 8.1, 1),
('Herb Garden Workshop', 'Learn about growing and caring for herbs', '2024-12-28', '14:00:00', '16:00:00', 'Herb Garden Area', 12, 'scheduled', NULL, NULL, NULL, NULL, 1),
('Winter Preparation', 'Prepare garden for winter season', '2024-12-15', '09:30:00', '12:30:00', 'All Areas', 10, 'scheduled', NULL, NULL, NULL, NULL, 1);

-- Insert session registrations
INSERT INTO session_registrations (session_id, user_id, attended) VALUES
(1, 2, FALSE), -- Alice registered for Spring Planting
(1, 3, FALSE), -- Bob registered for Spring Planting
(1, 4, FALSE), -- Charlie registered for Spring Planting
(2, 2, TRUE),  -- Alice attended Garden Maintenance
(2, 4, TRUE),  -- Charlie attended Garden Maintenance
(3, 2, FALSE), -- Alice registered for Herb Workshop
(3, 3, FALSE), -- Bob registered for Herb Workshop
(4, 2, FALSE), -- Alice registered for Winter Prep
(4, 3, FALSE), -- Bob registered for Winter Prep
(4, 4, FALSE); -- Charlie registered for Winter Prep

-- Insert tasks
INSERT INTO tasks (session_id, title, description, priority, status, estimated_duration, completed_by, completed_at, created_by) VALUES
(1, 'Prepare soil in bed A', 'Remove weeds and add compost to rose garden', 'high', 'not-started', 60, NULL, NULL, 1),
(1, 'Plant spring flowers', 'Plant tulips and daffodils in designated areas', 'medium', 'not-started', 90, NULL, NULL, 1),
(1, 'Set up irrigation', 'Install drip irrigation for new plantings', 'high', 'not-started', 45, NULL, NULL, 1),
(2, 'Weed removal', 'Remove weeds from all plant beds', 'high', 'completed', 120, 2, '2024-11-15 11:30:00', 1),
(2, 'Pruning roses', 'Deadhead roses and remove diseased branches', 'medium', 'completed', 45, 4, '2024-11-15 12:15:00', 1),
(3, 'Herb identification tour', 'Guide participants through herb garden', 'low', 'not-started', 30, NULL, NULL, 1),
(3, 'Harvesting demonstration', 'Show proper harvesting techniques', 'medium', 'not-started', 45, NULL, NULL, 1),
(4, 'Mulch application', 'Apply winter mulch to protect plants', 'high', 'not-started', 90, NULL, NULL, 1),
(4, 'Tool maintenance', 'Clean and oil garden tools for winter storage', 'medium', 'not-started', 60, NULL, NULL, 1);

-- Insert task comments
INSERT INTO task_comments (task_id, user_id, comment) VALUES
(4, 2, 'Completed the weeding in beds A and B. Bed C needs more attention.'),
(4, 1, 'Great work! Please focus on bed C in the next session.'),
(5, 4, 'Removed several diseased branches. Roses should recover well.'),
(5, 1, 'Thanks Charlie! The roses look much healthier now.');

-- Insert progress entries
INSERT INTO progress_entries (session_id, title, description, entry_date, created_by) VALUES
(2, 'Weeding completed', 'All beds are now weed-free and ready for winter', '2024-11-15', 2),
(2, 'Rose pruning finished', 'Roses have been properly pruned and treated', '2024-11-15', 4);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Garden Volunteers', 'string', 'Name of the gardening volunteer application', TRUE),
('max_session_volunteers', '15', 'number', 'Maximum number of volunteers per session', FALSE),
('session_reminder_days', '2', 'number', 'Days before session to send reminder', FALSE),
('allow_self_registration', 'true', 'boolean', 'Allow volunteers to register themselves', TRUE),
('garden_location', '123 Garden Street, Green City', 'string', 'Main garden location address', TRUE),
('contact_email', 'admin@garden.com', 'string', 'Main contact email for the garden', TRUE),
('weather_api_key', '', 'string', 'API key for weather service', FALSE),
('instagram_integration', 'false', 'boolean', 'Enable Instagram integration', FALSE);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url) VALUES
(2, 'Session Reminder', 'Don\'t forget about the Spring Planting Session tomorrow at 9:00 AM!', 'info', '/calendar'),
(3, 'New Session Available', 'A new Herb Garden Workshop has been scheduled for December 28th.', 'success', '/calendar'),
(4, 'Task Completed', 'Your rose pruning task has been marked as completed. Great work!', 'success', '/calendar'),
(2, 'Weather Alert', 'Rain is expected during tomorrow\'s session. Please bring appropriate clothing.', 'warning', '/calendar');
