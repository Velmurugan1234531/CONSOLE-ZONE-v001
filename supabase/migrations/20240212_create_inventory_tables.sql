-- Create consoles/hardware matrix table
CREATE TABLE IF NOT EXISTS consoles (
    console_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    health INTEGER DEFAULT 100,
    notes TEXT,
    last_service TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rentals table if not exists (base structure)
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    console_id INTEGER REFERENCES consoles(console_id) ON DELETE SET NULL,
    product_id UUID, -- Link to products if exists
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
    total_price DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Consoles Policies
CREATE POLICY "Public read consoles" ON consoles FOR SELECT USING (true);
CREATE POLICY "Admins manage consoles" ON consoles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Rentals Policies
CREATE POLICY "Users view own rentals" ON rentals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage rentals" ON rentals FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
