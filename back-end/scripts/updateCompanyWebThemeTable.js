const { pool } = require('../config/database');

async function updateCompanyWebThemeTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Updating company_web_theme table...');
    
    // Check if table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_web_theme'
    `);
    
    if (tables.length === 0) {
      console.log('⚠️  company_web_theme table does not exist. Please run createCompanyWebThemeTable.js first');
      await connection.rollback();
      return;
    }
    
    // Get current columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_web_theme'
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    // Remove old columns if they exist
    const columnsToRemove = ['theme', 'accentColor', 'primaryColor', 'secondaryColor', 'textColor', 'description'];
    for (const col of columnsToRemove) {
      if (existingColumns.includes(col)) {
        console.log(`Removing column: ${col}`);
        await connection.execute(`ALTER TABLE company_web_theme DROP COLUMN ${col}`);
      }
    }
    
    // Add new columns if they don't exist
    const columnsToAdd = [
      { name: 'bodyTextColor', type: 'VARCHAR(50) DEFAULT NULL' },
      { name: 'headingColor', type: 'VARCHAR(50) DEFAULT NULL' },
      { name: 'h1Font', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'h2Font', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'h3Font', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'h4Font', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'h5Font', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'googleFontUrl', type: 'TEXT DEFAULT NULL' },
    ];
    
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await connection.execute(`ALTER TABLE company_web_theme ADD COLUMN ${col.name} ${col.type}`);
      }
    }
    
    // Rename backgroundColor if it exists (it should stay, just make sure it's for body background)
    if (existingColumns.includes('backgroundColor')) {
      console.log('✅ backgroundColor column already exists');
    } else {
      console.log('Adding backgroundColor column');
      await connection.execute(`ALTER TABLE company_web_theme ADD COLUMN backgroundColor VARCHAR(50) DEFAULT NULL`);
    }
    
    console.log('✅ company_web_theme table updated successfully');
    
    await connection.commit();
    console.log('✅ Transaction committed');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error updating company_web_theme table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateCompanyWebThemeTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { updateCompanyWebThemeTable };
