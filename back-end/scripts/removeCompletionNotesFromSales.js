const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removeCompletionNotesFromSales = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration: Remove completionNotes from company_sales');
    
    await connection.beginTransaction();
    
    // Check if column exists
    console.log('\n📋 Checking if completionNotes column exists...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_sales' 
      AND COLUMN_NAME = 'completionNotes'
    `);
    
    if (columns.length > 0) {
      console.log('   ✅ completionNotes column found, removing...');
      
      // Remove the column
      await connection.execute(`
        ALTER TABLE company_sales 
        DROP COLUMN completionNotes
      `);
      
      console.log('   ✅ completionNotes column removed from company_sales');
    } else {
      console.log('   ⚠️  completionNotes column does not exist, skipping...');
    }
    
    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    
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
  removeCompletionNotesFromSales()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeCompletionNotesFromSales };

