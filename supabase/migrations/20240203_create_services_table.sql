CREATE TABLE IF NOT EXISTS repair_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Repair', 'Maintenance', 'Modification', 'Other')),
    price DECIMAL(10, 2) NOT NULL,
    duration TEXT NOT NULL, -- e.g., '24h'
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
