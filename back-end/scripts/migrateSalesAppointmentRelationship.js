const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../config/database');

const migrateSalesAppointmentRelationship = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting migration: Reverse sales-appointment relationship');
    console.log('   - Adding saleId to company_appointments');
    console.log('   - Migrating existing data');
    console.log('   - Removing appointmentId from company_sales');
    
    await connection.beginTransaction();
    
    // Step 1: Add saleId column to company_appointments if it doesn't exist
    console.log('\n📋 Step 1: Adding saleId column to company_appointments...');
    try {
      await connection.execute(`
        ALTER TABLE company_appointments 
        ADD COLUMN saleId VARCHAR(10) DEFAULT NULL,
        ADD INDEX idx_sale (saleId)
      `);
      console.log('   ✅ saleId column added to company_appointments');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  saleId column already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 2: Add foreign key constraint for saleId (after data migration)
    // We'll do this after migrating data to avoid constraint violations
    
    // Step 3: Migrate existing data
    // For each sale that has an appointmentId, update the corresponding appointment with the saleId
    console.log('\n📋 Step 2: Migrating existing data...');
    const [salesWithAppointments] = await connection.execute(`
      SELECT id, appointmentId 
      FROM company_sales 
      WHERE appointmentId IS NOT NULL AND appointmentId != ''
    `);
    
    console.log(`   Found ${salesWithAppointments.length} sales with appointmentId`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const sale of salesWithAppointments) {
      try {
        // Check if appointment exists
        const [appointments] = await connection.execute(
          'SELECT id FROM company_appointments WHERE id = ?',
          [sale.appointmentId]
        );
        
        if (appointments.length > 0) {
          // Update appointment with saleId
          await connection.execute(
            'UPDATE company_appointments SET saleId = ? WHERE id = ?',
            [sale.id, sale.appointmentId]
          );
          migratedCount++;
        } else {
          console.log(`   ⚠️  Appointment ${sale.appointmentId} not found for sale ${sale.id}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error migrating sale ${sale.id}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`   ✅ Migrated ${migratedCount} appointments`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  Skipped ${skippedCount} sales (appointments not found)`);
    }
    
    // Step 4: Add foreign key constraint for saleId
    console.log('\n📋 Step 3: Adding foreign key constraint...');
    try {
      // First, check if foreign key already exists
      const [foreignKeys] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_appointments' 
        AND COLUMN_NAME = 'saleId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (foreignKeys.length === 0) {
        await connection.execute(`
          ALTER TABLE company_appointments 
          ADD CONSTRAINT fk_appointment_sale 
          FOREIGN KEY (saleId) REFERENCES company_sales(id) ON DELETE SET NULL
        `);
        console.log('   ✅ Foreign key constraint added');
      } else {
        console.log('   ⚠️  Foreign key constraint already exists, skipping...');
      }
    } catch (error) {
      if (error.code === 'ER_DUP_KEY' || error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  Foreign key constraint already exists, skipping...');
      } else {
        console.error('   ⚠️  Could not add foreign key constraint:', error.message);
        console.log('   ℹ️  You may need to add it manually');
      }
    }
    
    // Step 5: Remove appointmentId column from company_sales
    console.log('\n📋 Step 4: Removing appointmentId column from company_sales...');
    try {
      // First, check if column exists
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company_sales' 
        AND COLUMN_NAME = 'appointmentId'
      `);
      
      if (columns.length > 0) {
        // Remove index first if it exists
        try {
          await connection.execute(`
            ALTER TABLE company_sales 
            DROP INDEX idx_appointment
          `);
        } catch (error) {
          // Index might not exist, that's okay
          if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log('   ⚠️  Could not drop index:', error.message);
          }
        }
        
        // Remove foreign key constraint if it exists
        try {
          const [fkConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'company_sales' 
            AND COLUMN_NAME = 'appointmentId'
            AND REFERENCED_TABLE_NAME IS NOT NULL
          `);
          
          if (fkConstraints.length > 0) {
            await connection.execute(`
              ALTER TABLE company_sales 
              DROP FOREIGN KEY ${fkConstraints[0].CONSTRAINT_NAME}
            `);
          }
        } catch (error) {
          console.log('   ⚠️  Could not drop foreign key:', error.message);
        }
        
        // Remove the column
        await connection.execute(`
          ALTER TABLE company_sales 
          DROP COLUMN appointmentId
        `);
        console.log('   ✅ appointmentId column removed from company_sales');
      } else {
        console.log('   ⚠️  appointmentId column does not exist, skipping...');
      }
    } catch (error) {
      console.error('   ❌ Error removing appointmentId column:', error.message);
      throw error;
    }
    
    await connection.commit();
    console.log('\n✅ Migration completed successfully!');
    console.log(`   - ${migratedCount} appointments updated with saleId`);
    console.log('   - appointmentId removed from company_sales');
    
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
  migrateSalesAppointmentRelationship()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSalesAppointmentRelationship };

