-- Auvra Pulse: Enhanced Database Schema

-- Drop if exists to recreate with new columns
DROP TABLE IF EXISTS pulse_inventory;

CREATE TABLE pulse_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vinted_id TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT,
    source_price DECIMAL NOT NULL,
    listing_price DECIMAL NOT NULL,
    potential_profit DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    images TEXT[] NOT NULL,
    source_url TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pending_review', -- pending_review, available, sold, archived
    confidence_score INTEGER,
    seller_rating DECIMAL,
    seller_reviews_count INTEGER,
    is_auto_approved BOOLEAN DEFAULT FALSE,
    locale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status ON pulse_inventory(status);
CREATE INDEX idx_brand ON pulse_inventory(brand);
CREATE INDEX idx_profit ON pulse_inventory(potential_profit DESC);

ALTER TABLE pulse_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Available" ON pulse_inventory
    FOR SELECT USING (status = 'available' OR status = 'sold');

CREATE POLICY "Admin Full Access" ON pulse_inventory
    FOR ALL USING (true);
