const { pool } = require('../config/database');

async function checkCompanySizeColumn() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Checking companySize column type...\n');
    
    // Get column information
    const [columns] = await connection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies'
      AND COLUMN_NAME = 'companySize'
    `);
    
    if (columns.length === 0) {
      console.log('❌ companySize column does not exist!');
      console.log('Run: node scripts/addCompanySizeEnum.js');
      return;
    }
    
    const column = columns[0];
    console.log('companySize Column Information:');
    console.log('================================');
    console.log(`Column Name: ${column.COLUMN_NAME}`);
    console.log(`Data Type: ${column.DATA_TYPE}`);
    console.log(`Column Type: ${column.COLUMN_TYPE}`);
    console.log(`Nullable: ${column.IS_NULLABLE}`);
    console.log(`Default: ${column.COLUMN_DEFAULT}`);
    
    if (column.DATA_TYPE === 'enum') {
      console.log('\n✅ Column is ENUM type');
      console.log(`   Allowed values: ${column.COLUMN_TYPE}`);
    } else {
      console.log('\n⚠️  Column is NOT ENUM type!');
      console.log('   Current type:', column.DATA_TYPE);
      console.log('   Run: node scripts/addCompanySizeEnum.js to fix');
    }
    
    // Check a sample of existing data
    const [samples] = await connection.execute(`
      SELECT id, name, companySize 
      FROM companies 
      WHERE companySize IS NOT NULL 
      LIMIT 5
    `);
    
    if (samples.length > 0) {
      console.log('\nSample companies with companySize:');
      samples.forEach(company => {
        console.log(`  - ${company.name}: ${company.companySize}`);
      });
    } else {
      console.log('\n⚠️  No companies have companySize set');
    }
    
  } catch (error) {
    console.error('❌ Error checking column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run check
checkCompanySizeColumn()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });

