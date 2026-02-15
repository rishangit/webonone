const { pool } = require('../../config/database');

/**
 * Migration: Update systemproductattribute table - remove productId and value, rename type to valueDataType
 * This migration removes productId and value columns, and renames type to valueDataType.
 * 
 * Run this script to update the live environment:
 * node scripts/migrations/update_systemproductattribute_remove_fields.js
 */

const updateSystemProductAttributeTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: Update systemproductattribute table...');
    await connection.beginTransaction();

    // Check if valueDataType column exists, if not rename type to valueDataType
    const [typeColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'type'
    `);

    if (typeColumns.length > 0) {
      await connection.execute(`
        ALTER TABLE product_attributes 
        CHANGE COLUMN type valueDataType ENUM('text', 'number', 'boolean', 'date', 'json') DEFAULT 'text'
      `);
      console.log('✅ Renamed type column to valueDataType');
    } else {
      console.log('ℹ️  valueDataType column already exists or type column not found');
    }

    // Remove productId column and its foreign key
    const [productIdColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'productId'
    `);

    if (productIdColumns.length > 0) {
      // First, drop the foreign key constraint
      const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'product_attributes' 
        AND COLUMN_NAME = 'productId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (constraints.length > 0) {
        for (const constraint of constraints) {
          await connection.execute(`
            ALTER TABLE product_attributes 
            DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
          `);
          console.log(`✅ Dropped foreign key constraint: ${constraint.CONSTRAINT_NAME}`);
        }
      }

      // Drop the index on productId
      await connection.execute(`
        ALTER TABLE product_attributes 
        DROP INDEX idx_product
      `).catch(() => {
        console.log('ℹ️  idx_product index not found or already dropped');
      });

      // Remove productId column
      await connection.execute(`
        ALTER TABLE product_attributes 
        DROP COLUMN productId
      `);
      console.log('✅ Removed productId column');
    } else {
      console.log('ℹ️  productId column already removed');
    }

    // Remove value column
    const [valueColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_attributes' 
      AND COLUMN_NAME = 'value'
    `);

    if (valueColumns.length > 0) {
      await connection.execute(`
        ALTER TABLE product_attributes 
        DROP COLUMN value
      `);
      console.log('✅ Removed value column');
    } else {
      console.log('ℹ️  value column already removed');
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
