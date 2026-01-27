const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

/**
 * Migration script to add currencies table and currencyId to companies table
 * Run this script to set up currency support
 */
async function addCurrenciesTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding currencies table...');
    
    // Check if table already exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'currencies'`
    );
    
    if (tables.length > 0) {
      console.log('✅ currencies table already exists');
    } else {
      // Create the currencies table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS currencies (
          id VARCHAR(10) PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          symbol VARCHAR(10) NOT NULL,
          decimals INT DEFAULT 2,
          rounding DECIMAL(10, 4) DEFAULT 0.01,
          isActive BOOLEAN DEFAULT TRUE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_active (isActive),
          INDEX idx_name (name)
        )
      `);
      
      console.log('✅ currencies table created successfully');
      
      // Insert default currencies
      const defaultCurrencies = [
        { name: 'USD', symbol: '$', decimals: 2, rounding: 0.01 },
        { name: 'EUR', symbol: '€', decimals: 2, rounding: 0.01 },
        { name: 'GBP', symbol: '£', decimals: 2, rounding: 0.01 },
        { name: 'CAD', symbol: 'C$', decimals: 2, rounding: 0.01 }
      ];
      
      for (const currency of defaultCurrencies) {
        const id = nanoid(10);
        await connection.execute(
          `INSERT INTO currencies (id, name, symbol, decimals, rounding) VALUES (?, ?, ?, ?, ?)`,
          [id, currency.name, currency.symbol, currency.decimals, currency.rounding]
        );
      }
      
      console.log(`✅ Inserted ${defaultCurrencies.length} default currencies`);
    }
    
    // Add currencyId column to companies table if it doesn't exist
    console.log('Checking for currencyId column in companies table...');
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'companies' 
       AND COLUMN_NAME = 'currencyId'`
    );
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN currencyId VARCHAR(10) DEFAULT NULL,
        ADD INDEX idx_currency (currencyId),
        ADD FOREIGN KEY (currencyId) REFERENCES currencies(id) ON DELETE SET NULL
      `);
      console.log('✅ currencyId column added to companies table');
    } else {
      console.log('✅ currencyId column already exists in companies table');
    }
    
    console.log('✅ Currency setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up currencies:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  addCurrenciesTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCurrenciesTable;
