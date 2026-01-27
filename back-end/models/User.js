const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class User {
  constructor(data) {
    // Helper function to safely parse JSON
    const safeJsonParse = (jsonString, defaultValue) => {
      if (!jsonString || jsonString === 'null' || jsonString === null) {
        return defaultValue;
      }
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('JSON parse error:', error.message, 'for value:', jsonString);
        return defaultValue;
      }
    };

    this.id = data.id;
    this.email = data.email;
    this.password = data.password; // Store password but don't expose in toJSON
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || null; // Deprecated - use users_role table instead
    this.roleLevel = data.role || null; // roleLevel is the same as role (for backward compatibility)
    this.avatar = data.avatar;
    this.companyId = data.companyId || null; // Deprecated - get from users_role table instead
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
    this.preferences = safeJsonParse(data.preferences, {});
    // permissions removed - now using role-based access control
    this.isActive = data.isActive;
    this.isVerified = data.isVerified;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastLogin = data.lastLogin;
    // appointmentsCount, totalSpent, joinDate, emergencyContact removed
  }

  // Get full name by combining firstName and lastName
  getFullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // Get user data with full name for API responses
  // Note: role should be fetched from users_role table, this is for backward compatibility
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.getFullName(),
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role, // Deprecated - will be null after migration
      avatar: this.avatar,
      companyId: this.companyId || null, // Deprecated - get from users_role table instead
      phone: this.phone,
      address: this.address,
      dateOfBirth: this.dateOfBirth,
      preferences: this.preferences,
      // permissions removed - now using role-based access control
      isActive: this.isActive,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin
      // appointmentsCount, totalSpent, joinDate, emergencyContact removed
    };
  }

  // Get user's current role from users_role table
  // Returns USER role (3) as default if no roles found
  static async getCurrentRole(userId, companyId = null) {
    try {
      const UserRole = require('./UserRole');
      const { UserRole: UserRoleEnum } = require('../types/user');
      
      // If companyId is provided, get role for that company
      if (companyId) {
        const roles = await UserRole.findByUserAndCompany(userId, companyId);
        if (roles.length > 0) {
          return roles[0].role;
        }
        // If no role found for company, return USER as default
        return UserRoleEnum.USER;
      }
      
      // Otherwise, get default role (will return USER if none found)
      const defaultRole = await UserRole.getDefaultRole(userId);
      return defaultRole.role || UserRoleEnum.USER;
    } catch (error) {
      console.warn('Error getting current role from users_role table:', error.message);
      // Fallback to USER role if table doesn't exist
      return 3; // USER role
    }
  }

  // Create a new user
  // Note: role parameter is deprecated - roles should be added to users_role table after user creation
  static async create(userData) {
    try {
      const {
        email, password, firstName, lastName, role, avatar, companyId,
        phone, address, dateOfBirth, preferences,
        permissions, isActive, isVerified
        // appointmentsCount, totalSpent, joinDate, emergencyContact removed
      } = userData;

      const id = nanoid(10); // Generate NanoID for new user
      
      // Check if role column exists in users table
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      `);
      
      const hasRoleColumn = columns.length > 0;
      
      // Build query based on whether role column exists
      let query, values;
      if (hasRoleColumn) {
        query = `
          INSERT INTO users (
            id, email, password, firstName, lastName, role, avatar,
            phone, address, dateOfBirth, preferences,
            isActive, isVerified, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        values = [
          id,
          email,
          password || '', // Use empty string instead of null to satisfy NOT NULL constraint
          firstName, 
          lastName, 
          role || 3, // Default to USER role if not provided
          avatar || null, 
          phone || null, 
          address || null, 
          dateOfBirth || null, 
          JSON.stringify(preferences || {}),
          isActive !== undefined ? isActive : true,
          isVerified !== undefined ? isVerified : false
        ];
      } else {
        // Role column doesn't exist - don't include it
        query = `
          INSERT INTO users (
            id, email, password, firstName, lastName, avatar,
            phone, address, dateOfBirth, preferences,
            isActive, isVerified, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        values = [
          id,
          email,
          password || '', // Use empty string instead of null to satisfy NOT NULL constraint
          firstName, 
          lastName, 
          avatar || null, 
          phone || null, 
          address || null, 
          dateOfBirth || null, 
          JSON.stringify(preferences || {}),
          isActive !== undefined ? isActive : true,
          isVerified !== undefined ? isVerified : false
        ];
      }

      await pool.execute(query, values);
      return id;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Get user by email (handles both exact match and email with timestamp pattern)
  static async findByEmail(email) {
    try {
      // First try exact match
      let query = 'SELECT * FROM users WHERE email = ?';
      let [rows] = await pool.execute(query, [email]);
      
      // If not found and email contains @, try to find with timestamp pattern
      // This handles users registered before we removed email modification
      // Pattern: localPart+timestamp@domain matches localPart@domain
      if (rows.length === 0 && email.includes('@')) {
        const [localPart, domain] = email.split('@');
        // Try to find email with timestamp pattern: localPart+timestamp@domain
        query = 'SELECT * FROM users WHERE email LIKE ?';
        const pattern = `${localPart}+%@${domain}`;
        [rows] = await pool.execute(query, [pattern]);
      }
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Get all users (following Category pattern EXACTLY)
  // Note: role filtering should be done via users_role table join
  static async findAll(options = {}) {
    try {
      const { page, limit, role, companyId, isActive } = options;
      
      // Check if role column exists
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      `);
      const hasRoleColumn = columns.length > 0;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      // Check if we need to join users_role table (for role or companyId filtering)
      const needsRoleJoin = (!hasRoleColumn && role !== undefined) || companyId !== undefined;
      
      if (companyId) {
        // Includes both staff (from users_role) and clients (from company_users)
        query = `
          SELECT DISTINCT u.* FROM users u
          LEFT JOIN users_role ur ON u.id = ur.userId AND ur.isActive = 1
          LEFT JOIN company_users cu ON u.id = cu.userId
          WHERE 1=1
        `;
        
        if (role !== undefined) {
          const roleNum = parseInt(role, 10);
          if (roleNum === 3) {
            query += ' AND ((ur.companyId = ? AND ur.role = 3) OR (cu.companyId = ? AND ur.id IS NULL))';
            params.push(companyId, companyId);
          } else {
            query += ' AND ur.companyId = ? AND ur.role = ?';
            params.push(companyId, roleNum);
          }
        } else {
          query += ' AND (ur.companyId = ? OR cu.companyId = ?)';
          params.push(companyId, companyId);
        }
      } else if (role !== undefined && !hasRoleColumn) {
        // Only role filter, no company filter
        query = `
          SELECT DISTINCT u.* FROM users u
          INNER JOIN users_role ur ON u.id = ur.userId
          WHERE ur.isActive = 1 AND ur.role = ?
        `;
        params.push(role);
      } else {
        // Simple query without join
        if (hasRoleColumn && role !== undefined) {
          query += ' AND role = ?';
          params.push(role);
        }
      }

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(isActive ? 1 : 0);
      }

      query += ' ORDER BY createdAt DESC';

      if (page && limit && !isNaN(page) && !isNaN(limit)) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
      }

      // Ensure params is always an array
      const finalParams = Array.isArray(params) ? params : [];
      
      // Debug: Log query and params before execution
      const placeholderCount = (query.match(/\?/g) || []).length;
      console.log('User.findAll - Query:', query);
      console.log('User.findAll - Params:', finalParams);
      console.log('User.findAll - Placeholder count:', placeholderCount, 'Params count:', finalParams.length);
      console.log('User.findAll - Options received:', JSON.stringify(options));

      if (placeholderCount !== finalParams.length) {
        console.error('PARAMETER MISMATCH DETECTED!');
        console.error('Query:', query);
        console.error('Expected params:', placeholderCount);
        console.error('Actual params:', finalParams.length);
        console.error('Params array:', finalParams);
        throw new Error(`Parameter count mismatch: ${placeholderCount} placeholders but ${finalParams.length} parameters`);
      }

      const [rows] = await pool.execute(query, finalParams);
      return rows.map(row => new User(row));
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Get users with pagination, search, filters
  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search,
        role,
        companyId,
        isActive,
      } = options;

      // Debug: Log search parameter
      console.log('[User.findAllPaginated] Received options:', { search, searchType: typeof search, hasSearch: !!search, searchLength: search ? search.length : 0 });

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      // Check if role column exists
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      `);
      const hasRoleColumn = columns.length > 0;

      // Build WHERE clause
      const whereConditions = [];
      const params = [];

      // Check if we need to join users_role table
      const needsRoleJoin = (!hasRoleColumn && role !== undefined) || companyId !== undefined;
      const tableAlias = needsRoleJoin ? 'u' : 'users';
      const baseTable = needsRoleJoin ? 'users u' : 'users';
      let roleJoin = '';

      if (companyId) {
        // Special join logic for company users:
        // Includes both staff (from users_role) and clients (from company_users)
        roleJoin = `
          LEFT JOIN users_role ur ON ${tableAlias}.id = ur.userId AND ur.isActive = 1
          LEFT JOIN company_users cu ON ${tableAlias}.id = cu.userId
        `;
        
        if (role !== undefined) {
          const roleNum = parseInt(role, 10);
          if (roleNum === 3) {
            // Searching for 'User' role (Clients)
            // They can be in users_role with role 3 OR in company_users (where they may not have a users_role entry)
            whereConditions.push(`((ur.companyId = ? AND ur.role = 3) OR (cu.companyId = ? AND ur.id IS NULL))`);
            params.push(companyId, companyId);
          } else {
            // Searching for Staff roles (Admin, Owner, Staff Member)
            // These MUST be in users_role table
            whereConditions.push(`ur.companyId = ? AND ur.role = ?`);
            params.push(companyId, roleNum);
          }
        } else {
          // No role filter - return anyone associated with the company
          whereConditions.push(`(ur.companyId = ? OR cu.companyId = ?)`);
          params.push(companyId, companyId);
        }
      } else if (role !== undefined && !hasRoleColumn) {
        // No company filter, but role filter requested on non-legacy table
        roleJoin = `INNER JOIN users_role ur ON ${tableAlias}.id = ur.userId AND ur.isActive = 1`;
        whereConditions.push(`ur.role = ?`);
        params.push(role);
      } else {
        // Legacy simple query without join
        if (hasRoleColumn && role !== undefined) {
          whereConditions.push(`role = ?`);
          params.push(role);
        }
      }

      // Search filter (case-insensitive, filters by name and email only)
      if (search) {
        const searchValue = typeof search === 'string' ? search.trim() : String(search).trim();
        if (searchValue.length > 0) {
          console.log('[User.findAllPaginated] Adding search condition for:', searchValue);
          whereConditions.push(`(
            LOWER(${tableAlias}.firstName) LIKE ? OR 
            LOWER(${tableAlias}.lastName) LIKE ? OR 
            LOWER(CONCAT(${tableAlias}.firstName, ' ', ${tableAlias}.lastName)) LIKE ? OR 
            LOWER(${tableAlias}.email) LIKE ?
          )`);
          const searchPattern = `%${searchValue.toLowerCase()}%`;
          // Push 4 times: firstName, lastName, fullName, email
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        } else {
          console.log('[User.findAllPaginated] Search value is empty after trim');
        }
      } else {
        console.log('[User.findAllPaginated] No search parameter provided');
      }

      // Status filter
      if (isActive !== undefined) {
        whereConditions.push(`${tableAlias}.isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching users
      const countQuery = `
        SELECT COUNT(DISTINCT ${tableAlias}.id) as total
        FROM ${baseTable}
        ${roleJoin}
        ${whereClause}
      `;
      
      console.log('User count query:', countQuery.replace(/\s+/g, ' ').trim());
      console.log('User count params:', params);
      
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated users
      const dataQuery = `
        SELECT DISTINCT ${tableAlias}.*
        FROM ${baseTable}
        ${roleJoin}
        ${whereClause}
        ORDER BY ${tableAlias}.createdAt DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      console.log('User data query:', dataQuery.replace(/\s+/g, ' ').trim());
      console.log('User data params:', params);
      
      const [rows] = await pool.execute(dataQuery, params);
      
      const users = rows.map(row => new User(row));

      return {
        users,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      console.error('Error in findAllPaginated:', error);
      throw new Error(`Error finding paginated users: ${error.message}`);
    }
  }

  // Update user
  async update(updateData) {
    try {
      // Check if role column exists
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      `);
      const hasRoleColumn = columns.length > 0;
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        // Skip role field if column doesn't exist
        if (key === 'role' && !hasRoleColumn) {
          return;
        }
        
        // Skip removed columns
        if (key === 'appointmentsCount' || key === 'totalSpent' || key === 'joinDate' || key === 'emergencyContact') {
          return;
        }
        
        if (updateData[key] !== undefined) {
          if (key === 'preferences' || key === 'permissions') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
          }
        }
      });

      if (fields.length === 0) return;

      fields.push('updatedAt = NOW()');
      values.push(this.id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      // Update local instance (but don't set role if column doesn't exist)
      const localUpdate = { ...updateData };
      if (!hasRoleColumn && 'role' in localUpdate) {
        delete localUpdate.role;
      }
      Object.assign(this, localUpdate);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Get user statistics
  static async getStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as totalUsers FROM users',
        'SELECT COUNT(*) as activeUsers FROM users WHERE isActive = true',
        'SELECT COUNT(*) as newUsersThisMonth FROM users WHERE MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())'
      ];

      const [totalUsers] = await pool.execute(queries[0]);
      const [activeUsers] = await pool.execute(queries[1]);
      const [newUsersThisMonth] = await pool.execute(queries[2]);

      return {
        totalUsers: totalUsers[0].totalUsers,
        activeUsers: activeUsers[0].activeUsers,
        newUsersThisMonth: newUsersThisMonth[0].newUsersThisMonth,
        userGrowthRate: 18.5 // This would be calculated based on historical data
        // appointmentsCount and totalSpent removed - calculate from appointments/sales if needed
      };
    } catch (error) {
      throw new Error(`Error getting user statistics: ${error.message}`);
    }
  }

  // Get users by role (from users_role table)
  static async getUsersByRole() {
    try {
      // Check if role column exists in users table
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      `);
      const hasRoleColumn = columns.length > 0;
      
      let query, rows;
      
      if (hasRoleColumn) {
        // Use old method if role column exists
        query = `
          SELECT role, COUNT(*) as count 
          FROM users 
          WHERE isActive = true 
          GROUP BY role
        `;
        [rows] = await pool.execute(query);
      } else {
        // Use users_role table
        query = `
          SELECT ur.role, COUNT(DISTINCT ur.userId) as count 
          FROM users_role ur
          INNER JOIN users u ON ur.userId = u.id
          WHERE ur.isActive = true AND u.isActive = true
          GROUP BY ur.role
        `;
        [rows] = await pool.execute(query);
      }
      
      const usersByRole = {};
      rows.forEach(row => {
        if (row.role !== null && row.role !== undefined) {
          const roleKey = String(row.role).toLowerCase().replace(/\s+/g, '');
          usersByRole[roleKey] = row.count;
        }
      });

      return usersByRole;
    } catch (error) {
      throw new Error(`Error getting users by role: ${error.message}`);
    }
  }
}

module.exports = User;

