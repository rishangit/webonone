const { pool } = require('../config/database');

async function replaceSupplierFields() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Replacing supplierName and supplierContact with supplierId...');
    
    // Check if supplierId column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_stock' 
      AND COLUMN_NAME = 'supplierId'
    `);
    
    if (columns.length === 0) {
      // Add supplierId column
      await connection.execute(`
        ALTER TABLE company_product_stock 
        ADD COLUMN supplierId VARCHAR(255) DEFAULT NULL 
        AFTER expiryDate
      `);
      
      console.log('✅ Added supplierId column to company_product_stock table');
      
      // Add foreign key constraint
      await connection.execute(`
        ALTER TABLE company_product_stock 
        ADD CONSTRAINT fk_stock_supplier 
        FOREIGN KEY (supplierId) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      
      console.log('✅ Added foreign key constraint for supplierId');
    } else {
      console.log('⚠️  Column supplierId already exists in company_product_stock table');
    }
    
    // Check if supplierName column exists
    const [nameColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_stock' 
      AND COLUMN_NAME = 'supplierName'
    `);
    
    if (nameColumns.length > 0) {
      // Drop supplierName column
      await connection.execute(`
        ALTER TABLE company_product_stock 
        DROP COLUMN supplierName
      `);
      console.log('✅ Removed supplierName column');
    } else {
      console.log('⚠️  Column supplierName does not exist');
    }
    
    // Check if supplierContact column exists
    const [contactColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_stock' 
      AND COLUMN_NAME = 'supplierContact'
    `);
    
    if (contactColumns.length > 0) {
      // Drop supplierContact column
      await connection.execute(`
        ALTER TABLE company_product_stock 
        DROP COLUMN supplierContact
      `);
      console.log('✅ Removed supplierContact column');
    } else {
      console.log('⚠️  Column supplierContact does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error replacing supplier fields:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the migration
if (require.main === module) {
  replaceSupplierFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { replaceSupplierFields };

