const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

/**
 * Migration script to add company_users table
 * This table tracks which users are clients of which companies
 * Run this script if the table doesn't exist in your database
 */
async function addCompanyUsersTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding company_users table...');
    
    // Check if table already exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'company_users'`
    );
    
    if (tables.length > 0) {
      console.log('✅ company_users table already exists');
      return;
    }
    
    // Create the table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_users (
        id VARCHAR(10) PRIMARY KEY,
        companyId VARCHAR(10) NOT NULL,
        userId VARCHAR(10) NOT NULL,
        firstInteractionDate DATE NOT NULL,
        lastInteractionDate DATE NOT NULL,
        totalAppointments INT DEFAULT 0,
        totalSales INT DEFAULT 0,
        totalSpent DECIMAL(10,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (companyId),
        INDEX idx_user (userId),
        INDEX idx_company_user (companyId, userId),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_company_user (companyId, userId)
      )
    `);
    
    console.log('✅ company_users table created successfully');
    
    // Optionally, populate existing data from appointments and sales
    console.log('Populating company_users from existing appointments and sales...');
    
    // Get all unique company-user pairs from appointments
    const [appointments] = await connection.execute(`
      SELECT DISTINCT companyId, clientId as userId, MIN(date) as firstDate, MAX(date) as lastDate, COUNT(*) as appointmentCount
      FROM company_appointments
      WHERE companyId IS NOT NULL AND clientId IS NOT NULL
      GROUP BY companyId, clientId
    `);
    
    // Get all unique company-user pairs from sales
    const [sales] = await connection.execute(`
      SELECT DISTINCT companyId, userId, MIN(DATE(createdAt)) as firstDate, MAX(DATE(createdAt)) as lastDate, 
             COUNT(*) as saleCount, SUM(totalAmount) as totalSpent
      FROM company_sales
      WHERE companyId IS NOT NULL AND userId IS NOT NULL
      GROUP BY companyId, userId
    `);
    
    // Combine data
    const companyUserMap = new Map();
    
    // Process appointments
    for (const appt of appointments) {
      const key = `${appt.companyId}_${appt.userId}`;
      if (!companyUserMap.has(key)) {
        companyUserMap.set(key, {
          companyId: appt.companyId,
          userId: appt.userId,
          firstInteractionDate: appt.firstDate,
          lastInteractionDate: appt.lastDate,
          totalAppointments: appt.appointmentCount,
          totalSales: 0,
          totalSpent: 0
        });
      } else {
        const existing = companyUserMap.get(key);
        existing.firstInteractionDate = existing.firstInteractionDate < appt.firstDate 
          ? existing.firstInteractionDate 
          : appt.firstDate;
        existing.lastInteractionDate = existing.lastInteractionDate > appt.lastDate 
          ? existing.lastInteractionDate 
          : appt.lastDate;
        existing.totalAppointments = (existing.totalAppointments || 0) + appt.appointmentCount;
      }
    }
    
    // Process sales
    for (const sale of sales) {
      const key = `${sale.companyId}_${sale.userId}`;
      if (!companyUserMap.has(key)) {
        companyUserMap.set(key, {
          companyId: sale.companyId,
          userId: sale.userId,
          firstInteractionDate: sale.firstDate,
          lastInteractionDate: sale.lastDate,
          totalAppointments: 0,
          totalSales: sale.saleCount,
          totalSpent: parseFloat(sale.totalSpent) || 0
        });
      } else {
        const existing = companyUserMap.get(key);
        existing.firstInteractionDate = existing.firstInteractionDate < sale.firstDate 
          ? existing.firstInteractionDate 
          : sale.firstDate;
        existing.lastInteractionDate = existing.lastInteractionDate > sale.lastDate 
          ? existing.lastInteractionDate 
          : sale.lastDate;
        existing.totalSales = (existing.totalSales || 0) + sale.saleCount;
        existing.totalSpent = (parseFloat(existing.totalSpent) || 0) + (parseFloat(sale.totalSpent) || 0);
      }
    }
    
    // Insert all records
    let inserted = 0;
    for (const record of companyUserMap.values()) {
      try {
        const id = nanoid(10);
        await connection.execute(
          `INSERT INTO company_users 
           (id, companyId, userId, firstInteractionDate, lastInteractionDate, totalAppointments, totalSales, totalSpent) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            record.companyId,
            record.userId,
            record.firstInteractionDate,
            record.lastInteractionDate,
            record.totalAppointments || 0,
            record.totalSales || 0,
            record.totalSpent || 0
          ]
        );
        inserted++;
      } catch (error) {
        // Skip duplicates (shouldn't happen due to UNIQUE constraint, but just in case)
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error(`Error inserting company_user record: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Populated ${inserted} company_user records from existing data`);
    
  } catch (error) {
    console.error('❌ Error adding company_users table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addCompanyUsersTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addCompanyUsersTable };

