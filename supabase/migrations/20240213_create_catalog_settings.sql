-- Create catalog_settings table for device configuration
CREATE TABLE IF NOT EXISTS catalog_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_category TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    max_controllers INTEGER DEFAULT 4,
    extra_controller_enabled BOOLEAN DEFAULT true,
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    controller_daily_rate DECIMAL(10,2),
    controller_weekly_rate DECIMAL(10,2),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default catalog settings for common devices
INSERT INTO catalog_settings (device_category, is_enabled, is_featured, max_controllers, extra_controller_enabled, daily_rate, weekly_rate, monthly_rate, controller_daily_rate, controller_weekly_rate, display_order)
VALUES
    ('PS5', true, true, 4, true, 500.00, 3000.00, 10000.00, 100.00, 500.00, 1),
    ('PS4', true, false, 4, true, 300.00, 1800.00, 6000.00, 75.00, 400.00, 2),
    ('Xbox', true, false, 4, true, 500.00, 3000.00, 10000.00, 100.00, 500.00, 3)
ON CONFLICT (device_category) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_catalog_enabled ON catalog_settings(is_enabled);
CREATE INDEX IF NOT EXISTS idx_catalog_featured ON catalog_settings(is_featured);
CREATE INDEX IF NOT EXISTS idx_catalog_display_order ON catalog_settings(display_order);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_catalog_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catalog_settings_updated_at
    BEFORE UPDATE ON catalog_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_settings_updated_at();
