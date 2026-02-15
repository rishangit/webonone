-- Migration: Create product_related_attributes_values table
-- This table stores attribute values for product variants
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/create_product_related_attributes_values_table.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/create_product_related_attributes_values_table.sql

CREATE TABLE IF NOT EXISTS product_related_attributes_values (
  id VARCHAR(10) PRIMARY KEY,
  variantId VARCHAR(10) NOT NULL,
  productRelatedAttributeId VARCHAR(10) NOT NULL,
  attributeValue TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_variant_attribute (variantId, productRelatedAttributeId),
  INDEX idx_variant (variantId),
  INDEX idx_product_related_attribute (productRelatedAttributeId),
  FOREIGN KEY (variantId) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (productRelatedAttributeId) REFERENCES product_related_attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
