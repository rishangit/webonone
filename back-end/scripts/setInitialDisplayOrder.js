const { pool } = require('../config/database');

/**
 * Script to set initial displayOrder for existing backlog items
 * This ensures all items have a displayOrder value
 */

const setInitialDisplayOrder = async () => {
  try {
    console.log('Checking for items without display_order...');
    
    const [items] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM backlog_items 
      WHERE display_order IS NULL
    `);
    
    const count = items[0].count;
    console.log(`Found ${count} items without display_order`);
    
    if (count === 0) {
      console.log('✅ All items already have display_order set.');
      return;
    }
    
    console.log('Setting display_order for existing items...');
    
    // Get all items without displayOrder, ordered by priority and created_at
    const [allItems] = await pool.execute(`
      SELECT id, priority, created_at
      FROM backlog_items
      WHERE display_order IS NULL
      ORDER BY 
        CASE 
          WHEN priority = 'Urgent' THEN 1
          WHEN priority = 'High' THEN 2
          ELSE 3
        END,
        created_at DESC
    `);
    
    // Get the max existing displayOrder to continue from there
    const [maxOrderResult] = await pool.execute(`
      SELECT COALESCE(MAX(display_order), 0) as max_order 
      FROM backlog_items
    `);
    const startOrder = (maxOrderResult[0]?.max_order || 0) + 1;
    
    console.log(`Starting display_order from ${startOrder}`);
    
    // Update displayOrder for each item
    for (let i = 0; i < allItems.length; i++) {
      await pool.execute(
        `UPDATE backlog_items SET display_order = ? WHERE id = ?`,
        [startOrder + i, allItems[i].id]
      );
    }
    
    console.log(`✅ Set display_order for ${allItems.length} items.`);
    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Error setting display_order:', error.message);
    throw error;
  }
};

// Run script
if (require.main === module) {
  setInitialDisplayOrder()
    .then(() => {
      console.log('Script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setInitialDisplayOrder };
