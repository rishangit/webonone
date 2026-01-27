const { pool } = require('../config/database');

async function setupCompanyWebThemeTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Setting up company_web_theme table...');
    
    // Check if table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_web_theme'
    `);
    
    if (tables.length === 0) {
      // Create table with new structure
      console.log('Creating company_web_theme table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS company_web_theme (
          id VARCHAR(10) PRIMARY KEY,
          companyId VARCHAR(10) NOT NULL,
          name VARCHAR(255) NOT NULL,
          backgroundColor VARCHAR(50) DEFAULT NULL,
          bodyTextColor VARCHAR(50) DEFAULT NULL,
          headingColor VARCHAR(50) DEFAULT NULL,
          h1Font VARCHAR(255) DEFAULT NULL,
          h2Font VARCHAR(255) DEFAULT NULL,
          h3Font VARCHAR(255) DEFAULT NULL,
          h4Font VARCHAR(255) DEFAULT NULL,
          h5Font VARCHAR(255) DEFAULT NULL,
          googleFontUrl TEXT DEFAULT NULL,
          isActive BOOLEAN DEFAULT FALSE,
          isDefault BOOLEAN DEFAULT FALSE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_company (companyId),
          INDEX idx_active (isActive),
          INDEX idx_default (isDefault),
          FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('✅ company_web_theme table created successfully');
    } else {
      // Table exists, update it
      console.log('Table exists, updating structure...');
      
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
      
      // Ensure backgroundColor exists
      if (!existingColumns.includes('backgroundColor')) {
        console.log('Adding backgroundColor column');
        await connection.execute(`ALTER TABLE company_web_theme ADD COLUMN backgroundColor VARCHAR(50) DEFAULT NULL`);
      }
      
      console.log('✅ company_web_theme table updated successfully');
    }
    
    await connection.commit();
    console.log('✅ Transaction committed');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error setting up company_web_theme table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  setupCompanyWebThemeTable()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupCompanyWebThemeTable };
