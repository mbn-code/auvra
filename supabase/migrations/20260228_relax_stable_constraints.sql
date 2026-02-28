-- Migration: Relax constraints for Stable Inventory
ALTER TABLE pulse_inventory 
ALTER COLUMN source_url DROP NOT NULL;

-- Ensure potential_profit is calculated if not provided
-- (though our API currently provides it)
