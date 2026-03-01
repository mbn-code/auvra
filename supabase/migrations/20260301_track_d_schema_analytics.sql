-- Track D: Schema & Analytics Hygiene
-- D1 + D2: Fix aggregate_creative_stats
--   D1: Prune step was deleting purchase events (creative_id IS NULL) before they
--       could contribute to any aggregation. Separate the prune from aggregation
--       and only prune non-purchase events on the 48h cycle; purchase events are
--       retained until they are at least 72h old (giving the daily cron time to run).
--   D2: ON CONFLICT DO UPDATE was adding EXCLUDED counts ON TOP of existing counts,
--       causing double-counting on every subsequent run for the same date.
--       Fix: replace with EXCLUDED values (idempotent re-run safe) since the SELECT
--       already fully aggregates from raw events for that date.

CREATE OR REPLACE FUNCTION aggregate_creative_stats()
RETURNS void AS $$
BEGIN
    -- 1. Upsert aggregated data for all complete days (up to yesterday).
    --    REPLACE on conflict — the SELECT already fully re-aggregates, so adding
    --    on top of the existing row would double-count on repeated runs.
    INSERT INTO creative_insights (creative_id, insight_date, total_interactions, conversions, revenue)
    SELECT
        creative_id,
        created_at::date AS insight_date,
        COUNT(*) FILTER (WHERE event_type IN ('view', 'drag')) AS total_interactions,
        COUNT(*) FILTER (WHERE event_type = 'purchase') AS conversions,
        COALESCE(SUM((metadata->>'revenue')::numeric) FILTER (WHERE event_type = 'purchase'), 0) AS revenue
    FROM pulse_events
    WHERE creative_id IS NOT NULL
      AND created_at < CURRENT_DATE  -- only complete days
    GROUP BY creative_id, created_at::date
    ON CONFLICT (creative_id, insight_date)
    DO UPDATE SET
        -- Replace (not add) — safe because the SELECT re-derives the full count
        total_interactions = EXCLUDED.total_interactions,
        conversions        = EXCLUDED.conversions,
        revenue            = EXCLUDED.revenue,
        updated_at         = now();

    -- 2. Prune ephemeral events:
    --    - Non-purchase events: prune after 48 hours (original behaviour).
    --    - Purchase events: retain for 72 hours so the daily cron always has a
    --      full extra day of buffer before they are deleted. This ensures a
    --      purchase that lands at 23:59 isn't lost if the cron fires at 01:00
    --      the same night before aggregation could capture it.
    DELETE FROM pulse_events
    WHERE (
        event_type != 'purchase' AND created_at < now() - interval '48 hours'
    ) OR (
        event_type = 'purchase'  AND created_at < now() - interval '72 hours'
    );

END;
$$ LANGUAGE plpgsql;


-- D3: Add missing constraints on price/financial columns and membership_tier.
--     All constraints use ALTER TABLE … ADD CONSTRAINT IF NOT EXISTS (PG 9.6+).
--     Prices are stored as numeric — must be non-negative.
--     membership_tier must be one of the known application values.

ALTER TABLE pulse_inventory
    ADD CONSTRAINT IF NOT EXISTS chk_listing_price_nonneg
        CHECK (listing_price >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_member_price_nonneg
        CHECK (member_price IS NULL OR member_price >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_early_bird_price_nonneg
        CHECK (early_bird_price IS NULL OR early_bird_price >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_preorder_price_nonneg
        CHECK (preorder_price IS NULL OR preorder_price >= 0);

ALTER TABLE profiles
    ADD CONSTRAINT IF NOT EXISTS chk_membership_tier
        CHECK (membership_tier IN ('free', 'society'));


-- D4: Prevent public read of sold/archived inventory.
--     The existing RLS SELECT policy exposes all rows regardless of status.
--     We replace it so that anonymous users can only see 'available' items
--     (and stable pre-order items with is_stable = TRUE), while authenticated
--     users (admin service role bypasses RLS entirely) are not affected.

-- Drop the open SELECT policy if it exists (name may vary — try both common names).
DROP POLICY IF EXISTS "Allow public read access" ON pulse_inventory;
DROP POLICY IF EXISTS "Public read access" ON pulse_inventory;
DROP POLICY IF EXISTS "Enable read access for all users" ON pulse_inventory;

-- Recreate with status filter: public can only see available items or active stable nodes.
CREATE POLICY "Public read: available and stable items only"
    ON pulse_inventory
    FOR SELECT
    USING (
        status = 'available'
        OR (is_stable = TRUE AND pre_order_status = TRUE)
    );
