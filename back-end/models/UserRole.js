const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class UserRole {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.role = data.role;
    this.companyId = data.companyId;
    this.isActive = data.isActive;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      role: this.role,
      companyId: this.companyId,
      isActive: this.isActive,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new user role
  // Note: USER role (3) should not be created - it's the default for all users
  static async create(userRoleData) {
    try {
      const {
        userId,
        role,
        companyId = null,
        isActive = true,
        isDefault = false
      } = userRoleData;

      // Prevent creating USER role (3) - it's the default for everyone
      const { UserRole: UserRoleEnum } = require('../types/user');
      if (role === UserRoleEnum.USER) {
        console.warn(`[UserRole.create] Skipping USER role creation for user ${userId} - USER is the default role`);
        return null; // Return null instead of creating
      }

      const id = nanoid(10);
      const query = `
        INSERT INTO users_role (
          id, userId, role, companyId, isActive, isDefault, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        id,
        userId,
        role,
        companyId || null,
        isActive ? 1 : 0,
        isDefault ? 1 : 0
      ];

      await pool.execute(query, values);
      return id;
    } catch (error) {
      throw new Error(`Error creating user role: ${error.message}`);
    }
  }

  // Get all roles for a user (excluding USER role, which is the default)
  static async findByUserId(userId, includeInactive = false) {
    try {
      const { UserRole: UserRoleEnum } = require('../types/user');
      
      let query = 'SELECT * FROM users_role WHERE userId = ? AND role != ?';
      const params = [userId, UserRoleEnum.USER]; // Exclude USER role
      
      if (!includeInactive) {
        query += ' AND isActive = 1';
      }
      
      query += ' ORDER BY isDefault DESC, createdAt ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new UserRole(row));
    } catch (error) {
      throw new Error(`Error finding user roles: ${error.message}`);
    }
  }

  // Get roles for a user in a specific company
  static async findByUserAndCompany(userId, companyId) {
    try {
      const query = `
        SELECT * FROM users_role 
        WHERE userId = ? AND companyId = ? AND isActive = 1
        ORDER BY isDefault DESC, createdAt ASC
      `;
      
      const [rows] = await pool.execute(query, [userId, companyId]);
      return rows.map(row => new UserRole(row));
    } catch (error) {
      throw new Error(`Error finding user roles by company: ${error.message}`);
    }
  }

  // Get role by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users_role WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new UserRole(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user role: ${error.message}`);
    }
  }

  // Update user role
  static async update(id, updateData) {
    try {
      const allowedFields = ['role', 'companyId', 'isActive', 'isDefault'];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (key === 'isActive' || key === 'isDefault') {
            updates.push(`${key} = ?`);
            values.push(value ? 1 : 0);
          } else {
            updates.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updatedAt = NOW()');
      values.push(id);

      const query = `UPDATE users_role SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);
      
      return await UserRole.findById(id);
    } catch (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }
  }

  // Delete user role
  static async delete(id) {
    try {
      const query = 'DELETE FROM users_role WHERE id = ?';
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting user role: ${error.message}`);
    }
  }

  // Set default role for a user (only one default per user)
  static async setDefault(userId, roleId) {
    try {
      // First, unset all defaults for this user
      await pool.execute(
        'UPDATE users_role SET isDefault = 0 WHERE userId = ?',
        [userId]
      );
      
      // Then set the new default
      await pool.execute(
        'UPDATE users_role SET isDefault = 1 WHERE id = ? AND userId = ?',
        [roleId, userId]
      );
      
      return await UserRole.findById(roleId);
    } catch (error) {
      throw new Error(`Error setting default role: ${error.message}`);
    }
  }

  // Get default role for a user
  // Returns USER role (3) as default if no roles found in table
  static async getDefaultRole(userId) {
    try {
      const query = `
        SELECT * FROM users_role 
        WHERE userId = ? AND isDefault = 1 AND isActive = 1
        LIMIT 1
      `;
      
      const [rows] = await pool.execute(query, [userId]);
      
      // If no default role found, return USER role (3) as default
      if (rows.length === 0) {
        const { UserRole: UserRoleEnum } = require('../types/user');
        return {
          id: null,
          userId: userId,
          role: UserRoleEnum.USER,
          companyId: null,
          isActive: true,
          isDefault: true
        };
      }
      
      return new UserRole(rows[0]);
    } catch (error) {
      // If table doesn't exist, return USER role as default
      const { UserRole: UserRoleEnum } = require('../types/user');
      return {
        id: null,
        userId: userId,
        role: UserRoleEnum.USER,
        companyId: null,
        isActive: true,
        isDefault: true
      };
    }
  }

  // Check if user has a specific role in a company
  static async hasRole(userId, role, companyId = null) {
    try {
      let query = 'SELECT * FROM users_role WHERE userId = ? AND role = ? AND isActive = 1';
      const params = [userId, role];
      
      if (companyId !== null) {
        query += ' AND companyId = ?';
        params.push(companyId);
      } else {
        query += ' AND companyId IS NULL';
      }
      
      const [rows] = await pool.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking user role: ${error.message}`);
    }
  }
}

module.exports = UserRole;

