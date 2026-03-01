-- Migration: Atomic units_sold_count increment RPC
--
-- DATA INTEGRITY FIX (audit/p0-hardening → P1-A1):
-- The webhook previously read units_sold_count then wrote count+1 from
-- application code, creating a race condition under concurrent purchases.
-- This RPC performs the increment atomically in a single UPDATE statement,
-- matching the pattern already used by decrement_stock().

CREATE OR REPLACE FUNCTION increment_units_sold(item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pulse_inventory
    SET units_sold_count = COALESCE(units_sold_count, 0) + 1
    WHERE id = item_id AND is_stable = TRUE;
END;
$$ LANGUAGE plpgsql;
