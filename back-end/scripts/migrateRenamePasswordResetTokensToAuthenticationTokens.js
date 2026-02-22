const { pool } = require('../config/database');

/**
 * Migration script to rename password_reset_tokens table to authentication_tokens
 * This table is now used for multiple authentication purposes:
 * - Password reset tokens
 * - Email verification tokens
 * - Other authentication tokens
 * 
 * Usage: node scripts/migrateRenamePasswordResetTokensToAuthenticationTokens.js
 * 
 * IMPORTANT: This migration is safe to run on production as it:
 * - Checks if the old table exists before renaming
 * - Checks if the new table already exists (skips if it does)
 * - Preserves all data and indexes
 * - Uses RENAME TABLE which is atomic in MySQL
 */

const migrateRenamePasswordResetTokensToAuthenticationTokens = async () => {
  try {
    console.log('🔄 Starting migration: Renaming password_reset_tokens to authentication_tokens...\n');

    // Check if old table exists
    const [oldTableExists] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'password_reset_tokens'
    `);

    if (oldTableExists.length === 0) {
      console.log('ℹ️  Table password_reset_tokens does not exist. Checking if authentication_tokens exists...');
      
      // Check if new table already exists
      const [newTableExists] = await pool.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'authentication_tokens'
      `);

      if (newTableExists.length > 0) {
        console.log('✅ Table authentication_tokens already exists. Migration not needed.');
        console.log('✅ Migration completed (no changes needed)\n');
        return;
      } else {
        console.log('⚠️  Neither password_reset_tokens nor authentication_tokens exists.');
        console.log('ℹ️  The table will be created by initDatabase.js script.');
        console.log('✅ Migration completed (no changes needed)\n');
        return;
      }
    }

    // Check if new table already exists
    const [newTableExists] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'authentication_tokens'
    `);

    if (newTableExists.length > 0) {
      console.log('⚠️  Table authentication_tokens already exists.');
      console.log('⚠️  This might indicate the migration was already run.');
      console.log('ℹ️  Checking if password_reset_tokens has data that needs to be migrated...');
      
      // Check if old table has data
      const [oldTableData] = await pool.execute(`
        SELECT COUNT(*) as count FROM password_reset_tokens
      `);
      
      if (oldTableData[0].count > 0) {
        console.log(`⚠️  Old table has ${oldTableData[0].count} records.`);
        console.log('⚠️  You may need to manually merge data or drop the old table.');
        console.log('✅ Migration completed (new table exists)\n');
      } else {
        console.log('✅ Old table is empty. Safe to drop.');
        console.log('✅ Migration completed (new table exists)\n');
      }
      return;
    }

    console.log('📦 Renaming password_reset_tokens to authentication_tokens...');

    // Use RENAME TABLE which is atomic in MySQL
    // This preserves all data, indexes, and foreign keys
    await pool.execute(`
      RENAME TABLE password_reset_tokens TO authentication_tokens
    `);

    console.log('✅ Table renamed successfully');

    // Verify the rename was successful
    const [verifyTable] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'authentication_tokens'
    `);

    if (verifyTable.length > 0) {
      // Verify indexes are still there
      const [indexes] = await pool.execute(`
        SELECT INDEX_NAME 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'authentication_tokens'
      `);

      console.log(`✅ Verification: Table exists with ${indexes.length} indexes`);
      console.log('✅ Migration completed successfully\n');
    } else {
      throw new Error('Table rename verification failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    await pool.end();
  }
};

// Run migration if script is executed directly
if (require.main === module) {
  migrateRenamePasswordResetTokensToAuthenticationTokens()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script error:', error);
      process.exit(1);
    });
}

module.exports = { migrateRenamePasswordResetTokensToAuthenticationTokens };
