CREATE OR REPLACE FUNCTION get_trending_items(limit_count int DEFAULT 6)
RETURNS TABLE(product_id uuid, score numeric) AS $$
  SELECT creative_id as product_id, score
  FROM creative_rankings
  ORDER BY score DESC
  LIMIT limit_count;
$$ LANGUAGE sql SECURITY DEFINER;