-- Migration: Tiered Pricing for Stable Nodes
ALTER TABLE pulse_inventory 
ADD COLUMN IF NOT EXISTS early_bird_price DECIMAL,
ADD COLUMN IF NOT EXISTS early_bird_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preorder_price DECIMAL,
ADD COLUMN IF NOT EXISTS units_sold_count INTEGER DEFAULT 0;

-- Function to get the current applicable price for an item
CREATE OR REPLACE FUNCTION get_current_price(item_id UUID, is_member BOOLEAN DEFAULT FALSE)
RETURNS DECIMAL AS $$
DECLARE
    item RECORD;
    base_price DECIMAL;
BEGIN
    SELECT * INTO item FROM pulse_inventory WHERE id = item_id;
    
    IF item.is_stable THEN
        -- Tiered Pricing Logic
        IF item.units_sold_count < item.early_bird_limit AND item.early_bird_price IS NOT NULL THEN
            base_price := item.early_bird_price;
        ELSIF item.pre_order_status AND item.preorder_price IS NOT NULL THEN
            base_price := item.preorder_price;
        ELSE
            base_price := item.listing_price;
        END IF;
    ELSE
        base_price := item.listing_price;
    END IF;

    -- Apply Society Member Discount (10% or member_price if set)
    -- For stable items, we might want different discount logic, but let's stick to the user's requirement
    -- User mentioned: "Early Bird Price: 450 DKK... Standard Preorder: 499-549 DKK... Full Launch: 599 DKK"
    -- These look like absolute prices, so we'll return the base_price.
    -- If they are members, we can still apply the 10% or use member_price if it's lower.
    
    IF is_member THEN
        IF item.member_price IS NOT NULL AND item.member_price < base_price THEN
            RETURN item.member_price;
        ELSE
            RETURN base_price * 0.9;
        END IF;
    END IF;

    RETURN base_price;
END;
$$ LANGUAGE plpgsql STABLE;
