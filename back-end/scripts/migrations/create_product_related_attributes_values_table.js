const { pool } = require('../../config/database');

/**
 * Migration: Create product_related_attributes_values table
 * This table stores attribute values for product variants
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/create_product_related_attributes_values_table.js
 */

const createProductRelatedAttributesValuesTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Create product_related_attributes_values table...');
    await connection.beginTransaction();

    // Create product_related_attributes_values table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.commit();
    console.log('✅ Migration completed successfully: product_related_attributes_values table created');
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
  createProductRelatedAttributesValuesTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createProductRelatedAttributesValuesTable };
