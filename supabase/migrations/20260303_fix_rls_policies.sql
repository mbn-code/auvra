-- ==========================================
-- FIX RLS ENABLED NO POLICY (INFO 0008)
-- ==========================================
-- These tables had RLS enabled but lacked policies, meaning they were completely locked down.
-- The following policies restore basic read/write access based on typical usage patterns.

-- 1. style_latent_space
-- Used for the AI Stylist (Vibes). Needs to be readable by anyone (anon/auth) to show options.
CREATE POLICY "Allow public read access on style_latent_space" ON public.style_latent_space
    FOR SELECT USING (true);

-- 2. pulse_events
-- Analytics events. Users should be able to insert them, but only admins/system can read them.
CREATE POLICY "Allow public insert on pulse_events" ON public.pulse_events
    FOR INSERT WITH CHECK (true);

-- 3. creative_nodes
-- Nodes in the creative intelligence graph. Safe to be read publicly.
CREATE POLICY "Allow public read access on creative_nodes" ON public.creative_nodes
    FOR SELECT USING (true);

-- 4. creative_scores
-- Public rankings/scores. Safe to be read publicly.
CREATE POLICY "Allow public read access on creative_scores" ON public.creative_scores
    FOR SELECT USING (true);

-- 5. creative_insights
-- Insights generated from the graph. Safe to be read publicly.
CREATE POLICY "Allow public read access on creative_insights" ON public.creative_insights
    FOR SELECT USING (true);

