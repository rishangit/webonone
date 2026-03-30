/**
 * Idempotent: ensures company_web_layout_components exists (also in initDatabase.js).
 * For legacy installs with company_web_headers / company_web_footers, run
 * migrateToCompanyWebLayoutComponents.js to merge and drop legacy tables.
 */
const { pool } = require('../../config/database');

async function run() {
  try {
    console.log('Ensuring company_web_layout_components table exists...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS company_web_layout_components (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        kind ENUM('header', 'footer') NOT NULL,
        name VARCHAR(255) NOT NULL,
        isDefault BOOLEAN DEFAULT FALSE,
        content JSON NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company_kind (companyId, kind),
        INDEX idx_default_kind (companyId, kind, isDefault)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ company_web_layout_components ready');
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

run();
