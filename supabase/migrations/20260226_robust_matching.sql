-- Migration: Robust Neural Matching with Keyword Search
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
    1 - (pi.style_embedding <=> user_dna) AS similarity,
    pi.category
  FROM
    pulse_inventory pi
  WHERE
    pi.status = 'available'
    -- Smart Filter: If preferred_category is provided, search in both category AND title
    AND (
      preferred_category IS NULL 
      OR pi.category ILIKE '%' || preferred_category || '%'
      OR pi.title ILIKE '%' || preferred_category || '%'
    )
    AND 1 - (pi.style_embedding <=> user_dna) > match_threshold
  ORDER BY
    pi.style_embedding <=> user_dna -- Order by distance
  LIMIT
    match_count
  OFFSET
    match_offset;
END;
$$ LANGUAGE plpgsql;
