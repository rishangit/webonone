const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const removeServiceIdSpaceIdFromSales = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration: Remove serviceId and spaceId from company_sales');
    console.log('   - These fields are available in company_appointments table');
    console.log('   - Sales can be joined with appointments via saleId');
    
    await connection.beginTransaction();
    
    // Step 1: Remove serviceId column
    console.log('\n📋 Step 1: Removing serviceId column...');
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'serviceId'
      `);
      
      if (columns.length > 0) {
        // Check for indexes on serviceId
        try {
          const [indexes] = await connection.execute(`
            SHOW INDEXES FROM company_sales WHERE Column_name = 'serviceId'
          `);
          
          if (indexes.length > 0) {
            for (const index of indexes) {
              if (index.Key_name !== 'PRIMARY') {
                try {
                  await connection.execute(`
                    ALTER TABLE company_sales DROP INDEX ${index.Key_name}
                  `);
                  console.log(`   ✅ Dropped index: ${index.Key_name}`);
                } catch (error) {
                  console.log(`   ⚠️  Could not drop index ${index.Key_name}: ${error.message}`);
                }
              }
            }
          }
        } catch (error) {
          console.log('   ⚠️  Could not check indexes:', error.message);
        }
        
        // Remove foreign key constraint if exists
        try {
          const [fkConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'company_sales' 
            AND COLUMN_NAME = 'serviceId'
            AND REFERENCED_TABLE_NAME IS NOT NULL
          `);
          
          if (fkConstraints.length > 0) {
            for (const fk of fkConstraints) {
              await connection.execute(`
                ALTER TABLE company_sales 
                DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
              `);
              console.log(`   ✅ Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
            }
          }
        } catch (error) {
          console.log('   ⚠️  Could not drop foreign key:', error.message);
        }
        
        // Remove the column
        await connection.execute(`
          ALTER TABLE company_sales 
          DROP COLUMN serviceId
        `);
        console.log('   ✅ serviceId column removed');
      } else {
        console.log('   ⚠️  serviceId column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing serviceId column:', error.message);
      throw error;
    }
    
    // Step 2: Remove spaceId column
    console.log('\n📋 Step 2: Removing spaceId column...');
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'spaceId'
      `);
      
      if (columns.length > 0) {
        // Check for indexes on spaceId
        try {
          const [indexes] = await connection.execute(`
            SHOW INDEXES FROM company_sales WHERE Column_name = 'spaceId'
          `);
          
          if (indexes.length > 0) {
            for (const index of indexes) {
              if (index.Key_name !== 'PRIMARY') {
                try {
                  await connection.execute(`
                    ALTER TABLE company_sales DROP INDEX ${index.Key_name}
                  `);
                  console.log(`   ✅ Dropped index: ${index.Key_name}`);
                } catch (error) {
                  console.log(`   ⚠️  Could not drop index ${index.Key_name}: ${error.message}`);
                }
              }
            }
          }
        } catch (error) {
          console.log('   ⚠️  Could not check indexes:', error.message);
        }
        
        // Remove foreign key constraint if exists
        try {
          const [fkConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'company_sales' 
            AND COLUMN_NAME = 'spaceId'
            AND REFERENCED_TABLE_NAME IS NOT NULL
          `);
          
          if (fkConstraints.length > 0) {
            for (const fk of fkConstraints) {
              await connection.execute(`
                ALTER TABLE company_sales 
                DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
              `);
              console.log(`   ✅ Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
            }
          }
        } catch (error) {
          console.log('   ⚠️  Could not drop foreign key:', error.message);
        }
        
        // Remove the column
        await connection.execute(`
          ALTER TABLE company_sales 
          DROP COLUMN spaceId
        `);
        console.log('   ✅ spaceId column removed');
      } else {
        console.log('   ⚠️  spaceId column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing spaceId column:', error.message);
      throw error;
    }
    
    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log('   - serviceId column removed from company_sales');
    console.log('   - spaceId column removed from company_sales');
    console.log('   - These fields are now available via company_appointments table');
    
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
  removeServiceIdSpaceIdFromSales()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeServiceIdSpaceIdFromSales };

