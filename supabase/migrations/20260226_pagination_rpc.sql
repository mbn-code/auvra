-- Migration: Update Neural Matching RPC to support pagination
CREATE OR REPLACE FUNCTION match_inventory_to_dna(
  user_dna vector(512),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  match_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  brand text,
  listing_price numeric,
  images text[],
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id,
    pi.title,
    pi.brand,
    pi.listing_price::numeric,
    pi.images,
    1 - (pi.style_embedding <=> user_dna) AS similarity
  FROM
    pulse_inventory pi
  WHERE
    pi.status = 'available'
    AND 1 - (pi.style_embedding <=> user_dna) > match_threshold
  ORDER BY
    pi.style_embedding <=> user_dna -- Order by distance (smaller is better)
  LIMIT
    match_count
  OFFSET
    match_offset;
END;
$$ LANGUAGE plpgsql;
