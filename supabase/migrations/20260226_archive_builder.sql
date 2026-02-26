-- Auvra v5.0: Archive Builder & Persistence Migration

-- 1. Create the user_outfits table for lookbook storage
CREATE TABLE IF NOT EXISTS user_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Untitled Look',
  -- Store slot IDs linked to pulse_inventory
  slots JSONB DEFAULT '{
    "head": null,
    "upper": null,
    "lower": null,
    "footwear": null,
    "accessory": null
  }'::JSONB,
  share_slug TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Outfits
ALTER TABLE user_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and public outfits" ON user_outfits
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own outfits" ON user_outfits
    FOR ALL USING (auth.uid() = user_id);

-- 2. Update Neural Matching RPC to support category-weighting
-- This allows the engine to prioritize specific slots (e.g. "pants" for "LOWER")
CREATE OR REPLACE FUNCTION match_inventory_to_dna(
  user_dna vector(512),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 20,
  match_offset int DEFAULT 0,
  preferred_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  brand text,
  listing_price numeric,
  images text[],
  similarity float,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id,
    pi.title,
    pi.brand,
    pi.listing_price::numeric,
    pi.images,
    -- Apply a slight similarity boost (0.05) if the category matches the user's focus
    CASE 
      WHEN preferred_category IS NOT NULL AND pi.category ILIKE '%' || preferred_category || '%' 
      THEN (1 - (pi.style_embedding <=> user_dna)) + 0.05
      ELSE 1 - (pi.style_embedding <=> user_dna)
    END AS similarity,
    pi.category
  FROM
    pulse_inventory pi
  WHERE
    pi.status = 'available'
    AND 1 - (pi.style_embedding <=> user_dna) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count
  OFFSET
    match_offset;
END;
$$ LANGUAGE plpgsql;
