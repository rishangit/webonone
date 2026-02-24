const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class BacklogItem {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.type = data.type || 'Issue';
    this.status = data.status || 'New';
    this.priority = data.priority || data.priority || 'Medium';
    this.displayOrder = data.display_order !== undefined ? data.display_order : (data.displayOrder !== undefined ? data.displayOrder : null);
    this.screenshotPath = data.screenshot_path || data.screenshotPath || null;
    this.createdBy = data.created_by || data.createdBy;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  static async create(data) {
    try {
      const id = nanoid(10);
      // Get the next displayOrder (highest + 1, or 1 if none exist)
      const [maxOrderResult] = await pool.execute(
        `SELECT COALESCE(MAX(display_order), 0) as max_order FROM backlog_items`
      );
      const nextDisplayOrder = (maxOrderResult[0]?.max_order || 0) + 1;

      await pool.execute(
        `INSERT INTO backlog_items (id, title, description, type, status, priority, display_order, screenshot_path, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.title,
          data.description,
          data.type || 'Issue',
          data.status || 'New',
          data.priority || 'Medium',
          nextDisplayOrder, // New items go to top
          data.screenshotPath || null,
          data.createdBy
        ]
      );
      
      const item = await BacklogItem.findById(id);
      return item;
    } catch (error) {
      throw new Error(`Error creating backlog item: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT bi.*, 
                u.firstName, u.lastName, u.email 
         FROM backlog_items bi
         LEFT JOIN users u ON bi.created_by COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
         WHERE bi.id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const item = new BacklogItem(row);
      // Add creator info
      item.creator = {
        id: row.created_by,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email
      };
      
      return item;
    } catch (error) {
      throw new Error(`Error finding backlog item: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        type,
        status,
        createdBy
      } = options;

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      // Build WHERE clause
      const whereConditions = [];
      const params = [];

      // Search filter
      if (search && search.trim()) {
        whereConditions.push(`(bi.title LIKE ? OR bi.description LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      // Type filter
      if (type) {
        whereConditions.push(`bi.type = ?`);
        params.push(type);
      }

      // Status filter
      if (status) {
        whereConditions.push(`bi.status = ?`);
        params.push(status);
      }

      // Created by filter
      if (createdBy) {
        whereConditions.push(`bi.created_by = ?`);
        params.push(createdBy);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching items
      const countQuery = `
        SELECT COUNT(*) as total
        FROM backlog_items bi
        ${whereClause}
      `;
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated items
      // Order by: priority items first (High/Urgent), then by display_order, then by created_at DESC
      const dataQuery = `
        SELECT bi.*, 
               u.firstName, u.lastName, u.email,
               CASE 
                 WHEN bi.priority = 'Urgent' THEN 1
                 WHEN bi.priority = 'High' THEN 2
                 ELSE 3
               END as priority_order
        FROM backlog_items bi
        LEFT JOIN users u ON bi.created_by COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
        ${whereClause}
        ORDER BY 
          priority_order ASC,
          COALESCE(bi.display_order, 999999) ASC,
          bi.created_at DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const [rows] = await pool.execute(dataQuery, params);
      
      const items = rows.map(row => {
        const item = new BacklogItem(row);
        // Add creator info
        item.creator = {
          id: row.created_by,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email
        };
        return item;
      });

      return {
        items,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error(`Error finding backlog items: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.title !== undefined) {
        updateFields.push('title = ?');
        values.push(data.title);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        values.push(data.description);
      }
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        values.push(data.type);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        values.push(data.status);
      }
      if (data.screenshotPath !== undefined) {
        updateFields.push('screenshot_path = ?');
        values.push(data.screenshotPath);
      }
      if (data.priority !== undefined) {
        updateFields.push('priority = ?');
        values.push(data.priority);
      }
      if (data.displayOrder !== undefined) {
        updateFields.push('display_order = ?');
        values.push(data.displayOrder);
      }

      if (updateFields.length === 0) {
        return await BacklogItem.findById(id);
      }

      values.push(id);
      await pool.execute(
        `UPDATE backlog_items SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return await BacklogItem.findById(id);
    } catch (error) {
      throw new Error(`Error updating backlog item: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM backlog_items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting backlog item: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      priority: this.priority || 'Medium',
      displayOrder: this.displayOrder,
      screenshotPath: this.screenshotPath,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      creator: this.creator || null
    };
  }
}

module.exports = BacklogItem;
