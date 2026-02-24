const { pool } = require('../config/database');

/**
 * Migration script to add priority and displayOrder fields to backlog_items table
 * 
 * This script:
 * 1. Adds priority field (ENUM: 'Low', 'Medium', 'High', 'Urgent') with default 'Medium'
 * 2. Adds displayOrder field (INT) for drag-and-drop ordering
 * 3. Sets initial displayOrder based on created_at (newest first)
 * 4. Is safe to run multiple times (idempotent)
 * 
 * Usage: node scripts/migrateAddBacklogPriorityAndOrder.js
 */

const addPriorityAndOrderFields = async () => {
  try {
    console.log('Adding priority and displayOrder fields to backlog_items table...');

    // Check if priority column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'backlog_items' 
      AND COLUMN_NAME IN ('priority', 'display_order')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    const hasPriority = existingColumns.includes('priority');
    const hasDisplayOrder = existingColumns.includes('display_order');

    // Add priority column if it doesn't exist
    if (!hasPriority) {
      console.log('Adding priority column...');
      await pool.execute(`
        ALTER TABLE backlog_items 
        ADD COLUMN priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium'
        AFTER status
      `);
      console.log('✅ priority column added successfully.');
    } else {
      console.log('✅ priority column already exists.');
    }

    // Add display_order column if it doesn't exist
    if (!hasDisplayOrder) {
      console.log('Adding display_order column...');
      await pool.execute(`
        ALTER TABLE backlog_items 
        ADD COLUMN display_order INT DEFAULT NULL
        AFTER priority
      `);
      console.log('✅ display_order column added successfully.');
    } else {
      console.log('✅ display_order column already exists.');
    }

    // Set initial displayOrder for existing items (newest first, priority items at top)
    // Only set if we just added the column or if items don't have displayOrder set
    const [itemsWithoutOrder] = await pool.execute(`
      SELECT COUNT(*) as count FROM backlog_items WHERE display_order IS NULL
    `);
    
    if (itemsWithoutOrder[0]?.count > 0) {
      console.log('Setting initial displayOrder for existing items...');
      
      // Get all items ordered by priority and created_at
      const [allItems] = await pool.execute(`
        SELECT id, priority, created_at
        FROM backlog_items
        WHERE display_order IS NULL
        ORDER BY 
          CASE 
            WHEN priority IN ('High', 'Urgent') THEN 
              CASE priority 
                WHEN 'Urgent' THEN 1 
                WHEN 'High' THEN 2 
              END
            ELSE 3
          END,
          created_at DESC
      `);

      // Get the max existing displayOrder to continue from there
      const [maxOrderResult] = await pool.execute(`
        SELECT COALESCE(MAX(display_order), 0) as max_order FROM backlog_items
      `);
      const startOrder = (maxOrderResult[0]?.max_order || 0) + 1;

      // Update displayOrder for each item
      for (let i = 0; i < allItems.length; i++) {
        await pool.execute(
          `UPDATE backlog_items SET display_order = ? WHERE id = ?`,
          [startOrder + i, allItems[i].id]
        );
      }

      console.log('✅ Initial displayOrder set for existing items.');
    }

    // Add index on display_order for better query performance
    try {
      const [indexes] = await pool.execute(`
        SHOW INDEXES FROM backlog_items WHERE Key_name = 'idx_display_order'
      `);
      
      if (indexes.length === 0) {
        await pool.execute(`
          ALTER TABLE backlog_items 
          ADD INDEX idx_display_order (display_order)
        `);
        console.log('✅ Index on display_order added successfully.');
      } else {
        console.log('✅ Index on display_order already exists.');
      }
    } catch (indexError) {
      console.warn('⚠️  Warning: Could not add index on display_order:', indexError.message);
    }

    // Add index on priority for better query performance
    try {
      const [indexes] = await pool.execute(`
        SHOW INDEXES FROM backlog_items WHERE Key_name = 'idx_priority'
      `);
      
      if (indexes.length === 0) {
        await pool.execute(`
          ALTER TABLE backlog_items 
          ADD INDEX idx_priority (priority)
        `);
        console.log('✅ Index on priority added successfully.');
      } else {
        console.log('✅ Index on priority already exists.');
      }
    } catch (indexError) {
      console.warn('⚠️  Warning: Could not add index on priority:', indexError.message);
    }

    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Error adding priority and displayOrder fields:', error.message);
    throw error;
  }
};

// Run migration
if (require.main === module) {
  addPriorityAndOrderFields()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addPriorityAndOrderFields };
