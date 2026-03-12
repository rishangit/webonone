const { pool } = require('../../config/database');

const createCompanyWebPagesTable = async () => {
  try {
    console.log('Creating company_web_pages table...');
    
    // Create table without foreign key first
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_web_pages (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        isActive BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_active (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Attempt to add foreign key constraint separately to handle potential collation issues
    try {
      const [fkCheck] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_web_pages' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND CONSTRAINT_NAME LIKE '%companyId%'
      `);

      if (fkCheck.length === 0) {
        await pool.execute(`
          ALTER TABLE company_web_pages 
          ADD CONSTRAINT fk_company_web_pages_companyId 
          FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint added successfully');
      } else {
        console.log('✅ Foreign key constraint already exists');
      }
    } catch (fkError) {
      // Foreign key constraint may fail due to collation mismatch, but table will still work
      console.warn('⚠️  Warning: Could not add foreign key constraint:', fkError.message);
      console.warn('⚠️  Table created without foreign key constraint. It will still function correctly.');
    }
    
    console.log('✅ company_web_pages table created successfully');
    
    // Test the table
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM company_web_pages');
    console.log(`✅ Table verified. Current record count: ${rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating company_web_pages table:', error.message);
    process.exit(1);
  }
};

// Run the script
createCompanyWebPagesTable();
