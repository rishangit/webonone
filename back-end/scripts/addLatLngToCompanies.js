const { pool } = require('../config/database');

async function addLatLngToCompanies() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Adding latitude and longitude columns to companies table...');
    
    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies' 
      AND COLUMN_NAME IN ('latitude', 'longitude')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('latitude')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL
        AFTER address
      `);
      console.log('✅ Added latitude column');
    } else {
      console.log('⚠️  latitude column already exists');
    }
    
    if (!existingColumns.includes('longitude')) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL
        AFTER latitude
      `);
      console.log('✅ Added longitude column');
    } else {
      console.log('⚠️  longitude column already exists');
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
addLatLngToCompanies()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

