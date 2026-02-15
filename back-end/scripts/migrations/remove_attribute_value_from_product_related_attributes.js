const { pool } = require('../../config/database');

/**
 * Migration: Remove attributeValue column from product_related_attributes table
 * This migration removes the attributeValue column as values should be managed separately
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/remove_attribute_value_from_product_related_attributes.js
 */

const removeAttributeValueColumn = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Remove attributeValue column from product_related_attributes...');
    await connection.beginTransaction();

    // Check if column exists and remove it
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_related_attributes' 
      AND COLUMN_NAME = 'attributeValue'
    `);
    
    if (columns.length > 0) {
      await connection.execute(`
        ALTER TABLE product_related_attributes
        DROP COLUMN attributeValue
      `);
      console.log('✅ attributeValue column removed');
    } else {
      console.log('ℹ️  attributeValue column does not exist, skipping');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: attributeValue column removed');
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
  removeAttributeValueColumn()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { removeAttributeValueColumn };
