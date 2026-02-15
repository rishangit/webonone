const { pool } = require('../../config/database');

/**
 * Migration: Remove hardcoded columns from product_variants table
 * This migration removes color, size, weight, and material columns
 * as they are now stored in product_related_attributes_values
 * 
 * IMPORTANT: Run migrate_hardcoded_variant_values_to_attributes.js FIRST!
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/remove_hardcoded_columns_from_product_variants.js
 */

const removeHardcodedColumns = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Remove hardcoded columns from product_variants...');
    await connection.beginTransaction();

    // Check which columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_variants'
      AND COLUMN_NAME IN ('color', 'size', 'weight', 'material')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    const columnsToRemove = ['color', 'size', 'weight', 'material'].filter(col => existingColumns.includes(col));

    if (columnsToRemove.length === 0) {
      console.log('ℹ️  No hardcoded columns found to remove, skipping...');
    } else {
      console.log(`📋 Found columns to remove: ${columnsToRemove.join(', ')}`);

      // Remove columns one by one
      for (const column of columnsToRemove) {
        try {
          await connection.execute(`ALTER TABLE product_variants DROP COLUMN ${column}`);
          console.log(`✅ Removed column: ${column}`);
        } catch (error) {
          // Column might not exist or have dependencies
          console.warn(`⚠️  Could not remove column ${column}: ${error.message}`);
        }
      }
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: Hardcoded columns removed from product_variants');
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
  removeHardcodedColumns()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { removeHardcodedColumns };
