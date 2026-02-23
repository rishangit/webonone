const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const { EntityType } = require('../constants/entityType');

/**
 * Migration script to migrate tag data from separate tables to unified entity_tags table
 * 
 * This script:
 * 1. Creates the entity_tags table if it doesn't exist
 * 2. Migrates data from old tag tables (company_tags, product_tags, service_tags, space_tags, company_product_tags)
 * 3. Is safe to run multiple times (idempotent) - checks for existing records before inserting
 * 
 * Old tables are NOT dropped to maintain backward compatibility during transition period
 * 
 * Usage: node scripts/migrateToUnifiedEntityTags.js
 */

const createEntityTagsTable = async () => {
  try {
    console.log('Creating entity_tags table if it doesn\'t exist...');

    // Check if table already exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'entity_tags'"
    );

    if (tables.length > 0) {
      console.log('✅ entity_tags table already exists.');
      return;
    }

    // Create entity_tags table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS entity_tags (
        id VARCHAR(10) PRIMARY KEY,
        entityType ENUM('appointment', 'staff', 'space', 'service', 'product', 'user', 'company', 'company_product') NOT NULL,
        entityId VARCHAR(50) NOT NULL,
        tagId VARCHAR(10) NOT NULL,
        createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_entity_tag (entityType, entityId, tagId),
        INDEX idx_entity_type (entityType),
        INDEX idx_entity_id (entityId),
        INDEX idx_tag (tagId),
        INDEX idx_entity_type_id (entityType, entityId),
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    console.log('✅ entity_tags table created successfully.');
  } catch (error) {
    console.error('❌ Error creating entity_tags table:', error.message);
    throw error;
  }
};

const migrateCompanyTags = async () => {
  try {
    console.log('\n📦 Migrating company_tags...');

    // Check if company_tags table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'company_tags'"
    );

    if (tables.length === 0) {
      console.log('   ⚠️  company_tags table does not exist. Skipping.');
      return { migrated: 0, skipped: 0 };
    }

    // Get all company_tags records
    const [rows] = await pool.execute(`
      SELECT id, companyId, tagId, createdDate
      FROM company_tags
    `);

    if (rows.length === 0) {
      console.log('   ℹ️  No company_tags records to migrate.');
      return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
      // Check if record already exists in entity_tags
      const [existing] = await pool.execute(`
        SELECT id FROM entity_tags
        WHERE entityType = ? AND entityId = ? AND tagId = ?
      `, [EntityType.COMPANY, row.companyId, row.tagId]);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert into entity_tags
      await pool.execute(`
        INSERT INTO entity_tags (id, entityType, entityId, tagId, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `, [nanoid(10), EntityType.COMPANY, row.companyId, row.tagId, row.createdDate || new Date()]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} company_tags records (${skipped} already existed).`);
    return { migrated, skipped };
  } catch (error) {
    console.error('   ❌ Error migrating company_tags:', error.message);
    throw error;
  }
};

const migrateProductTags = async () => {
  try {
    console.log('\n📦 Migrating product_tags...');

    // Check if product_tags table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'product_tags'"
    );

    if (tables.length === 0) {
      console.log('   ⚠️  product_tags table does not exist. Skipping.');
      return { migrated: 0, skipped: 0 };
    }

    // Get all product_tags records
    const [rows] = await pool.execute(`
      SELECT id, productId, tagId, createdDate
      FROM product_tags
    `);

    if (rows.length === 0) {
      console.log('   ℹ️  No product_tags records to migrate.');
      return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
      // Check if record already exists in entity_tags
      const [existing] = await pool.execute(`
        SELECT id FROM entity_tags
        WHERE entityType = ? AND entityId = ? AND tagId = ?
      `, [EntityType.PRODUCT, row.productId, row.tagId]);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert into entity_tags
      await pool.execute(`
        INSERT INTO entity_tags (id, entityType, entityId, tagId, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `, [nanoid(10), EntityType.PRODUCT, row.productId, row.tagId, row.createdDate || new Date()]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} product_tags records (${skipped} already existed).`);
    return { migrated, skipped };
  } catch (error) {
    console.error('   ❌ Error migrating product_tags:', error.message);
    throw error;
  }
};

