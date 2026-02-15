-- Migration: Remove brand column from products table
-- This SQL script removes the brand column from the products table
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/remove_brand_from_products.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/remove_brand_from_products.sql
-- 
-- Note: DROP COLUMN IF EXISTS and DROP INDEX IF EXISTS require MySQL 8.0.19+
-- For older MySQL versions, use the JavaScript migration script instead:
-- node scripts/migrations/remove_brand_from_products.js

-- Drop index on brand column if it exists (MySQL 8.0.19+)
DROP INDEX IF EXISTS idx_brand ON products;

-- Remove brand column (MySQL 8.0.19+)
ALTER TABLE products DROP COLUMN IF EXISTS brand;
