const { pool } = require('../config/database');

async function createCompanyWebThemeTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Creating company_web_theme table...');
    
    // Check if table already exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_web_theme'
    `);
    
    if (tables.length > 0) {
      console.log('⚠️  company_web_theme table already exists');
      await connection.rollback();
      return;
    }
    
    // Create company_web_theme table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_web_theme (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        theme ENUM('light', 'dark', 'system') DEFAULT 'light',
        accentColor VARCHAR(50) DEFAULT 'orange',
        primaryColor VARCHAR(50) DEFAULT NULL,
        secondaryColor VARCHAR(50) DEFAULT NULL,
        backgroundColor VARCHAR(50) DEFAULT NULL,
        textColor VARCHAR(50) DEFAULT NULL,
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
    
    await connection.commit();
    console.log('✅ Transaction committed');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating company_web_theme table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  createCompanyWebThemeTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createCompanyWebThemeTable };
