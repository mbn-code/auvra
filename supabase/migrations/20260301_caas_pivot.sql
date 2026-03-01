-- 1. Create dna_briefs table for PDF lookbooks
CREATE TABLE IF NOT EXISTS dna_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES user_outfits(id) ON DELETE CASCADE,
  pdf_storage_path TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for dna_briefs
ALTER TABLE dna_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dna_briefs" ON dna_briefs;
CREATE POLICY "Users can view own dna_briefs" ON dna_briefs
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Add HNSW index to pulse_inventory for style_embedding
-- Drops if exists just in case
DROP INDEX IF EXISTS pulse_inventory_style_embedding_hnsw_idx;
CREATE INDEX pulse_inventory_style_embedding_hnsw_idx ON pulse_inventory USING hnsw (style_embedding vector_cosine_ops);

-- 3. Add style_centroid to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS style_centroid vector(512);

-- 4. Unverified Assets Staging Table
CREATE TABLE IF NOT EXISTS unverified_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vinted_id TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT,
  source_price DECIMAL NOT NULL,
  listing_price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  images TEXT[] NOT NULL,
  source_url TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  locale TEXT,
  shipping_zone TEXT DEFAULT 'EU_ONLY',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add update function for style centroid based on vault/outfits
CREATE OR REPLACE FUNCTION update_user_style_centroid(p_user_id UUID)
RETURNS void AS $$
DECLARE
  new_centroid vector(512);
BEGIN
  SELECT AVG(pi.style_embedding) INTO new_centroid
  FROM user_vault uv
  JOIN pulse_inventory pi ON uv.product_id = pi.id
  WHERE uv.user_id = p_user_id AND pi.style_embedding IS NOT NULL;
  
  IF new_centroid IS NOT NULL THEN
    UPDATE profiles SET style_centroid = new_centroid WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
