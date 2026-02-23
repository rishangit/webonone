const { pool } = require('../config/database');

/**
 * Migration script to drop old tag tables after migration to unified entity_tags
 * 
 * This script safely removes the old tag junction tables:
 * - company_tags
 * - product_tags
 * - service_tags
 * - space_tags
 * - company_product_tags
 * 
 * IMPORTANT: Only run this after:
 * 1. Migration to entity_tags has been completed successfully
 * 2. All code has been updated to use entity_tags
 * 3. You have verified that entity_tags contains all the data
 * 4. You have a database backup
 * 
 * Usage: node scripts/migrateDropOldTagTables.js
 */

const dropOldTagTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🗑️  Starting removal of old tag tables...\n');

    const tablesToDrop = [
      'company_tags',
      'product_tags',
      'service_tags',
      'space_tags',
      'company_product_tags'
    ];

    const results = {
      dropped: [],
      notFound: [],
      errors: []
    };

    for (const tableName of tablesToDrop) {
      try {
        // Check if table exists
        const [tables] = await connection.execute(
          `SHOW TABLES LIKE '${tableName}'`
        );

        if (tables.length === 0) {
          console.log(`   ⚠️  Table ${tableName} does not exist. Skipping.`);
          results.notFound.push(tableName);
          continue;
        }

        // Get record count before dropping (for verification)
        const [countRows] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        const recordCount = countRows[0]?.count || 0;

        // Drop the table
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        
        console.log(`   ✅ Dropped table ${tableName} (had ${recordCount} records)`);
        results.dropped.push({ table: tableName, records: recordCount });
      } catch (error) {
        console.error(`   ❌ Error dropping table ${tableName}:`, error.message);
        results.errors.push({ table: tableName, error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Removal Summary:');
    console.log('='.repeat(60));
    
    if (results.dropped.length > 0) {
      console.log('✅ Successfully dropped tables:');
      results.dropped.forEach(({ table, records }) => {
        console.log(`   - ${table.padEnd(25)} (${records} records)`);
      });
    }

    if (results.notFound.length > 0) {
      console.log('\n⚠️  Tables not found (already removed or never existed):');
      results.notFound.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(({ table, error }) => {
        console.log(`   - ${table}: ${error}`);
      });
    }

    console.log('='.repeat(60));

    if (results.errors.length === 0) {
      console.log('\n✅ Old tag tables removal completed successfully!');
      console.log('   All tag data is now stored in the unified entity_tags table.');
    } else {
      console.log('\n⚠️  Removal completed with some errors. Please review the output above.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during table removal:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  // Add confirmation prompt for safety
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('⚠️  WARNING: This will permanently delete the following tables:');
  console.log('   - company_tags');
  console.log('   - product_tags');
  console.log('   - service_tags');
  console.log('   - space_tags');
  console.log('   - company_product_tags');
  console.log('\n   Make sure you have:');
  console.log('   1. Completed migration to entity_tags');
  console.log('   2. Verified all data is in entity_tags');
  console.log('   3. Updated all code to use entity_tags');
  console.log('   4. Created a database backup');
  console.log('');

  rl.question('Are you sure you want to proceed? Type "yes" to continue: ', (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'yes') {
      dropOldTagTables()
        .then(() => {
          console.log('\n🎉 Table removal process completed.');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Table removal process failed:', error);
          process.exit(1);
        });
    } else {
      console.log('\n❌ Operation cancelled. Tables were not removed.');
      process.exit(0);
    }
  });
}

module.exports = { dropOldTagTables };
