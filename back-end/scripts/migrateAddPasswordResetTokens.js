const { pool } = require('../config/database');

/**
 * Migration script to add password_reset_tokens table to existing database
 * Run this script if you have an existing database and need to add the password reset functionality
 * 
 * Usage: node scripts/migrateAddPasswordResetTokens.js
 */

const migrateAddPasswordResetTokens = async () => {
  try {
    console.log('🔄 Starting migration: Adding password_reset_tokens table...\n');

    // Check if table already exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'password_reset_tokens'
    `);

    if (tables.length > 0) {
      console.log('ℹ️  Table password_reset_tokens already exists. Skipping migration.');
      console.log('✅ Migration completed (no changes needed)\n');
      return;
    }

    // Check if users table exists (required for foreign key)
    const [usersTable] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
    `);

    if (usersTable.length === 0) {
      throw new Error('Users table does not exist. Please run initDatabase.js first to create all required tables.');
    }

    console.log('📦 Creating password_reset_tokens table...');

    // Create password_reset_tokens table
    await pool.execute(`
      CREATE TABLE password_reset_tokens (
        id VARCHAR(10) PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        isUsed BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (userId),
        INDEX idx_token (token),
        INDEX idx_expires (expiresAt),
        INDEX idx_used (isUsed),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Table password_reset_tokens created successfully');
    console.log('✅ Migration completed successfully\n');

    // Verify the table was created
    const [verifyTables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'password_reset_tokens'
    `);

    if (verifyTables.length > 0) {
      console.log('✅ Verification: Table exists and is ready to use\n');
    } else {
      throw new Error('Table creation verification failed');
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
  migrateAddPasswordResetTokens()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script error:', error);
      process.exit(1);
    });
}

module.exports = { migrateAddPasswordResetTokens };
