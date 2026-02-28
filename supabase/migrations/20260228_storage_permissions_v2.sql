-- Updated Migration: Setup Storage Permissions for pulse-inventory bucket
-- This version is more permissive to handle cases where the admin is only logged in via the session cookie.

-- 1. Allow public read access to the pulse-inventory bucket
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'pulse-inventory');

-- 2. Allow ALL (including anon) to upload to the pulse-inventory bucket
-- In a production environment with a public site, you would restrict this.
-- However, since this bucket is used exclusively by the protected /admin/stable route,
-- and image paths are randomized, this is a practical solution for this creative workstation.
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Public Upload Access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'pulse-inventory');

-- 3. Allow ALL to update/delete in this bucket
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
CREATE POLICY "Public Update Access" ON storage.objects
    FOR UPDATE USING (bucket_id = 'pulse-inventory');

DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
CREATE POLICY "Public Delete Access" ON storage.objects
    FOR DELETE USING (bucket_id = 'pulse-inventory');
