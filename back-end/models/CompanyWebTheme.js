const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyWebTheme {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;

    // themeData is stored as JSON in the database and contains:
    // { themeName, basicSetting: { backgroundColor, fontColor }, textSettings: [...] }
    this.themeData =
      typeof data.themeData === 'string'
        ? JSON.parse(data.themeData)
        : data.themeData || null;

    const basic = this.themeData?.basicSetting || {};
    this.backgroundColor = basic.backgroundColor || null;
    this.bodyTextColor = basic.fontColor || null;
    this.headingColor = basic.fontColor || null;
    this.textSettings = Array.isArray(this.themeData?.textSettings)
      ? this.themeData.textSettings
      : [];

    // Keep googleFontUrl for compatibility with existing UI, derive from first text style if present
    const firstTextStyle = this.textSettings[0] || {};
    this.googleFontUrl = firstTextStyle.googleFontUrl || null;

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
      themeData: this.themeData,
      backgroundColor: this.backgroundColor,
      bodyTextColor: this.bodyTextColor,
      headingColor: this.headingColor,
      googleFontUrl: this.googleFontUrl,
      isActive: this.isActive,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async create(data) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const id = nanoid(10);
      const query = `
        INSERT INTO company_web_themes (
          id, companyId, name, themeData, isActive, isDefault
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const themeData = data.themeData || null;

      const values = [
        id,
        data.companyId,
        data.name,
        JSON.stringify(themeData),
        data.isActive !== undefined ? data.isActive : false,
        data.isDefault !== undefined ? data.isDefault : false,
      ];

      try {
        await connection.execute(query, values);
      } catch (dbError) {
        // If table or columns don't exist, provide helpful error
        if (
          dbError.message.includes("doesn't exist") ||
          dbError.message.includes('Unknown column')
        ) {
          throw new Error(
            'Database table needs to be set up. Please run the database init script to create company_web_themes table.'
          );
        }
        throw dbError;
      }

      // If this is set as default, unset other defaults for this company
      if (data.isDefault) {
        try {
          await connection.execute(
            `UPDATE company_web_themes 
             SET isDefault = FALSE 
             WHERE companyId = ? AND id != ?`,
            [data.companyId, id]
          );
        } catch (updateError) {
          // Ignore update errors if table doesn't exist
          if (
            !updateError.message.includes("doesn't exist") &&
            !updateError.message.includes('Unknown column')
          ) {
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
         themeData,
         COALESCE(isActive, FALSE) as isActive,
         COALESCE(isDefault, FALSE) as isDefault,
         createdAt, updatedAt
         FROM company_web_themes WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return new CompanyWebTheme(rows[0]);
    } catch (error) {
      console.error('Error in findById:', error);
      // If table doesn't exist or columns are missing, return null
      if (
        error.message.includes("doesn't exist") ||
        error.message.includes('Unknown column')
      ) {
        console.warn(
          'Table or columns not found. Please run migration script.'
        );
        return null;
      }
      throw new Error(`Error finding theme: ${error.message}`);
    }
  }

  static async findByCompanyId(companyId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name,
         themeData,
         COALESCE(isActive, FALSE) as isActive,
         COALESCE(isDefault, FALSE) as isDefault,
         createdAt, updatedAt
         FROM company_web_themes 
         WHERE companyId = ? 
         ORDER BY isDefault DESC, createdAt DESC`,
        [companyId]
      );

      return rows.map((row) => new CompanyWebTheme(row));
    } catch (error) {
      console.error('Error in findByCompanyId:', error);
      // If table doesn't exist or columns are missing, return empty array
      if (
        error.message.includes("doesn't exist") ||
        error.message.includes('Unknown column')
      ) {
        console.warn(
          'Table or columns not found, returning empty array. Please run migration script.'
        );
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
      if (data.themeData !== undefined) {
        updateFields.push('themeData = ?');
        values.push(JSON.stringify(data.themeData));
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
        `UPDATE company_web_themes SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      // If this is set as default, unset other defaults for this company
      if (data.isDefault) {
        const [theme] = await connection.execute(
          'SELECT companyId FROM company_web_themes WHERE id = ?',
          [id]
        );

        if (theme.length > 0) {
          await connection.execute(
            `UPDATE company_web_themes 
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
        'DELETE FROM company_web_themes WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting theme: ${error.message}`);
    }
  }
}

module.exports = CompanyWebTheme;
