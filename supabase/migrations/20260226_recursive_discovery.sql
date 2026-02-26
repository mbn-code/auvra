-- Fresh Start: Recursive Inventory Discovery Migration
TRUNCATE TABLE style_latent_space;

-- Add product_id link to track which inventory item a vibe came from
ALTER TABLE style_latent_space 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES pulse_inventory(id) ON DELETE CASCADE;

-- Ensure an index exists on product_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_style_latent_product_id ON style_latent_space(product_id);
