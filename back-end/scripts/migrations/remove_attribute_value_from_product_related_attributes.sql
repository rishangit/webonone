-- Migration: Remove attributeValue column from product_related_attributes table
-- This SQL script removes the attributeValue column from product_related_attributes
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/remove_attribute_value_from_product_related_attributes.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/remove_attribute_value_from_product_related_attributes.sql
-- 
-- Note: MySQL doesn't support DROP COLUMN IF EXISTS, so check if column exists first:
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_related_attributes' AND COLUMN_NAME = 'attributeValue';

ALTER TABLE product_related_attributes
DROP COLUMN attributeValue;
