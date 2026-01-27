const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removeProductIdFromSalesItems = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration: Remove productId from company_sales_items');
    console.log('   - For products, only variantId will be stored');
    console.log('   - Product details can be retrieved from company_product_variants table');
    
    await connection.beginTransaction();
    
    // Step 1: Verify that all product items have variantId
    console.log('\n📋 Step 1: Verifying product items have variantId...');
    const [itemsWithoutVariant] = await connection.execute(`
      SELECT id, saleId, productId, variantId
      FROM company_sales_items
      WHERE itemType = 'product' 
      AND (variantId IS NULL OR variantId = '')
    `);
    
    if (itemsWithoutVariant.length > 0) {
      console.log(`   ⚠️  Found ${itemsWithoutVariant.length} product items without variantId:`);
      itemsWithoutVariant.forEach(item => {
        console.log(`   - Item ID: ${item.id}, Sale ID: ${item.saleId}, Product ID: ${item.productId}`);
      });
      console.log('   ⚠️  These items need variantId before removing productId column');
      console.log('   ⚠️  Migration will continue but these items may need manual fixing');
    } else {
      console.log('   ✅ All product items have variantId');
    }
    
    // Step 2: Remove index on productId if it exists
    console.log('\n📋 Step 2: Removing index on productId...');
    try {
      const [indexes] = await connection.execute(`
        SHOW INDEXES FROM company_sales_items WHERE Column_name = 'productId'
      `);
      
      if (indexes.length > 0) {
        for (const index of indexes) {
          if (index.Key_name !== 'PRIMARY') {
            try {
              await connection.execute(`
                ALTER TABLE company_sales_items DROP INDEX ${index.Key_name}
              `);
              console.log(`   ✅ Dropped index: ${index.Key_name}`);
            } catch (error) {
              console.log(`   ⚠️  Could not drop index ${index.Key_name}: ${error.message}`);
            }
          }
        }
      } else {
        console.log('   ⚠️  No index found on productId column');
      }
    } catch (error) {
      console.log('   ⚠️  Could not check indexes:', error.message);
    }
    
    // Step 3: Remove foreign key constraint if exists
    console.log('\n📋 Step 3: Removing foreign key constraint on productId...');
    try {
      const [fkConstraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales_items' 
        AND COLUMN_NAME = 'productId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (fkConstraints.length > 0) {
        for (const fk of fkConstraints) {
          await connection.execute(`
            ALTER TABLE company_sales_items 
            DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
          `);
          console.log(`   ✅ Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
        }
      } else {
        console.log('   ⚠️  No foreign key constraint found on productId');
      }
    } catch (error) {
      console.log('   ⚠️  Could not drop foreign key:', error.message);
    }
    
    // Step 4: Remove productId column
    console.log('\n📋 Step 4: Removing productId column...');
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales_items' 
        AND COLUMN_NAME = 'productId'
      `);
      
      if (columns.length > 0) {
        await connection.execute(`
          ALTER TABLE company_sales_items 
          DROP COLUMN productId
        `);
        console.log('   ✅ productId column removed from company_sales_items');
      } else {
        console.log('   ⚠️  productId column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing productId column:', error.message);
      throw error;
    }
    
    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log('   - productId column removed from company_sales_items');
    console.log('   - Product items now only store variantId');
    console.log('   - Product details can be retrieved from company_product_variants table');
    
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  removeProductIdFromSalesItems()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeProductIdFromSalesItems };

