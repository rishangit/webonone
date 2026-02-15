-- Migration: Create product_related_attributes table
-- This SQL script creates the product_related_attributes junction table for linking products to attributes
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/create_product_related_attributes_table.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/create_product_related_attributes_table.sql

CREATE TABLE IF NOT EXISTS product_related_attributes (
  id VARCHAR(10) PRIMARY KEY,
  productId VARCHAR(10) NOT NULL,
  attributeId VARCHAR(10) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_product_attribute (productId, attributeId),
  INDEX idx_product (productId),
  INDEX idx_attribute (attributeId),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (attributeId) REFERENCES product_attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
