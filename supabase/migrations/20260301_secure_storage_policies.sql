-- Migration: Restore secure storage policies for pulse-inventory bucket
--
-- SECURITY FIX (audit/p0-hardening):
-- 20260228_storage_permissions_v2.sql erroneously granted unauthenticated
-- (anon) INSERT, UPDATE, and DELETE access to the pulse-inventory bucket.
-- This allowed anyone on the internet to upload, overwrite, or delete product
-- images without any credentials.
--
-- Root cause: The admin image upload was done via the browser anon client.
-- Fix: Admin uploads now go through /api/admin/upload (server-side, service
-- role key, gated by verifyAdmin()). The bucket returns to requiring an
-- authenticated Supabase session for all write operations.
--
-- Public read access is preserved — product images must remain publicly CDN-accessible.

-- 1. Drop all policies set by the v2 migration
DROP POLICY IF EXISTS "Public Read Access"   ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- Also drop v1 policies in case they are still present (idempotent)
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

-- 2. Public read — product images are served directly from Cloudinary/Supabase CDN
CREATE POLICY "pulse_inventory_public_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pulse-inventory');

-- 3. Authenticated upload only — only a valid Supabase session may write.
--    In practice this means the service-role key used by /api/admin/upload.
--    Anon (browser) clients are rejected.
CREATE POLICY "pulse_inventory_auth_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'pulse-inventory'
        AND auth.role() = 'authenticated'
    );

-- 4. Authenticated update only
CREATE POLICY "pulse_inventory_auth_update" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'pulse-inventory'
        AND auth.role() = 'authenticated'
    );

-- 5. Authenticated delete only
CREATE POLICY "pulse_inventory_auth_delete" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'pulse-inventory'
        AND auth.role() = 'authenticated'
    );
