const { pool } = require('../../config/database');

const createCompanyWebContentTable = async () => {
  try {
    console.log('Creating company_web_content table...');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_web_content (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        pageId VARCHAR(10) NOT NULL,
        contentElementId VARCHAR(50) NOT NULL,
        addonType VARCHAR(50) NOT NULL,
        addonData JSON NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_page (pageId),
        INDEX idx_content_element (contentElementId),
        INDEX idx_company_content (companyId, contentElementId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ company_web_content table created/verified successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating company_web_content table:', error.message);
    process.exit(1);
  }
};

createCompanyWebContentTable();
