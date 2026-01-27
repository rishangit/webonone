const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyProductStock {
  constructor(data) {
    this.id = data.id;
    this.variantId = data.variantId;
    this.quantity = data.quantity !== undefined ? parseInt(data.quantity) : 0;
    this.costPrice = data.costPrice !== undefined && data.costPrice !== null ? parseFloat(data.costPrice) : 0;
    this.sellPrice = data.sellPrice !== undefined && data.sellPrice !== null ? parseFloat(data.sellPrice) : null;
    this.purchaseDate = data.purchaseDate;
    this.expiryDate = data.expiryDate;
    this.supplierId = data.supplierId || null;
    // Supplier details from joined users table
    this.supplier = data.supplierId ? {
      id: data.supplierId,
      firstName: data.supplierFirstName || null,
      lastName: data.supplierLastName || null,
      email: data.supplierEmail || null,
      phone: data.supplierPhone || null
    } : null;
    this.batchNumber = data.batchNumber || null;
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      variantId: this.variantId,
      quantity: this.quantity,
      costPrice: this.costPrice,
      sellPrice: this.sellPrice,
      purchaseDate: this.purchaseDate,
      expiryDate: this.expiryDate,
      supplierId: this.supplierId,
      supplier: this.supplier,
      batchNumber: this.batchNumber,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create new stock entry
  static async create(stockData) {
    try {
      const {
        variantId,
        quantity,
        costPrice,
        sellPrice,
        purchaseDate,
        expiryDate,
        supplierId,
        batchNumber,
        isActive
      } = stockData;

      if (!variantId) {
        throw new Error('variantId is required');
      }

      if (!quantity || quantity <= 0) {
        throw new Error('quantity must be greater than 0');
      }

      const stockId = nanoid(10);

      const query = `
        INSERT INTO company_product_stock (
          id, variantId, quantity, costPrice, sellPrice,
          purchaseDate, expiryDate, supplierId,
          batchNumber, isActive,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        stockId,
        variantId,
        quantity,
        costPrice || 0,
        sellPrice || null,
        purchaseDate || null,
        expiryDate || null,
        supplierId || null,
        batchNumber || null,
        isActive !== undefined ? isActive : true
      ];

      await pool.execute(query, values);

      return await CompanyProductStock.findById(stockId);
    } catch (error) {
      throw new Error(`Error creating stock entry: ${error.message}`);
    }
  }

  // Get stock by ID (with joined supplier data)
  static async findById(id) {
    try {
      const query = `
        SELECT 
          cps.*,
          u.firstName as supplierFirstName,
          u.lastName as supplierLastName,
          u.email as supplierEmail,
          u.phone as supplierPhone
        FROM company_product_stock cps
        LEFT JOIN users u ON cps.supplierId = u.id
        WHERE cps.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      return new CompanyProductStock(rows[0]);
    } catch (error) {
      throw new Error(`Error finding stock entry: ${error.message}`);
    }
  }

  // Get all stock entries for a variant (with joined supplier data)
  static async findByVariantId(variantId, options = {}) {
    try {
      const { activeOnly = false } = options;
      
      let query = `
        SELECT 
          cps.*,
          u.firstName as supplierFirstName,
          u.lastName as supplierLastName,
          u.email as supplierEmail,
          u.phone as supplierPhone
        FROM company_product_stock cps
        LEFT JOIN users u ON cps.supplierId = u.id
        WHERE cps.variantId = ?
      `;
      const params = [variantId];

      if (activeOnly) {
        query += ' AND cps.isActive = TRUE';
      }

      query += ' ORDER BY cps.purchaseDate DESC, cps.createdAt DESC';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new CompanyProductStock(row));
    } catch (error) {
      throw new Error(`Error finding stock entries: ${error.message}`);
    }
  }

  // Get total available stock for a variant
  static async getTotalStock(variantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT SUM(quantity) as total FROM company_product_stock WHERE variantId = ? AND isActive = TRUE',
        [variantId]
      );
      
      return rows[0]?.total || 0;
    } catch (error) {
      throw new Error(`Error calculating total stock: ${error.message}`);
    }
  }

  // Update stock entry
  async update(data) {
    try {
      const fields = [];
      const values = [];

      if (data.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(parseInt(data.quantity));
      }
      if (data.costPrice !== undefined) {
        fields.push('costPrice = ?');
        values.push(parseFloat(data.costPrice));
      }
      if (data.sellPrice !== undefined) {
        fields.push('sellPrice = ?');
        values.push(data.sellPrice !== null ? parseFloat(data.sellPrice) : null);
      }
      if (data.purchaseDate !== undefined) {
        fields.push('purchaseDate = ?');
        values.push(data.purchaseDate || null);
      }
      if (data.expiryDate !== undefined) {
        fields.push('expiryDate = ?');
        values.push(data.expiryDate || null);
      }
      if (data.supplierId !== undefined) {
        fields.push('supplierId = ?');
        values.push(data.supplierId || null);
      }
      if (data.batchNumber !== undefined) {
        fields.push('batchNumber = ?');
        values.push(data.batchNumber || null);
      }
      if (data.isActive !== undefined) {
        fields.push('isActive = ?');
        values.push(data.isActive ? 1 : 0);
      }

      if (fields.length === 0) {
        return this;
      }

      values.push(this.id);

      const query = `UPDATE company_product_stock SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`;
      await pool.execute(query, values);

      const updated = await CompanyProductStock.findById(this.id);
      return updated;
    } catch (error) {
      throw new Error(`Error updating stock entry: ${error.message}`);
    }
  }

  // Delete stock entry
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_product_stock WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting stock entry: ${error.message}`);
    }
  }

  // Deactivate stock entry (soft delete)
  static async deactivate(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE company_product_stock SET isActive = FALSE, updatedAt = NOW() WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deactivating stock entry: ${error.message}`);
    }
  }
}

module.exports = CompanyProductStock;

