-- Migration: Add stripe_subscription_id to profiles for lifecycle webhook tracking
--
-- SECURITY FIX (audit/p0-hardening, P0-2):
-- The webhook now saves the Stripe subscription ID at membership purchase time
-- so that subscription.updated / subscription.deleted events can be cleanly
-- linked back to the correct profile row.
--
-- stripe_customer_id already exists from 20260226_membership_fix.sql.
-- This migration adds the companion subscription ID column.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Composite index: customer + subscription lookups in webhook handlers
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
    ON profiles(stripe_subscription_id);
