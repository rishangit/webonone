const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const crypto = require('crypto');

// Table name - supports both old and new table names for backward compatibility
// Always prefers authentication_tokens if it exists, otherwise falls back to password_reset_tokens
const getTableName = async () => {
  try {
    // First check if authentication_tokens table exists (preferred)
    const [newTable] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'authentication_tokens'
      LIMIT 1
    `);
    
    if (newTable.length > 0) {
      return 'authentication_tokens';
    }
    
    // Fallback to old table name if new one doesn't exist
    const [oldTable] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'password_reset_tokens'
      LIMIT 1
    `);
    
    if (oldTable.length > 0) {
      return 'password_reset_tokens';
    }
    
    // Default to new table name if neither exists (will be created by initDatabase)
    return 'authentication_tokens';
  } catch (error) {
    // Fallback to new table name
    return 'authentication_tokens';
  }
};

class PasswordResetToken {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.token = data.token;
    this.expiresAt = data.expiresAt;
    this.isUsed = data.isUsed;
    this.createdAt = data.createdAt;
  }

  // Generate a secure random token
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Get table name (cached for performance)
  static _tableName = null;
  static async _getTableName() {
    if (!this._tableName) {
      this._tableName = await getTableName();
    }
    return this._tableName;
  }

  // Expose table name getter for use in routes
  static async getTableName() {
    return await this._getTableName();
  }

  // Create a new authentication token (password reset, email verification, etc.)
  static async create(userId, expiresInHours = 1) {
    try {
      const tableName = await this._getTableName();
      
      // Invalidate any existing unused tokens for this user
      await pool.execute(
        `UPDATE ${tableName} SET isUsed = TRUE WHERE userId = ? AND isUsed = FALSE`,
        [userId]
      );

      // Generate secure token
      const token = this.generateToken();
      const id = nanoid(10);
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      // Insert token
      await pool.execute(
        `INSERT INTO ${tableName} (id, userId, token, expiresAt) 
         VALUES (?, ?, ?, ?)`,
        [id, userId, token, expiresAt]
      );

      return token;
    } catch (error) {
      throw new Error(`Error creating authentication token: ${error.message}`);
    }
  }

  // Find token by token string
  static async findByToken(token) {
    try {
      const tableName = await this._getTableName();
      const query = `
        SELECT * FROM ${tableName} 
        WHERE token = ? AND isUsed = FALSE AND expiresAt > NOW()
        ORDER BY createdAt DESC
        LIMIT 1
      `;
      const [rows] = await pool.execute(query, [token]);
      return rows.length > 0 ? new PasswordResetToken(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding authentication token: ${error.message}`);
    }
  }

  // Mark token as used
  async markAsUsed() {
    try {
      const tableName = await PasswordResetToken._getTableName();
      await pool.execute(
        `UPDATE ${tableName} SET isUsed = TRUE WHERE id = ?`,
        [this.id]
      );
      this.isUsed = true;
    } catch (error) {
      throw new Error(`Error marking token as used: ${error.message}`);
    }
  }

  // Clean up expired tokens (optional utility method)
  static async cleanupExpired() {
    try {
      const tableName = await this._getTableName();
      await pool.execute(
        `DELETE FROM ${tableName} WHERE expiresAt < NOW() OR isUsed = TRUE`
      );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error.message);
    }
  }
}

module.exports = PasswordResetToken;
