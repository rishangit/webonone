const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const crypto = require('crypto');

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

  // Create a new password reset token
  static async create(userId, expiresInHours = 1) {
    try {
      // Invalidate any existing unused tokens for this user
      await pool.execute(
        'UPDATE password_reset_tokens SET isUsed = TRUE WHERE userId = ? AND isUsed = FALSE',
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
        `INSERT INTO password_reset_tokens (id, userId, token, expiresAt) 
         VALUES (?, ?, ?, ?)`,
        [id, userId, token, expiresAt]
      );

      return token;
    } catch (error) {
      throw new Error(`Error creating password reset token: ${error.message}`);
    }
  }

  // Find token by token string
  static async findByToken(token) {
    try {
      const query = `
        SELECT * FROM password_reset_tokens 
        WHERE token = ? AND isUsed = FALSE AND expiresAt > NOW()
        ORDER BY createdAt DESC
        LIMIT 1
      `;
      const [rows] = await pool.execute(query, [token]);
      return rows.length > 0 ? new PasswordResetToken(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding password reset token: ${error.message}`);
    }
  }

  // Mark token as used
  async markAsUsed() {
    try {
      await pool.execute(
        'UPDATE password_reset_tokens SET isUsed = TRUE WHERE id = ?',
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
      await pool.execute(
        'DELETE FROM password_reset_tokens WHERE expiresAt < NOW() OR isUsed = TRUE'
      );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error.message);
    }
  }
}

module.exports = PasswordResetToken;
