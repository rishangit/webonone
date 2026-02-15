const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class ProductRelatedAttribute {
  constructor(data) {
    this.id = data.id;
    this.productId = data.productId || data.product_id;
    this.attributeId = data.attributeId || data.attribute_id;
    this.isVariantDefining = Boolean(data.isVariantDefining !== undefined ? data.isVariantDefining : (data.is_variant_defining !== undefined ? data.is_variant_defining : false));
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      attributeId: this.attributeId,
      isVariantDefining: this.isVariantDefining,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async findByProductId(productId) {
    // Check if isVariantDefining column exists for backward compatibility
    let orderByClause = 'ORDER BY pa.name ASC';
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'product_related_attributes' 
         AND COLUMN_NAME = 'isVariantDefining'`
      );
      if (columns.length > 0) {
        orderByClause = 'ORDER BY pra.isVariantDefining DESC, pa.name ASC';
      }
    } catch (error) {
      // If check fails, use default ordering
      console.warn('Could not check for isVariantDefining column, using default ordering:', error.message);
    }

    const [rows] = await pool.execute(
      `SELECT 
        pra.*,
        pa.name as attributeName,
        pa.description as attributeDescription,
        pa.valueDataType as valueDataType,
        pa.unit_of_measure as unitOfMeasure
       FROM product_related_attributes pra
       INNER JOIN product_attributes pa ON pra.attributeId = pa.id
       WHERE pra.productId = ?
       ${orderByClause}`,
      [productId]
    );
    return rows.map(row => ({
      ...new ProductRelatedAttribute(row).toJSON(),
      attributeName: row.attributeName,
      attributeDescription: row.attributeDescription,
      valueDataType: row.valueDataType,
      unitOfMeasure: row.unitOfMeasure,
    }));
  }

  static async findVariantDefiningByProductId(productId) {
    // Check if isVariantDefining column exists for backward compatibility
    let whereClause = 'WHERE pra.productId = ?';
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'product_related_attributes' 
         AND COLUMN_NAME = 'isVariantDefining'`
      );
      if (columns.length > 0) {
        whereClause = 'WHERE pra.productId = ? AND pra.isVariantDefining = TRUE';
      } else {
        // If column doesn't exist, return empty array (no variant-defining attributes yet)
        return [];
      }
    } catch (error) {
      // If check fails, return empty array
      console.warn('Could not check for isVariantDefining column:', error.message);
      return [];
    }

    const [rows] = await pool.execute(
      `SELECT 
        pra.*,
        pa.name as attributeName,
        pa.description as attributeDescription,
        pa.valueDataType as valueDataType,
        pa.unit_of_measure as unitOfMeasure
       FROM product_related_attributes pra
       INNER JOIN product_attributes pa ON pra.attributeId = pa.id
       ${whereClause}
       ORDER BY pa.name ASC`,
      [productId]
    );
    return rows.map(row => ({
      ...new ProductRelatedAttribute(row).toJSON(),
      attributeName: row.attributeName,
      attributeDescription: row.attributeDescription,
      valueDataType: row.valueDataType,
      unitOfMeasure: row.unitOfMeasure,
    }));
  }

  static async findByAttributeId(attributeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM product_related_attributes WHERE attributeId = ?',
      [attributeId]
    );
    return rows.map(row => new ProductRelatedAttribute(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM product_related_attributes WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return new ProductRelatedAttribute(rows[0]);
  }

  static async create(data) {
    const id = nanoid(10);
    const isVariantDefining = data.isVariantDefining !== undefined ? Boolean(data.isVariantDefining) : false;
    
    // Check if isVariantDefining column exists for backward compatibility
    let insertQuery = 'INSERT INTO product_related_attributes (id, productId, attributeId) VALUES (?, ?, ?)';
    let insertValues = [id, data.productId, data.attributeId];
    
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'product_related_attributes' 
         AND COLUMN_NAME = 'isVariantDefining'`
      );
      if (columns.length > 0) {
        insertQuery = 'INSERT INTO product_related_attributes (id, productId, attributeId, isVariantDefining) VALUES (?, ?, ?, ?)';
        insertValues.push(isVariantDefining);
      }
    } catch (error) {
      // If check fails, use query without isVariantDefining
      console.warn('Could not check for isVariantDefining column, using basic insert:', error.message);
    }
    
    const [result] = await pool.execute(insertQuery, insertValues);
    return await ProductRelatedAttribute.findById(id);
  }

  static async update(id, data) {
    const updates = [];
    const values = [];

    // Check if isVariantDefining column exists before trying to update it
    if (data.isVariantDefining !== undefined) {
      try {
        const [columns] = await pool.execute(
          `SELECT COLUMN_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'product_related_attributes' 
           AND COLUMN_NAME = 'isVariantDefining'`
        );
        if (columns.length > 0) {
          updates.push('isVariantDefining = ?');
          values.push(Boolean(data.isVariantDefining));
        } else {
          console.warn('isVariantDefining column does not exist, skipping update. Please run migration first.');
        }
      } catch (error) {
        console.warn('Could not check for isVariantDefining column:', error.message);
      }
    }

    if (updates.length === 0) {
      return await ProductRelatedAttribute.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE product_related_attributes SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      values
    );

    return await ProductRelatedAttribute.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM product_related_attributes WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByProductAndAttribute(productId, attributeId) {
    const [result] = await pool.execute(
      'DELETE FROM product_related_attributes WHERE productId = ? AND attributeId = ?',
      [productId, attributeId]
    );
    return result.affectedRows > 0;
  }

  static async exists(productId, attributeId) {
    const [rows] = await pool.execute(
      'SELECT id FROM product_related_attributes WHERE productId = ? AND attributeId = ?',
      [productId, attributeId]
    );
    return rows.length > 0;
  }
}

module.exports = ProductRelatedAttribute;
