const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyProduct {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.systemProductId = data.systemProductId;
    this.isAvailableForPurchase = Boolean(data.isAvailableForPurchase);
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    // System product data (from join)
    this.name = data.name;
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    // Removed brand field
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      systemProductId: this.systemProductId,
      isAvailableForPurchase: this.isAvailableForPurchase,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // System product data (populated from join)
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      // Removed brand field
    };
  }

  // Create a new company product (with optional variants)
  static async create(productData, variants = []) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        companyId,
        systemProductId,
        isAvailableForPurchase,
        notes
        // tagIds removed - tags are inherited from system product
        // type, price, and stock are now in variants
      } = productData;

      // Validate that systemProductId is provided
      if (!systemProductId) {
        throw new Error('systemProductId is required');
      }

      const productId = nanoid(10);

      const query = `
        INSERT INTO company_products (
          id, companyId, systemProductId,
          isAvailableForPurchase, notes,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        productId,
        companyId,
        systemProductId,
        isAvailableForPurchase || false,
        notes || null
      ];

      await connection.execute(query, values);

      // Tags are inherited from the system product, so we don't set them here
      // They will be retrieved from the system product when fetching company products

      // Handle variants if provided (in the same transaction)
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const CompanyProductVariant = require('./CompanyProductVariant');
        await CompanyProductVariant.createBulk(productId, variants, connection);
      }

      await connection.commit();
      
      return await CompanyProduct.findById(productId);
    } catch (error) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Product already exists for this company');
      }
      throw new Error(`Error creating company product: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get company product by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT cp.*, 
                p.name, 
                p.description, 
                p.imageUrl AS systemProductImageUrl
                -- Removed brand field
         FROM company_products cp
         LEFT JOIN products p ON cp.systemProductId = p.id
         WHERE cp.id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      // Map systemProductImageUrl to imageUrl for the constructor
      const rowData = {
        ...rows[0],
        imageUrl: rows[0].systemProductImageUrl || null
      };
      const product = new CompanyProduct(rowData);
      // Get tags from the system product (not from company_product_tags)
      const Product = require('./Product');
      const tags = product.systemProductId ? await Product.getTags(product.systemProductId) : [];
      // Get variants
      const CompanyProductVariant = require('./CompanyProductVariant');
      const variants = await CompanyProductVariant.findByCompanyProductId(id);
      return { ...product.toJSON(), tags, variants: variants.map(v => v.toJSON()) };
    } catch (error) {
      throw new Error(`Error finding company product: ${error.message}`);
    }
  }

  // Get all company products
  static async findAll(filters = {}) {
    try {
      let query = `SELECT cp.*, 
                          p.name, 
                          p.description, 
                          p.imageUrl AS systemProductImageUrl
                          -- Removed brand field
                   FROM company_products cp
                   LEFT JOIN products p ON cp.systemProductId = p.id
                   WHERE 1=1`;
      const params = [];

      if (filters.companyId) {
        query += ' AND cp.companyId = ?';
        params.push(filters.companyId);
      }

      if (filters.systemProductId) {
        query += ' AND cp.systemProductId = ?';
        params.push(filters.systemProductId);
      }

      query += ' ORDER BY cp.createdAt DESC';

      const [rows] = await pool.execute(query, params);
      const products = [];
      const Product = require('./Product');

      for (const row of rows) {
        // Map systemProductImageUrl to imageUrl for the constructor
        const rowData = {
          ...row,
          imageUrl: row.systemProductImageUrl || null
        };
        const product = new CompanyProduct(rowData);
        // Get tags from the system product (not from company_product_tags)
        const tags = product.systemProductId ? await Product.getTags(product.systemProductId) : [];
        // Get variants
        const CompanyProductVariant = require('./CompanyProductVariant');
        const variants = await CompanyProductVariant.findByCompanyProductId(product.id);
        products.push({ ...product.toJSON(), tags, variants: variants.map(v => v.toJSON()) });
      }

      return products;
    } catch (error) {
      throw new Error(`Error finding company products: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        companyId,
        systemProductId,
      } = options || {};

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = `SELECT cp.*, 
                          p.name, 
                          p.description, 
                          p.imageUrl AS systemProductImageUrl
                          -- Removed brand field
                   FROM company_products cp
                   LEFT JOIN products p ON cp.systemProductId = p.id
                   WHERE 1=1`;
      const params = [];

      if (companyId) {
        query += ' AND cp.companyId = ?';
        params.push(companyId);
      }

      if (systemProductId) {
        query += ' AND cp.systemProductId = ?';
        params.push(systemProductId);
      }

      // Search filter
      if (search && search.trim()) {
        query += ` AND (
          p.name LIKE ? OR 
          p.description LIKE ?
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      // Count total matching products
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT cp.id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated products
      query += ' ORDER BY cp.createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);
      
      // If no rows, return empty array with pagination info
      if (!rows || rows.length === 0) {
        return {
          products: [],
          pagination: {
            total: 0,
            limit: limitInt,
            offset: offsetInt,
            totalPages: 0,
            currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
          },
        };
      }

      const products = [];
      const Product = require('./Product');

      for (const row of rows) {
        // Map systemProductImageUrl to imageUrl for the constructor
        const rowData = {
          ...row,
          imageUrl: row.systemProductImageUrl || null
        };
        const product = new CompanyProduct(rowData);
        // Get tags from the system product (not from company_product_tags)
        const tags = product.systemProductId ? await Product.getTags(product.systemProductId) : [];
        // Get variants
        const CompanyProductVariant = require('./CompanyProductVariant');
        const variants = await CompanyProductVariant.findByCompanyProductId(product.id);
        products.push({ ...product.toJSON(), tags, variants: variants.map(v => v.toJSON()) });
      }
      
      return {
        products,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      throw new Error(`Error finding paginated company products: ${error.message}`);
    }
  }

  // Update company product
  static async update(id, productData) {
    try {
      const allowedFields = [
        'isAvailableForPurchase', 'notes', 'systemProductId'
        // type, price, and stock are now in variants
      ];

      const fields = [];
      const values = [];

      for (const field of allowedFields) {
        if (productData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(productData[field]);
        }
      }

      if (fields.length === 0) {
        return await CompanyProduct.findById(id);
      }

      fields.push('updatedAt = NOW()');
      values.push(id);

      await pool.execute(
        `UPDATE company_products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      // Tags are inherited from the system product, so we don't update them here
      // They will be retrieved from the system product when fetching company products

      return await CompanyProduct.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Product already exists for this company');
      }
      throw new Error(`Error updating company product: ${error.message}`);
    }
  }

  // Delete company product
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_products WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting company product: ${error.message}`);
    }
  }

  // Tag management methods
  static async getTags(companyProductId) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.* FROM tags t
         INNER JOIN company_product_tags cpt ON t.id = cpt.tagId
         WHERE cpt.companyProductId = ?
         ORDER BY t.name`,
        [companyProductId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error getting company product tags: ${error.message}`);
    }
  }

  static async setTags(companyProductId, tagIds) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Remove existing tags
      await connection.execute(
        'DELETE FROM company_product_tags WHERE companyProductId = ?',
        [companyProductId]
      );
      
      // Add new tags
      if (tagIds && tagIds.length > 0) {
        const values = tagIds.map(tagId => [nanoid(10), companyProductId, tagId]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        
        await connection.execute(
          `INSERT INTO company_product_tags (id, companyProductId, tagId) VALUES ${placeholders}`,
          values.flat()
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error setting company product tags: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = CompanyProduct;