const migrateServiceTags = async () => {
  try {
    console.log('\n📦 Migrating service_tags...');

    // Check if service_tags table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'service_tags'"
    );

    if (tables.length === 0) {
      console.log('   ⚠️  service_tags table does not exist. Skipping.');
      return { migrated: 0, skipped: 0 };
    }

    // Get all service_tags records
    const [rows] = await pool.execute(`
      SELECT id, serviceId, tagId, createdDate
      FROM service_tags
    `);

    if (rows.length === 0) {
      console.log('   ℹ️  No service_tags records to migrate.');
      return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
      // Check if record already exists in entity_tags
      const [existing] = await pool.execute(`
        SELECT id FROM entity_tags
        WHERE entityType = ? AND entityId = ? AND tagId = ?
      `, [EntityType.SERVICE, row.serviceId, row.tagId]);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert into entity_tags
      await pool.execute(`
        INSERT INTO entity_tags (id, entityType, entityId, tagId, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `, [nanoid(10), EntityType.SERVICE, row.serviceId, row.tagId, row.createdDate || new Date()]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} service_tags records (${skipped} already existed).`);
    return { migrated, skipped };
  } catch (error) {
    console.error('   ❌ Error migrating service_tags:', error.message);
    throw error;
  }
};

const migrateSpaceTags = async () => {
  try {
    console.log('\n📦 Migrating space_tags...');

    // Check if space_tags table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'space_tags'"
    );

    if (tables.length === 0) {
      console.log('   ⚠️  space_tags table does not exist. Skipping.');
      return { migrated: 0, skipped: 0 };
    }

    // Get all space_tags records
    const [rows] = await pool.execute(`
      SELECT id, spaceId, tagId, createdDate
      FROM space_tags
    `);

    if (rows.length === 0) {
      console.log('   ℹ️  No space_tags records to migrate.');
      return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
      // Check if record already exists in entity_tags
      const [existing] = await pool.execute(`
        SELECT id FROM entity_tags
        WHERE entityType = ? AND entityId = ? AND tagId = ?
      `, [EntityType.SPACE, row.spaceId, row.tagId]);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert into entity_tags
      await pool.execute(`
        INSERT INTO entity_tags (id, entityType, entityId, tagId, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `, [nanoid(10), EntityType.SPACE, row.spaceId, row.tagId, row.createdDate || new Date()]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} space_tags records (${skipped} already existed).`);
    return { migrated, skipped };
  } catch (error) {
    console.error('   ❌ Error migrating space_tags:', error.message);
    throw error;
  }
};

const migrateCompanyProductTags = async () => {
  try {
    console.log('\n📦 Migrating company_product_tags...');

    // Check if company_product_tags table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'company_product_tags'"
    );

    if (tables.length === 0) {
      console.log('   ⚠️  company_product_tags table does not exist. Skipping.');
      return { migrated: 0, skipped: 0 };
    }

    // Get all company_product_tags records
    const [rows] = await pool.execute(`
      SELECT id, companyProductId, tagId, createdDate
      FROM company_product_tags
    `);

    if (rows.length === 0) {
      console.log('   ℹ️  No company_product_tags records to migrate.');
      return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const row of rows) {
      // Check if record already exists in entity_tags
      const [existing] = await pool.execute(`
        SELECT id FROM entity_tags
        WHERE entityType = ? AND entityId = ? AND tagId = ?
      `, [EntityType.COMPANY_PRODUCT, row.companyProductId, row.tagId]);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert into entity_tags
      await pool.execute(`
        INSERT INTO entity_tags (id, entityType, entityId, tagId, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `, [nanoid(10), EntityType.COMPANY_PRODUCT, row.companyProductId, row.tagId, row.createdDate || new Date()]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} company_product_tags records (${skipped} already existed).`);
    return { migrated, skipped };
  } catch (error) {
    console.error('   ❌ Error migrating company_product_tags:', error.message);
    throw error;
  }
};

const runMigration = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration to unified entity_tags table...\n');

    // Create entity_tags table if it doesn't exist
    await createEntityTagsTable();

    // Migrate data from all old tag tables
    const results = {
      company_tags: await migrateCompanyTags(),
      product_tags: await migrateProductTags(),
      service_tags: await migrateServiceTags(),
      space_tags: await migrateSpaceTags(),
      company_product_tags: await migrateCompanyProductTags()
    };

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    
    let totalMigrated = 0;
    let totalSkipped = 0;

    for (const [table, result] of Object.entries(results)) {
      totalMigrated += result.migrated;
      totalSkipped += result.skipped;
      console.log(`${table.padEnd(25)}: ${result.migrated} migrated, ${result.skipped} skipped`);
    }

    console.log('='.repeat(60));
    console.log(`Total: ${totalMigrated} records migrated, ${totalSkipped} records skipped`);
    console.log('='.repeat(60));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  Note: Old tag tables (company_tags, product_tags, etc.) are preserved for backward compatibility.');
    console.log('   They can be safely removed after verifying the migration and updating all code to use entity_tags.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
