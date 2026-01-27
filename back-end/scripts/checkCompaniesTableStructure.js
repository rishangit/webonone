const { pool } = require('../config/database');

async function checkCompaniesTableStructure() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Checking companies table structure...\n');
    
    // Get all columns from companies table
    const [columns] = await connection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Current columns in companies table:');
    console.log('=====================================');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT !== null ? `DEFAULT: ${col.COLUMN_DEFAULT}` : ''}`);
    });
    
    console.log('\n');
    
    // Check specifically for address-related columns
    const addressColumns = ['address', 'city', 'state', 'postalCode', 'country', 'latitude', 'longitude'];
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    console.log('Address-related columns status:');
    console.log('================================');
    addressColumns.forEach(colName => {
      if (existingColumns.includes(colName)) {
        console.log(`✅ ${colName} - EXISTS`);
      } else {
        console.log(`❌ ${colName} - MISSING`);
      }
    });
    
    const missingColumns = addressColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`\n⚠️  Missing columns: ${missingColumns.join(', ')}`);
      console.log('Run the migration script: node scripts/addAddressColumnsToCompanies.js');
    } else {
      console.log('\n✅ All address columns exist!');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run check
checkCompaniesTableStructure()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });

