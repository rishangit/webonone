const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

/**
 * Add or update a user in the company_users table
 * This tracks which users are clients of which companies
 * @param {string} companyId - The company ID
 * @param {string} userId - The user/client ID
 * @param {string} interactionType - 'appointment' or 'sale'
 * @param {number} amount - Optional amount spent (for sales)
 */
async function addOrUpdateCompanyUser(companyId, userId, interactionType = 'appointment', amount = 0) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if the company_user record already exists
    const [existing] = await connection.execute(
      'SELECT id, totalAppointments, totalSales, totalSpent, firstInteractionDate, lastInteractionDate FROM company_users WHERE companyId = ? AND userId = ?',
      [companyId, userId]
    );
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (existing.length > 0) {
      // Update existing record
      const record = existing[0];
      const updates = {
        lastInteractionDate: today,
        totalAppointments: interactionType === 'appointment' 
          ? (record.totalAppointments || 0) + 1 
          : record.totalAppointments || 0,
        totalSales: interactionType === 'sale' 
          ? (record.totalSales || 0) + 1 
          : record.totalSales || 0,
        totalSpent: (parseFloat(record.totalSpent) || 0) + (parseFloat(amount) || 0)
      };
      
      await connection.execute(
        `UPDATE company_users 
         SET lastInteractionDate = ?, 
             totalAppointments = ?, 
             totalSales = ?, 
             totalSpent = ?,
             updatedAt = NOW()
         WHERE id = ?`,
        [
          updates.lastInteractionDate,
          updates.totalAppointments,
          updates.totalSales,
          updates.totalSpent,
          record.id
        ]
      );
    } else {
      // Create new record
      const id = nanoid(10);
      await connection.execute(
        `INSERT INTO company_users 
         (id, companyId, userId, firstInteractionDate, lastInteractionDate, totalAppointments, totalSales, totalSpent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          companyId,
          userId,
          today,
          today,
          interactionType === 'appointment' ? 1 : 0,
          interactionType === 'sale' ? 1 : 0,
          parseFloat(amount) || 0
        ]
      );
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    // Log error but don't throw - we don't want to fail the appointment/sale creation
    console.error(`[CompanyUsers] Error adding/updating company user: ${error.message}`);
    // Don't throw - this is a non-critical operation
  } finally {
    connection.release();
  }
}

module.exports = {
  addOrUpdateCompanyUser
};

