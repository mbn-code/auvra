-- Migration: Ensure profiles table has membership tracking
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_profiles_membership ON profiles(membership_tier);
