const { pool } = require('../../config/database');

/**
 * Idempotent migration script to:
 * 1. Create company_web_themes table if it doesn't exist
 * 2. Optionally migrate data from legacy company_web_theme table (if present)
 *
 * Usage:
 *   node scripts/1.7.1/migrateCreateCompanyWebThemesTable.js
 */

const TABLE_NEW = 'company_web_themes';
const TABLE_OLD = 'company_web_theme';

async function tableExists(tableName) {
  const [rows] = await pool.execute(
    `
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
  `,
    [tableName]
  );
  return rows.length > 0;
}

async function createNewTableIfNeeded() {
  const exists = await tableExists(TABLE_NEW);

  if (exists) {
    console.log(`✅ ${TABLE_NEW} table already exists`);
    return;
  }

  console.log(`Creating ${TABLE_NEW} table...`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NEW} (
      id VARCHAR(10) PRIMARY KEY,
      companyId VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      themeData JSON NOT NULL,
      isActive BOOLEAN DEFAULT FALSE,
      isDefault BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company (companyId),
      INDEX idx_active (isActive),
      INDEX idx_default (isDefault)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log(`✅ ${TABLE_NEW} table created successfully`);
}

function buildThemeDataFromLegacyRow(row) {
  const backgroundColor = row.backgroundColor || '#ffffff';
  const fontColor = row.bodyTextColor || '#000000';

  const textSettings = [];

  const addTextSetting = (key, fontField) => {
    const fontValue = row[fontField];
    if (!fontValue) return;

    textSettings.push({
      styleName: key.toUpperCase(),
      googleFontUrl: row.googleFontUrl || '',
      fontFamily: fontValue,
      fontSize: '',
    });
  };

  addTextSetting('h1', 'h1Font');
  addTextSetting('h2', 'h2Font');
  addTextSetting('h3', 'h3Font');
  addTextSetting('h4', 'h4Font');
  addTextSetting('h5', 'h5Font');
  addTextSetting('p', 'pFont');

  return {
    themeName: row.name,
    basicSetting: {
      backgroundColor,
      fontColor,
    },
    textSettings,
  };
}

async function migrateFromLegacyIfPresent() {
  const oldExists = await tableExists(TABLE_OLD);
  if (!oldExists) {
    console.log(`ℹ️  Legacy table ${TABLE_OLD} not found. No data to migrate.`);
    return;
  }

  console.log(`Migrating data from legacy ${TABLE_OLD} to ${TABLE_NEW}...`);

  const [legacyRows] = await pool.execute(
    `
    SELECT 
      id,
      companyId,
      name,
      backgroundColor,
      bodyTextColor,
      headingColor,
      h1Font,
      h2Font,
      h3Font,
      h4Font,
      h5Font,
      pFont,
      googleFontUrl,
      COALESCE(isActive, FALSE) as isActive,
      COALESCE(isDefault, FALSE) as isDefault,
      createdAt,
      updatedAt
    FROM ${TABLE_OLD}
  `
  );

  if (!legacyRows.length) {
    console.log('ℹ️  No rows found in legacy table, migration skipped.');
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const row of legacyRows) {
    // Skip if a record with same id already exists in new table (idempotent)
    const [existing] = await pool.execute(
      `SELECT id FROM ${TABLE_NEW} WHERE id = ?`,
      [row.id]
    );
    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    const themeData = buildThemeDataFromLegacyRow(row);

    await pool.execute(
      `
      INSERT INTO ${TABLE_NEW} (
        id,
        companyId,
        name,
        themeData,
        isActive,
        isDefault,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        row.id,
        row.companyId,
        row.name,
        JSON.stringify(themeData),
        row.isActive,
        row.isDefault,
        row.createdAt,
        row.updatedAt,
      ]
    );

    migrated += 1;
  }

  console.log(
    `✅ Migration completed. Migrated ${migrated} rows, skipped ${skipped} existing rows.`
  );
}

const run = async () => {
  try {
    console.log('Starting company_web_themes migration...');
    await createNewTableIfNeeded();
    await migrateFromLegacyIfPresent();
    console.log('✅ Migration script finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration script:', error.message);
    process.exit(1);
  }
};

run();

