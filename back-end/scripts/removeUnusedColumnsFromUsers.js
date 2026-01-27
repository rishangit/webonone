const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removeUnusedColumnsFromUsers = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Starting migration: Remove unused columns from users table');
    console.log('   - Removing: appointmentsCount, totalSpent, joinDate, emergencyContact');
    console.log('   - Note: emergencyContact and joinDate remain in company_staff table');

    await connection.beginTransaction();

    const columnsToRemove = [
      'appointmentsCount',
      'totalSpent',
      'joinDate',
      'emergencyContact'
    ];

    for (const columnName of columnsToRemove) {
      // Check if column exists
      console.log(`\n📋 Checking ${columnName} column...`);
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = ?
      `, [columnName]);

      if (columns.length === 0) {
        console.log(`   ⚠️  ${columnName} column does not exist, skipping`);
        continue;
      }

      // Remove column
      console.log(`   ✅ Removing ${columnName} column...`);
      await connection.execute(`
        ALTER TABLE users
        DROP COLUMN ${columnName}
      `);
      console.log(`   ✅ ${columnName} column removed`);
    }

    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log('   - appointmentsCount column removed');
    console.log('   - totalSpent column removed');
    console.log('   - joinDate column removed');
    console.log('   - emergencyContact column removed from users table');

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
  removeUnusedColumnsFromUsers()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeUnusedColumnsFromUsers };

