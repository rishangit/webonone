const { pool } = require('../../config/database');

const addContentColumn = async () => {
  try {
    console.log('Adding content column to company_web_pages table...');
    
    // Check if column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_web_pages' 
      AND COLUMN_NAME = 'content'
    `);

    if (columns.length > 0) {
      console.log('✅ Content column already exists');
      process.exit(0);
      return;
    }

    // Add content column as JSON type
    await pool.execute(`
      ALTER TABLE company_web_pages 
      ADD COLUMN content JSON NULL
    `);
    
    console.log('✅ Content column added successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding content column:', error.message);
    process.exit(1);
  }
};

// Run the script
addContentColumn();
