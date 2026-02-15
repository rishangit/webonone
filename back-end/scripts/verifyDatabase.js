const { pool } = require('../config/database');

const verifyDatabase = async () => {
  try {
    console.log('🔍 Verifying database tables...\n');

    // Expected tables based on initDatabase.js
    // Note: categories and subcategories tables have been removed
    const expectedTables = [
      'users',
      'users_role',
      'companies',
      'company_users',
      'services',
      'spaces',
      'appointments',
      'company_appointments',
      'notifications',
      'sales',
      'products',
      'product_variants',
      'tags',
      'company_tags',
      'product_tags',
      'product_attributes',
      'company_products',
      'company_product_tags'
    ];

    const missingTables = [];
    const existingTables = [];

    // Check each table
    for (const table of expectedTables) {
      try {
        const [rows] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          existingTables.push(table);
          console.log(`✅ ${table} - EXISTS`);
        } else {
          missingTables.push(table);
          console.log(`❌ ${table} - MISSING`);
        }
      } catch (error) {
        missingTables.push(table);
        console.log(`❌ ${table} - ERROR: ${error.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Existing tables: ${existingTables.length}`);
    console.log(`   ❌ Missing tables: ${missingTables.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables detected:');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      console.log('\n💡 Run: node scripts/initDatabase.js to create missing tables\n');
      return false;
    } else {
      console.log('✅ All required tables exist!\n');
      
      // Verify table structures
      console.log('🔍 Verifying table structures...\n');
      await verifyTableStructures();
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    throw error;
  }
};

const verifyTableStructures = async () => {
  // Table structure checks based on actual schema from initDatabase.js
  const tableChecks = {
    users: ['id', 'email', 'password', 'firstName', 'lastName', 'isActive', 'isVerified'],
    users_role: ['id', 'userId', 'role', 'companyId', 'isActive'],
    companies: ['id', 'name', 'isActive', 'ownerId'],
    company_users: ['id', 'companyId', 'userId', 'totalAppointments', 'totalSpent'],
    services: ['id', 'name', 'duration', 'price', 'companyId', 'status'],
    spaces: ['id', 'name', 'companyId', 'isActive'],
    appointments: ['id', 'clientId', 'companyId', 'date', 'time', 'status'],
    company_appointments: ['id', 'clientId', 'companyId', 'date', 'time', 'status'],
    notifications: ['id', 'userId', 'title', 'message', 'isRead'],
    sales: ['id', 'companyId', 'clientId', 'amount', 'paymentStatus'],
    products: ['id', 'name', 'isActive', 'isVerified'],
    product_variants: ['id', 'productId', 'name', 'sku', 'isActive'],
    tags: ['id', 'name', 'isActive'],
    company_tags: ['id', 'companyId', 'tagId'],
      product_tags: ['id', 'productId', 'tagId'],
      product_attributes: ['id', 'name', 'description', 'valueDataType', 'unit_of_measure', 'isActive'],
      company_products: ['id', 'companyId', 'systemProductId', 'sellPrice', 'currentStock'],
      company_product_tags: ['id', 'companyProductId', 'tagId']
  };

  for (const [table, requiredColumns] of Object.entries(tableChecks)) {
    try {
      const [columns] = await pool.execute(`SHOW COLUMNS FROM ${table}`);
      const columnNames = columns.map(col => col.Field);
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  ${table} - Missing columns: ${missingColumns.join(', ')}`);
      } else {
        console.log(`✅ ${table} - Structure OK`);
      }
    } catch (error) {
      console.log(`❌ ${table} - Error checking structure: ${error.message}`);
    }
  }
  
  console.log('');
};

// Run if this file is executed directly
if (require.main === module) {
  verifyDatabase()
    .then((success) => {
      if (success) {
        console.log('🎉 Database verification completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Database verification found issues. Please fix them.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Database verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyDatabase, verifyTableStructures };
