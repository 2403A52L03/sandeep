-- =============================================================================
-- SMART AGRICULTURE AND CROP MONITORING DASHBOARD
-- Project No. 60 | SR University | Academic Year 2026-2027
-- Demo Database Seed Script (Realistic Sample Data)
-- Passwords: All accounts default to 'Password@123'
-- =============================================================================

-- Clear existing data
TRUNCATE notifications CASCADE;
TRUNCATE farm_activities CASCADE;
TRUNCATE irrigation_records CASCADE;
TRUNCATE environmental_readings CASCADE;
TRUNCATE soil_observations CASCADE;
TRUNCATE crops CASCADE;
TRUNCATE plots CASCADE;
TRUNCATE farms CASCADE;
TRUNCATE users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. SEED USERS (IDs: 1, 2, 3, 4, 5)
-- Password hash for 'Password@123'
-- -----------------------------------------------------------------------------
INSERT INTO users (full_name, email, phone, password_hash, role, is_active) VALUES
('Dr. Ramesh Sharma (Admin)', 'admin@smartagri.edu', '+91 9876543210', '$2a$10$cngzCvdTJELUjm8n0sBvqem6IdQ80OwRdaAw7K3YtKverixNOZGCG', 'admin', true),
('Sandeep Reddy (Lead Farmer)', 'farmer@smartagri.edu', '+91 9848012345', '$2a$10$cngzCvdTJELUjm8n0sBvqem6IdQ80OwRdaAw7K3YtKverixNOZGCG', 'farmer', true),
('K. Venkat Rao (Agri Officer)', 'officer@smartagri.edu', '+91 9440156789', '$2a$10$cngzCvdTJELUjm8n0sBvqem6IdQ80OwRdaAw7K3YtKverixNOZGCG', 'officer', true),
('Dr. Ananya Roy (Agronomist)', 'agronomist@smartagri.edu', '+91 9123456780', '$2a$10$cngzCvdTJELUjm8n0sBvqem6IdQ80OwRdaAw7K3YtKverixNOZGCG', 'agronomist', true),
('Rajesh Kumar (Progressive Farmer)', 'rajesh.farmer@smartagri.edu', '+91 9988776655', '$2a$10$cngzCvdTJELUjm8n0sBvqem6IdQ80OwRdaAw7K3YtKverixNOZGCG', 'farmer', true);

-- -----------------------------------------------------------------------------
-- 2. SEED FARMS (IDs: 1, 2, 3)
-- -----------------------------------------------------------------------------
INSERT INTO farms (name, owner_id, location, village, district, state, latitude, longitude, total_area, area_unit, soil_type, description) VALUES
('Sri Lakshmi Organic Farm', 2, 'NH 163, Ananthasagar', 'Ananthasagar', 'Hanamkonda', 'Telangana', 18.0056000, 79.5624000, 15.50, 'Acres', 'Red Sandy Loam', 'Integrated organic farming unit practicing drip-fertigated precision farming and crop rotation.'),
('SR Agro Research Station', 2, 'SR University Campus, Hasanparthy', 'Hasanparthy', 'Warangal Urban', 'Telangana', 18.0428000, 79.5448000, 25.00, 'Acres', 'Black Clay Loam', 'Agricultural experiment plot dedicated to moisture monitoring, smart irrigation trials, and pulse yield benchmarking.'),
('Godavari Green Meadows', 5, 'Near River Basin, Dharmasagar', 'Dharmasagar', 'Warangal Rural', 'Telangana', 18.0192000, 79.4678000, 30.00, 'Acres', 'Alluvial Clay', 'Commercial paddy, cotton, and chilli cultivation with automated micro-irrigation channels.');

-- -----------------------------------------------------------------------------
-- 3. SEED PLOTS (IDs: 1, 2, 3, 4, 5, 6)
-- -----------------------------------------------------------------------------
INSERT INTO plots (farm_id, name, area, soil_type, irrigation_type, latitude, longitude, description) VALUES
(1, 'Plot A - North Ridge', 5.00, 'Red Sandy Loam', 'Drip', 18.0060000, 79.5620000, 'Precision drip lines with soil moisture sensor probes installed at 15cm and 30cm depths.'),
(1, 'Plot B - South Orchard', 6.50, 'Loamy Sand', 'Sprinkler', 18.0052000, 79.5630000, 'High canopy sprinkler layout used for commercial maize and intercropped pulses.'),
(1, 'Plot C - Terrace Green', 4.00, 'Red Sandy Loam', 'Drip', 18.0048000, 79.5615000, 'Terraced vegetable cultivation with organic mulching.'),
(2, 'Plot 1 - Experimental Field', 12.00, 'Black Clay Loam', 'Drip', 18.0430000, 79.5450000, 'SR University smart agriculture experimental block with IoT telemetry nodes.'),
(2, 'Plot 2 - Nursery & Seedlings', 8.00, 'Black Clay Loam', 'Sprinkler', 18.0425000, 79.5440000, 'Polyhouse and open nursery zone for high-yielding hybrid crop trials.'),
(3, 'Plot East - Canal View', 15.00, 'Alluvial Clay', 'Surface', 18.0195000, 79.4680000, 'Level-basin flood irrigation plot for high-yield wetland paddy.');

