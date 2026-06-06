const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

const DEFAULT_DEFINITION = {
  version: 1,
  canvas: { minHeightPx: 720, rowHeightPx: 60 },
  fields: [],
};

function parseDefinition(raw) {
  if (!raw) return { ...DEFAULT_DEFINITION };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object') {
      return {
        version: parsed.version ?? 1,
        canvas: parsed.canvas ?? DEFAULT_DEFINITION.canvas,
        fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      };
    }
  } catch {
    // fall through
  }
  return { ...DEFAULT_DEFINITION };
}

class CompanyCustomForm {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description ?? null;
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.definition = parseDefinition(data.definition);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      definition: this.definition,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const id = nanoid(10);
      const definition =
        data.definition !== undefined
          ? JSON.stringify(parseDefinition(data.definition))
          : JSON.stringify(DEFAULT_DEFINITION);

      await connection.execute(
        `INSERT INTO company_custom_forms (
          id, companyId, name, description, isActive, definition
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.companyId,
          data.name,
          data.description ?? null,
          data.isActive !== undefined ? data.isActive : true,
          definition,
        ]
      );
      await connection.commit();
      return CompanyCustomForm.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating custom form: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, companyId, name, description,
         COALESCE(isActive, TRUE) as isActive,
         definition, createdAt, updatedAt
         FROM company_custom_forms WHERE id = ?`,
        [id]
      );
      if (rows.length === 0) return null;
      return new CompanyCustomForm(rows[0]);
    } catch (error) {
      if (error.message.includes("doesn't exist") || error.message.includes('Unknown column')) {
        console.warn('company_custom_forms table not found.');
        return null;
      }
      throw new Error(`Error finding custom form: ${error.message}`);
    }
  }

  static async findByCompanyId(companyId, options = {}) {
    try {
      let query = `
        SELECT id, companyId, name, description,
         COALESCE(isActive, TRUE) as isActive,
         definition, createdAt, updatedAt
         FROM company_custom_forms
         WHERE companyId = ?
      `;
      const params = [companyId];
      if (options.activeOnly) {
        query += ' AND isActive = TRUE';
      }
      query += ' ORDER BY createdAt DESC';
      const [rows] = await pool.execute(query, params);
      return rows.map((row) => new CompanyCustomForm(row));
    } catch (error) {
      if (error.message.includes("doesn't exist") || error.message.includes('Unknown column')) {
        return [];
      }
      throw new Error(`Error finding custom forms: ${error.message}`);
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
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        values.push(data.description);
      }
      if (data.isActive !== undefined) {
        updateFields.push('isActive = ?');
        values.push(data.isActive);
      }
      if (data.definition !== undefined) {
        updateFields.push('definition = ?');
        values.push(JSON.stringify(parseDefinition(data.definition)));
      }

      if (updateFields.length === 0) {
        return CompanyCustomForm.findById(id);
      }

      values.push(id);
      await connection.execute(
        `UPDATE company_custom_forms SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      await connection.commit();
      return CompanyCustomForm.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating custom form: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async duplicate(id) {
    const source = await CompanyCustomForm.findById(id);
    if (!source) return null;
    const copyName = `Copy of ${source.name}`.slice(0, 255);
    return CompanyCustomForm.create({
      companyId: source.companyId,
      name: copyName,
      description: source.description,
      isActive: source.isActive,
      definition: source.definition,
    });
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM company_custom_forms WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting custom form: ${error.message}`);
    }
  }
}

module.exports = CompanyCustomForm;
module.exports.DEFAULT_DEFINITION = DEFAULT_DEFINITION;
