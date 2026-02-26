const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class CompanyService {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.duration = data.duration;
    this.price = data.price;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.categoryId = data.categoryId;
    this.subcategoryId = data.subcategoryId;
    this.status = data.status || 'Active';
    this.providerName = data.providerName;
    this.providerAvatar = data.providerAvatar;
    this.staffId = data.staffId;
    this.imageUrl = data.imageUrl;
    this.galleryImages = data.galleryImages;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      description: this.description,
      duration: this.duration,
      price: parseFloat(this.price),
      category: this.category,
      subcategory: this.subcategory,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      status: this.status,
      provider: {
        name: this.providerName || '',
        avatar: this.providerAvatar || '',
        staffId: this.staffId
      },
      bookings: {
        thisMonth: 0,
        revenue: 0
      },
      tags: [],
      image: this.imageUrl || '',
      galleryImages: this.galleryImages ? (typeof this.galleryImages === 'string' ? JSON.parse(this.galleryImages) : this.galleryImages) : [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const id = nanoid(10);
      const query = `
        INSERT INTO company_services (
          id, companyId, name, description, duration, price, category, subcategory,
          categoryId, subcategoryId, status, providerName, providerAvatar, staffId, imageUrl, galleryImages
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const galleryImagesValue = data.galleryImages 
        ? (Array.isArray(data.galleryImages) ? JSON.stringify(data.galleryImages) : data.galleryImages)
        : null;

      const values = [
        id,
        data.companyId,
        data.name,
        data.description || null,
        data.duration,
        data.price,
        data.category || null,
        data.subcategory || null,
        data.categoryId || null,
        data.subcategoryId || null,
        data.status || 'Active',
        data.providerName || null,
        data.providerAvatar || null,
        data.staffId || null,
        data.imageUrl || null,
        galleryImagesValue
      ];

      await connection.execute(query, values);
      
      // Set tags if provided (within transaction)
      let tagUpdateResult = null;
      if (data.tagIds && data.tagIds.length > 0) {
        tagUpdateResult = await CompanyService.setTags(id, data.tagIds, connection);
      }
      
      await connection.commit();
      
      // Update usage counts asynchronously (non-blocking) after response
      if (tagUpdateResult) {
        // Fire and forget - don't await, let it run in background
        CompanyService.updateTagUsageCounts(tagUpdateResult.oldTagIds, tagUpdateResult.newTagIds).catch(err => {
          console.error(`[CompanyService.create] Background tag usage count update failed:`, err.message);
        });
      }
      
      const service = await CompanyService.findById(id);
      return service;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating service: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM company_services WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      const service = new CompanyService(rows[0]);
      const serviceData = service.toJSON();
      
      // Fetch tags with full information (color, icon, etc.)
      try {
        const tags = await CompanyService.getTags(id);
        serviceData.tags = tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color || '#3B82F6',
          icon: tag.icon,
          description: tag.description,
          isActive: tag.isActive
        }));
      } catch (error) {
        console.error(`Error fetching tags for service ${id}:`, error);
        serviceData.tags = [];
      }
      
      return serviceData;
    } catch (error) {
      throw new Error(`Error finding service: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { companyId, status, categoryId } = options;
      
      let query = 'SELECT * FROM company_services WHERE 1=1';
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (categoryId) {
        query += ' AND categoryId = ?';
        params.push(categoryId);
      }

      query += ' ORDER BY createdAt DESC';

      const [rows] = await pool.execute(query, params);
      const services = rows.map(row => new CompanyService(row));
      
      // Fetch tags for each service with full information
      const servicesWithTags = await Promise.all(
        services.map(async (service) => {
          const serviceData = service.toJSON();
          try {
            const tags = await CompanyService.getTags(service.id);
            serviceData.tags = tags.map(tag => ({
              id: tag.id,
              name: tag.name,
              color: tag.color || '#3B82F6',
              icon: tag.icon,
              description: tag.description,
              isActive: tag.isActive
            }));
          } catch (error) {
            console.error(`Error fetching tags for service ${service.id}:`, error);
            serviceData.tags = [];
          }
          return serviceData;
        })
      );
      
      return servicesWithTags;
    } catch (error) {
      throw new Error(`Error finding services: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        companyId,
        status,
        categoryId,
      } = options || {};

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = 'SELECT * FROM company_services WHERE 1=1';
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (categoryId) {
        query += ' AND categoryId = ?';
        params.push(categoryId);
      }

      // Search filter
      if (search && search.trim()) {
        query += ` AND (
          name LIKE ? OR 
          description LIKE ? OR 
          category LIKE ?
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Count total matching services
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated services
      query += ' ORDER BY createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);
      
      // If no rows, return empty array with pagination info
      if (!rows || rows.length === 0) {
        return {
          services: [],
          pagination: {
            total: 0,
            limit: limitInt,
            offset: offsetInt,
            totalPages: 0,
            currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
          },
        };
      }

      const services = rows.map(row => new CompanyService(row));
      
      // Fetch tags for each service with full information
      const servicesWithTags = await Promise.all(
        services.map(async (service) => {
          const serviceData = service.toJSON();
          try {
            const tags = await CompanyService.getTags(service.id);
            serviceData.tags = tags.map(tag => ({
              id: tag.id,
              name: tag.name,
              color: tag.color || '#3B82F6',
              icon: tag.icon,
              description: tag.description,
              isActive: tag.isActive
            }));
          } catch (error) {
            console.error(`Error fetching tags for service ${service.id}:`, error);
            serviceData.tags = [];
          }
          return serviceData;
        })
      );
      
      return {
        services: servicesWithTags,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      throw new Error(`Error finding paginated services: ${error.message}`);
    }
  }

  async update(data) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const fields = [];
      const values = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        values.push(data.description);
      }
      if (data.duration !== undefined) {
        fields.push('duration = ?');
        values.push(data.duration);
      }
      if (data.price !== undefined) {
        fields.push('price = ?');
        values.push(data.price);
      }
      if (data.category !== undefined) {
        fields.push('category = ?');
        values.push(data.category);
      }
      if (data.subcategory !== undefined) {
        fields.push('subcategory = ?');
        values.push(data.subcategory);
      }
      if (data.categoryId !== undefined) {
        fields.push('categoryId = ?');
        values.push(data.categoryId);
      }
      if (data.subcategoryId !== undefined) {
        fields.push('subcategoryId = ?');
        values.push(data.subcategoryId);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.providerName !== undefined) {
        fields.push('providerName = ?');
        values.push(data.providerName);
      }
      if (data.providerAvatar !== undefined) {
        fields.push('providerAvatar = ?');
        values.push(data.providerAvatar);
      }
      if (data.staffId !== undefined) {
        fields.push('staffId = ?');
        values.push(data.staffId);
      }
      if (data.imageUrl !== undefined) {
        fields.push('imageUrl = ?');
        values.push(data.imageUrl);
      }
      if (data.galleryImages !== undefined) {
        const galleryImagesValue = Array.isArray(data.galleryImages) 
          ? JSON.stringify(data.galleryImages) 
          : (data.galleryImages || null);
        fields.push('galleryImages = ?');
        values.push(galleryImagesValue);
      }

      // Update service fields if any
      if (fields.length > 0) {
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(this.id);
        const query = `UPDATE company_services SET ${fields.join(', ')} WHERE id = ?`;
        await connection.execute(query, values);
      }

      // Update tags if provided
      let tagUpdateResult = null;
      if (data.tagIds !== undefined) {
        tagUpdateResult = await CompanyService.setTags(this.id, data.tagIds, connection);
      }
      
      await connection.commit();
      
      // Update usage counts asynchronously (non-blocking) after response
      if (tagUpdateResult) {
        // Fire and forget - don't await, let it run in background
        CompanyService.updateTagUsageCounts(tagUpdateResult.oldTagIds, tagUpdateResult.newTagIds).catch(err => {
          console.error(`[CompanyService.update] Background tag usage count update failed:`, err.message);
        });
      }
      
      const updated = await CompanyService.findById(this.id);
      return updated;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating service: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM company_services WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  // Tag management methods
  static async getTags(serviceId) {
    try {
      const { getEntityTags } = require('../utils/entityTags');
      const { EntityType } = require('../constants/entityType');
      return await getEntityTags(EntityType.SERVICE, serviceId);
    } catch (error) {
      throw new Error(`Error getting service tags: ${error.message}`);
    }
  }

  static async setTags(serviceId, tagIds, connection = null) {
    try {
      const { setEntityTags, updateTagUsageCounts } = require('../utils/entityTags');
      const { EntityType } = require('../constants/entityType');
      
      // Set tags in unified entity_tags table (use provided connection if available)
      const result = await setEntityTags(EntityType.SERVICE, serviceId, tagIds, connection);
      
      // Update usage counts asynchronously (non-blocking) if not in transaction
      if (!connection) {
        updateTagUsageCounts(result.oldTagIds, result.newTagIds).catch(err => {
          console.error(`[CompanyService.setTags] Background tag usage count update failed:`, err.message);
        });
      }
      
      // Return old and new tag IDs for async usage count update (don't update here)
      return { oldTagIds: result.oldTagIds, newTagIds: result.newTagIds };
    } catch (error) {
      throw new Error(`Error setting service tags: ${error.message}`);
    }
  }

  // Separate method for updating tag usage counts asynchronously
  static async updateTagUsageCounts(oldTagIds, newTagIds) {
    const Tag = require('./Tag');
    
    try {
      // Decrement usage count for removed tags
      for (const oldTagId of oldTagIds) {
        if (!newTagIds || !newTagIds.includes(oldTagId)) {
          await Tag.decrementUsageCount(oldTagId);
        }
      }
      
      // Increment usage count for new tags
      if (newTagIds && newTagIds.length > 0) {
        for (const tagId of newTagIds) {
          if (!oldTagIds.includes(tagId)) {
            await Tag.incrementUsageCount(tagId);
          }
        }
      }
    } catch (usageError) {
      // Non-critical error - log but don't fail
      console.error(`[CompanyService.updateTagUsageCounts] Error updating tag usage counts (non-critical):`, usageError.message);
    }
  }
}

module.exports = CompanyService;



