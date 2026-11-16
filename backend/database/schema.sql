-- =============================================================================
-- SMART AGRICULTURE AND CROP MONITORING DASHBOARD
-- Project No. 60 | SR University | Academic Year 2026-2027
-- PostgreSQL Database Schema Definition
-- =============================================================================

-- Drop tables in reverse order of dependencies if re-initializing
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS farm_activities CASCADE;
DROP TABLE IF EXISTS irrigation_records CASCADE;
DROP TABLE IF EXISTS environmental_readings CASCADE;
DROP TABLE IF EXISTS soil_observations CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS plots CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(25),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer' 
        CHECK (role IN ('admin', 'farmer', 'officer', 'agronomist')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 2. FARMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(255),
    village VARCHAR(150),
    district VARCHAR(150),
    state VARCHAR(150) DEFAULT 'Telangana',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    total_area NUMERIC(10, 2) NOT NULL CHECK (total_area > 0),
    area_unit VARCHAR(50) NOT NULL DEFAULT 'Acres' CHECK (area_unit IN ('Acres', 'Hectares', 'Guntas')),
    soil_type VARCHAR(100) DEFAULT 'Red Sandy Loam',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_farms_district ON farms(district);

-- -----------------------------------------------------------------------------
-- 3. PLOTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE plots (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    area NUMERIC(10, 2) NOT NULL CHECK (area > 0),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100) DEFAULT 'Drip',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plots_farm ON plots(farm_id);

-- -----------------------------------------------------------------------------
-- 4. CROPS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    crop_name VARCHAR(150) NOT NULL,
    crop_category VARCHAR(100) NOT NULL DEFAULT 'Cereals',
    variety VARCHAR(150),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    cultivated_area NUMERIC(10, 2) NOT NULL CHECK (cultivated_area > 0),
    expected_yield NUMERIC(10, 2) CHECK (expected_yield >= 0),
    actual_yield NUMERIC(10, 2) CHECK (actual_yield >= 0),
    yield_unit VARCHAR(50) DEFAULT 'Quintals',
    status VARCHAR(50) NOT NULL DEFAULT 'Planted'
        CHECK (status IN ('Planned', 'Planted', 'Growing', 'Flowering', 'Maturing', 'Ready for Harvest', 'Harvested', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crops_plot ON crops(plot_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_crops_harvest_date ON crops(expected_harvest_date);

-- -----------------------------------------------------------------------------
-- 5. SOIL OBSERVATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE soil_observations (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    plot_id INTEGER NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,
    observation_date DATE NOT NULL,
    soil_moisture NUMERIC(5, 2) CHECK (soil_moisture >= 0 AND soil_moisture <= 100),
    soil_temperature NUMERIC(5, 2),
    soil_ph NUMERIC(4, 2) CHECK (soil_ph >= 0 AND soil_ph <= 14),
    nitrogen NUMERIC(8, 2) CHECK (nitrogen >= 0),
    phosphorus NUMERIC(8, 2) CHECK (phosphorus >= 0),
    potassium NUMERIC(8, 2) CHECK (potassium >= 0),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soil_obs_farm ON soil_observations(farm_id);
CREATE INDEX idx_soil_obs_plot ON soil_observations(plot_id);
CREATE INDEX idx_soil_obs_crop ON soil_observations(crop_id);
CREATE INDEX idx_soil_obs_date ON soil_observations(observation_date);

-- -----------------------------------------------------------------------------
-- 6. ENVIRONMENTAL READINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE environmental_readings (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    plot_id INTEGER NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2) CHECK (humidity >= 0 AND humidity <= 100),
    rainfall NUMERIC(6, 2) CHECK (rainfall >= 0),
    wind_speed NUMERIC(5, 2) CHECK (wind_speed >= 0),
    soil_moisture NUMERIC(5, 2) CHECK (soil_moisture >= 0 AND soil_moisture <= 100),
    data_source VARCHAR(100) DEFAULT 'Simulated (Demo)',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_env_readings_farm ON environmental_readings(farm_id);
CREATE INDEX idx_env_readings_plot ON environmental_readings(plot_id);
CREATE INDEX idx_env_readings_time ON environmental_readings(recorded_at);

-- -----------------------------------------------------------------------------
-- 7. IRRIGATION RECORDS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE irrigation_records (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    plot_id INTEGER NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,
    irrigation_method VARCHAR(50) NOT NULL DEFAULT 'Drip'
        CHECK (irrigation_method IN ('Drip', 'Sprinkler', 'Surface', 'Manual')),
    scheduled_date DATE NOT NULL,
    start_time VARCHAR(20),
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    water_quantity_litres NUMERIC(10, 2) CHECK (water_quantity_litres >= 0),
    actual_irrigation_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled'
        CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_irrigation_farm ON irrigation_records(farm_id);
CREATE INDEX idx_irrigation_status ON irrigation_records(status);
CREATE INDEX idx_irrigation_date ON irrigation_records(scheduled_date);

-- -----------------------------------------------------------------------------
-- 8. FARM ACTIVITIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE farm_activities (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    plot_id INTEGER NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL
        CHECK (activity_type IN ('Land Preparation', 'Sowing', 'Fertilization', 'Irrigation', 'Pest Control', 'Weeding', 'Pruning', 'Harvesting', 'Other')),
    activity_date DATE NOT NULL,
    description TEXT,
    labour_hours NUMERIC(6, 2) DEFAULT 0 CHECK (labour_hours >= 0),
    cost NUMERIC(12, 2) DEFAULT 0 CHECK (cost >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Completed'
        CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farm_activities_farm ON farm_activities(farm_id);
CREATE INDEX idx_farm_activities_date ON farm_activities(activity_date);
CREATE INDEX idx_farm_activities_type ON farm_activities(activity_type);

-- -----------------------------------------------------------------------------
-- 9. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info'
        CHECK (type IN ('info', 'warning', 'critical', 'success')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