-- -----------------------------------------------------------------------------
-- 4. SEED CROPS (IDs: 1, 2, 3, 4, 5, 6)
-- -----------------------------------------------------------------------------
INSERT INTO crops (plot_id, crop_name, crop_category, variety, planting_date, expected_harvest_date, actual_harvest_date, cultivated_area, expected_yield, actual_yield, yield_unit, status) VALUES
(1, 'Telangana Sona Rice', 'Cereals', 'RNR 15048', '2026-08-15', '2026-11-20', NULL, 4.50, 95.00, NULL, 'Quintals', 'Maturing'),
(2, 'Hybrid Sweet Corn', 'Cereals', 'Sugar 75', '2026-09-01', '2026-11-30', NULL, 5.00, 110.00, NULL, 'Quintals', 'Growing'),
(3, 'Guntur Teja Chilli', 'Spices & Cash', 'Teja Red', '2026-07-10', '2026-12-15', NULL, 3.50, 42.00, NULL, 'Quintals', 'Flowering'),
(4, 'BT Cotton', 'Fiber', 'Bollgard II', '2026-06-25', '2026-11-10', NULL, 10.00, 125.00, NULL, 'Quintals', 'Ready for Harvest'),
(5, 'Yellow Pigeon Pea (Tur)', 'Pulses', 'PRG 176', '2026-07-20', '2026-12-30', NULL, 6.00, 48.00, NULL, 'Quintals', 'Growing'),
(6, 'Basmati Paddy', 'Cereals', 'Pusa 1121', '2026-05-10', '2026-09-25', '2026-09-28', 14.00, 260.00, 275.50, 'Quintals', 'Harvested');

-- -----------------------------------------------------------------------------
-- 5. SEED SOIL OBSERVATIONS
-- -----------------------------------------------------------------------------
INSERT INTO soil_observations (farm_id, plot_id, crop_id, observation_date, soil_moisture, soil_temperature, soil_ph, nitrogen, phosphorus, potassium, notes, created_by) VALUES
(1, 1, 1, '2026-10-25', 42.50, 24.50, 6.80, 220.00, 45.00, 180.00, 'Optimum moisture levels maintained in grain filling stage.', 2),
(1, 1, 1, '2026-11-01', 38.00, 25.20, 6.70, 215.00, 42.00, 178.00, 'Slight drop in moisture; recommended light top irrigation before ripening.', 4),
(1, 2, 2, '2026-10-28', 48.50, 26.00, 7.10, 260.00, 52.00, 210.00, 'Silking phase corn requiring sustained moisture and nitrogen uptake.', 2),
(1, 3, 3, '2026-11-02', 32.00, 27.50, 6.40, 190.00, 38.00, 165.00, 'Sub-optimal moisture detected in chilli plot. Micro-fertigation recommended.', 4),
(2, 4, 4, '2026-10-30', 29.50, 28.00, 7.50, 185.00, 35.00, 190.00, 'Bolls fully developed and opening. Moisture tapering intentional prior to picking.', 3),
(2, 5, 5, '2026-11-03', 44.00, 25.00, 7.20, 230.00, 48.00, 195.00, 'Good vegetative root nodulation and balanced soil pH.', 3);

