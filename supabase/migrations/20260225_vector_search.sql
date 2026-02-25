-- 1. Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add an embedding column to the inventory table
-- Assuming ResNet50 (2048 dimensions)
ALTER TABLE pulse_inventory 
ADD COLUMN IF NOT EXISTS embedding vector(2048);

-- 3. Create a similarity search function
CREATE OR REPLACE FUNCTION match_inventory_vibes (
  query_embedding vector(2048),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  brand TEXT,
  title TEXT,
  listing_price FLOAT,
  images TEXT[],
  category TEXT,
  status TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id,
    pi.brand,
    pi.title,
    pi.listing_price,
    pi.images,
    pi.category,
    pi.status,
    1 - (pi.embedding <=> query_embedding) AS similarity
  FROM pulse_inventory pi
  WHERE 1 - (pi.embedding <=> query_embedding) > match_threshold
    AND pi.status = 'available'
  ORDER BY pi.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
