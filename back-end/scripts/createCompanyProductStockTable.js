const { pool } = require('../config/database');

async function createCompanyProductStockTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Creating company_product_stock table...');
    
    // Check if table already exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_stock'
    `);
    
    if (tables.length > 0) {
      console.log('⚠️  company_product_stock table already exists');
      await connection.rollback();
      return;
    }
    
    // Create company_product_stock table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_product_stock (
        id VARCHAR(10) PRIMARY KEY,
        variantId VARCHAR(10) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        costPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
        sellPrice DECIMAL(10, 2) DEFAULT NULL,
        purchaseDate DATE DEFAULT NULL,
        expiryDate DATE DEFAULT NULL,
        supplierName VARCHAR(255) DEFAULT NULL,
        supplierContact VARCHAR(255) DEFAULT NULL,
        batchNumber VARCHAR(100) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_variant (variantId),
        INDEX idx_purchase_date (purchaseDate),
        INDEX idx_expiry_date (expiryDate),
        INDEX idx_active (isActive),
        FOREIGN KEY (variantId) REFERENCES company_product_variants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ company_product_stock table created successfully');
    
    await connection.commit();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
createCompanyProductStockTable()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

