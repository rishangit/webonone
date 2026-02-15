-- Migration: Remove hardcoded columns from product_variants table
-- This SQL script removes color, size, weight, and material columns
-- as they are now stored in product_related_attributes_values
-- 
-- IMPORTANT: Run migrate_hardcoded_variant_values_to_attributes.js FIRST!
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/remove_hardcoded_columns_from_product_variants.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/remove_hardcoded_columns_from_product_variants.sql
-- 
-- Note: DROP COLUMN IF EXISTS requires MySQL 8.0.19+
-- For older MySQL versions, use the JavaScript migration script instead:
-- node scripts/migrations/remove_hardcoded_columns_from_product_variants.js

-- Remove color column if it exists (MySQL 8.0.19+)
ALTER TABLE product_variants DROP COLUMN IF EXISTS color;

-- Remove size column if it exists (MySQL 8.0.19+)
ALTER TABLE product_variants DROP COLUMN IF EXISTS size;

-- Remove weight column if it exists (MySQL 8.0.19+)
ALTER TABLE product_variants DROP COLUMN IF EXISTS weight;

-- Remove material column if it exists (MySQL 8.0.19+)
ALTER TABLE product_variants DROP COLUMN IF EXISTS material;
