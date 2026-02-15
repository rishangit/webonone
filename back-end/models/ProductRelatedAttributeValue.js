const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class ProductRelatedAttributeValue {
  constructor(data) {
    this.id = data.id;
    this.variantId = data.variantId || data.variant_id;
    this.productRelatedAttributeId = data.productRelatedAttributeId || data.product_related_attribute_id;
    this.attributeValue = data.attributeValue || data.attribute_value || null;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      variantId: this.variantId,
      productRelatedAttributeId: this.productRelatedAttributeId,
      attributeValue: this.attributeValue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async findByVariantId(variantId) {
    const [rows] = await pool.execute(
      `SELECT 
        prav.*,
        pra.productId,
        pra.attributeId,
        pa.name as attributeName,
        pa.description as attributeDescription,
        pa.valueDataType as valueDataType,
        pa.unit_of_measure as unitOfMeasure
       FROM product_related_attributes_values prav
       INNER JOIN product_related_attributes pra ON prav.productRelatedAttributeId = pra.id
       INNER JOIN product_attributes pa ON pra.attributeId = pa.id
       WHERE prav.variantId = ?
       ORDER BY pa.name ASC`,
      [variantId]
    );
    return rows.map(row => ({
      ...new ProductRelatedAttributeValue(row).toJSON(),
      productId: row.productId,
      attributeId: row.attributeId,
      attributeName: row.attributeName,
      attributeDescription: row.attributeDescription,
      valueDataType: row.valueDataType,
      unitOfMeasure: row.unitOfMeasure,
    }));
  }

  static async findByProductRelatedAttributeId(productRelatedAttributeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM product_related_attributes_values WHERE productRelatedAttributeId = ?',
      [productRelatedAttributeId]
    );
    return rows.map(row => new ProductRelatedAttributeValue(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM product_related_attributes_values WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return new ProductRelatedAttributeValue(rows[0]);
  }

  static async findByVariantAndAttribute(variantId, productRelatedAttributeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM product_related_attributes_values WHERE variantId = ? AND productRelatedAttributeId = ?',
      [variantId, productRelatedAttributeId]
    );
    if (rows.length === 0) return null;
    return new ProductRelatedAttributeValue(rows[0]);
  }

  static async create(data) {
    const id = nanoid(10);
    const [result] = await pool.execute(
      'INSERT INTO product_related_attributes_values (id, variantId, productRelatedAttributeId, attributeValue) VALUES (?, ?, ?, ?)',
      [id, data.variantId, data.productRelatedAttributeId, data.attributeValue || null]
    );
    return await ProductRelatedAttributeValue.findById(id);
  }

  static async update(id, data) {
    const updates = [];
    const values = [];

    if (data.attributeValue !== undefined) {
      updates.push('attributeValue = ?');
      values.push(data.attributeValue);
    }

    if (updates.length === 0) {
      return await ProductRelatedAttributeValue.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE product_related_attributes_values SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return await ProductRelatedAttributeValue.findById(id);
  }

  static async upsert(data) {
    // Check if exists
    const existing = await ProductRelatedAttributeValue.findByVariantAndAttribute(
      data.variantId,
      data.productRelatedAttributeId
    );
    
    if (existing) {
      return await ProductRelatedAttributeValue.update(existing.id, data);
    } else {
      return await ProductRelatedAttributeValue.create(data);
    }
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM product_related_attributes_values WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByVariantId(variantId) {
    const [result] = await pool.execute(
      'DELETE FROM product_related_attributes_values WHERE variantId = ?',
      [variantId]
    );
    return result.affectedRows > 0;
  }

  static async deleteByVariantAndAttribute(variantId, productRelatedAttributeId) {
    const [result] = await pool.execute(
      'DELETE FROM product_related_attributes_values WHERE variantId = ? AND productRelatedAttributeId = ?',
      [variantId, productRelatedAttributeId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ProductRelatedAttributeValue;
