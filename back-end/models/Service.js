const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.duration = data.duration;
    this.price = data.price;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.status = data.status;
    this.companyId = data.companyId;
    this.provider = data.provider ? JSON.parse(data.provider) : null;
    this.bookings = data.bookings ? JSON.parse(data.bookings) : {};
    this.tags = data.tags ? JSON.parse(data.tags) : [];
    this.image = data.image;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new service
  static async create(serviceData) {
    try {
      const {
        name, description, duration, price, category, subcategory,
        status, companyId, provider, bookings, tags, image
      } = serviceData;

      const id = nanoid(10); // Generate NanoID for new service
      const query = `
        INSERT INTO services (
          id, name, description, duration, price, category, subcategory,
          status, companyId, provider, bookings, tags, image, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        id,
        name, description, duration, price, category, subcategory,
        status, companyId,
        JSON.stringify(provider || null),
        JSON.stringify(bookings || {}),
        JSON.stringify(tags || []),
        image
      ];

      await pool.execute(query, values);
      return id;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  // Get service by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM services WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new Service(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding service: ${error.message}`);
    }
  }

  // Get all services with filters
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyId,
        category,
        subcategory,
        status,
        search
      } = options;

      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM services WHERE 1=1';
      const params = [];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (subcategory) {
        query += ' AND subcategory = ?';
        params.push(subcategory);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Service(row));
    } catch (error) {
      throw new Error(`Error finding services: ${error.message}`);
    }
  }

  // Update service
  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (key === 'provider' || key === 'bookings' || key === 'tags') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
          }
        }
      });

      if (fields.length === 0) return;

      fields.push('updatedAt = NOW()');
      values.push(this.id);

      const query = `UPDATE services SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      // Update local instance
      Object.assign(this, updateData);
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  // Delete service
  static async delete(id) {
    try {
      const query = 'DELETE FROM services WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  // Get services by company
  static async getByCompany(companyId, options = {}) {
    try {
      const { category, status = 'Active' } = options;
      let query = 'SELECT * FROM services WHERE companyId = ?';
      const params = [companyId];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY name';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Service(row));
    } catch (error) {
      throw new Error(`Error getting services by company: ${error.message}`);
    }
  }

  // Get service statistics
  static async getStats(companyId = null) {
    try {
      let whereClause = '';
      const params = [];

      if (companyId) {
        whereClause = 'WHERE companyId = ?';
        params.push(companyId);
      }

      const queries = [
        `SELECT COUNT(*) as totalServices FROM services ${whereClause}`,
        `SELECT COUNT(*) as activeServices FROM services ${whereClause} AND status = 'Active'`,
        `SELECT AVG(price) as averagePrice FROM services ${whereClause} WHERE price IS NOT NULL`,
        `SELECT SUM(JSON_EXTRACT(bookings, '$.revenue')) as totalRevenue FROM services ${whereClause}`
      ];

      const [totalServices] = await pool.execute(queries[0], params);
      const [activeServices] = await pool.execute(queries[1], params);
      const [averagePrice] = await pool.execute(queries[2], params);
      const [totalRevenue] = await pool.execute(queries[3], params);

      return {
        totalServices: totalServices[0].totalServices,
        activeServices: activeServices[0].activeServices,
        averagePrice: averagePrice[0].averagePrice || 0,
        totalRevenue: totalRevenue[0].totalRevenue || 0
      };
    } catch (error) {
      throw new Error(`Error getting service statistics: ${error.message}`);
    }
  }

  // Search services
  static async search(searchTerm, options = {}) {
    try {
      const { companyId, category, limit = 20 } = options;
      let query = `
        SELECT * FROM services 
        WHERE (name LIKE ? OR description LIKE ? OR JSON_SEARCH(tags, 'one', ?) IS NOT NULL)
      `;
      const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (companyId) {
        query += ' AND companyId = ?';
        params.push(companyId);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' AND status = "Active" ORDER BY name LIMIT ?';
      params.push(limit);

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Service(row));
    } catch (error) {
      throw new Error(`Error searching services: ${error.message}`);
    }
  }
}

module.exports = Service;

