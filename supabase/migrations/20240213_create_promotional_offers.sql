-- Create promotional_offers table for discount codes and promotions
CREATE TABLE IF NOT EXISTS promotional_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_rental_days INTEGER DEFAULT 1,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    applicable_categories TEXT[], -- NULL means all categories
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample promotional offers
INSERT INTO promotional_offers (code, title, description, discount_type, discount_value, min_rental_days, max_uses, valid_from, valid_until, applicable_categories)
VALUES
    ('FIRST10', 'First Time User Discount', 'Get 10% off your first rental', 'percentage', 10.00, 1, NULL, NOW(), NOW() + INTERVAL '90 days', NULL),
    ('WEEKEND50', 'Weekend Special', 'Flat ₹50 off on weekend rentals', 'fixed', 50.00, 2, 100, NOW(), NOW() + INTERVAL '30 days', ARRAY['PS5', 'Xbox']),
    ('MONTHLY20', 'Monthly Plan Discount', '20% off on monthly rentals', 'percentage', 20.00, 28, NULL, NOW(), NOW() + INTERVAL '60 days', NULL)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_offers_code ON promotional_offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_active ON promotional_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_valid_dates ON promotional_offers(valid_from, valid_until);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_promotional_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotional_offers_updated_at
    BEFORE UPDATE ON promotional_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_offers_updated_at();

-- Function to validate and apply offer
CREATE OR REPLACE FUNCTION validate_offer_code(
    p_code TEXT,
    p_category TEXT,
    p_rental_days INTEGER
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_type TEXT,
    discount_value DECIMAL,
    message TEXT
) AS $$
DECLARE
    v_offer promotional_offers%ROWTYPE;
BEGIN
    -- Fetch the offer
    SELECT * INTO v_offer
    FROM promotional_offers
    WHERE code = p_code
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW());

    -- Check if offer exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, 'Invalid or expired offer code';
        RETURN;
    END IF;

    -- Check max uses
    IF v_offer.max_uses IS NOT NULL AND v_offer.current_uses >= v_offer.max_uses THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, 'Offer code has reached maximum usage limit';
        RETURN;
    END IF;

    -- Check minimum rental days
    IF p_rental_days < v_offer.min_rental_days THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, 
            'Minimum rental period of ' || v_offer.min_rental_days || ' days required';
        RETURN;
    END IF;

    -- Check applicable categories
    IF v_offer.applicable_categories IS NOT NULL 
       AND NOT (p_category = ANY(v_offer.applicable_categories)) THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, 
            'Offer not applicable to this device category';
        RETURN;
    END IF;

    -- Offer is valid
    RETURN QUERY SELECT true, v_offer.discount_type, v_offer.discount_value, 'Offer applied successfully';
END;
$$ LANGUAGE plpgsql;
