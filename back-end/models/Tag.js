const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Tag {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color || '#3B82F6';
    this.icon = data.icon;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.usageCount = data.usageCount || 0;
    this.createdDate = data.createdDate;
    this.lastModified = data.lastModified;
  }

  static async create(data) {
    try {
      const id = nanoid(10); // Generate NanoID for new tag
      await pool.execute(
        'INSERT INTO tags (id, name, description, color, icon, isActive) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.name, data.description || null, data.color || '#3B82F6', data.icon || null, data.isActive ?? true]
      );
      
      const tag = await Tag.findById(id);
      return tag;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Tag with this name already exists');
      }
      throw new Error(`Error creating tag: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM tags WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      return new Tag(rows[0]);
    } catch (error) {
      throw new Error(`Error finding tag: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM tags WHERE name = ?',
        [name]
      );
      
      if (rows.length === 0) {
        return null;
      }

      return new Tag(rows[0]);
    } catch (error) {
      throw new Error(`Error finding tag by name: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { activeOnly = false, search = null } = options;
      
      let query = 'SELECT * FROM tags WHERE 1=1';
      const params = [];

      if (activeOnly) {
        query += ' AND isActive = ?';
        params.push(1);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY usageCount DESC, name ASC';

      const [rows] = await pool.execute(query, params);
      
      return rows.map(row => new Tag(row));
    } catch (error) {
      throw new Error(`Error finding tags: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        isActive,
      } = options;

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      // Build WHERE clause
      const whereConditions = [];
      const params = [];

      // Search filter
      if (search && search.trim()) {
        whereConditions.push(`(t.name LIKE ? OR t.description LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      // Status filter
      if (isActive !== undefined) {
        whereConditions.push(`t.isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching tags
      const countQuery = `
        SELECT COUNT(*) as total
        FROM tags t
        ${whereClause}
      `;
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated tags
      const dataQuery = `
        SELECT t.*
        FROM tags t
        ${whereClause}
        ORDER BY t.usageCount DESC, t.name ASC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const dataParams = params;
      
      const [rows] = await pool.execute(dataQuery, dataParams);
      
      const tags = rows.map(row => new Tag(row));

      return {
        tags,
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
      throw new Error(`Error finding paginated tags: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        values.push(data.description);
      }
      if (data.color !== undefined) {
        updateFields.push('color = ?');
        values.push(data.color);
      }
      if (data.icon !== undefined) {
        updateFields.push('icon = ?');
        values.push(data.icon);
      }
      if (data.isActive !== undefined) {
        updateFields.push('isActive = ?');
        values.push(data.isActive);
      }

      if (updateFields.length === 0) {
        return await Tag.findById(id);
      }

      values.push(id);
      await pool.execute(
        `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return await Tag.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Tag with this name already exists');
      }
      throw new Error(`Error updating tag: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Check if tag is being used
      const [companyTags] = await pool.execute(
        'SELECT COUNT(*) as count FROM company_tags WHERE tagId = ?',
        [id]
      );
      const [productTags] = await pool.execute(
        'SELECT COUNT(*) as count FROM product_tags WHERE tagId = ?',
        [id]
      );

      if (companyTags[0].count > 0 || productTags[0].count > 0) {
        throw new Error('Cannot delete tag that is in use. Deactivate it instead.');
      }

      await pool.execute('DELETE FROM tags WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting tag: ${error.message}`);
    }
  }

  static async incrementUsageCount(tagId, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await pool.execute(
          'UPDATE tags SET usageCount = usageCount + 1 WHERE id = ?',
          [tagId]
        );
        return; // Success, exit function
      } catch (error) {
        // If it's a lock timeout and we have retries left, wait and retry
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.message.includes('Lock wait timeout')) {
          if (attempt < retries - 1) {
            // Exponential backoff: wait 50ms, 100ms, 200ms
            const waitTime = 50 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        // Non-critical error, just log it
        console.error(`Error incrementing usage count for tag ${tagId} (attempt ${attempt + 1}/${retries}):`, error.message);
        return; // Give up after retries or on non-lock errors
      }
    }
  }

  static async decrementUsageCount(tagId, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await pool.execute(
          'UPDATE tags SET usageCount = GREATEST(usageCount - 1, 0) WHERE id = ?',
          [tagId]
        );
        return; // Success, exit function
      } catch (error) {
        // If it's a lock timeout and we have retries left, wait and retry
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.message.includes('Lock wait timeout')) {
          if (attempt < retries - 1) {
            // Exponential backoff: wait 50ms, 100ms, 200ms
            const waitTime = 50 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        // Non-critical error, just log it
        console.error(`Error decrementing usage count for tag ${tagId} (attempt ${attempt + 1}/${retries}):`, error.message);
        return; // Give up after retries or on non-lock errors
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      icon: this.icon,
      isActive: this.isActive,
      usageCount: this.usageCount,
      createdDate: this.createdDate,
      lastModified: this.lastModified
    };
  }
}

module.exports = Tag;

