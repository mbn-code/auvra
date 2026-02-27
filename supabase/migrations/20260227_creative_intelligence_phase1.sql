-- Phase 1: Creative Intelligence System (CIS) Schema

-- Extensions required for UUIDs and Vector Embeddings
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ENUMS (Safe creation)
DO $$ BEGIN
    CREATE TYPE creative_platform AS ENUM ('IG', 'TT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE creative_format AS ENUM ('POV', 'Unboxing', 'Vibe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pulse_event_type AS ENUM ('view', 'drag', 'checkout', 'purchase');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Creative Nodes (Permanent)
CREATE TABLE IF NOT EXISTS creative_nodes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    embedding vector(512),
    thumbnail_url text,
    platform creative_platform,
    format creative_format,
    duration_sec integer,
    posted_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Index for vector search if needed later
CREATE INDEX IF NOT EXISTS idx_creative_nodes_embedding ON creative_nodes USING hnsw (embedding vector_cosine_ops);

-- 2. Pulse Events (Ephemeral buffer, pruned every 48h)
CREATE TABLE IF NOT EXISTS pulse_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL, -- using text to accommodate hash/fingerprint strings or UUIDs
    creative_id uuid REFERENCES creative_nodes(id) ON DELETE SET NULL,
    event_type pulse_event_type NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb, -- to store product_id, duration, etc.
    created_at timestamptz DEFAULT now()
);

-- Index for fast aggregation and pruning
CREATE INDEX IF NOT EXISTS idx_pulse_events_creative_date ON pulse_events(creative_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pulse_events_session ON pulse_events(session_id);

-- 3. Creative Insights (Aggregated)
CREATE TABLE IF NOT EXISTS creative_insights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creative_id uuid REFERENCES creative_nodes(id) ON DELETE CASCADE,
    insight_date date NOT NULL,
    total_interactions integer DEFAULT 0,
    conversions integer DEFAULT 0,
    revenue numeric DEFAULT 0.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(creative_id, insight_date) -- Ensures one record per creative per day
);

-- 4. Stored Procedure for Aggregation and Pruning
CREATE OR REPLACE FUNCTION aggregate_creative_stats()
RETURNS void AS $$
BEGIN
    -- We aggregate data up to yesterday (or for the last full 24h cycle)
    -- This function should run via pg_cron or an external cron (Vercel) daily.
    
    -- 1. Upsert Aggregated Data
    INSERT INTO creative_insights (creative_id, insight_date, total_interactions, conversions, revenue)
    SELECT 
        creative_id,
        created_at::date AS insight_date,
        COUNT(*) FILTER (WHERE event_type IN ('view', 'drag')) AS total_interactions,
        COUNT(*) FILTER (WHERE event_type = 'purchase') AS conversions,
        -- Assuming metadata->>'revenue' is stored on purchase events
        COALESCE(SUM((metadata->>'revenue')::numeric), 0) AS revenue
    FROM pulse_events
    WHERE creative_id IS NOT NULL 
      AND created_at < CURRENT_DATE -- aggregate up to yesterday
    GROUP BY creative_id, created_at::date
    ON CONFLICT (creative_id, insight_date) 
    DO UPDATE SET 
        total_interactions = creative_insights.total_interactions + EXCLUDED.total_interactions,
        conversions = creative_insights.conversions + EXCLUDED.conversions,
        revenue = creative_insights.revenue + EXCLUDED.revenue,
        updated_at = now();

    -- 2. Prune Ephemeral Data older than 48 hours to save space
    DELETE FROM pulse_events WHERE created_at < now() - interval '48 hours';
    
END;
$$ LANGUAGE plpgsql;

-- 5. RPC for Batch Inserting Events (Optimized for Edge Functions)
CREATE OR REPLACE FUNCTION batch_insert_pulse_events(events jsonb)
RETURNS void AS $$
BEGIN
    INSERT INTO pulse_events (session_id, creative_id, event_type, metadata, created_at)
    SELECT 
        (elem->>'session_id')::text,
        NULLIF(elem->>'creative_id', '')::uuid,
        (elem->>'event_type')::pulse_event_type,
        COALESCE(elem->'metadata', '{}'::jsonb),
        COALESCE((elem->>'timestamp')::timestamptz, now())
    FROM jsonb_array_elements(events) AS elem;
END;
$$ LANGUAGE plpgsql;
