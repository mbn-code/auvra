-- ==========================================
-- 1. FIX SECURITY DEFINER VIEW (ERROR 0010)
-- ==========================================
ALTER VIEW public.creative_rankings SET (security_invoker = true);

-- ==========================================
-- 2. FIX RLS DISABLED IN PUBLIC (ERROR 0013)
-- ==========================================
ALTER TABLE public.creative_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_latent_space ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_events ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. FIX RLS ENABLED NO POLICY (INFO 0008)
-- ==========================================
-- Fallback policy: allow authenticated users to read.
CREATE POLICY "Allow authenticated read access" ON public.orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.unverified_assets
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- 4. FIX EXTENSION IN PUBLIC (WARN 0014)
-- ==========================================
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- ==========================================
-- 5. FIX FUNCTION SEARCH PATH MUTABLE (WARN 0011)
-- ==========================================
DO $$
DECLARE
    func_record RECORD;
    alter_stmt TEXT;
BEGIN
    FOR func_record IN 
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.prokind = 'f'
          AND p.proname IN (
              'increment_stock', 'update_user_dna_from_vault', 'match_inventory_to_dna',
              'batch_insert_pulse_events', 'recalculate_creative_rankings', 'calculate_creative_scores',
              'get_current_price', 'decrement_stock', 'aggregate_creative_stats', 
              'attribute_traffic_to_creatives', 'increment_units_sold', 'handle_new_user',
              'update_user_style_centroid', 'find_neural_echoes'
          )
    LOOP
        alter_stmt := 'ALTER FUNCTION public.' || func_record.func_signature || ' SET search_path = public, extensions;';
        EXECUTE alter_stmt;
    END LOOP;
END;
$$;
