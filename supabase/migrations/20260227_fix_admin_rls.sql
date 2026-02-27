-- Drop insecure policies allowing unauthenticated admin access
DROP POLICY IF EXISTS "Admin Full Access" ON pulse_inventory;
DROP POLICY IF EXISTS "Admin Orders Access" ON orders;
