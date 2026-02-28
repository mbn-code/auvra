-- Migration: Setup Storage Permissions for pulse-inventory bucket

-- Allow public read access to the pulse-inventory bucket
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'pulse-inventory');

-- Allow authenticated users to upload to the pulse-inventory bucket
CREATE POLICY "Authenticated Upload Access" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'pulse-inventory' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own uploads (optional but recommended)
CREATE POLICY "Authenticated Update Access" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'pulse-inventory' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to delete their own uploads (optional but recommended)
CREATE POLICY "Authenticated Delete Access" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'pulse-inventory' 
        AND auth.role() = 'authenticated'
    );
