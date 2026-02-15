const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyProductVariant {
  constructor(data) {
    this.id = data.id;
    this.companyProductId = data.companyProductId;
    this.systemProductVariantId = data.systemProductVariantId;
    // Variant details from system product variant (joined)
    this.name = data.name || data.systemVariantName;
    this.sku = data.sku || data.systemVariantSku;
    // Removed hardcoded fields: color, size, weight, material (now stored in attributes)
    // Company-specific fields
    this.type = data.type;
    this.isDefault = Boolean(data.isDefault);
    this.isActive = Boolean(data.isActive);
    this.activeStockId = data.activeStockId || null;
    this.minStock = data.minStock !== undefined ? parseInt(data.minStock) : 10;
    this.maxStock = data.maxStock !== undefined ? parseInt(data.maxStock) : 100;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    const json = {
      id: this.id,
      companyProductId: this.companyProductId,
      systemProductVariantId: this.systemProductVariantId,
      name: this.name,
      sku: this.sku,
      // Removed hardcoded fields: color, size, weight, material (now stored in attributes)
      type: this.type,
      isDefault: this.isDefault,
      isActive: this.isActive,
      activeStockId: this.activeStockId,
      minStock: this.minStock,
      maxStock: this.maxStock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
    
    // Include active stock data if available
    if (this.activeStock) {
      json.activeStock = this.activeStock;
    }
    
    return json;
  }

  // Create a new variant
  static async create(variantData) {
    try {
      const {
        companyProductId,
        systemProductVariantId,
        type,
        isDefault,
        isActive,
        minStock,
        maxStock
      } = variantData;

      if (!systemProductVariantId) {
        throw new Error('systemProductVariantId is required');
      }

      // Check if this will be the only variant for this product
      const [existingVariants] = await pool.execute(
        'SELECT COUNT(*) as count FROM company_product_variants WHERE companyProductId = ?',
        [companyProductId]
      );
      const isOnlyVariant = existingVariants[0].count === 0;
      
      // If this is the only variant, set it as default
      // Otherwise, use the provided isDefault value
      const shouldBeDefault = isOnlyVariant ? true : (isDefault === true);

      // If this is set as default, unset other defaults for this product
      if (shouldBeDefault) {
        await pool.execute(
          'UPDATE company_product_variants SET isDefault = FALSE WHERE companyProductId = ?',
          [companyProductId]
        );
      }

      const variantId = nanoid(10);

      const query = `
        INSERT INTO company_product_variants (
          id, companyProductId, systemProductVariantId,
          type, isDefault, isActive, minStock, maxStock,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        variantId,
        companyProductId,
        systemProductVariantId,
        type || 'service',
        shouldBeDefault,
        isActive !== undefined ? isActive : true,
        minStock !== undefined ? parseInt(minStock) : 10,
        maxStock !== undefined ? parseInt(maxStock) : 100
      ];

      await pool.execute(query, values);

      return await CompanyProductVariant.findById(variantId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Variant already exists for this product');
      }
      throw new Error(`Error creating variant: ${error.message}`);
    }
  }

  // Create multiple variants (bulk)
  // If connection is provided, use it (for transactions), otherwise create a new one
  static async createBulk(companyProductId, variants, providedConnection = null) {
    const connection = providedConnection || await pool.getConnection();
    const shouldCommit = !providedConnection; // Only commit if we created the connection
    
    try {
      if (!providedConnection) {
        await connection.beginTransaction();
      }

      // If there's only one variant and no default is set, set it as default
      const hasDefault = variants.some(v => v.isDefault === true);
      const isSingleVariant = variants.length === 1;
      
      // If any variant is set as default, unset other defaults first
      if (hasDefault) {
        await connection.execute(
          'UPDATE company_product_variants SET isDefault = FALSE WHERE companyProductId = ?',
          [companyProductId]
        );
      }

      const createdVariants = [];

      for (let index = 0; index < variants.length; index++) {
        const variantData = variants[index];
        const {
          systemProductVariantId,
          type,
          isDefault,
          isActive,
          minStock,
          maxStock
        } = variantData;

        if (!systemProductVariantId) {
          throw new Error('systemProductVariantId is required for all variants');
        }

        // If this is the only variant and no default is explicitly set, make it default
        const shouldBeDefault = isSingleVariant && !hasDefault ? true : (isDefault === true);

        const variantId = nanoid(10);

        const query = `
          INSERT INTO company_product_variants (
            id, companyProductId, systemProductVariantId,
            type, isDefault, isActive, minStock, maxStock,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const values = [
          variantId,
          companyProductId,
          systemProductVariantId,
          type || 'service',
          shouldBeDefault,
          isActive !== undefined ? isActive : true,
          minStock !== undefined ? parseInt(minStock) : 10,
          maxStock !== undefined ? parseInt(maxStock) : 100
        ];

        await connection.execute(query, values);
        
        // Fetch the created variant with joined system variant data
        const created = await CompanyProductVariant.findById(variantId);
        if (created) {
          createdVariants.push(created);
        }
      }

      if (shouldCommit) {
        await connection.commit();
      }
      return createdVariants;
    } catch (error) {
      if (shouldCommit) {
        await connection.rollback();
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Variant already exists for this product');
      }
      throw new Error(`Error creating variants: ${error.message}`);
    } finally {
      if (!providedConnection) {
        connection.release();
      }
    }
  }

  // Get variant by ID (with joined system variant data and active stock)
  static async findById(id) {
    try {
      const query = `
        SELECT 
          cpv.*,
          pv.name as systemVariantName,
          pv.sku as systemVariantSku,
          -- Removed hardcoded fields: color, size, weight, material (now stored in attributes)
          cps.costPrice as activeStockCostPrice,
          cps.sellPrice as activeStockSellPrice,
          cps.quantity as activeStockQuantity
        FROM company_product_variants cpv
        LEFT JOIN product_variants pv ON cpv.systemProductVariantId = pv.id
        LEFT JOIN company_product_stock cps ON cpv.activeStockId = cps.id AND cps.isActive = 1
        WHERE cpv.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const variant = new CompanyProductVariant(rows[0]);
      // Add active stock data to variant object
      if (rows[0].activeStockCostPrice !== null && rows[0].activeStockCostPrice !== undefined) {
        variant.activeStock = {
          costPrice: rows[0].activeStockCostPrice,
          sellPrice: rows[0].activeStockSellPrice,
          quantity: rows[0].activeStockQuantity
        };
      }
      return variant;
    } catch (error) {
      throw new Error(`Error finding variant: ${error.message}`);
    }
  }

  // Get variants by company product ID (with joined system variant data and active stock)
  static async findByCompanyProductId(companyProductId) {
    try {
      const query = `
        SELECT 
          cpv.*,
          pv.name as systemVariantName,
          pv.sku as systemVariantSku,
          -- Removed hardcoded fields: color, size, weight, material (now stored in attributes)
          cps.costPrice as activeStockCostPrice,
          cps.sellPrice as activeStockSellPrice,
          cps.quantity as activeStockQuantity
        FROM company_product_variants cpv
        LEFT JOIN product_variants pv ON cpv.systemProductVariantId = pv.id
        LEFT JOIN company_product_stock cps ON cpv.activeStockId = cps.id AND cps.isActive = 1
        WHERE cpv.companyProductId = ?
        ORDER BY cpv.isDefault DESC, cpv.createdAt ASC
      `;
      const [rows] = await pool.execute(query, [companyProductId]);
      
      return rows.map(row => {
        const variant = new CompanyProductVariant(row);
        // Add active stock data to variant object
        if (row.activeStockCostPrice !== null && row.activeStockCostPrice !== undefined) {
          variant.activeStock = {
            costPrice: row.activeStockCostPrice,
            sellPrice: row.activeStockSellPrice,
            quantity: row.activeStockQuantity
          };
        }
        return variant;
      });
    } catch (error) {
      throw new Error(`Error finding variants: ${error.message}`);
    }
  }

  // Update variant
  static async update(id, variantData) {
    try {
      const allowedFields = [
        'systemProductVariantId', 'type',
        'isDefault', 'isActive', 'activeStockId',
        'minStock', 'maxStock'
      ];

      const fields = [];
      const values = [];

      // If setting as default, unset other defaults
      if (variantData.isDefault === true) {
        const variant = await CompanyProductVariant.findById(id);
        if (variant) {
          await pool.execute(
            'UPDATE company_product_variants SET isDefault = FALSE WHERE companyProductId = ? AND id != ?',
            [variant.companyProductId, id]
          );
        }
      }

      for (const field of allowedFields) {
        if (variantData[field] !== undefined) {
          fields.push(`${field} = ?`);
          // Parse minStock and maxStock as integers
          if (field === 'minStock' || field === 'maxStock') {
            values.push(parseInt(variantData[field]));
          } else {
            values.push(variantData[field]);
          }
        }
      }

      if (fields.length === 0) {
        return await CompanyProductVariant.findById(id);
      }

      fields.push('updatedAt = NOW()');
      values.push(id);

      await pool.execute(
        `UPDATE company_product_variants SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await CompanyProductVariant.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Variant already exists for this product');
      }
      throw new Error(`Error updating variant: ${error.message}`);
    }
  }

  // Delete variant
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_product_variants WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting variant: ${error.message}`);
    }
  }
}

module.exports = CompanyProductVariant;

