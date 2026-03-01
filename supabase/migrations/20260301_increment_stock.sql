-- Atomic RPC to restore one unit of stock on refund.
-- Mirrors decrement_stock() from 20260228_stable_inventory.sql.
-- Used by the admin refund route instead of a raw read-modify-write UPDATE,
-- preventing a race condition when two refunds for the same item run concurrently.
CREATE OR REPLACE FUNCTION increment_stock(item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pulse_inventory
    SET stock_level = stock_level + 1
    WHERE id = item_id AND is_stable = TRUE;
END;
$$ LANGUAGE plpgsql;
