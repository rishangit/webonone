const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class SystemProductAttribute {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || null;
    this.valueDataType = data.valueDataType || data.value_data_type || 'text';
    this.unitOfMeasure = data.unitOfMeasure || data.unit_of_measure || null;
    this.isActive = Boolean(data.isActive !== undefined ? data.isActive : true);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      valueDataType: this.valueDataType,
      unitOfMeasure: this.unitOfMeasure,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create a new system product attribute
  static async create(attributeData) {
    try {
      const {
        name,
        description,
        valueDataType = 'text',
        unitOfMeasure,
        isActive = true,
      } = attributeData;

      if (!name) {
        throw new Error('name is required');
      }

      const attributeId = nanoid(10);

      const query = `
        INSERT INTO product_attributes (
          id, name, description, valueDataType, unit_of_measure, isActive,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        attributeId,
        name,
        description || null,
        valueDataType,
        unitOfMeasure || null,
        isActive,
      ];

      await pool.execute(query, values);
      return await SystemProductAttribute.findById(attributeId);
    } catch (error) {
      throw new Error(`Error creating system product attribute: ${error.message}`);
    }
  }

  // Get attribute by ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM product_attributes WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      return new SystemProductAttribute(rows[0]);
    } catch (error) {
      throw new Error(`Error finding system product attribute: ${error.message}`);
    }
  }

  // Get all attributes with pagination
  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        isActive,
        valueDataType,
      } = options;

      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      const whereConditions = [];
      const params = [];

      if (search && search.trim()) {
        whereConditions.push(`(name LIKE ? OR description LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      if (isActive !== undefined) {
        whereConditions.push(`isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      if (valueDataType) {
        whereConditions.push(`valueDataType = ?`);
        params.push(valueDataType);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching attributes
      const countQuery = `
        SELECT COUNT(*) as total
        FROM product_attributes
        ${whereClause}
      `;
      
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated attributes
      const dataQuery = `
        SELECT *
        FROM product_attributes
        ${whereClause}
        ORDER BY createdAt DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const [rows] = await pool.execute(dataQuery, params);
      const attributes = rows.map(row => new SystemProductAttribute(row));

      return {
        attributes,
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
      throw new Error(`Error finding paginated system product attributes: ${error.message}`);
    }
  }

  // Update attribute
  static async update(id, attributeData) {
    try {
      const allowedFields = [
        'name', 'description', 'valueDataType', 'unitOfMeasure', 'isActive'
      ];

      const updates = [];
      const values = [];

      // Map frontend field names to database column names
      const fieldMapping = {
        unitOfMeasure: 'unit_of_measure',
        valueDataType: 'valueDataType',
      };

      for (const field of allowedFields) {
        if (attributeData[field] !== undefined) {
          const dbField = fieldMapping[field] || field;
          updates.push(`${dbField} = ?`);
          // Handle null values for optional fields
          if (field === 'unitOfMeasure' && attributeData[field] === '') {
            values.push(null);
          } else {
            values.push(attributeData[field]);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updatedAt = NOW()');
      values.push(id);

      const query = `UPDATE product_attributes SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      return await SystemProductAttribute.findById(id);
    } catch (error) {
      throw new Error(`Error updating system product attribute: ${error.message}`);
    }
  }

  // Delete attribute
  static async delete(id) {
    try {
      const query = `DELETE FROM product_attributes WHERE id = ?`;
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting system product attribute: ${error.message}`);
    }
  }
}

module.exports = SystemProductAttribute;
