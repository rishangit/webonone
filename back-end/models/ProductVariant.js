const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class ProductVariant {
  constructor(data) {
    this.id = data.id;
    this.productId = data.productId;
    this.name = data.name;
    this.sku = data.sku;
    this.color = data.color;
    this.size = data.size;
    this.weight = data.weight;
    this.material = data.material;
    this.isDefault = Boolean(data.isDefault);
    this.isActive = Boolean(data.isActive !== undefined ? data.isActive : true);
    this.isVerified = Boolean(data.isVerified !== undefined ? data.isVerified : false);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      sku: this.sku,
      color: this.color,
      size: this.size,
      weight: this.weight,
      material: this.material,
      isDefault: this.isDefault,
      isActive: this.isActive,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new variant
  static async create(variantData) {
    try {
      const {
        productId,
        name,
        sku,
        color,
        size,
        weight,
        material,
        isDefault,
        isActive,
        isVerified
      } = variantData;

      if (!productId || !name || !sku) {
        throw new Error('Product ID, name, and SKU are required');
      }

      // Check if this will be the only variant - if so, set as default
      const existingVariants = await ProductVariant.findByProductId(productId);
      const willBeOnlyVariant = existingVariants.length === 0;
      
      // If this variant is set as default, unset other defaults
      const shouldBeDefault = willBeOnlyVariant ? true : (isDefault === true);
      if (shouldBeDefault) {
        await pool.execute(
          'UPDATE product_variants SET isDefault = FALSE WHERE productId = ?',
          [productId]
        );
      }

      const variantId = nanoid(10);

      const query = `
        INSERT INTO product_variants (
          id, productId, name, sku,
          color, size, weight, material,
          isDefault, isActive, isVerified,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      // isVerified defaults to true for super admin (will be set by route based on user role)
      const shouldBeVerified = isVerified !== undefined ? isVerified : true;

      const values = [
        variantId,
        productId,
        name,
        sku,
        color || null,
        size || null,
        weight || null,
        material || null,
        shouldBeDefault,
        isActive !== undefined ? isActive : true,
        shouldBeVerified
      ];

      await pool.execute(query, values);

      return await ProductVariant.findById(variantId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Variant SKU already exists for this product');
      }
      throw new Error(`Error creating variant: ${error.message}`);
    }
  }

  // Get variant by ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM product_variants WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      return new ProductVariant(rows[0]);
    } catch (error) {
      throw new Error(`Error finding variant: ${error.message}`);
    }
  }

  // Get all variants for a product
  static async findByProductId(productId) {
    try {
      const query = `SELECT * FROM product_variants WHERE productId = ? ORDER BY isDefault DESC, createdAt ASC`;
      const [rows] = await pool.execute(query, [productId]);
      return rows.map(row => new ProductVariant(row));
    } catch (error) {
      throw new Error(`Error finding variants: ${error.message}`);
    }
  }

  // Update variant
  static async update(id, variantData) {
    try {
      const allowedFields = [
        'name', 'sku', 'color', 'size', 'weight', 'material', 'isDefault', 'isActive', 'isVerified'
      ];

      const updates = [];
      const values = [];

      // If setting as default, unset other defaults first
      if (variantData.isDefault === true) {
        const variant = await ProductVariant.findById(id);
        if (variant) {
          await pool.execute(
            'UPDATE product_variants SET isDefault = FALSE WHERE productId = ? AND id != ?',
            [variant.productId, id]
          );
        }
      }

      for (const field of allowedFields) {
        if (variantData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(variantData[field]);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updatedAt = NOW()');
      values.push(id);

      const query = `UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      return await ProductVariant.findById(id);
    } catch (error) {
      throw new Error(`Error updating variant: ${error.message}`);
    }
  }

  // Delete variant
  static async delete(id) {
    try {
      const variant = await ProductVariant.findById(id);
      if (!variant) {
        return false;
      }

      const query = `DELETE FROM product_variants WHERE id = ?`;
      const [result] = await pool.execute(query, [id]);
      
      // If deleted variant was default, set first remaining variant as default
      if (variant.isDefault) {
        const remainingVariants = await ProductVariant.findByProductId(variant.productId);
        if (remainingVariants.length > 0) {
          await pool.execute(
            'UPDATE product_variants SET isDefault = TRUE WHERE id = ?',
            [remainingVariants[0].id]
          );
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting variant: ${error.message}`);
    }
  }
}

module.exports = ProductVariant;

