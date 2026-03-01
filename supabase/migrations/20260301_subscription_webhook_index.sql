-- Migration: Add index on profiles.stripe_customer_id for webhook lookups
--
-- SECURITY FIX (audit/p0-hardening, P0-2):
-- The webhook now handles customer.subscription.deleted and
-- customer.subscription.updated to revoke the Society tier on cancellation.
-- These events carry a Stripe customer ID but no Supabase user ID, so we
-- must look up the profile by stripe_customer_id. This index makes that
-- lookup O(log n) instead of a full table scan.
--
-- The stripe_customer_id and subscription_status columns already exist from
-- 20260226_membership_fix.sql — only the index is new here.

-- Index for webhook reverse-lookup: Stripe customer ID → profiles row
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
    ON profiles(stripe_customer_id);

-- Index for subscription status queries (admin dashboard filters)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
    ON profiles(subscription_status);
