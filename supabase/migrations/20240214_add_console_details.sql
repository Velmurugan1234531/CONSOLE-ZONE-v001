-- Migration: Add financial and warranty details to consoles
ALTER TABLE public.consoles
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
ADD COLUMN IF NOT EXISTS supplier TEXT;
