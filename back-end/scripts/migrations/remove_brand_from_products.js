const { pool } = require('../../config/database');

/**
 * Migration: Remove brand column from products table
 * This migration removes the brand column from the products table
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/remove_brand_from_products.js
 */

const removeBrandColumn = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Remove brand column from products table...');
    await connection.beginTransaction();

    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'brand'
    `);

    if (columns.length > 0) {
      // Remove index on brand column if it exists
      try {
        await connection.execute(`DROP INDEX idx_brand ON products`);
        console.log('✅ Removed idx_brand index');
      } catch (error) {
        // Index might not exist, that's okay
        console.log('ℹ️  Index idx_brand does not exist or already removed');
      }

      // Remove brand column
      await connection.execute(`ALTER TABLE products DROP COLUMN brand`);
      console.log('✅ Removed brand column from products table');
    } else {
      console.log('ℹ️  Brand column does not exist, skipping...');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: brand column removed from products');
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
  removeBrandColumn()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { removeBrandColumn };
