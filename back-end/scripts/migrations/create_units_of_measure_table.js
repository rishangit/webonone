const { pool } = require('../../config/database');

/**
 * Migration: Create units_of_measure table
 * This migration creates the units_of_measure table for storing measurement units
 * that can be used for product attributes.
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/create_units_of_measure_table.js
 */

const createUnitsOfMeasureTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Create units_of_measure table...');
    await connection.beginTransaction();

    // Create units_of_measure table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS units_of_measure (
        id VARCHAR(10) PRIMARY KEY,
        unit_name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        base_unit VARCHAR(10),
        multiplier DECIMAL(20, 10) DEFAULT 1.0,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_unit_name (unit_name),
        INDEX idx_symbol (symbol),
        INDEX idx_active (isActive),
        INDEX idx_base_unit (base_unit),
        FOREIGN KEY (base_unit) REFERENCES units_of_measure(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.commit();
    console.log('✅ Migration completed successfully: units_of_measure table created');
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
  createUnitsOfMeasureTable()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { createUnitsOfMeasureTable };
