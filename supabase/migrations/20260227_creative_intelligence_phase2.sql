-- Phase 2/4: Creative Intelligence System (CIS) Scoring & Ranking

-- 1. Create creative_scores Table
CREATE TABLE IF NOT EXISTS creative_scores (
    creative_id uuid PRIMARY KEY REFERENCES creative_nodes(id) ON DELETE CASCADE,
    score numeric DEFAULT 0,
    views integer DEFAULT 0,
    drags integer DEFAULT 0,
    checkouts integer DEFAULT 0,
    purchases integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Index for fast ranking queries
CREATE INDEX IF NOT EXISTS idx_creative_scores_score ON creative_scores(score DESC);

-- 2. Create the core scoring logic function
CREATE OR REPLACE FUNCTION calculate_creative_scores()
RETURNS void AS $$
BEGIN
    -- Upsert scores based on the last 7 days of event activity.
    -- We join pulse_events to aggregate the counts per creative.
    -- Note: We rely on the existing idx_pulse_events_creative_date index to make the date filter fast.
    
    INSERT INTO creative_scores (creative_id, score, views, drags, checkouts, purchases, updated_at)
    SELECT 
        creative_id,
        (
            (COUNT(*) FILTER (WHERE event_type = 'view') * 1) +
            (COUNT(*) FILTER (WHERE event_type = 'drag') * 3) +
            (COUNT(*) FILTER (WHERE event_type = 'checkout') * 8) +
            (COUNT(*) FILTER (WHERE event_type = 'purchase') * 20)
        ) AS score,
        COUNT(*) FILTER (WHERE event_type = 'view') AS views,
        COUNT(*) FILTER (WHERE event_type = 'drag') AS drags,
        COUNT(*) FILTER (WHERE event_type = 'checkout') AS checkouts,
        COUNT(*) FILTER (WHERE event_type = 'purchase') AS purchases,
        now() AS updated_at
    FROM pulse_events
    WHERE creative_id IS NOT NULL 
      AND created_at >= (now() - interval '7 days')
    GROUP BY creative_id
    ON CONFLICT (creative_id) 
    DO UPDATE SET 
        score = EXCLUDED.score,
        views = EXCLUDED.views,
        drags = EXCLUDED.drags,
        checkouts = EXCLUDED.checkouts,
        purchases = EXCLUDED.purchases,
        updated_at = EXCLUDED.updated_at;
        
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Auto Ranking View
CREATE OR REPLACE VIEW creative_rankings AS
SELECT 
    creative_id,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
    updated_at
FROM creative_scores;

-- 4. Expose the safe RPC callable endpoint
CREATE OR REPLACE FUNCTION recalculate_creative_rankings()
RETURNS void AS $$
BEGIN
    PERFORM calculate_creative_scores();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
