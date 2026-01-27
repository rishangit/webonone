const { pool } = require('../config/database');

async function addMinMaxStockColumns() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Adding minStock and maxStock columns to company_product_variants table...');
    
    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_variants' 
      AND COLUMN_NAME IN ('minStock', 'maxStock')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    // Add minStock column if it doesn't exist
    if (!existingColumns.includes('minStock')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        ADD COLUMN minStock INT DEFAULT 10 
        AFTER activeStockId
      `);
      console.log('✅ Successfully added minStock column to company_product_variants table');
    } else {
      console.log('⚠️  Column minStock already exists in company_product_variants table');
    }
    
    // Add maxStock column if it doesn't exist
    if (!existingColumns.includes('maxStock')) {
      await connection.execute(`
        ALTER TABLE company_product_variants 
        ADD COLUMN maxStock INT DEFAULT 100 
        AFTER minStock
      `);
      console.log('✅ Successfully added maxStock column to company_product_variants table');
    } else {
      console.log('⚠️  Column maxStock already exists in company_product_variants table');
    }
    
    // Update existing rows with default values if they are NULL
    if (!existingColumns.includes('minStock') || !existingColumns.includes('maxStock')) {
      console.log('Setting default values for existing variants...');
      const [result] = await connection.execute(`
        UPDATE company_product_variants 
        SET minStock = COALESCE(minStock, 10),
            maxStock = COALESCE(maxStock, 100)
        WHERE minStock IS NULL OR maxStock IS NULL
      `);
      console.log(`✅ Updated ${result.affectedRows} variants with default min/max stock values`);
    }
    
  } catch (error) {
    console.error('❌ Error adding minStock and maxStock columns:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the migration
if (require.main === module) {
  addMinMaxStockColumns()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addMinMaxStockColumns };

