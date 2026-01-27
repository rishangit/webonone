const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

async function migrateStockToStockTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Migrating stock data from company_product_variants to company_product_stock...');
    
    // Check if company_product_stock table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company_product_stock'
    `);
    
    if (tables.length === 0) {
      console.log('❌ company_product_stock table does not exist. Run createCompanyProductStockTable.js first.');
      await connection.rollback();
      return;
    }
    
    // Get all variants with stock
    const [variants] = await connection.execute(`
      SELECT 
        id, 
        companyProductId,
        currentStock,
        costPrice,
        sellPrice,
        stockUnit,
        minStock,
        maxStock,
        createdAt
      FROM company_product_variants
      WHERE currentStock > 0
    `);
    
    console.log(`Found ${variants.length} variants with stock to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const variant of variants) {
      try {
        // Check if stock entry already exists for this variant
        const [existingStock] = await connection.execute(`
          SELECT id FROM company_product_stock WHERE variantId = ? LIMIT 1
        `, [variant.id]);
        
        if (existingStock.length > 0) {
          console.log(`⚠️  Stock entry already exists for variant ${variant.id}, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Create stock entry from variant data
        const stockId = nanoid(10);
        await connection.execute(`
          INSERT INTO company_product_stock (
            id, variantId, quantity, costPrice, sellPrice,
            purchaseDate, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          stockId,
          variant.id,
          variant.currentStock,
          variant.costPrice || 0,
          variant.sellPrice || null,
          variant.createdAt ? new Date(variant.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          true,
          variant.createdAt || new Date(),
          new Date()
        ]);
        
        migratedCount++;
        console.log(`✅ Migrated stock for variant ${variant.id}: ${variant.currentStock} ${variant.stockUnit || 'pieces'}`);
      } catch (error) {
        console.error(`❌ Error migrating variant ${variant.id}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Migration completed:`);
    console.log(`   - Migrated: ${migratedCount} variants`);
    console.log(`   - Skipped: ${skippedCount} variants`);
    
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
migrateStockToStockTable()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

