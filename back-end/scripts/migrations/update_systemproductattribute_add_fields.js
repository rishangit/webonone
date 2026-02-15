const { pool } = require('../../config/database');

/**
 * Migration: Update systemproductattribute table to add description and unit_of_measure
 * This migration adds description and unit_of_measure fields to the systemproductattribute table.
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/update_systemproductattribute_add_fields.js
 */

const updateSystemProductAttributeTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Update systemproductattribute table...');
    await connection.beginTransaction();

    // Check if description column exists, if not add it
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'description'
    `);

    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE product_attributes 
        ADD COLUMN description TEXT AFTER name
      `);
      console.log('✅ Added description column to systemproductattribute table');
    } else {
      console.log('ℹ️  description column already exists');
    }

    // Check if unit_of_measure column exists, if not add it
    const [unitColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'unit_of_measure'
    `);

    if (unitColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE product_attributes 
        ADD COLUMN unit_of_measure VARCHAR(10) AFTER description,
        ADD INDEX idx_unit_of_measure (unit_of_measure),
        ADD FOREIGN KEY (unit_of_measure) REFERENCES units_of_measure(id) ON DELETE SET NULL
      `);
      console.log('✅ Added unit_of_measure column to systemproductattribute table');
    } else {
      console.log('ℹ️  unit_of_measure column already exists');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: systemproductattribute table updated');
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
  updateSystemProductAttributeTable()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateSystemProductAttributeTable };
