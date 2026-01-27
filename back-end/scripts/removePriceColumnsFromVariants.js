const { pool } = require('../config/database');

async function removePriceColumnsFromVariants() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Removing price columns (costPrice, sellPrice) from company_product_variants table...');
    
    // Check current columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_variants'
      AND COLUMN_NAME IN ('costPrice', 'sellPrice')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.length === 0) {
      console.log('⚠️  No price columns found in company_product_variants table');
      await connection.rollback();
      return;
    }
    
    console.log(`Found ${existingColumns.length} price columns to remove: ${existingColumns.join(', ')}`);
    
    // Remove columns one by one
    if (existingColumns.includes('costPrice')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN costPrice
      `);
      console.log('✅ Removed costPrice column');
    }
    
    if (existingColumns.includes('sellPrice')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        DROP COLUMN sellPrice
      `);
      console.log('✅ Removed sellPrice column');
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
removePriceColumnsFromVariants()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

