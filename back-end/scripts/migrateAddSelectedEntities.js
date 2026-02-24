const { pool } = require('../config/database');

/**
 * Migration script to add selectedEntities JSON field to companies table
 * 
 * This script:
 * 1. Adds selectedEntities field (JSON) to store company's selected entity types
 * 2. Is safe to run multiple times (idempotent)
 * 
 * Usage: node scripts/migrateAddSelectedEntities.js
 */

const addSelectedEntitiesField = async () => {
  try {
    console.log('Adding selectedEntities field to companies table...');

    // Check if selectedEntities column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'companies' 
      AND COLUMN_NAME = 'selectedEntities'
    `);

    const hasSelectedEntities = columns.length > 0;

    // Add selectedEntities column if it doesn't exist
    if (!hasSelectedEntities) {
      console.log('Adding selectedEntities column...');
      await pool.execute(`
        ALTER TABLE companies 
        ADD COLUMN selectedEntities JSON DEFAULT NULL
        AFTER currencyId
      `);
      console.log('✅ selectedEntities column added successfully.');
    } else {
      console.log('✅ selectedEntities column already exists.');
    }

    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Error adding selectedEntities field:', error.message);
    throw error;
  }
};

// Run migration
if (require.main === module) {
  addSelectedEntitiesField()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addSelectedEntitiesField };
