-- Create site_settings table for global configurations
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (if needed) or admin only
-- For now, allowing all for development, but ideally RESTRICT to admin
CREATE POLICY "Enable read access for all users" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON site_settings FOR ALL USING (true);

-- Insert default settings if not exists
INSERT INTO site_settings (key, value)
VALUES ('global_config', '{
    "siteTitle": "Console Zone",
    "siteDescription": "Premium Gaming Rental Platform",
    "holidayMode": false,
    "maintenanceMode": false,
    "announcement": "",
    "seo": {
        "home": {
            "title": "Console Zone | Rent PS5, Xbox & Gaming Gear",
            "description": "Premium gaming rentals delivered to your doorstep. Experience the latest consoles without the commitment.",
            "keywords": "ps5 rental, xbox rental, gaming console, rent games"
        }
    }
}') ON CONFLICT (key) DO NOTHING;
