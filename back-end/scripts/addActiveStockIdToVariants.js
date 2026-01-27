const { pool } = require('../config/database');

async function addActiveStockIdColumn() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Adding activeStockId column to company_product_variants table...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_variants' 
      AND COLUMN_NAME = 'activeStockId'
    `);
    
    if (columns.length === 0) {
      // Add the column
      await connection.execute(`
        ALTER TABLE company_product_variants 
        ADD COLUMN activeStockId VARCHAR(255) DEFAULT NULL 
        AFTER isActive
      `);
      
      // Add foreign key constraint
      await connection.execute(`
        ALTER TABLE company_product_variants 
        ADD CONSTRAINT fk_variant_active_stock 
        FOREIGN KEY (activeStockId) 
        REFERENCES company_product_stock(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      
      console.log('✅ Successfully added activeStockId column to company_product_variants table');
      
      // Set activeStockId for existing variants based on their first active stock entry
      console.log('Setting activeStockId for existing variants...');
      const [variants] = await connection.execute(`
        SELECT id FROM company_product_variants WHERE activeStockId IS NULL
      `);
      
      for (const variant of variants) {
        // Find the first active stock entry for this variant
        const [stocks] = await connection.execute(`
          SELECT id FROM company_product_stock 
          WHERE variantId = ? AND isActive = 1 
          ORDER BY createdAt ASC 
          LIMIT 1
        `, [variant.id]);
        
        if (stocks.length > 0) {
          await connection.execute(`
            UPDATE company_product_variants 
            SET activeStockId = ? 
            WHERE id = ?
          `, [stocks[0].id, variant.id]);
        }
      }
      
      console.log(`✅ Updated ${variants.length} variants with activeStockId`);
    } else {
      console.log('⚠️  Column activeStockId already exists in company_product_variants table');
    }
    
  } catch (error) {
    console.error('❌ Error adding activeStockId column:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the migration
if (require.main === module) {
  addActiveStockIdColumn()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addActiveStockIdColumn };

