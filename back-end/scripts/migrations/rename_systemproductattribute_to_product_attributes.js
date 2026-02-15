const { pool } = require('../../config/database');

/**
 * Migration: Rename systemproductattribute table to product_attributes
 * This migration renames the table to align with the naming convention of other tables.
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/rename_systemproductattribute_to_product_attributes.js
 */

const renameSystemProductAttributeTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Rename systemproductattribute to product_attributes...');
    await connection.beginTransaction();

    // Check if the old table exists
    const [oldTable] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'systemproductattribute'
    `);

    if (oldTable.length > 0) {
      // Check if the new table already exists
      const [newTable] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'product_attributes'
      `);

      if (newTable.length > 0) {
        console.log('ℹ️  product_attributes table already exists. Skipping rename.');
      } else {
        // Rename the table
        await connection.execute(`
          RENAME TABLE systemproductattribute TO product_attributes
        `);
        console.log('✅ Renamed systemproductattribute table to product_attributes');
      }
    } else {
      console.log('ℹ️  systemproductattribute table not found. It may have already been renamed or does not exist.');
    }

    await connection.commit();
    console.log('✅ Migration completed successfully: Table renamed');
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
  renameSystemProductAttributeTable()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { renameSystemProductAttributeTable };
