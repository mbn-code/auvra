-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. The Style Latent Space (The 50k "Vibe" Library)
CREATE TABLE IF NOT EXISTS style_latent_space (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  source text,
  archetype text,
  embedding vector(512),
  created_at timestamptz DEFAULT now()
);

-- Index for fast cosine similarity searches (HNSW for production-grade recall)
CREATE INDEX ON style_latent_space USING hnsw (embedding vector_cosine_ops);

-- 2. User Style DNA (The Centroid)
CREATE TABLE IF NOT EXISTS user_aesthetic_dna (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  centroid vector(512) NOT NULL,
  interaction_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 3. Add 512-dim CLIP column to inventory for deep matching
ALTER TABLE pulse_inventory ADD COLUMN IF NOT EXISTS style_embedding vector(512);

-- 4. Matching Function (The Core Recommendation Engine)
CREATE OR REPLACE FUNCTION match_inventory_to_dna(
  user_dna vector(512),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
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
    similarity DESC
  LIMIT
    match_count;
END;
$$ LANGUAGE plpgsql;
