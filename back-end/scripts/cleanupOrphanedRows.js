const { pool } = require('../config/database');

/**
 * Script to clean up orphaned rows in junction tables before recreating foreign keys
 */

const cleanupOrphanedRows = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🧹 Cleaning up orphaned rows in junction tables...\n');
    await connection.beginTransaction();

    // Clean up company_tags
    console.log('📋 Cleaning company_tags...');
    const [orphanedCompanyTags] = await connection.execute(`
      SELECT ct.id, ct.companyId, ct.tagId
      FROM company_tags ct
      LEFT JOIN companies c ON ct.companyId = c.id
      LEFT JOIN tags t ON ct.tagId = t.id
      WHERE c.id IS NULL OR t.id IS NULL
    `);
    
    if (orphanedCompanyTags.length > 0) {
      console.log(`   Found ${orphanedCompanyTags.length} orphaned rows`);
      orphanedCompanyTags.forEach(row => {
        console.log(`     - ID: ${row.id}, companyId: ${row.companyId}, tagId: ${row.tagId}`);
      });
      
      await connection.execute(`
        DELETE ct FROM company_tags ct
        LEFT JOIN companies c ON ct.companyId = c.id
        LEFT JOIN tags t ON ct.tagId = t.id
        WHERE c.id IS NULL OR t.id IS NULL
      `);
      console.log(`   ✅ Deleted ${orphanedCompanyTags.length} orphaned rows`);
    } else {
      console.log('   ✅ No orphaned rows found');
    }

    // Clean up product_tags
    console.log('\n📋 Cleaning product_tags...');
    const [orphanedProductTags] = await connection.execute(`
      SELECT pt.id, pt.productId, pt.tagId
      FROM product_tags pt
      LEFT JOIN products p ON pt.productId = p.id
      LEFT JOIN tags t ON pt.tagId = t.id
      WHERE p.id IS NULL OR t.id IS NULL
    `);
    
    if (orphanedProductTags.length > 0) {
      console.log(`   Found ${orphanedProductTags.length} orphaned rows`);
      orphanedProductTags.forEach(row => {
        console.log(`     - ID: ${row.id}, productId: ${row.productId}, tagId: ${row.tagId}`);
      });
      
      await connection.execute(`
        DELETE pt FROM product_tags pt
        LEFT JOIN products p ON pt.productId = p.id
        LEFT JOIN tags t ON pt.tagId = t.id
        WHERE p.id IS NULL OR t.id IS NULL
      `);
      console.log(`   ✅ Deleted ${orphanedProductTags.length} orphaned rows`);
    } else {
      console.log('   ✅ No orphaned rows found');
    }

    await connection.commit();
    console.log('\n✅ Cleanup completed!');
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Error cleaning up orphaned rows:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    connection.release();
  }
};

// Run cleanup if script is executed directly
if (require.main === module) {
  cleanupOrphanedRows()
    .then(() => {
      console.log('✅ Cleanup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedRows };



















