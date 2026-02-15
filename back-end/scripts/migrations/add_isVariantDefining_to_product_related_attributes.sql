-- Migration: Add isVariantDefining column to product_related_attributes table
-- This SQL script adds support for marking which attributes define product variants
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/add_isVariantDefining_to_product_related_attributes.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/add_isVariantDefining_to_product_related_attributes.sql

-- Check if column exists before adding (MySQL doesn't support IF NOT EXISTS for ALTER TABLE)
-- You may need to manually check or use the .js migration file instead

ALTER TABLE product_related_attributes 
ADD COLUMN IF NOT EXISTS isVariantDefining BOOLEAN DEFAULT FALSE AFTER attributeId;

CREATE INDEX IF NOT EXISTS idx_variant_defining 
ON product_related_attributes(productId, isVariantDefining);
