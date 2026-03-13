-- Harden order handling and webhook idempotency.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    stripe_object_id TEXT,
    status TEXT NOT NULL DEFAULT 'processing',
    error_message TEXT,
    customer_notified_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS product_sku TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS inventory_applied BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_stripe_session_id_key;

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_quantity_check;

ALTER TABLE orders
ADD CONSTRAINT orders_quantity_check CHECK (quantity > 0);

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_sku ON orders(product_sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_session_product_unique
ON orders(stripe_session_id, product_sku);

CREATE OR REPLACE FUNCTION reserve_webhook_event(
    event_id_input TEXT,
    event_type_input TEXT,
    stripe_object_id_input TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    current_status TEXT;
BEGIN
    INSERT INTO stripe_webhook_events (event_id, event_type, stripe_object_id, status, updated_at)
    VALUES (event_id_input, event_type_input, stripe_object_id_input, 'processing', NOW())
    ON CONFLICT (event_id) DO NOTHING;

    IF FOUND THEN
        RETURN 'acquired';
    END IF;

    SELECT status
    INTO current_status
    FROM stripe_webhook_events
    WHERE event_id = event_id_input
    FOR UPDATE;

    IF current_status = 'failed' THEN
        UPDATE stripe_webhook_events
        SET status = 'processing',
            error_message = NULL,
            processed_at = NULL,
            updated_at = NOW()
        WHERE event_id = event_id_input;

        RETURN 'acquired';
    END IF;

    IF current_status = 'processed' THEN
        RETURN 'processed';
    END IF;

    RETURN 'in_progress';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fulfill_order_item(
    order_id_input UUID,
    item_id_input UUID,
    item_quantity_input INTEGER
)
RETURNS VOID AS $$
DECLARE
    item_record pulse_inventory%ROWTYPE;
    order_record orders%ROWTYPE;
BEGIN
    SELECT *
    INTO order_record
    FROM orders
    WHERE id = order_id_input
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', order_id_input;
    END IF;

    IF order_record.inventory_applied THEN
        RETURN;
    END IF;

    SELECT *
    INTO item_record
    FROM pulse_inventory
    WHERE id = item_id_input
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item % not found', item_id_input;
    END IF;

    IF item_record.is_stable THEN
        IF COALESCE(item_record.pre_order_status, FALSE) = FALSE AND COALESCE(item_record.stock_level, 0) < item_quantity_input THEN
            RAISE EXCEPTION 'Stable inventory item % does not have enough stock', item_id_input;
        END IF;

        UPDATE pulse_inventory
        SET stock_level = CASE
                WHEN COALESCE(pre_order_status, FALSE) THEN stock_level
                ELSE GREATEST(0, COALESCE(stock_level, 0) - item_quantity_input)
            END,
            units_sold_count = COALESCE(units_sold_count, 0) + item_quantity_input
        WHERE id = item_id_input;
    ELSE
        IF item_quantity_input <> 1 THEN
            RAISE EXCEPTION 'Archive item % cannot be fulfilled with quantity %', item_id_input, item_quantity_input;
        END IF;

        UPDATE pulse_inventory
        SET status = 'sold'
        WHERE id = item_id_input AND status = 'available';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Archive item % is no longer available', item_id_input;
        END IF;
    END IF;

    UPDATE orders
    SET inventory_applied = TRUE
    WHERE id = order_id_input;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refund_order_session(
    stripe_session_id_input TEXT,
    refund_id_input TEXT,
    refunded_at_input TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
DECLARE
    order_record orders%ROWTYPE;
    item_record pulse_inventory%ROWTYPE;
BEGIN
    FOR order_record IN
        SELECT *
        FROM orders
        WHERE stripe_session_id = stripe_session_id_input
          AND status <> 'refunded'
        FOR UPDATE
    LOOP
        IF order_record.product_id IS NOT NULL THEN
            SELECT *
            INTO item_record
            FROM pulse_inventory
            WHERE id = order_record.product_id
            FOR UPDATE;

            IF FOUND THEN
                IF item_record.is_stable THEN
                    IF COALESCE(order_record.inventory_applied, FALSE) AND COALESCE(item_record.pre_order_status, FALSE) = FALSE THEN
                        UPDATE pulse_inventory
                        SET stock_level = COALESCE(stock_level, 0) + COALESCE(order_record.quantity, 1),
                            units_sold_count = GREATEST(0, COALESCE(units_sold_count, 0) - COALESCE(order_record.quantity, 1))
                        WHERE id = item_record.id;
                    ELSIF COALESCE(order_record.inventory_applied, FALSE) THEN
                        UPDATE pulse_inventory
                        SET units_sold_count = GREATEST(0, COALESCE(units_sold_count, 0) - COALESCE(order_record.quantity, 1))
                        WHERE id = item_record.id;
                    END IF;
                ELSE
                    IF COALESCE(order_record.inventory_applied, FALSE) THEN
                        UPDATE pulse_inventory
                        SET status = 'available'
                        WHERE id = item_record.id;
                    END IF;
                END IF;
            END IF;
        END IF;
    END LOOP;

    UPDATE orders
    SET status = 'refunded',
        inventory_applied = FALSE,
        refund_id = refund_id_input,
        refunded_at = refunded_at_input
    WHERE stripe_session_id = stripe_session_id_input;
END;
$$ LANGUAGE plpgsql;
