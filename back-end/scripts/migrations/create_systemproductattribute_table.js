const { pool } = require('../../config/database');

/**
 * Migration: Create product_attributes table
 * This migration creates the product_attributes table for storing product attributes
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/create_systemproductattribute_table.js
 */

const createSystemProductAttributeTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Create product_attributes table...');
    await connection.beginTransaction();

    // Create product_attributes table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.commit();
    console.log('✅ Migration completed successfully: product_attributes table created');
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
  createSystemProductAttributeTable()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSystemProductAttributeTable };
