const { pool } = require('../config/database');

const verifyDatabase = async () => {
  try {
    console.log('🔍 Verifying database tables...\n');

    // Expected tables based on models and routes
    const expectedTables = [
      'users',
      'categories',
      'subcategories',
      'services',
      'appointments',
      'companies',
      'spaces',
      'notifications',
      'sales'
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
      console.log('\n💡 Run: node scripts/runInit.js to create missing tables\n');
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
  const tableChecks = {
    users: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
    categories: ['id', 'name', 'description', 'icon', 'isActive'],
    subcategories: ['id', 'categoryId', 'name', 'isActive'],
    services: ['id', 'name', 'duration', 'price', 'companyId', 'status'],
    appointments: ['id', 'clientId', 'companyId', 'date', 'time', 'status'],
    companies: ['id', 'name', 'isActive'],
    spaces: ['id', 'name', 'companyId', 'isActive'],
    notifications: ['id', 'userId', 'title', 'message', 'isRead'],
    sales: ['id', 'companyId', 'clientId', 'amount', 'paymentStatus']
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

