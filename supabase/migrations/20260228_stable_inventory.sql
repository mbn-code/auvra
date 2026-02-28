-- Migration: Stable Inventory and Pre-Order Drop Infrastructure
ALTER TABLE pulse_inventory 
ADD COLUMN IF NOT EXISTS is_stable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stock_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pre_order_status BOOLEAN DEFAULT TRUE;

-- Add index for stable inventory performance
CREATE INDEX IF NOT EXISTS idx_is_stable ON pulse_inventory(is_stable);

-- RPC to safely decrement stock levels
CREATE OR REPLACE FUNCTION decrement_stock(item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pulse_inventory
    SET stock_level = GREATEST(0, stock_level - 1)
    WHERE id = item_id AND is_stable = TRUE;
END;
$$ LANGUAGE plpgsql;

-- DROP existing function to change return type
DROP FUNCTION IF EXISTS match_inventory_to_dna(vector,double precision,integer,integer,text);

-- Update Neural Matching to prioritize stable nodes
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
  category text,
  is_stable boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id,
    pi.title,
    pi.brand,
    pi.listing_price::numeric,
    pi.images,
    (1 - (pi.style_embedding <=> user_dna)) + (CASE WHEN pi.is_stable THEN 0.05 ELSE 0 END) AS similarity,
    pi.category,
    pi.is_stable
  FROM
    pulse_inventory pi
  WHERE
    (pi.status = 'available' OR (pi.is_stable = TRUE AND pi.pre_order_status = TRUE))
    -- Smart Filter: If preferred_category is provided, search in both category AND title
    AND (
      preferred_category IS NULL 
      OR pi.category ILIKE '%' || preferred_category || '%'
      OR pi.title ILIKE '%' || preferred_category || '%'
    )
    AND 1 - (pi.style_embedding <=> user_dna) > match_threshold
  ORDER BY
    pi.is_stable DESC, -- Prioritize stable items
    pi.style_embedding <=> user_dna -- Then order by distance
  LIMIT
    match_count
  OFFSET
    match_offset;
END;
$$ LANGUAGE plpgsql;


