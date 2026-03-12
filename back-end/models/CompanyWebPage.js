const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyWebPage {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.url = data.url;
    this.isActive = data.isActive || false;
    this.content = data.content || null; // JSON content
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      url: this.url,
      isActive: this.isActive,
      content: this.content,
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
        INSERT INTO company_web_pages (
          id, companyId, name, url, isActive
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.companyId,
        data.name,
        data.url,
        data.isActive !== undefined ? data.isActive : false
      ];

      try {
        await connection.execute(query, values);
      } catch (dbError) {
        // If table or columns don't exist, provide helpful error
        if (dbError.message.includes("doesn't exist") || dbError.message.includes("Unknown column")) {
          throw new Error('Database table needs to be set up. Please run: node scripts/1.7.0/setupCompanyWebPagesTable.js');
        }
        throw dbError;
      }
      
      await connection.commit();
      
      const webpage = await CompanyWebPage.findById(id);
      return webpage;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating webpage: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name, url,
         COALESCE(isActive, FALSE) as isActive,
         content,
         createdAt, updatedAt
         FROM company_web_pages WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      // Parse JSON content if it exists
      if (row.content) {
        try {
          row.content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
        } catch (e) {
          row.content = null;
        }
      }
      
      return new CompanyWebPage(row);
    } catch (error) {
      console.error('Error in findById:', error);
      // If table doesn't exist or columns are missing, return null
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        console.warn('Table or columns not found. Please run migration script.');
        return null;
      }
      throw new Error(`Error finding webpage: ${error.message}`);
    }
  }

  static async findByCompanyId(companyId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name, url,
         COALESCE(isActive, FALSE) as isActive,
         content,
         createdAt, updatedAt
         FROM company_web_pages 
         WHERE companyId = ? 
         ORDER BY createdAt DESC`,
        [companyId]
      );
      
      return rows.map(row => {
        // Parse JSON content if it exists
        if (row.content) {
          try {
            row.content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
          } catch (e) {
            row.content = null;
          }
        }
        return new CompanyWebPage(row);
      });
    } catch (error) {
      console.error('Error in findByCompanyId:', error);
      // If table doesn't exist or columns are missing, return empty array
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        console.warn('Table or columns not found, returning empty array. Please run migration script.');
        return [];
      }
      throw new Error(`Error finding webpages: ${error.message}`);
    }
  }

  static async findByCompanyIdAndUrl(companyId, url, requireActive = false) {
    try {
      // Build query - optionally require active status
      let query = `
        SELECT id, companyId, name, url,
         COALESCE(isActive, FALSE) as isActive,
         content,
         createdAt, updatedAt
         FROM company_web_pages 
         WHERE companyId = ? AND url = ?
      `;
      
      const params = [companyId, url];
      
      if (requireActive) {
        query += ' AND isActive = TRUE';
      }
      
      query += ' LIMIT 1';
      
      const [rows] = await pool.execute(query, params);
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      // Parse JSON content if it exists
      if (row.content) {
        try {
          row.content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
        } catch (e) {
          row.content = null;
        }
      }
      
      return new CompanyWebPage(row);
    } catch (error) {
      console.error('Error in findByCompanyIdAndUrl:', error);
      // If table doesn't exist or columns are missing, return null
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        console.warn('Table or columns not found. Please run migration script.');
        return null;
      }
      throw new Error(`Error finding webpage: ${error.message}`);
    }
  }

  static async update(id, data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const updateFields = [];
      const values = [];
      
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }
      if (data.url !== undefined) {
        updateFields.push('url = ?');
        values.push(data.url);
      }
      if (data.isActive !== undefined) {
        updateFields.push('isActive = ?');
        values.push(data.isActive);
      }
      if (data.content !== undefined) {
        // Convert content to JSON string if it's an object
        const contentValue = typeof data.content === 'string' 
          ? data.content 
          : JSON.stringify(data.content);
        updateFields.push('content = ?');
        values.push(contentValue);
      }
      
      if (updateFields.length === 0) {
        return await CompanyWebPage.findById(id);
      }
      
      values.push(id);
      
      await connection.execute(
        `UPDATE company_web_pages SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      await connection.commit();
      
      return await CompanyWebPage.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating webpage: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_web_pages WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting webpage: ${error.message}`);
    }
  }
}

module.exports = CompanyWebPage;
