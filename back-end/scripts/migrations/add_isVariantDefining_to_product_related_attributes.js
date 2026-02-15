const { pool } = require('../../config/database');

/**
 * Migration: Add isVariantDefining column to product_related_attributes table
 * This migration adds support for marking which attributes define product variants
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/add_isVariantDefining_to_product_related_attributes.js
 */

const addIsVariantDefiningColumn = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Add isVariantDefining column to product_related_attributes...');
    await connection.beginTransaction();

    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_related_attributes' 
      AND COLUMN_NAME = 'isVariantDefining'
    `);

    if (columns.length === 0) {
      // Add isVariantDefining column
      await connection.execute(`
        ALTER TABLE product_related_attributes 
        ADD COLUMN isVariantDefining BOOLEAN DEFAULT FALSE AFTER attributeId
      `);

      // Add index for better query performance
      await connection.execute(`
        CREATE INDEX idx_variant_defining 
        ON product_related_attributes(productId, isVariantDefining)
      `);

      console.log('✅ Added isVariantDefining column and index');
    } else {
      console.log('ℹ️  Column isVariantDefining already exists, skipping...');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: isVariantDefining column added');
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
  addIsVariantDefiningColumn()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addIsVariantDefiningColumn };
