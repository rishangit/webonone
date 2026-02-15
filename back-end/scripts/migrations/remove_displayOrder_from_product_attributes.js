const { pool } = require('../../config/database');

/**
 * Migration: Remove displayOrder column from product_attributes table
 * This migration removes the displayOrder column from the product_attributes table.
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/remove_displayOrder_from_product_attributes.js
 */

const removeDisplayOrderFromProductAttributes = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Remove displayOrder from product_attributes...');
    await connection.beginTransaction();

    // Check if the column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'displayOrder'
    `);

    if (columns.length > 0) {
      // Remove the index first if it exists
      try {
        await connection.execute(`
          ALTER TABLE product_attributes DROP INDEX idx_display_order
        `);
        console.log('✅ Removed idx_display_order index');
      } catch (error) {
        // Index might not exist, continue
        console.log('ℹ️  Index idx_display_order not found or already removed');
      }

      // Remove the column
      await connection.execute(`
        ALTER TABLE product_attributes DROP COLUMN displayOrder
      `);
      console.log('✅ Removed displayOrder column from product_attributes table');
    } else {
      console.log('ℹ️  displayOrder column not found. It may have already been removed.');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: displayOrder column removed');
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
  removeDisplayOrderFromProductAttributes()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeDisplayOrderFromProductAttributes };
