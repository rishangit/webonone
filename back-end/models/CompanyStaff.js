const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyStaff {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.userId = data.userId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.avatar = data.avatar;
    this.status = data.status || 'Active';
    this.bio = data.bio;
    this.address = data.address;
    this.permissions = data.permissions;
    this.emergencyContact = data.emergencyContact;
    this.workSchedule = data.workSchedule;
    this.joinDate = data.joinDate;
    this.lastActive = data.lastActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    // Helper function to safely parse JSON
    const safeParseJSON = (value, defaultValue) => {
      if (!value) return defaultValue;
      if (typeof value === 'object') return value;
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
      }
    };

    // Safely construct name field
    const firstName = this.firstName || '';
    const lastName = this.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || this.email || 'Unknown';

    return {
      id: this.id,
      companyId: this.companyId,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      name: name,
      email: this.email,
      phone: this.phone,
      avatar: this.avatar,
      status: this.status,
      bio: this.bio,
      address: this.address,
      permissions: safeParseJSON(this.permissions, {}),
      emergencyContact: safeParseJSON(this.emergencyContact, null),
      workSchedule: safeParseJSON(this.workSchedule, null),
      joinDate: this.joinDate,
      lastActive: this.lastActive || 'Just now',
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const id = nanoid(10);
      // Only store userId reference and staff-specific fields
      // User data (firstName, lastName, email, phone, avatar, address) will come from users table via JOIN
      const query = `
        INSERT INTO company_staff (
          id, companyId, userId, status, bio, permissions, 
          emergencyContact, workSchedule, joinDate, lastActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.companyId,
        data.userId || null,
        data.status || 'Active',
        data.bio || null,
        data.permissions ? JSON.stringify(data.permissions) : null,
        data.emergencyContact ? JSON.stringify(data.emergencyContact) : null,
        data.workSchedule ? JSON.stringify(data.workSchedule) : null,
        data.joinDate || new Date().toISOString().split('T')[0],
        data.lastActive || 'Just now'
      ];

      await connection.execute(query, values);
      
      await connection.commit();
      const staff = await CompanyStaff.findById(id);
      return staff;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating staff: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          cs.*,
          u.firstName as userFirstName,
          u.lastName as userLastName,
          u.email as userEmail,
          u.phone as userPhone,
          u.avatar as userAvatar,
          u.address as userAddress
        FROM company_staff cs
        LEFT JOIN users u ON cs.userId = u.id
        WHERE cs.id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      // Use user data if userId exists, otherwise use staff table data (for backward compatibility)
      const staffData = {
        ...row,
        firstName: row.userFirstName || row.firstName || null,
        lastName: row.userLastName || row.lastName || null,
        email: row.userEmail || row.email || null,
        phone: row.userPhone || row.phone || null,
        avatar: row.userAvatar || row.avatar || null,
        address: row.userAddress || row.address || null
      };

      const staff = new CompanyStaff(staffData);
      try {
        return staff.toJSON();
      } catch (error) {
        console.error('Error converting staff to JSON:', error);
        // Return a minimal safe object if JSON conversion fails
        return {
          id: staff.id,
          companyId: staff.companyId,
          userId: staff.userId,
          firstName: staff.firstName || '',
          lastName: staff.lastName || '',
          name: staff.email || 'Unknown',
          email: staff.email || '',
          status: staff.status || 'Active'
        };
      }
    } catch (error) {
      throw new Error(`Error finding staff: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        companyId,
        status,
        role,
        department,
      } = options || {};

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = `SELECT 
        cs.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        u.address as userAddress
      FROM company_staff cs
      LEFT JOIN users u ON cs.userId = u.id
      WHERE 1=1`;
      const params = [];

      if (companyId) {
        query += ' AND cs.companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND cs.status = ?';
        params.push(status);
      }

      // Search filter
      if (search && search.trim()) {
        query += ` AND (
          u.firstName LIKE ? OR 
          u.lastName LIKE ? OR 
          u.email LIKE ? OR 
          u.phone LIKE ? OR
          CONCAT(u.firstName, ' ', u.lastName) LIKE ?
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Count total matching staff
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT cs.id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated staff
      query += ' ORDER BY cs.createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      let rows;
      try {
        [rows] = await pool.execute(query, params);
      } catch (dbError) {
        console.error('Database query error in CompanyStaff.findAll:', dbError);
        console.error('Query:', query);
        console.error('Params:', params);
        throw new Error(`Database query failed: ${dbError.message}`);
      }
      
      // If no rows, return empty array with pagination info
      if (!rows || rows.length === 0) {
        return {
          staff: [],
          pagination: {
            total: 0,
            limit: limitInt,
            offset: offsetInt,
            totalPages: 0,
            currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
          },
        };
      }
      
      // Map rows to use user data when available
      const staff = rows.map(row => {
        try {
          const staffData = {
            ...row,
            firstName: row.userFirstName || row.firstName || null,
            lastName: row.userLastName || row.lastName || null,
            email: row.userEmail || row.email || null,
            phone: row.userPhone || row.phone || null,
            avatar: row.userAvatar || row.avatar || null,
            address: row.userAddress || row.address || null
          };
          return new CompanyStaff(staffData);
        } catch (error) {
          console.error('Error creating CompanyStaff instance:', error, row);
          // Return a minimal safe object if creation fails
          return {
            id: row.id,
            companyId: row.companyId,
            userId: row.userId,
            firstName: row.userFirstName || row.firstName || '',
            lastName: row.userLastName || row.lastName || '',
            email: row.userEmail || row.email || '',
            status: row.status || 'Active'
          };
        }
      });
      
      const staffArray = staff.map(s => {
        try {
          // If s is already a plain object (from error handling above), return it
          if (s && typeof s.toJSON !== 'function') {
            return {
              ...s,
              name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Unknown'
            };
          }
          return s.toJSON();
        } catch (error) {
          console.error('Error converting staff to JSON:', error, s);
          // Return a minimal safe object if JSON conversion fails
          return {
            id: s.id || '',
            companyId: s.companyId || '',
            userId: s.userId || null,
            firstName: s.firstName || '',
            lastName: s.lastName || '',
            name: s.email || 'Unknown',
            email: s.email || '',
            status: s.status || 'Active'
          };
        }
      });

      return {
        staff: staffArray,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      console.error('Error in CompanyStaff.findAll:', error);
      throw new Error(`Error finding staff: ${error.message}`);
    }
  }

  async update(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const fields = [];
      const values = [];

      // Only allow updating staff-specific fields, not user data
      // User data (firstName, lastName, email, phone, avatar, address) should be updated in users table
      if (data.userId !== undefined) {
        fields.push('userId = ?');
        values.push(data.userId);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.bio !== undefined) {
        fields.push('bio = ?');
        values.push(data.bio);
      }
      if (data.permissions !== undefined) {
        fields.push('permissions = ?');
        values.push(data.permissions ? JSON.stringify(data.permissions) : null);
      }
      if (data.emergencyContact !== undefined) {
        fields.push('emergencyContact = ?');
        values.push(data.emergencyContact ? JSON.stringify(data.emergencyContact) : null);
      }
      if (data.workSchedule !== undefined) {
        fields.push('workSchedule = ?');
        values.push(data.workSchedule ? JSON.stringify(data.workSchedule) : null);
      }
      if (data.lastActive !== undefined) {
        fields.push('lastActive = ?');
        values.push(data.lastActive);
      }

      // Update staff fields if any
      if (fields.length > 0) {
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(this.id);
        const query = `UPDATE company_staff SET ${fields.join(', ')} WHERE id = ?`;
        await connection.execute(query, values);
      }
      
      await connection.commit();
      const updated = await CompanyStaff.findById(this.id);
      return updated;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating staff: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_staff WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting staff: ${error.message}`);
    }
  }
}

module.exports = CompanyStaff;

