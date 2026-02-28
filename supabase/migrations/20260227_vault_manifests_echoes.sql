-- Auvra Feature Adoption Migration: Vault, Manifests, and Echoes

-- 0. Update Pulse Event Types Enum
-- We need to add the new automatic tracking types to the enum.
-- This needs to be done via ALTER TYPE because it's an existing type from Phase 1.
DO $$ BEGIN
    ALTER TYPE pulse_event_type ADD VALUE 'heartbeat';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE pulse_event_type ADD VALUE 'session_start';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE pulse_event_type ADD VALUE 'page_view';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE pulse_event_type ADD VALUE 'scroll_depth';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE pulse_event_type ADD VALUE 'click';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. User Vault (Likes/Saves)
CREATE TABLE IF NOT EXISTS user_vault (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES pulse_inventory(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS on user_vault
ALTER TABLE user_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own vault" ON user_vault;
CREATE POLICY "Users can manage their own vault" ON user_vault
    FOR ALL USING (auth.uid() = user_id);

-- 2. User Manifests (Mood-boards/Collections)
CREATE TABLE IF NOT EXISTS user_manifests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, slug)
);

-- Enable RLS on user_manifests
ALTER TABLE user_manifests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own manifests" ON user_manifests;
CREATE POLICY "Users can manage their own manifests" ON user_manifests
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view public manifests" ON user_manifests;
CREATE POLICY "Public can view public manifests" ON user_manifests
    FOR SELECT USING (is_public = true);

-- 3. Manifest Items (Relationship)
CREATE TABLE IF NOT EXISTS user_manifest_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manifest_id uuid REFERENCES user_manifests(id) ON DELETE CASCADE,
    product_id uuid REFERENCES pulse_inventory(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(manifest_id, product_id)
);

-- Enable RLS on user_manifest_items
ALTER TABLE user_manifest_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage items in their manifests" ON user_manifest_items;
CREATE POLICY "Users can manage items in their manifests" ON user_manifest_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_manifests 
            WHERE id = manifest_id AND user_id = auth.uid()
        )
    );

-- 4. Neural Echoes RPC (Visual Similarity)
CREATE OR REPLACE FUNCTION find_neural_echoes(source_product_id uuid, match_count int DEFAULT 5)
RETURNS SETOF pulse_inventory AS $$
DECLARE
    source_embedding vector(512);
BEGIN
    -- 1. Get the embedding of the source item
    SELECT style_embedding INTO source_embedding 
    FROM pulse_inventory 
    WHERE id = source_product_id;

    -- 2. If no embedding exists, return empty
    IF source_embedding IS NULL THEN
        RETURN;
    END IF;

    -- 3. Perform cosine similarity search
    RETURN QUERY
    SELECT *
    FROM pulse_inventory
    WHERE id != source_product_id
      AND status = 'available'
      AND style_embedding IS NOT NULL
    ORDER BY style_embedding <=> source_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Trigger to update User DNA based on Vault activity
-- Simplified to avoid casting errors on certain pgvector versions
CREATE OR REPLACE FUNCTION update_user_dna_from_vault()
RETURNS TRIGGER AS $$
DECLARE
    new_centroid vector(512);
    target_user_id uuid;
BEGIN
    target_user_id := COALESCE(NEW.user_id, OLD.user_id);

    -- Simply use the most recently vaulted item's embedding as the new DNA target.
    -- This is fast, free-tier safe, and avoids complex vector averaging math
    -- which can cause casting errors.
    SELECT pi.style_embedding INTO new_centroid
    FROM pulse_inventory pi
    JOIN user_vault uv ON pi.id = uv.product_id
    WHERE uv.user_id = target_user_id
    AND pi.style_embedding IS NOT NULL
    ORDER BY uv.created_at DESC
    LIMIT 1;

    IF new_centroid IS NOT NULL THEN
        INSERT INTO user_aesthetic_dna (user_id, centroid, interaction_count, updated_at)
        VALUES (target_user_id, new_centroid, 1, now())
        ON CONFLICT (user_id) DO UPDATE SET 
            centroid = new_centroid,
            interaction_count = user_aesthetic_dna.interaction_count + 1,
            updated_at = now();
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_vault_update_dna ON user_vault;
CREATE TRIGGER trigger_vault_update_dna
AFTER INSERT OR DELETE ON user_vault
FOR EACH ROW EXECUTE FUNCTION update_user_dna_from_vault();

