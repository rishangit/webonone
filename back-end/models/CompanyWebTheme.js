const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyWebTheme {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.backgroundColor = data.backgroundColor;
    this.bodyTextColor = data.bodyTextColor;
    this.headingColor = data.headingColor;
    this.h1Font = data.h1Font;
    this.h2Font = data.h2Font;
    this.h3Font = data.h3Font;
    this.h4Font = data.h4Font;
    this.h5Font = data.h5Font;
    this.googleFontUrl = data.googleFontUrl;
    this.isActive = data.isActive || false;
    this.isDefault = data.isDefault || false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      backgroundColor: this.backgroundColor,
      bodyTextColor: this.bodyTextColor,
      headingColor: this.headingColor,
      h1Font: this.h1Font,
      h2Font: this.h2Font,
      h3Font: this.h3Font,
      h4Font: this.h4Font,
      h5Font: this.h5Font,
      googleFontUrl: this.googleFontUrl,
      isActive: this.isActive,
      isDefault: this.isDefault,
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
        INSERT INTO company_web_theme (
          id, companyId, name, backgroundColor, bodyTextColor, headingColor,
          h1Font, h2Font, h3Font, h4Font, h5Font, googleFontUrl, isActive, isDefault
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.companyId,
        data.name,
        data.backgroundColor || null,
        data.bodyTextColor || null,
        data.headingColor || null,
        data.h1Font || null,
        data.h2Font || null,
        data.h3Font || null,
        data.h4Font || null,
        data.h5Font || null,
        data.googleFontUrl || null,
        data.isActive !== undefined ? data.isActive : false,
        data.isDefault !== undefined ? data.isDefault : false
      ];

      try {
        await connection.execute(query, values);
      } catch (dbError) {
        // If table or columns don't exist, provide helpful error
        if (dbError.message.includes("doesn't exist") || dbError.message.includes("Unknown column")) {
          throw new Error('Database table needs to be set up. Please run: node scripts/setupCompanyWebThemeTable.js');
        }
        throw dbError;
      }
      
      // If this is set as default, unset other defaults for this company
      if (data.isDefault) {
        try {
          await connection.execute(
            `UPDATE company_web_theme 
             SET isDefault = FALSE 
             WHERE companyId = ? AND id != ?`,
            [data.companyId, id]
          );
        } catch (updateError) {
          // Ignore update errors if table doesn't exist
          if (!updateError.message.includes("doesn't exist") && !updateError.message.includes("Unknown column")) {
            throw updateError;
          }
        }
      }
      
      await connection.commit();
      
      const theme = await CompanyWebTheme.findById(id);
      return theme;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating theme: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name, 
         COALESCE(backgroundColor, NULL) as backgroundColor,
         COALESCE(bodyTextColor, NULL) as bodyTextColor,
         COALESCE(headingColor, NULL) as headingColor,
         COALESCE(h1Font, NULL) as h1Font,
         COALESCE(h2Font, NULL) as h2Font,
         COALESCE(h3Font, NULL) as h3Font,
         COALESCE(h4Font, NULL) as h4Font,
         COALESCE(h5Font, NULL) as h5Font,
         COALESCE(googleFontUrl, NULL) as googleFontUrl,
         COALESCE(isActive, FALSE) as isActive,
         COALESCE(isDefault, FALSE) as isDefault,
         createdAt, updatedAt
         FROM company_web_theme WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return new CompanyWebTheme(rows[0]);
    } catch (error) {
      console.error('Error in findById:', error);
      // If table doesn't exist or columns are missing, return null
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        console.warn('Table or columns not found. Please run migration script.');
        return null;
      }
      throw new Error(`Error finding theme: ${error.message}`);
    }
  }

  static async findByCompanyId(companyId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name, 
         COALESCE(backgroundColor, NULL) as backgroundColor,
         COALESCE(bodyTextColor, NULL) as bodyTextColor,
         COALESCE(headingColor, NULL) as headingColor,
         COALESCE(h1Font, NULL) as h1Font,
         COALESCE(h2Font, NULL) as h2Font,
         COALESCE(h3Font, NULL) as h3Font,
         COALESCE(h4Font, NULL) as h4Font,
         COALESCE(h5Font, NULL) as h5Font,
         COALESCE(googleFontUrl, NULL) as googleFontUrl,
         COALESCE(isActive, FALSE) as isActive,
         COALESCE(isDefault, FALSE) as isDefault,
         createdAt, updatedAt
         FROM company_web_theme 
         WHERE companyId = ? 
         ORDER BY isDefault DESC, createdAt DESC`,
        [companyId]
      );
      
      return rows.map(row => new CompanyWebTheme(row));
    } catch (error) {
      console.error('Error in findByCompanyId:', error);
      // If table doesn't exist or columns are missing, return empty array
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        console.warn('Table or columns not found, returning empty array. Please run migration script.');
        return [];
      }
      throw new Error(`Error finding themes: ${error.message}`);
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
      if (data.backgroundColor !== undefined) {
        updateFields.push('backgroundColor = ?');
        values.push(data.backgroundColor);
      }
      if (data.bodyTextColor !== undefined) {
        updateFields.push('bodyTextColor = ?');
        values.push(data.bodyTextColor);
      }
      if (data.headingColor !== undefined) {
        updateFields.push('headingColor = ?');
        values.push(data.headingColor);
      }
      if (data.h1Font !== undefined) {
        updateFields.push('h1Font = ?');
        values.push(data.h1Font);
      }
      if (data.h2Font !== undefined) {
        updateFields.push('h2Font = ?');
        values.push(data.h2Font);
      }
      if (data.h3Font !== undefined) {
        updateFields.push('h3Font = ?');
        values.push(data.h3Font);
      }
      if (data.h4Font !== undefined) {
        updateFields.push('h4Font = ?');
        values.push(data.h4Font);
      }
      if (data.h5Font !== undefined) {
        updateFields.push('h5Font = ?');
        values.push(data.h5Font);
      }
      if (data.googleFontUrl !== undefined) {
        updateFields.push('googleFontUrl = ?');
        values.push(data.googleFontUrl);
      }
      if (data.isActive !== undefined) {
        updateFields.push('isActive = ?');
        values.push(data.isActive);
      }
      if (data.isDefault !== undefined) {
        updateFields.push('isDefault = ?');
        values.push(data.isDefault);
      }
      
      if (updateFields.length === 0) {
        return await CompanyWebTheme.findById(id);
      }
      
      values.push(id);
      
      await connection.execute(
        `UPDATE company_web_theme SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      // If this is set as default, unset other defaults for this company
      if (data.isDefault) {
        const [theme] = await connection.execute(
          'SELECT companyId FROM company_web_theme WHERE id = ?',
          [id]
        );
        
        if (theme.length > 0) {
          await connection.execute(
            `UPDATE company_web_theme 
             SET isDefault = FALSE 
             WHERE companyId = ? AND id != ?`,
            [theme[0].companyId, id]
          );
        }
      }
      
      await connection.commit();
      
      return await CompanyWebTheme.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating theme: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_web_theme WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting theme: ${error.message}`);
    }
  }
}

module.exports = CompanyWebTheme;
