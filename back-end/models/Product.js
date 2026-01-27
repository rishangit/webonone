const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Product {
  constructor(data) {
    this.id = data.id;
    this.brand = data.brand;
    this.name = data.name;
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.isActive = Boolean(data.isActive);
    this.isVerified = Boolean(data.isVerified !== undefined ? data.isVerified : false);
    this.usageCount = data.usageCount || 0;
    this.createdDate = data.createdDate;
    this.lastModified = data.lastModified;
  }

  toJSON() {
    return {
      id: this.id,
      brand: this.brand,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      isVerified: this.isVerified,
      usageCount: this.usageCount,
      createdDate: this.createdDate,
      lastModified: this.lastModified,
    };
  }

  // Create a new product
  static async create(productData) {
    try {
      const {
        brand, name, description, imageUrl, isActive
      } = productData;

      // Generate NanoID for new product (8-10 characters)
      const productId = nanoid(10);

      const query = `
        INSERT INTO products (
          id, brand, name, description, imageUrl, isActive, isVerified,
          createdDate, lastModified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      // isVerified defaults to true for super admin (will be set by route based on user role)
      const isVerified = productData.isVerified !== undefined ? productData.isVerified : true;

      const values = [
        productId,
        brand || null, name, description, imageUrl || null, 
        isActive !== undefined ? isActive : true,
        isVerified
      ];

      await pool.execute(query, values);
      return productId;
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Get product by ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM products WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      return new Product(rows[0]);
    } catch (error) {
      throw new Error(`Error finding product: ${error.message}`);
    }
  }

  // Get all products
  static async findAll(filters = {}) {
    try {
      let query = `SELECT * FROM products WHERE 1=1`;
      const params = [];

      if (filters.isActive !== undefined) {
        query += ` AND isActive = ?`;
        params.push(filters.isActive);
      }

      query += ` ORDER BY createdDate DESC`;

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error finding products: ${error.message}`);
    }
  }

  // Get products with pagination, search, filters, and tags
  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        isActive,
        isVerified,
        tagIds = [],
      } = options;

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      // Build WHERE clause
      const whereConditions = [];
      const params = [];

      // Search filter
      if (search && search.trim()) {
        whereConditions.push(`(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Status filters
      if (isActive !== undefined) {
        whereConditions.push(`p.isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      if (isVerified !== undefined) {
        whereConditions.push(`p.isVerified = ?`);
        params.push(isVerified === true || isVerified === 'true' ? 1 : 0);
      }

      // Tag filter - if tagIds provided, only get products with those tags
      let tagJoin = '';
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        tagJoin = `INNER JOIN product_tags pt ON p.id = pt.productId`;
        const placeholders = tagIds.map(() => '?').join(',');
        whereConditions.push(`pt.tagId IN (${placeholders})`);
        params.push(...tagIds);
      }

      // Build WHERE clause - use 1=1 only if we have other conditions, otherwise omit WHERE
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching products
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        ${tagJoin}
        ${whereClause}
      `;
      
      console.log('Count Query:', countQuery.replace(/\s+/g, ' ').trim());
      console.log('Count Params:', params);
      console.log('Count Params length:', params.length);
      
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated products
      // Use template literals for LIMIT and OFFSET since they're safe integers
      // MySQL prepared statements sometimes have issues with parameterized LIMIT/OFFSET
      const dataQuery = `
        SELECT p.*
        FROM products p
        ${tagJoin}
        ${whereClause}
        ORDER BY p.createdDate DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      console.log('Data Query:', dataQuery.replace(/\s+/g, ' ').trim());
      console.log('Data Params:', params);
      console.log('Data Params length:', params.length);
      
      const [rows] = await pool.execute(dataQuery, params);
      
      const products = rows.map(row => new Product(row));

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
      console.error('Error in findAllPaginated:', error);
      throw new Error(`Error finding paginated products: ${error.message}`);
    }
  }

  // Update product
  static async update(id, productData) {
    try {
      const allowedFields = [
        'name', 'description', 'imageUrl', 'isActive', 'brand', 'isVerified'
      ];

      const updates = [];
      const values = [];

      for (const field of allowedFields) {
        if (productData[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(productData[field]);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('lastModified = NOW()');
      values.push(id);

      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      return await Product.findById(id);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product
  static async delete(id) {
    try {
      const query = `DELETE FROM products WHERE id = ?`;
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Tag management methods
  static async getTags(productId) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.* FROM tags t
         INNER JOIN product_tags pt ON t.id = pt.tagId
         WHERE pt.productId = ?
         ORDER BY t.name`,
        [productId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error getting product tags: ${error.message}`);
    }
  }

  static async setTags(productId, tagIds) {
    const connection = await pool.getConnection();
    const Tag = require('./Tag');
    
    try {
      console.log(`[Product.setTags] Starting transaction for productId: ${productId}, tagIds:`, tagIds);
      await connection.beginTransaction();
      
      // Get old tags for usage count decrement (before deleting)
      const [oldTags] = await connection.execute(
          'SELECT tagId FROM product_tags WHERE productId = ?',
          [productId]
        );
      console.log(`[Product.setTags] Found ${oldTags.length} existing tags`);
      
      const oldTagIds = oldTags.map(t => t.tagId);
        
        // Remove existing tags
      await connection.execute('DELETE FROM product_tags WHERE productId = ?', [productId]);
      console.log(`[Product.setTags] Deleted existing tags`);
        
        // Add new tags
        if (tagIds && tagIds.length > 0) {
          const values = tagIds.map(tagId => [nanoid(10), productId, tagId]);
          const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        console.log(`[Product.setTags] Inserting tags:`, values);
        const [result] = await connection.execute(
            `INSERT INTO product_tags (id, productId, tagId) VALUES ${placeholders}`,
            values.flat()
          );
        console.log(`[Product.setTags] Inserted ${result.affectedRows} tag(s)`);
      }
      
      // Commit transaction first - this releases locks
      await connection.commit();
      console.log(`[Product.setTags] Transaction committed successfully`);
      
      // Update usage counts OUTSIDE the transaction to avoid lock conflicts
      // This is safe because the critical data (product_tags) is already saved
      try {
        // Decrement usage count for removed tags
        for (const oldTagId of oldTagIds) {
          if (!tagIds || !tagIds.includes(oldTagId)) {
            await Tag.decrementUsageCount(oldTagId);
          }
        }
          
          // Increment usage count for new tags
        if (tagIds && tagIds.length > 0) {
          for (const tagId of tagIds) {
            if (!oldTagIds.includes(tagId)) {
            await Tag.incrementUsageCount(tagId);
          }
        }
        }
        console.log(`[Product.setTags] Usage counts updated successfully`);
      } catch (usageError) {
        // Non-critical error - log but don't fail
        console.error(`[Product.setTags] Error updating usage counts (non-critical):`, usageError.message);
      }
      
      return true;
    } catch (error) {
      await connection.rollback();
      console.error(`[Product.setTags] Error occurred, rolling back:`, error);
      throw new Error(`Error setting product tags: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = Product;

