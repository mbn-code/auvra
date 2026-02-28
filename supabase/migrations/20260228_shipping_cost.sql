-- Migration: Add shipping_cost to pulse_inventory
ALTER TABLE pulse_inventory 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL DEFAULT 0;

-- Optionally, set a default shipping cost for existing non-stable items if needed.
-- For now, we will leave it at 0 and let the app handle default logic (e.g. Free Shipping or a flat rate if 0).
