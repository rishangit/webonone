const { pool } = require('../config/database');

const createBacklogItemsTable = async () => {
  try {
    console.log('Creating backlog_items table...');

    // Check if table already exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'backlog_items'"
    );

    if (tables.length > 0) {
      console.log('✅ backlog_items table already exists. Skipping creation.');
      return;
    }

    // Create backlog_items table
    // First create table without foreign key
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS backlog_items (
        id VARCHAR(10) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('Issue', 'Feature') NOT NULL DEFAULT 'Issue',
        status ENUM('New', 'Active', 'Done') NOT NULL DEFAULT 'New',
        screenshot_path VARCHAR(500) NULL,
        created_by VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_created_by (created_by),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add foreign key constraint separately to avoid collation issues
    try {
      // Check if foreign key already exists
      const [fkCheck] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'backlog_items' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND CONSTRAINT_NAME LIKE '%created_by%'
      `);

      if (fkCheck.length === 0) {
        await pool.execute(`
          ALTER TABLE backlog_items 
          ADD CONSTRAINT fk_backlog_items_created_by 
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint added successfully.');
      } else {
        console.log('✅ Foreign key constraint already exists.');
      }
    } catch (fkError) {
      console.warn('⚠️  Warning: Could not add foreign key constraint:', fkError.message);
      console.warn('   Table created without foreign key. This is not critical for functionality.');
    }

    console.log('✅ backlog_items table created successfully.');
  } catch (error) {
    console.error('❌ Error creating backlog_items table:', error.message);
    throw error;
  }
};

// Run migration
if (require.main === module) {
  createBacklogItemsTable()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createBacklogItemsTable };
