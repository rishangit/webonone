const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const Service = require('./Service');

function parseImages(raw) {
  if (raw == null || raw === '') return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map(String);
  }
  return [];
}

function parseDefaultProducts(raw) {
  if (raw == null || raw === '') return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw;
  }
  return [];
}

class CompanyService {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.systemServiceId = data.systemServiceId;
    this.companyName = data.companyName || null;
    this.overrideName = data.name == null ? null : String(data.name);
    this.overrideDescription = data.description == null ? null : String(data.description);
    this.overrideImages = parseImages(data.images);
    this.name = data.name || data.systemServiceName;
    this.description = data.description || data.systemServiceDescription;
    this.duration = data.duration;
    this.price = data.price;
    this.status = data.status || 'Active';
    this.images = parseImages(data.images || data.systemServiceImages);
    this.defaultProducts = parseDefaultProducts(data.defaultProducts);
    this.defaultDuration = data.defaultDuration == null ? null : Number(data.defaultDuration);
    this.defaultPrice = data.defaultPrice == null ? null : Number(data.defaultPrice);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    const images = this.images;
    const primaryImage = images[0] || '';
    const hasNameCustomization = this.overrideName !== null && this.overrideName.trim() !== '';
    const hasDescriptionCustomization = this.overrideDescription !== null && this.overrideDescription.trim() !== '';
    const hasImagesCustomization = this.overrideImages.length > 0;
    return {
      id: this.id,
      companyId: this.companyId,
      companyName: this.companyName,
      systemServiceId: this.systemServiceId,
      name: this.name,
      description: this.description,
      duration: this.duration,
      price: parseFloat(this.price),
      status: this.status,
      images,
      image: primaryImage,
      defaultDuration: this.defaultDuration,
      defaultPrice: this.defaultPrice,
      defaultProducts: this.defaultProducts,
      customizations: {
        name: hasNameCustomization,
        description: hasDescriptionCustomization,
        images: hasImagesCustomization,
        hasAny: hasNameCustomization || hasDescriptionCustomization || hasImagesCustomization,
      },
      bookings: {
        thisMonth: 0,
        revenue: 0,
      },
      tags: [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async assertDefaultProductsForCompany(companyId, defaultProducts, connection = null) {
    if (!defaultProducts || defaultProducts.length === 0) return;
    const exec = connection ? (sql, p) => connection.execute(sql, p) : (sql, p) => pool.execute(sql, p);
    for (const item of defaultProducts) {
      if (!item.companyProductId) {
        throw new Error('Each default product entry must include companyProductId');
      }
      const qty = parseFloat(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error('Each default product must have quantity > 0');
      }
      const [rows] = await exec(
        'SELECT id FROM company_products WHERE id = ? AND companyId = ? LIMIT 1',
        [item.companyProductId, companyId]
      );
      if (!rows || rows.length === 0) {
        throw new Error(`Company product ${item.companyProductId} is not valid for this company`);
      }
    }
  }

  static async create(data) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const id = nanoid(10);
      await CompanyService.assertDefaultProductsForCompany(data.companyId, data.defaultProducts, connection);
      let systemServiceId = data.systemServiceId || null;
      if (systemServiceId) {
        const [existingSystemRows] = await connection.execute('SELECT id FROM services WHERE id = ? LIMIT 1', [systemServiceId]);
        if (existingSystemRows.length === 0) {
          throw new Error('Invalid systemServiceId');
        }
      } else {
        const systemService = await Service.findOrCreateByName(
          {
            name: data.name,
            description: data.description,
            images: data.images,
            defaultDuration: data.duration,
            defaultPrice: data.price,
          },
          connection
        );
        systemServiceId = systemService.id;
      }
      const defaultProductsArr = Array.isArray(data.defaultProducts) ? data.defaultProducts : [];

      const query = `
        INSERT INTO company_services (
          id, companyId, systemServiceId, name, description, images, duration, price, status, defaultProducts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const defaultProductsValue = defaultProductsArr.length > 0 ? JSON.stringify(defaultProductsArr) : null;
      const images = parseImages(data.images);
      const hasSystemRef = Boolean(data.systemServiceId);
      const overrideName = hasSystemRef ? (data.name ? String(data.name).trim() : null) : null;
      const overrideDescription = hasSystemRef ? (data.description || null) : null;
      const overrideImages = hasSystemRef && images.length > 0 ? JSON.stringify(images) : null;

      const values = [
        id,
        data.companyId,
        systemServiceId,
        overrideName,
        overrideDescription,
        overrideImages,
        data.duration,
        data.price,
        data.status || 'Active',
        defaultProductsValue,
      ];

      await connection.execute(query, values);
      await Service.incrementUsageCount(systemServiceId, connection);

      let tagUpdateResult = null;
      if (data.tagIds && data.tagIds.length > 0) {
        tagUpdateResult = await Service.setTags(systemServiceId, data.tagIds, connection);
      }

      await connection.commit();

      if (tagUpdateResult) {
        CompanyService.updateTagUsageCounts(tagUpdateResult.oldTagIds, tagUpdateResult.newTagIds).catch((err) => {
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
        `
        SELECT
          cs.*,
          c.name AS companyName,
          s.name AS systemServiceName,
          s.description AS systemServiceDescription,
          s.images AS systemServiceImages,
          s.defaultDuration,
          s.defaultPrice
        FROM company_services cs
        LEFT JOIN companies c ON cs.companyId = c.id
        LEFT JOIN services s ON cs.systemServiceId = s.id
        WHERE cs.id = ?
      `,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const service = new CompanyService(rows[0]);
      const serviceData = service.toJSON();

      try {
        const tags = service.systemServiceId ? await Service.getTags(service.systemServiceId) : [];
        serviceData.tags = tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color || '#3B82F6',
          icon: tag.icon,
          description: tag.description,
          isActive: tag.isActive,
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
      const { companyId, status } = options;

      let query = `
        SELECT
          cs.*,
          c.name AS companyName,
          s.name AS systemServiceName,
          s.description AS systemServiceDescription,
          s.images AS systemServiceImages,
          s.defaultDuration,
          s.defaultPrice
        FROM company_services cs
        LEFT JOIN companies c ON cs.companyId = c.id
        LEFT JOIN services s ON cs.systemServiceId = s.id
        WHERE 1=1
      `;
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY createdAt DESC';

      const [rows] = await pool.execute(query, params);
      const services = rows.map((row) => new CompanyService(row));

      const servicesWithTags = await Promise.all(
        services.map(async (service) => {
          const serviceData = service.toJSON();
          try {
            const tags = service.systemServiceId ? await Service.getTags(service.systemServiceId) : [];
            serviceData.tags = tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color || '#3B82F6',
              icon: tag.icon,
              description: tag.description,
              isActive: tag.isActive,
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
      const { limit = 12, offset = 0, search = '', companyId, status } = options || {};

      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = `
        SELECT
          cs.*,
          c.name AS companyName,
          s.name AS systemServiceName,
          s.description AS systemServiceDescription,
          s.images AS systemServiceImages,
          s.defaultDuration,
          s.defaultPrice
        FROM company_services cs
        LEFT JOIN companies c ON cs.companyId = c.id
        LEFT JOIN services s ON cs.systemServiceId = s.id
        WHERE 1=1
      `;
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim()) {
        query += ` AND (
          COALESCE(cs.name, s.name) LIKE ? OR 
          COALESCE(cs.description, s.description) LIKE ?
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      const countQuery = query
        .replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT cs.id) as total FROM')
        .replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      query += ' ORDER BY createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);

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

      const services = rows.map((row) => new CompanyService(row));

      const servicesWithTags = await Promise.all(
        services.map(async (service) => {
          const serviceData = service.toJSON();
          try {
            const tags = service.systemServiceId ? await Service.getTags(service.systemServiceId) : [];
            serviceData.tags = tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color || '#3B82F6',
              icon: tag.icon,
              description: tag.description,
              isActive: tag.isActive,
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

      if (data.defaultProducts !== undefined) {
        const [rows] = await connection.execute('SELECT companyId FROM company_services WHERE id = ?', [this.id]);
        const companyId = rows[0]?.companyId;
        if (companyId) {
          await CompanyService.assertDefaultProductsForCompany(companyId, data.defaultProducts, connection);
        }
      }

      const fields = [];
      const values = [];
      let newSystemServiceId = null;

      if (data.duration !== undefined) {
        fields.push('duration = ?');
        values.push(data.duration);
      }
      if (data.price !== undefined) {
        fields.push('price = ?');
        values.push(data.price);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.systemServiceId !== undefined) {
        const [systemRows] = await connection.execute('SELECT id FROM services WHERE id = ? LIMIT 1', [data.systemServiceId]);
        if (systemRows.length === 0) {
          throw new Error('Invalid systemServiceId');
        }
        fields.push('systemServiceId = ?');
        values.push(data.systemServiceId);
        newSystemServiceId = data.systemServiceId;
      } else if (data.name !== undefined || data.description !== undefined || data.images !== undefined) {
        const [currentRows] = await connection.execute('SELECT systemServiceId FROM company_services WHERE id = ? LIMIT 1', [this.id]);
        const currentSystemServiceId = currentRows[0]?.systemServiceId || this.systemServiceId;
        if (currentSystemServiceId) {
          if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name ? String(data.name).trim() : null);
          }
          if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description || null);
          }
          if (data.images !== undefined) {
            const images = parseImages(data.images);
            fields.push('images = ?');
            values.push(images.length > 0 ? JSON.stringify(images) : null);
          }
        } else {
          const created = await Service.findOrCreateByName(
            {
              name: data.name,
              description: data.description,
              images: data.images,
            },
            connection
          );
          fields.push('systemServiceId = ?');
          values.push(created.id);
          newSystemServiceId = created.id;
        }
      }
      if (data.defaultProducts !== undefined) {
        const dp = Array.isArray(data.defaultProducts) ? data.defaultProducts : [];
        fields.push('defaultProducts = ?');
        values.push(dp.length > 0 ? JSON.stringify(dp) : null);
      }

      if (fields.length > 0) {
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(this.id);
        const query = `UPDATE company_services SET ${fields.join(', ')} WHERE id = ?`;
        await connection.execute(query, values);
      }

      let tagUpdateResult = null;
      if (data.tagIds !== undefined) {
        const [currentRows] = await connection.execute('SELECT systemServiceId FROM company_services WHERE id = ? LIMIT 1', [this.id]);
        const systemServiceIdForTags = newSystemServiceId || currentRows[0]?.systemServiceId || this.systemServiceId;
        if (systemServiceIdForTags) {
          tagUpdateResult = await Service.setTags(systemServiceIdForTags, data.tagIds, connection);
        }
      }

      await connection.commit();

      if (tagUpdateResult) {
        CompanyService.updateTagUsageCounts(tagUpdateResult.oldTagIds, tagUpdateResult.newTagIds).catch((err) => {
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
      const [result] = await pool.execute('DELETE FROM company_services WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  static async getTags(serviceId) {
    try {
      const [rows] = await pool.execute('SELECT systemServiceId FROM company_services WHERE id = ? LIMIT 1', [serviceId]);
      if (rows.length === 0 || !rows[0].systemServiceId) return [];
      return await Service.getTags(rows[0].systemServiceId);
    } catch (error) {
      throw new Error(`Error getting service tags: ${error.message}`);
    }
  }

  static async setTags(serviceId, tagIds, connection = null) {
    try {
      const exec = connection ? (sql, p) => connection.execute(sql, p) : (sql, p) => pool.execute(sql, p);
      const [rows] = await exec('SELECT systemServiceId FROM company_services WHERE id = ? LIMIT 1', [serviceId]);
      if (rows.length === 0 || !rows[0].systemServiceId) {
        return { oldTagIds: [], newTagIds: [] };
      }
      return await Service.setTags(rows[0].systemServiceId, tagIds, connection);
    } catch (error) {
      throw new Error(`Error setting service tags: ${error.message}`);
    }
  }

  static async updateTagUsageCounts(oldTagIds, newTagIds) {
    const Tag = require('./Tag');

    try {
      for (const oldTagId of oldTagIds) {
        if (!newTagIds || !newTagIds.includes(oldTagId)) {
          await Tag.decrementUsageCount(oldTagId);
        }
      }

      if (newTagIds && newTagIds.length > 0) {
        for (const tagId of newTagIds) {
          if (!oldTagIds.includes(tagId)) {
            await Tag.incrementUsageCount(tagId);
          }
        }
      }
    } catch (usageError) {
      console.error(
        `[CompanyService.updateTagUsageCounts] Error updating tag usage counts (non-critical):`,
        usageError.message
      );
    }
  }
}

module.exports = CompanyService;