-- -----------------------------------------------------------------------------
-- 6. SEED ENVIRONMENTAL READINGS
-- -----------------------------------------------------------------------------
INSERT INTO environmental_readings (farm_id, plot_id, temperature, humidity, rainfall, wind_speed, soil_moisture, data_source, recorded_at) VALUES
(1, 1, 28.5, 68.0, 0.0, 8.4, 42.0, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '48 hours'),
(1, 1, 29.2, 65.5, 0.0, 9.1, 40.5, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '36 hours'),
(1, 1, 27.8, 72.0, 2.5, 7.2, 44.0, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '24 hours'),
(1, 1, 26.4, 75.0, 0.0, 6.5, 39.0, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(1, 1, 25.0, 70.0, 0.0, 5.8, 38.0, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(2, 4, 31.0, 58.0, 0.0, 11.2, 30.5, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '24 hours'),
(2, 4, 30.5, 60.0, 0.0, 10.5, 29.5, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(3, 6, 27.0, 80.0, 5.0, 8.0, 55.0, 'Simulated (Demo)', CURRENT_TIMESTAMP - INTERVAL '18 hours');

-- -----------------------------------------------------------------------------
-- 7. SEED IRRIGATION RECORDS
-- -----------------------------------------------------------------------------
INSERT INTO irrigation_records (farm_id, plot_id, crop_id, irrigation_method, scheduled_date, start_time, duration_minutes, water_quantity_litres, actual_irrigation_date, status, notes, created_by) VALUES
(1, 1, 1, 'Drip', '2026-10-25', '06:00 AM', 90, 4500.00, '2026-10-25', 'Completed', 'Routine morning drip irrigation cycle with water-soluble potassium.', 2),
(1, 1, 1, 'Drip', '2026-11-02', '06:30 AM', 75, 3800.00, '2026-11-02', 'Completed', 'Pre-harvest grain development cycle.', 2),
(1, 2, 2, 'Sprinkler', '2026-11-04', '05:30 AM', 120, 8500.00, '2026-11-04', 'Completed', 'Overhead sprinkler wetting for corn plot.', 2),
(1, 3, 3, 'Drip', '2026-11-06', '07:00 AM', 60, 2200.00, NULL, 'Scheduled', 'Scheduled drip pulse irrigation to boost chilli flowering.', 2),
(2, 4, 4, 'Drip', '2026-11-01', '06:00 AM', 45, 2500.00, '2026-11-01', 'Completed', 'Minimal moisture preservation run for open bolls.', 3),
(2, 5, 5, 'Sprinkler', '2026-11-07', '06:00 AM', 90, 5000.00, NULL, 'Scheduled', 'Bi-weekly supplemental irrigation for pulse vegetative canopy.', 3);

-- -----------------------------------------------------------------------------
-- 8. SEED FARM ACTIVITIES
-- -----------------------------------------------------------------------------
INSERT INTO farm_activities (farm_id, plot_id, crop_id, activity_type, activity_date, description, labour_hours, cost, status, notes, created_by) VALUES
(1, 1, 1, 'Land Preparation', '2026-08-01', 'Deep ploughing, laser land leveling, and compost spreading.', 24.00, 7500.00, 'Completed', 'Tractor hired for 8 hours plus 2 farm hands.', 2),
(1, 1, 1, 'Sowing', '2026-08-15', 'Direct wet seedling transplantation with optimal spacing.', 32.00, 9600.00, 'Completed', '8 agricultural laborers engaged for transplanting.', 2),
(1, 1, 1, 'Fertilization', '2026-09-10', 'Basal application of bio-fertilizers and neem cake.', 12.00, 4200.00, 'Completed', 'Organic certification compliant inputs applied.', 2),
(1, 2, 2, 'Pest Control', '2026-10-15', 'Pheromone traps installation and organic bio-spray for fall armyworm.', 10.00, 3100.00, 'Completed', 'Trap count normal; pest population under control.', 2),
(1, 3, 3, 'Weeding', '2026-10-20', 'Manual inter-row weeding and soil loosening.', 16.00, 3800.00, 'Completed', 'Clean bed maintained for chilli plants.', 2),
(2, 4, 4, 'Harvesting', '2026-11-08', 'First round manual boll picking and sorting.', 40.00, 12000.00, 'Planned', 'Scheduled picking crew arranged.', 3),
(3, 6, 6, 'Harvesting', '2026-09-26', 'Combine harvester operation and grain bagging.', 18.00, 18500.00, 'Completed', 'Yield target exceeded by 15.5 Quintals.', 5);

-- -----------------------------------------------------------------------------
-- 9. SEED NOTIFICATIONS
-- -----------------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Moisture Alert: Plot C', 'Chilli plot soil moisture dropped below 35%. Automated drip cycle recommended.', 'warning', false),
(2, 'Harvest Ready Notification', 'Crop "BT Cotton" on Plot 1 has reached 98% maturity. Expected picking in 3 days.', 'info', false),
(3, 'Agronomic Inspection Scheduled', 'Review of RNR 15048 paddy plot scheduled by Dr. Roy for upcoming Tuesday.', 'info', true),
(1, 'System Health Normal', 'All sensor telemetry and simulation feeds operating with 99.8% uptime.', 'success', true);
