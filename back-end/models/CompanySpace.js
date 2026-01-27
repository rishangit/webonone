const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanySpace {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.capacity = data.capacity;
    this.status = data.status || 'Active';
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      capacity: this.capacity,
      status: this.status,
      description: this.description,
      imageUrl: this.imageUrl,
      appointments: {
        today: 0,
        thisWeek: 0
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const id = nanoid(10);
      const query = `
        INSERT INTO company_spaces (
          id, companyId, name, capacity, status, description, imageUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.companyId,
        data.name,
        data.capacity,
        data.status || 'Active',
        data.description || null,
        data.imageUrl || null
      ];

      await connection.execute(query, values);
      
      // Commit transaction first - this releases locks
      await connection.commit();
      
      // Set tags if provided (AFTER committing the main transaction)
      // This follows the same pattern as Product.create to avoid lock timeouts
      if (data.tagIds && data.tagIds.length > 0) {
        try {
          await CompanySpace.setTags(id, data.tagIds);
        } catch (tagError) {
          // Log but don't fail - tags can be updated later
          console.error(`Error setting tags for space ${id} (non-critical):`, tagError.message);
        }
      }
      
      const space = await CompanySpace.findById(id);
      return space;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating space: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM company_spaces WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      const space = new CompanySpace(rows[0]);
      const spaceData = space.toJSON();
      
      // Fetch tags
      try {
        const tags = await CompanySpace.getTags(id);
        spaceData.tags = tags;
      } catch (error) {
        console.error(`Error fetching tags for space ${id}:`, error);
        spaceData.tags = [];
      }
      
      return spaceData;
    } catch (error) {
      throw new Error(`Error finding space: ${error.message}`);
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
      } = options || {};

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = 'SELECT * FROM company_spaces WHERE 1=1';
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      // Search filter
      if (search && search.trim()) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      // Count total matching spaces
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated spaces
      query += ' ORDER BY createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);
      
      // If no rows, return empty array with pagination info
      if (!rows || rows.length === 0) {
        return {
          spaces: [],
          pagination: {
            total: 0,
            limit: limitInt,
            offset: offsetInt,
            totalPages: 0,
            currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
          },
        };
      }

      const spaces = rows.map(row => new CompanySpace(row));
      
      // Fetch tags for each space
      const spacesWithTags = await Promise.all(
        spaces.map(async (space) => {
          const spaceData = space.toJSON();
          try {
            const tags = await CompanySpace.getTags(space.id);
            spaceData.tags = tags;
          } catch (error) {
            console.error(`Error fetching tags for space ${space.id}:`, error);
            spaceData.tags = [];
          }
          return spaceData;
        })
      );

      return {
        spaces: spacesWithTags,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      console.error('Error in CompanySpace.findAllPaginated:', error);
      throw new Error(`Error finding paginated spaces: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { companyId, status } = options;
      
      let query = 'SELECT * FROM company_spaces WHERE 1=1';
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY createdAt DESC';

      const [rows] = await pool.execute(query, params);
      const spaces = rows.map(row => new CompanySpace(row));
      
      // Fetch tags for each space
      const spacesWithTags = await Promise.all(
        spaces.map(async (space) => {
          const spaceData = space.toJSON();
          try {
            const tags = await CompanySpace.getTags(space.id);
            spaceData.tags = tags;
          } catch (error) {
            console.error(`Error fetching tags for space ${space.id}:`, error);
            spaceData.tags = [];
          }
          return spaceData;
        })
      );
      
      return spacesWithTags;
    } catch (error) {
      throw new Error(`Error finding spaces: ${error.message}`);
    }
  }

  async update(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const fields = [];
      const values = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.capacity !== undefined) {
        fields.push('capacity = ?');
        values.push(data.capacity);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        values.push(data.description);
      }
      if (data.imageUrl !== undefined) {
        fields.push('imageUrl = ?');
        values.push(data.imageUrl);
      }

      // Update space fields if any
      if (fields.length > 0) {
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(this.id);
        const query = `UPDATE company_spaces SET ${fields.join(', ')} WHERE id = ?`;
        await connection.execute(query, values);
      }

      // Commit transaction first - this releases locks
      await connection.commit();
      
      // Update tags if provided (AFTER committing the main transaction)
      // This follows the same pattern as Product.update to avoid lock timeouts
      if (data.tagIds !== undefined) {
        try {
          await CompanySpace.setTags(this.id, data.tagIds);
        } catch (tagError) {
          // Log but don't fail - tags can be updated later
          console.error(`Error setting tags for space ${this.id} (non-critical):`, tagError.message);
        }
      }
      
      const updated = await CompanySpace.findById(this.id);
      return updated;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating space: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_spaces WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting space: ${error.message}`);
    }
  }

  // Tag management methods
  static async getTags(spaceId) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.* FROM tags t
         INNER JOIN space_tags st ON t.id = st.tagId
         WHERE st.spaceId = ?
         ORDER BY t.name`,
        [spaceId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error getting space tags: ${error.message}`);
    }
  }

  static async setTags(spaceId, tagIds) {
    const connection = await pool.getConnection();
    const Tag = require('./Tag');
    
    try {
      await connection.beginTransaction();
      
      // Get old tags for usage count decrement (before deleting)
      const [oldTags] = await connection.execute(
        'SELECT tagId FROM space_tags WHERE spaceId = ?',
        [spaceId]
      );
      
      const oldTagIds = oldTags.map(t => t.tagId);
      
      // Remove existing tags
      await connection.execute('DELETE FROM space_tags WHERE spaceId = ?', [spaceId]);
      
      // Add new tags
      if (tagIds && tagIds.length > 0) {
        const values = tagIds.map(tagId => [nanoid(10), spaceId, tagId]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        
        await connection.execute(
          `INSERT INTO space_tags (id, spaceId, tagId) VALUES ${placeholders}`,
          values.flat()
        );
      }
      
      // Commit transaction first - this releases locks
      await connection.commit();
      
      // Update usage counts OUTSIDE the transaction to avoid lock conflicts
      // This is safe because the critical data (space_tags) is already saved
      try {
        // Decrement usage count for removed tags
        for (const oldTagId of oldTagIds) {
          if (!tagIds || !tagIds.includes(oldTagId)) {
            await Tag.decrementUsageCount(oldTagId);
          }
        }
        
        // Increment usage count for new tags
        if (tagIds && tagIds.length > 0) {
          for (const tagId of tagIds) {
            if (!oldTagIds.includes(tagId)) {
              await Tag.incrementUsageCount(tagId);
            }
          }
        }
      } catch (usageError) {
        // Non-critical error - log but don't fail
        console.error(`Error updating tag usage counts (non-critical):`, usageError.message);
      }
      
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error setting space tags: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = CompanySpace;

