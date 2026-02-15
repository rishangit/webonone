-- Migration: Create product_attributes table
-- This SQL script creates the product_attributes table for storing product attributes
-- 
-- Run this script on your live environment to update the database:
-- mysql -u your_username -p your_database_name < scripts/migrations/create_systemproductattribute_table.sql
-- 
-- Or execute directly in MySQL:
-- source scripts/migrations/create_systemproductattribute_table.sql

CREATE TABLE IF NOT EXISTS product_attributes (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  valueDataType ENUM('text', 'number', 'boolean', 'date', 'json') DEFAULT 'text',
  unit_of_measure VARCHAR(10),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (isActive),
  INDEX idx_unit_of_measure (unit_of_measure),
  FOREIGN KEY (unit_of_measure) REFERENCES units_of_measure(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
