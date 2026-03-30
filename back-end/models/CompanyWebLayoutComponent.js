const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

const KIND_HEADER = 'header';
const KIND_FOOTER = 'footer';

const TABLE = 'company_web_layout_components';

class CompanyWebLayoutComponent {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.kind = data.kind;
    this.name = data.name;
    this.isDefault = data.isDefault === true || data.isDefault === 1;
    this.content = data.content || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      kind: this.kind,
      name: this.name,
      isDefault: this.isDefault,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static _parseRow(row) {
    if (!row) return null;
    if (row.content) {
      try {
        row.content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      } catch (e) {
        row.content = null;
      }
    }
    return new CompanyWebLayoutComponent(row);
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const id = nanoid(10);
      const kind = data.kind;

      if (data.isDefault) {
        await connection.execute(
          `UPDATE ${TABLE} SET isDefault = FALSE WHERE companyId = ? AND kind = ?`,
          [data.companyId, kind]
        );
      }

      const contentValue =
        data.content !== undefined && data.content !== null
          ? typeof data.content === 'string'
            ? data.content
            : JSON.stringify(data.content)
          : null;

      await connection.execute(
        `INSERT INTO ${TABLE} (id, companyId, kind, name, isDefault, content)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.companyId,
          kind,
          data.name,
          data.isDefault === true ? 1 : 0,
          contentValue,
        ]
      );

      await connection.commit();
      return await CompanyWebLayoutComponent.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating web layout component: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, kind, name,
         COALESCE(isDefault, FALSE) as isDefault,
         content, createdAt, updatedAt
         FROM ${TABLE} WHERE id = ?`,
        [id]
      );
      if (rows.length === 0) return null;
      return CompanyWebLayoutComponent._parseRow(rows[0]);
    } catch (error) {
      if (error.message.includes("doesn't exist") || error.message.includes('Unknown column')) {
        return null;
      }
      throw new Error(`Error finding web layout component: ${error.message}`);
    }
  }

  static async findByCompanyId(companyId, kind) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, kind, name,
         COALESCE(isDefault, FALSE) as isDefault,
         content, createdAt, updatedAt
         FROM ${TABLE}
         WHERE companyId = ? AND kind = ?
         ORDER BY isDefault DESC, createdAt DESC`,
        [companyId, kind]
      );
      return rows.map((row) => CompanyWebLayoutComponent._parseRow(row));
    } catch (error) {
      if (error.message.includes("doesn't exist") || error.message.includes('Unknown column')) {
        return [];
      }
      throw new Error(`Error finding web layout components: ${error.message}`);
    }
  }

  static async findDefaultByCompanyId(companyId, kind) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, kind, name,
         COALESCE(isDefault, FALSE) as isDefault,
         content, createdAt, updatedAt
         FROM ${TABLE}
         WHERE companyId = ? AND kind = ? AND isDefault = TRUE
         LIMIT 1`,
        [companyId, kind]
      );
      if (rows.length === 0) return null;
      return CompanyWebLayoutComponent._parseRow(rows[0]);
    } catch (error) {
      if (error.message.includes("doesn't exist") || error.message.includes('Unknown column')) {
        return null;
      }
      throw new Error(`Error finding default web layout component: ${error.message}`);
    }
  }

  static async update(id, data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const existing = await CompanyWebLayoutComponent.findById(id);
      if (!existing) {
        await connection.rollback();
        return null;
      }

      if (data.isDefault === true) {
        await connection.execute(
          `UPDATE ${TABLE} SET isDefault = FALSE WHERE companyId = ? AND kind = ? AND id != ?`,
          [existing.companyId, existing.kind, id]
        );
      }

      const updateFields = [];
      const values = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }
      if (data.isDefault !== undefined) {
        updateFields.push('isDefault = ?');
        values.push(data.isDefault ? 1 : 0);
      }
      if (data.content !== undefined) {
        const contentValue =
          typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
        updateFields.push('content = ?');
        values.push(contentValue);
      }

      if (updateFields.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE ${TABLE} SET ${updateFields.join(', ')} WHERE id = ?`,
          values
        );
      }

      await connection.commit();
      return await CompanyWebLayoutComponent.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating web layout component: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting web layout component: ${error.message}`);
    }
  }
}

CompanyWebLayoutComponent.KIND_HEADER = KIND_HEADER;
CompanyWebLayoutComponent.KIND_FOOTER = KIND_FOOTER;
CompanyWebLayoutComponent.TABLE = TABLE;

module.exports = CompanyWebLayoutComponent;
