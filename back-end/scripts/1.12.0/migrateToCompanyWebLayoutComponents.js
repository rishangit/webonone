/**
 * Idempotent migration:
 * - Ensures company_web_layout_components exists
 * - Copies data from company_web_headers / company_web_footers (with kind) when present
 * - Drops legacy tables after successful copy
 *
 * CLI: node scripts/1.12.0/migrateToCompanyWebLayoutComponents.js
 * Also invoked from initDatabase.js createTables (idempotent).
 */
const { pool } = require('../../config/database');

const TABLE = 'company_web_layout_components';

async function ensureLayoutComponentsTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
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

  const [fkCheck] = await connection.execute(
    `
    SELECT CONSTRAINT_NAME
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = ?
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND CONSTRAINT_NAME LIKE '%companyId%'
  `,
    [TABLE]
  );

  if (fkCheck.length === 0) {
    try {
      await connection.execute(`
        ALTER TABLE ${TABLE}
        ADD CONSTRAINT fk_company_web_layout_components_companyId
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key fk_company_web_layout_components_companyId added');
    } catch (e) {
      console.warn(
        '⚠️  Could not add foreign key for company_web_layout_components (table still usable):',
        e.message
      );
    }
  }
}

async function tableExists(connection, name) {
  const [rows] = await connection.execute(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [name]
  );
  return rows.length > 0;
}

/**
 * @param {import('mysql2/promise').Pool} poolRef
 */
async function migrateCompanyWebLayoutComponentsLegacy(poolRef) {
  const connection = await poolRef.getConnection();
  try {
    await connection.beginTransaction();

    await ensureLayoutComponentsTable(connection);

    if (await tableExists(connection, 'company_web_headers')) {
      const [res] = await connection.execute(`
        INSERT IGNORE INTO ${TABLE} (id, companyId, kind, name, isDefault, content, createdAt, updatedAt)
        SELECT id, companyId, 'header', name, isDefault, content, createdAt, updatedAt
        FROM company_web_headers
      `);
      console.log(
        `✅ Migrated company_web_headers (insert attempts / affected: ${res.affectedRows ?? res.changedRows ?? 'n/a'})`
      );
      await connection.execute('DROP TABLE company_web_headers');
      console.log('✅ Dropped company_web_headers');
    }

    if (await tableExists(connection, 'company_web_footers')) {
      const [res] = await connection.execute(`
        INSERT IGNORE INTO ${TABLE} (id, companyId, kind, name, isDefault, content, createdAt, updatedAt)
        SELECT id, companyId, 'footer', name, isDefault, content, createdAt, updatedAt
        FROM company_web_footers
      `);
      console.log(
        `✅ Migrated company_web_footers (insert attempts / affected: ${res.affectedRows ?? res.changedRows ?? 'n/a'})`
      );
      await connection.execute('DROP TABLE company_web_footers');
      console.log('✅ Dropped company_web_footers');
    }

    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

async function runCli() {
  try {
    console.log(`Ensuring ${TABLE} and migrating legacy header/footer data if present...`);
    await migrateCompanyWebLayoutComponentsLegacy(pool);
    console.log(`✅ ${TABLE} migration complete`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

module.exports = {
  migrateCompanyWebLayoutComponentsLegacy,
  ensureLayoutComponentsTable,
};

if (require.main === module) {
  runCli();
}
