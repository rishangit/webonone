const { pool } = require('../config/database');

async function addAddressColumnsToCompanies() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Adding address columns (city, state, postalCode, country) to companies table...');
    
    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies' 
      AND COLUMN_NAME IN ('city', 'state', 'postalCode', 'country')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('city')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN city VARCHAR(255) DEFAULT NULL
        AFTER address
      `);
      console.log('✅ Added city column');
    } else {
      console.log('⚠️  city column already exists');
    }
    
    if (!existingColumns.includes('state')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN state VARCHAR(255) DEFAULT NULL
        AFTER city
      `);
      console.log('✅ Added state column');
    } else {
      console.log('⚠️  state column already exists');
    }
    
    if (!existingColumns.includes('postalCode')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN postalCode VARCHAR(20) DEFAULT NULL
        AFTER state
      `);
      console.log('✅ Added postalCode column');
    } else {
      console.log('⚠️  postalCode column already exists');
    }
    
    if (!existingColumns.includes('country')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN country VARCHAR(255) DEFAULT NULL
        AFTER postalCode
      `);
      console.log('✅ Added country column');
    } else {
      console.log('⚠️  country column already exists');
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
addAddressColumnsToCompanies()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

