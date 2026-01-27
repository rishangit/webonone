const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

const migrateSalesItemsToTable = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration: Normalize sales items to company_sales_items table');
    console.log('   - Creating company_sales_items table');
    console.log('   - Migrating existing data from JSON columns');
    console.log('   - Removing servicesUsed and productsUsed columns from company_sales');
    
    await connection.beginTransaction();
    
    // Step 1: Create company_sales_items table
    console.log('\n📋 Step 1: Creating company_sales_items table...');
    try {
      // First check the charset and collation of company_sales.id
      const [columnInfo] = await connection.execute(`
        SELECT CHARACTER_SET_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'id'
      `);
      
      const charset = columnInfo[0]?.CHARACTER_SET_NAME || 'utf8mb4';
      const collation = columnInfo[0]?.COLLATION_NAME || 'utf8mb4_unicode_ci';
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS company_sales_items (
          id VARCHAR(10) CHARACTER SET ${charset} COLLATE ${collation} PRIMARY KEY,
          saleId VARCHAR(10) CHARACTER SET ${charset} COLLATE ${collation} NOT NULL,
          itemType ENUM('service', 'product') NOT NULL,
          serviceId VARCHAR(10) CHARACTER SET ${charset} COLLATE ${collation} DEFAULT NULL,
          productId VARCHAR(10) CHARACTER SET ${charset} COLLATE ${collation} DEFAULT NULL,
          variantId VARCHAR(10) CHARACTER SET ${charset} COLLATE ${collation} DEFAULT NULL,
          quantity INT NOT NULL DEFAULT 1,
          unitPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
          discount DECIMAL(5, 2) NOT NULL DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_sale (saleId),
          INDEX idx_service (serviceId),
          INDEX idx_product (productId),
          INDEX idx_variant (variantId),
          INDEX idx_item_type (itemType),
          FOREIGN KEY (saleId) REFERENCES company_sales(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collation}
      `);
      console.log('   ✅ company_sales_items table created');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  company_sales_items table already exists, skipping creation...');
      } else {
        throw error;
      }
    }
    
    // Step 2: Migrate existing data from JSON columns
    console.log('\n📋 Step 2: Migrating existing data from JSON columns...');
    
    // Get all sales with servicesUsed or productsUsed
    const [sales] = await connection.execute(`
      SELECT id, servicesUsed, productsUsed 
      FROM company_sales 
      WHERE (servicesUsed IS NOT NULL AND servicesUsed != '') 
         OR (productsUsed IS NOT NULL AND productsUsed != '')
    `);
    
    console.log(`   Found ${sales.length} sales with items to migrate`);
    
    let itemsMigrated = 0;
    let salesProcessed = 0;
    
    for (const sale of sales) {
      try {
        // Process servicesUsed
        if (sale.servicesUsed) {
          let services = [];
          try {
            services = typeof sale.servicesUsed === 'string' 
              ? JSON.parse(sale.servicesUsed) 
              : sale.servicesUsed;
          } catch (e) {
            console.log(`   ⚠️  Error parsing servicesUsed for sale ${sale.id}:`, e.message);
            continue;
          }
          
          if (Array.isArray(services) && services.length > 0) {
            for (const service of services) {
              if (service.serviceId && service.quantity && service.unitPrice !== undefined) {
                const itemId = nanoid(10);
                await connection.execute(`
                  INSERT INTO company_sales_items (
                    id, saleId, itemType, serviceId, 
                    quantity, unitPrice, discount, createdAt
                  ) VALUES (?, ?, 'service', ?, ?, ?, ?, NOW())
                `, [
                  itemId,
                  sale.id,
                  service.serviceId,
                  service.quantity || 1,
                  parseFloat(service.unitPrice) || 0,
                  parseFloat(service.discount) || 0
                ]);
                itemsMigrated++;
              }
            }
          }
        }
        
        // Process productsUsed
        if (sale.productsUsed) {
          let products = [];
          try {
            products = typeof sale.productsUsed === 'string' 
              ? JSON.parse(sale.productsUsed) 
              : sale.productsUsed;
          } catch (e) {
            console.log(`   ⚠️  Error parsing productsUsed for sale ${sale.id}:`, e.message);
            continue;
          }
          
          if (Array.isArray(products) && products.length > 0) {
            for (const product of products) {
              if (product.productId && product.quantity && product.unitPrice !== undefined) {
                const itemId = nanoid(10);
                await connection.execute(`
                  INSERT INTO company_sales_items (
                    id, saleId, itemType, productId, variantId,
                    quantity, unitPrice, discount, createdAt
                  ) VALUES (?, ?, 'product', ?, ?, ?, ?, ?, NOW())
                `, [
                  itemId,
                  sale.id,
                  product.productId,
                  product.variantId || null,
                  product.quantity || 1,
                  parseFloat(product.unitPrice) || 0,
                  parseFloat(product.discount) || 0
                ]);
                itemsMigrated++;
              }
            }
          }
        }
        
        salesProcessed++;
      } catch (error) {
        console.error(`   ❌ Error migrating sale ${sale.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ Migrated ${itemsMigrated} items from ${salesProcessed} sales`);
    
    // Step 3: Remove servicesUsed and productsUsed columns from company_sales
    console.log('\n📋 Step 3: Removing JSON columns from company_sales...');
    
    // Remove servicesUsed column
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'servicesUsed'
      `);
      
      if (columns.length > 0) {
        await connection.execute(`
          ALTER TABLE company_sales 
          DROP COLUMN servicesUsed
        `);
        console.log('   ✅ servicesUsed column removed');
      } else {
        console.log('   ⚠️  servicesUsed column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing servicesUsed column:', error.message);
      throw error;
    }
    
    // Remove productsUsed column
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'productsUsed'
      `);
      
      if (columns.length > 0) {
        await connection.execute(`
          ALTER TABLE company_sales 
          DROP COLUMN productsUsed
        `);
        console.log('   ✅ productsUsed column removed');
      } else {
        console.log('   ⚠️  productsUsed column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing productsUsed column:', error.message);
      throw error;
    }
    
    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log(`   - ${itemsMigrated} items migrated to company_sales_items`);
    console.log('   - servicesUsed and productsUsed columns removed from company_sales');
    
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
  migrateSalesItemsToTable()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSalesItemsToTable };

