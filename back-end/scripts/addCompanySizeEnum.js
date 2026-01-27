const { pool } = require('../config/database');

async function addCompanySizeEnum() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Adding companySize ENUM column to companies table...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies' 
      AND COLUMN_NAME = 'companySize'
    `);
    
    if (columns.length > 0) {
      console.log('⚠️  companySize column already exists. Dropping and recreating...');
      await connection.execute('ALTER TABLE companies DROP COLUMN companySize');
    }
    
    // Add companySize ENUM column
    await connection.execute(`
      ALTER TABLE companies 
      ADD COLUMN companySize ENUM('1-5', '6-10', '11-20', '21-50', '51-200', '201-500', '500+') 
      DEFAULT NULL
      AFTER website
    `);
    
    console.log('✅ Successfully added companySize ENUM column to companies table');
    
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
addCompanySizeEnum()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

