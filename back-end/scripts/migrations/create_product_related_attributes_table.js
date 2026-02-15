const { pool } = require('../../config/database');

/**
 * Migration: Create product_related_attributes table
 * This migration creates the product_related_attributes junction table for linking products to attributes
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/create_product_related_attributes_table.js
 */

const createProductRelatedAttributesTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Create product_related_attributes table...');
    await connection.beginTransaction();

    // Create product_related_attributes junction table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.commit();
    console.log('✅ Migration completed successfully: product_related_attributes table created');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createProductRelatedAttributesTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createProductRelatedAttributesTable };
