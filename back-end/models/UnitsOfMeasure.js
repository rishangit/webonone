const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class UnitsOfMeasure {
  constructor(data) {
    this.id = data.id;
    this.unitName = data.unitName || data.unit_name;
    this.symbol = data.symbol;
    this.baseUnit = data.baseUnit || data.base_unit || null;
    this.multiplier = data.multiplier ? parseFloat(data.multiplier) : 1.0;
    this.isActive = Boolean(data.isActive !== undefined ? data.isActive : true);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      unitName: this.unitName,
      symbol: this.symbol,
      baseUnit: this.baseUnit,
      multiplier: this.multiplier,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create a new unit of measure
  static async create(unitData) {
    try {
      const {
        unitName,
        symbol,
        baseUnit = null,
        multiplier = 1.0,
        isActive = true,
      } = unitData;

      if (!unitName || !symbol) {
        throw new Error('unitName and symbol are required');
      }

      const unitId = nanoid(10);

      const query = `
        INSERT INTO units_of_measure (
          id, unit_name, symbol, base_unit, multiplier, isActive,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        unitId,
        unitName,
        symbol,
        baseUnit || null,
        multiplier,
        isActive,
      ];

      await pool.execute(query, values);
      return await UnitsOfMeasure.findById(unitId);
    } catch (error) {
      throw new Error(`Error creating unit of measure: ${error.message}`);
    }
  }

  // Get unit by ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM units_of_measure WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      return new UnitsOfMeasure(rows[0]);
    } catch (error) {
      throw new Error(`Error finding unit of measure: ${error.message}`);
    }
  }

  // Get all units with pagination
  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        isActive,
      } = options;

      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      const whereConditions = [];
      const params = [];

      if (search && search.trim()) {
        whereConditions.push(`(unit_name LIKE ? OR symbol LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      if (isActive !== undefined) {
        whereConditions.push(`isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching units
      const countQuery = `
        SELECT COUNT(*) as total
        FROM units_of_measure
        ${whereClause}
      `;
      
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated units
      const dataQuery = `
        SELECT *
        FROM units_of_measure
        ${whereClause}
        ORDER BY unit_name ASC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const [rows] = await pool.execute(dataQuery, params);
      const units = rows.map(row => new UnitsOfMeasure(row));

      return {
        units,
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
      throw new Error(`Error finding paginated units of measure: ${error.message}`);
    }
  }

  // Get all active units
  static async findAllActive() {
    try {
      const query = `SELECT * FROM units_of_measure WHERE isActive = 1 ORDER BY unit_name ASC`;
      const [rows] = await pool.execute(query);
      return rows.map(row => new UnitsOfMeasure(row));
    } catch (error) {
      throw new Error(`Error finding active units of measure: ${error.message}`);
    }
  }

  // Update unit
  static async update(id, unitData) {
    try {
      const allowedFields = [
        'unitName', 'symbol', 'baseUnit', 'multiplier', 'isActive'
      ];

      const updates = [];
      const values = [];

      // Map frontend field names to database column names
      const fieldMapping = {
        unitName: 'unit_name',
        symbol: 'symbol',
        baseUnit: 'base_unit',
        multiplier: 'multiplier',
        isActive: 'isActive',
      };

      for (const field of allowedFields) {
        if (unitData[field] !== undefined) {
          const dbField = fieldMapping[field] || field;
          updates.push(`${dbField} = ?`);
          values.push(unitData[field]);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updatedAt = NOW()');
      values.push(id);

      const query = `UPDATE units_of_measure SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      return await UnitsOfMeasure.findById(id);
    } catch (error) {
      throw new Error(`Error updating unit of measure: ${error.message}`);
    }
  }

  // Delete unit
  static async delete(id) {
    try {
      const query = `DELETE FROM units_of_measure WHERE id = ?`;
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting unit of measure: ${error.message}`);
    }
  }
}

module.exports = UnitsOfMeasure;
