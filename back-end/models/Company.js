const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Company {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.address = data.address;
    this.city = data.city || null;
    this.state = data.state || null;
    this.postalCode = data.postalCode || null;
    this.country = data.country || null;
    this.latitude = data.latitude !== undefined && data.latitude !== null ? parseFloat(data.latitude) : null;
    this.longitude = data.longitude !== undefined && data.longitude !== null ? parseFloat(data.longitude) : null;
    this.phone = data.phone;
    this.email = data.email;
    this.website = data.website;
    this.companySize = data.companySize;
    this.logo = data.logo;
    this.currencyId = data.currencyId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      latitude: this.latitude,
      longitude: this.longitude,
      phone: this.phone,
      email: this.email,
      website: this.website,
      companySize: this.companySize,
      logo: this.logo,
      currencyId: this.currencyId,
      isActive: this.isActive,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(data) {
    try {
      // Use address field if provided, otherwise keep it as null
      // Individual address components are stored separately
      const address = data.address || null;

      const id = nanoid(10); // Generate NanoID for new company
      const query = `
        INSERT INTO companies (
          id, name, description, address, city, state, postalCode, country, latitude, longitude, phone, email, website, companySize, logo, currencyId, isActive, ownerId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.name,
        data.description || null,
        address,
        data.city || null,
        data.state || null,
        data.postalCode || null,
        data.country || null,
        data.latitude !== undefined && data.latitude !== null ? parseFloat(data.latitude) : null,
        data.longitude !== undefined && data.longitude !== null ? parseFloat(data.longitude) : null,
        data.phone || null,
        data.email || null,
        data.website || null,
        (data.companySize && data.companySize.trim() !== '') ? data.companySize : null,
        data.logo || null,
        data.currencyId || null,
        data.isActive !== undefined ? data.isActive : true,
        data.ownerId || null
      ];

      await pool.execute(query, values);
      const companyId = id;
      
      const company = await Company.findById(companyId);
      return company;
    } catch (error) {
      throw new Error(`Error creating company: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM companies WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      return new Company(rows[0]);
    } catch (error) {
      throw new Error(`Error finding company: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { page, limit, isActive, ownerId } = options;
      
      let query = 'SELECT * FROM companies WHERE 1=1';
      const params = [];

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(isActive ? 1 : 0);
      }

      if (ownerId) {
        query += ' AND ownerId = ?';
        params.push(ownerId);
      }

      query += ' ORDER BY createdAt DESC';

      if (page && limit && !isNaN(page) && !isNaN(limit)) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
      }

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Company(row));
    } catch (error) {
      throw new Error(`Error finding companies: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        isActive,
        ownerId,
      } = options;

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      // Build WHERE clause
      const whereConditions = [];
      const params = [];

      // Search filter
      if (search && search.trim()) {
        whereConditions.push(`(c.name LIKE ? OR c.description LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Status filters
      if (isActive !== undefined) {
        whereConditions.push(`c.isActive = ?`);
        params.push(isActive === true || isActive === 'true' ? 1 : 0);
      }

      // Owner filter
      if (ownerId) {
        whereConditions.push(`c.ownerId = ?`);
        params.push(ownerId);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total matching companies
      const countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM companies c
        ${whereClause}
      `;
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated companies
      const dataQuery = `
        SELECT c.*
        FROM companies c
        ${whereClause}
        ORDER BY c.createdAt DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const dataParams = params;
      
      console.log('Company Data Query:', dataQuery.replace(/\s+/g, ' ').trim());
      console.log('Company Data Params count:', dataParams.length);
      console.log('Company Data Params:', dataParams);
      
      const [rows] = await pool.execute(dataQuery, dataParams);
      
      const companies = rows.map(row => new Company(row));

      return {
        companies,
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
      throw new Error(`Error finding paginated companies: ${error.message}`);
    }
  }

  async update(data) {
    try {
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
      if (data.address !== undefined) {
        fields.push('address = ?');
        values.push(data.address);
      }
      if (data.city !== undefined) {
        fields.push('city = ?');
        values.push(data.city);
      }
      if (data.state !== undefined) {
        fields.push('state = ?');
        values.push(data.state);
      }
      if (data.postalCode !== undefined) {
        fields.push('postalCode = ?');
        values.push(data.postalCode);
      }
      if (data.country !== undefined) {
        fields.push('country = ?');
        values.push(data.country);
      }
      if (data.latitude !== undefined) {
        fields.push('latitude = ?');
        values.push(data.latitude !== null ? parseFloat(data.latitude) : null);
      }
      if (data.longitude !== undefined) {
        fields.push('longitude = ?');
        values.push(data.longitude !== null ? parseFloat(data.longitude) : null);
      }
      if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email);
      }
      if (data.website !== undefined) {
        fields.push('website = ?');
        values.push(data.website);
      }
      if (data.companySize !== undefined) {
        // Convert empty string to null for ENUM column
        const companySizeValue = (data.companySize === '' || data.companySize === null) ? null : data.companySize;
        fields.push('companySize = ?');
        values.push(companySizeValue);
      }
      if (data.logo !== undefined) {
        fields.push('logo = ?');
        values.push(data.logo);
      }
      if (data.currencyId !== undefined) {
        fields.push('currencyId = ?');
        values.push(data.currencyId || null);
      }
      if (data.isActive !== undefined) {
        fields.push('isActive = ?');
        values.push(data.isActive ? 1 : 0);
      }
      if (data.ownerId !== undefined) {
        fields.push('ownerId = ?');
        values.push(data.ownerId);
      }

      if (fields.length === 0) {
        return this;
      }

      values.push(this.id);

      const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      const updated = await Company.findById(this.id);
      return updated;
    } catch (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM companies WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }
  }

  // Tag management methods
  static async getTags(companyId) {
    try {
      const { getEntityTags } = require('../utils/entityTags');
      const { EntityType } = require('../constants/entityType');
      return await getEntityTags(EntityType.COMPANY, companyId);
    } catch (error) {
      throw new Error(`Error getting company tags: ${error.message}`);
    }
  }

  static async setTags(companyId, tagIds) {
    try {
      const { setEntityTags, updateTagUsageCounts } = require('../utils/entityTags');
      const { EntityType } = require('../constants/entityType');
      
      console.log(`[Company.setTags] Starting for companyId: ${companyId}, tagIds:`, tagIds);
      
      // Set tags in unified entity_tags table
      const result = await setEntityTags(EntityType.COMPANY, companyId, tagIds);
      
      // Update usage counts asynchronously (non-blocking)
      updateTagUsageCounts(result.oldTagIds, result.newTagIds).catch(err => {
        console.error(`[Company.setTags] Background tag usage count update failed:`, err.message);
      });
      
      console.log(`[Company.setTags] Completed successfully`);
      return true;
    } catch (error) {
      console.error(`[Company.setTags] Error occurred:`, error);
      throw new Error(`Error setting company tags: ${error.message}`);
    }
  }
}

module.exports = Company;

