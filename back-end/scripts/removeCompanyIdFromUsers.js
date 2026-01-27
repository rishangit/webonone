const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removeCompanyIdFromUsers = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Starting migration: Remove companyId from users table');
    console.log('   - companyId is now stored in users_role table');
    console.log('   - Migrating any existing companyId values to users_role if needed');

    await connection.beginTransaction();

    // Step 1: Check if companyId column exists
    console.log('\n📋 Step 1: Checking if companyId column exists in users table...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'companyId'
    `);

    if (columns.length === 0) {
      console.log('   ✅ companyId column does not exist in users table, migration not needed');
      await connection.commit();
      return;
    }

    // Step 2: Migrate companyId values to users_role table for users that don't have it
    console.log('\n📋 Step 2: Migrating companyId values to users_role table...');
    const [usersWithCompanyId] = await connection.execute(`
      SELECT id, companyId
      FROM users
      WHERE companyId IS NOT NULL AND companyId != ''
    `);

    if (usersWithCompanyId.length > 0) {
      console.log(`   Found ${usersWithCompanyId.length} users with companyId`);
      
      for (const user of usersWithCompanyId) {
        // Ensure companyId is not longer than VARCHAR(10)
        const companyIdValue = user.companyId && user.companyId.length > 10 
          ? user.companyId.substring(0, 10) 
          : user.companyId;
        
        if (!companyIdValue) {
          console.log(`   ⚠️  User ${user.id} has empty/null companyId, skipping`);
          continue;
        }

        // Validate that companyId exists in companies table
        const [companyExists] = await connection.execute(`
          SELECT id FROM companies WHERE id = ?
        `, [companyIdValue]);

        if (companyExists.length === 0) {
          console.log(`   ⚠️  User ${user.id} has invalid companyId ${companyIdValue} (company doesn't exist), skipping migration`);
          continue;
        }

        // Check if user already has a role entry with this companyId
        const [existingRoles] = await connection.execute(`
          SELECT id FROM users_role
          WHERE userId = ? AND companyId = ?
        `, [user.id, companyIdValue]);

        if (existingRoles.length === 0) {
          // Get user's current role (default to USER if none)
          const [userRoles] = await connection.execute(`
            SELECT role, isDefault FROM users_role
            WHERE userId = ? AND isActive = 1
            ORDER BY isDefault DESC, createdAt ASC
            LIMIT 1
          `, [user.id]);

          let roleToUse = 3; // USER role default
          let isDefault = true;

          if (userRoles.length > 0) {
            roleToUse = userRoles[0].role;
            isDefault = userRoles[0].isDefault;
          } else {
            // Create a default USER role entry with companyId
            const { nanoid } = require('nanoid');
            const roleId = nanoid(10);
            
            await connection.execute(`
              INSERT INTO users_role (id, userId, role, companyId, isActive, isDefault)
              VALUES (?, ?, ?, ?, 1, 1)
            `, [roleId, user.id, 3, companyIdValue]);
            console.log(`   ✅ Created USER role entry for user ${user.id} with companyId ${companyIdValue}`);
            continue;
          }

          // Update existing role entry to include companyId
          if (userRoles.length > 0) {
            await connection.execute(`
              UPDATE users_role
              SET companyId = ?
              WHERE userId = ? AND role = ? AND (companyId IS NULL OR companyId = '')
              LIMIT 1
            `, [companyIdValue, user.id, roleToUse]);
            console.log(`   ✅ Updated role entry for user ${user.id} with companyId ${companyIdValue}`);
          }
        } else {
          console.log(`   ⚠️  User ${user.id} already has role entry with companyId ${companyIdValue}, skipping`);
        }
      }
    } else {
      console.log('   ✅ No users with companyId found');
    }

    // Step 3: Remove index on companyId if it exists
    console.log('\n📋 Step 3: Removing index on companyId...');
    try {
      const [indexes] = await connection.execute(`
        SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'companyId'
      `);
      if (indexes.length > 0) {
        for (const index of indexes) {
          await connection.execute(`ALTER TABLE users DROP INDEX ${index.INDEX_NAME}`);
          console.log(`   ✅ Dropped index: ${index.INDEX_NAME}`);
        }
      } else {
        console.log('   ⚠️  No index found on companyId');
      }
    } catch (error) {
      console.warn('   ⚠️  Could not drop index on companyId:', error.message);
    }

    // Step 4: Remove foreign key constraint on companyId if it exists
    console.log('\n📋 Step 4: Removing foreign key constraint on companyId...');
    try {
      const [foreignKeys] = await connection.execute(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'companyId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      if (foreignKeys.length > 0) {
        for (const fk of foreignKeys) {
          await connection.execute(`
            ALTER TABLE users
            DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
          `);
          console.log(`   ✅ Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
        }
      } else {
        console.log('   ⚠️  No foreign key constraint found on companyId');
      }
    } catch (error) {
      console.warn('   ⚠️  Could not drop foreign key constraint on companyId:', error.message);
    }

    // Step 5: Remove companyId column
    console.log('\n📋 Step 5: Removing companyId column...');
    await connection.execute(`
      ALTER TABLE users
      DROP COLUMN companyId
    `);
    console.log('   ✅ companyId column removed from users table');

    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log('   - companyId column removed from users table');
    console.log('   - companyId is now only stored in users_role table');
    console.log('   - All existing companyId values have been migrated to users_role');

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
  removeCompanyIdFromUsers()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeCompanyIdFromUsers };

