-- Auvra Pulse: Enhanced Database Schema (v3)

-- Add extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Archive Inventory Table
CREATE TABLE IF NOT EXISTS pulse_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vinted_id TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT,
    source_price DECIMAL NOT NULL,
    listing_price DECIMAL NOT NULL,
    member_price DECIMAL, -- NEW: Member-only price
    potential_profit DECIMAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    images TEXT[] NOT NULL,
    source_url TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pending_review',
    confidence_score INTEGER,
    seller_rating DECIMAL,
    seller_reviews_count INTEGER,
    is_auto_approved BOOLEAN DEFAULT FALSE,
    locale TEXT,
    shipping_zone TEXT DEFAULT 'EU_ONLY', -- EU_ONLY, GLOBAL, SCANDINAVIA_ONLY
    last_pulse_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles for Membership
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    membership_tier TEXT DEFAULT 'free', -- free, society
    stripe_customer_id TEXT,
    subscription_status TEXT, -- active, past_due, canceled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Orders Table for Fulfillment
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_session_id TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES pulse_inventory(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    shipping_address JSONB,
    status TEXT DEFAULT 'pending_secure', -- pending_secure, secured, dispatched, delivered
    source_url TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_status ON pulse_inventory(status);
CREATE INDEX IF NOT EXISTS idx_brand ON pulse_inventory(brand);
CREATE INDEX IF NOT EXISTS idx_profit ON pulse_inventory(potential_profit DESC);
CREATE INDEX IF NOT EXISTS idx_order_status ON orders(status);

-- Security
ALTER TABLE pulse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Pulse Policies
DROP POLICY IF EXISTS "Public Read Available" ON pulse_inventory;
CREATE POLICY "Public Read Available" ON pulse_inventory
    FOR SELECT USING (status = 'available' OR status = 'sold');

DROP POLICY IF EXISTS "Admin Full Access" ON pulse_inventory;
CREATE POLICY "Admin Full Access" ON pulse_inventory
    FOR ALL USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Admin Orders Access" ON orders;
CREATE POLICY "Admin Orders Access" ON orders
    FOR ALL USING (true);
