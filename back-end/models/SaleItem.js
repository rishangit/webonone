const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class SaleItem {
  constructor(data) {
    this.id = data.id;
    this.saleId = data.saleId;
    this.itemType = data.itemType; // 'service' or 'product'
    this.serviceId = data.serviceId;
    // productId is no longer stored - get it from variant via company_product_variants.companyProductId
    this.variantId = data.variantId;
    this.quantity = data.quantity;
    this.unitPrice = data.unitPrice;
    this.discount = data.discount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      saleId: this.saleId,
      itemType: this.itemType,
      serviceId: this.serviceId || null,
      // productId is not stored - get from variant when needed
      variantId: this.variantId || null,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      discount: this.discount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create sale items in bulk
  static async createBulk(saleId, items, connection = null) {
    const useTransaction = connection !== null;
    const dbConnection = connection || await pool.getConnection();
    
    try {
      if (!useTransaction) {
        await dbConnection.beginTransaction();
      }

      const createdItems = [];

      for (const item of items) {
        const itemId = nanoid(10);
        const { itemType, serviceId, variantId, quantity, unitPrice, discount } = item;

        // Validate item type
        if (itemType !== 'service' && itemType !== 'product') {
          throw new Error(`Invalid itemType: ${itemType}. Must be 'service' or 'product'`);
        }

        // Validate required fields based on item type
        if (itemType === 'service' && !serviceId) {
          throw new Error('serviceId is required for service items');
        }
        if (itemType === 'product' && !variantId) {
          throw new Error('variantId is required for product items');
        }

        const query = `
          INSERT INTO company_sales_items (
            id, saleId, itemType, serviceId, variantId,
            quantity, unitPrice, discount, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
          itemId,
          saleId,
          itemType,
          itemType === 'service' ? serviceId : null,
          itemType === 'product' ? (variantId || null) : null,
          quantity || 1,
          parseFloat(unitPrice) || 0,
          parseFloat(discount) || 0
        ];

        await dbConnection.execute(query, values);
        createdItems.push(await this.findById(itemId, dbConnection));
      }

      if (!useTransaction) {
        await dbConnection.commit();
      }

      return createdItems;
    } catch (error) {
      if (!useTransaction) {
        await dbConnection.rollback();
      }
      throw new Error(`Error creating sale items: ${error.message}`);
    } finally {
      if (!useTransaction) {
        dbConnection.release();
      }
    }
  }

  // Find all items for a sale
  static async findBySaleId(saleId, connection = null) {
    const dbConnection = connection || pool;
    
    try {
      const query = `
        SELECT * FROM company_sales_items 
        WHERE saleId = ? 
        ORDER BY itemType, createdAt
      `;
      
      const [rows] = await dbConnection.execute(query, [saleId]);
      return rows.map(row => new SaleItem(row));
    } catch (error) {
      throw new Error(`Error finding sale items: ${error.message}`);
    } finally {
      if (!connection) {
        // If we created a connection, we should release it, but pool.execute doesn't require that
      }
    }
  }

  // Find item by ID
  static async findById(id, connection = null) {
    const dbConnection = connection || pool;
    
    try {
      const query = `SELECT * FROM company_sales_items WHERE id = ?`;
      const [rows] = await dbConnection.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new SaleItem(rows[0]);
    } catch (error) {
      throw new Error(`Error finding sale item: ${error.message}`);
    }
  }

  // Delete items for a sale
  static async deleteBySaleId(saleId, connection = null) {
    const dbConnection = connection || pool;
    
    try {
      const query = `DELETE FROM company_sales_items WHERE saleId = ?`;
      const [result] = await dbConnection.execute(query, [saleId]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting sale items: ${error.message}`);
    }
  }

  // Delete a single sale item by ID
  static async deleteById(itemId, connection = null) {
    const dbConnection = connection || pool;
    
    try {
      const query = `DELETE FROM company_sales_items WHERE id = ?`;
      const [result] = await dbConnection.execute(query, [itemId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting sale item: ${error.message}`);
    }
  }
}

module.exports = SaleItem;

