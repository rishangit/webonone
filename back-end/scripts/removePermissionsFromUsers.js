const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removePermissionsFromUsers = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Starting migration: Remove permissions column from users table');
    console.log('   - Permissions are now handled via role-based access control');
    console.log('   - All requirePermission checks will be replaced with requireRole');

    await connection.beginTransaction();

    // Step 1: Check if permissions column exists
    console.log('\n📋 Step 1: Checking if permissions column exists in users table...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'permissions'
    `);

    if (columns.length === 0) {
      console.log('   ✅ permissions column does not exist in users table, migration not needed');
      await connection.commit();
      return;
    }

    console.log('   ✅ permissions column found');

    // Step 2: Remove permissions column
    console.log('\n📋 Step 2: Removing permissions column...');
    await connection.execute(`
      ALTER TABLE users
      DROP COLUMN permissions
    `);
    console.log('   ✅ permissions column removed from users table');

    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log('   - permissions column removed from users table');
    console.log('   - Access control is now purely role-based');

  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  removePermissionsFromUsers()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removePermissionsFromUsers };

