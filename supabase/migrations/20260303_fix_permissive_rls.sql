-- ==========================================
-- FIX RLS POLICY ALWAYS TRUE (WARN 0024)
-- ==========================================
-- The policy "Allow public insert on pulse_events" was overly permissive.
-- Since all inserts to pulse_events are handled by backend API routes 
-- (which use the Service Role key that bypasses RLS), we do not need 
-- a public insert policy at all. Dropping it secures the table.

DROP POLICY IF EXISTS "Allow public insert on pulse_events" ON public.pulse_events;

