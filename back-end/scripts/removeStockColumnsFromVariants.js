const { pool } = require('../config/database');

async function removeStockColumnsFromVariants() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Removing stock columns from company_product_variants table...');
    
    // Check current columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_variants'
      AND COLUMN_NAME IN ('currentStock', 'minStock', 'maxStock', 'stockUnit')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.length === 0) {
      console.log('⚠️  No stock columns found in company_product_variants table');
      await connection.rollback();
      return;
    }
    
    console.log(`Found ${existingColumns.length} stock columns to remove: ${existingColumns.join(', ')}`);
    
    // Remove columns one by one
    if (existingColumns.includes('currentStock')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN currentStock
      `);
      console.log('✅ Removed currentStock column');
    }
    
    if (existingColumns.includes('minStock')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN minStock
      `);
      console.log('✅ Removed minStock column');
    }
    
    if (existingColumns.includes('maxStock')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN maxStock
      `);
      console.log('✅ Removed maxStock column');
    }
    
    if (existingColumns.includes('stockUnit')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN stockUnit
      `);
      console.log('✅ Removed stockUnit column');
    }
    
    await connection.commit();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
removeStockColumnsFromVariants()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

