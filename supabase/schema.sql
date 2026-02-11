-- 1. USERS: Tracks KYC and booking history for the Delivery Logic
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    kyc_verified BOOLEAN DEFAULT FALSE, -- Determines if Pickup is allowed
    total_bookings INT DEFAULT 0,       -- Determines First Time constraints
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CONSOLES: The physical assets (Hidden from user)
CREATE TABLE IF NOT EXISTS consoles (
    console_id SERIAL PRIMARY KEY,
    name VARCHAR(50), -- e.g., "PS5-Unit-Alpha"
    category VARCHAR(20), -- 'PS5', 'XBOX'
    status VARCHAR(20) DEFAULT 'ACTIVE' -- ACTIVE, MAINTENANCE
);

-- 3. PLANS: Hourly, Daily, Weekly definitions
CREATE TABLE IF NOT EXISTS plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(50), -- "Weekend Warrior", "Marathon"
    type VARCHAR(20), -- 'HOURLY', 'DAILY', 'WEEKLY'
    min_duration_hours INT,
    price_per_unit DECIMAL(10, 2)
);

-- 4. BOOKINGS: The core logic table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    console_id INT REFERENCES consoles(console_id), -- System Assigned
    plan_id INT REFERENCES plans(plan_id),
    
    -- Time ranges
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    
    -- Logistics
    delivery_type VARCHAR(20), -- 'DELIVERY', 'PICKUP'
    delivery_address TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED
    
    -- Constraint: Prevent overlapping bookings for the same console
    EXCLUDE USING GIST (
        console_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    )
);

-- 5. ADDONS: Controllers, Games, Cables
CREATE TABLE IF NOT EXISTS addons (
    addon_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),
    item_name VARCHAR(100),
    quantity INT,
    price DECIMAL(10, 2)
);
