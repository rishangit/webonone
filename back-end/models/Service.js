const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const { EntityType } = require('../constants/entityType');

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
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  return [];
}

function normalizeServiceName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.images = parseImages(data.images);
    this.isActive = data.isActive === undefined ? true : Boolean(data.isActive);
    this.isVerified = data.isVerified === undefined ? true : Boolean(data.isVerified);
    this.usageCount = Number(data.usageCount || 0);
    this.defaultDuration = data.defaultDuration == null ? null : Number(data.defaultDuration);
    this.defaultPrice = data.defaultPrice == null ? null : Number(data.defaultPrice);
    this.createdDate = data.createdDate;
    this.lastModified = data.lastModified;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      images: this.images,
      image: this.images[0] || '',
      isActive: this.isActive,
      isVerified: this.isVerified,
      usageCount: this.usageCount,
      defaultDuration: this.defaultDuration,
      defaultPrice: this.defaultPrice,
      createdDate: this.createdDate,
      lastModified: this.lastModified,
    };
  }

  static async create(serviceData) {
    try {
      const id = nanoid(10);
      const images = parseImages(serviceData.images);
      await pool.execute(
        `
        INSERT INTO services (
          id, name, description, images, isActive, isVerified, usageCount, defaultDuration, defaultPrice
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          id,
          serviceData.name,
          serviceData.description || null,
          images.length > 0 ? JSON.stringify(images) : null,
          serviceData.isActive !== undefined ? Boolean(serviceData.isActive) : true,
          serviceData.isVerified !== undefined ? Boolean(serviceData.isVerified) : true,
          Number(serviceData.usageCount || 0),
          serviceData.defaultDuration == null ? null : Number(serviceData.defaultDuration),
          serviceData.defaultPrice == null ? null : Number(serviceData.defaultPrice),
        ]
      );

      return await Service.findById(id);
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM services WHERE id = ?', [id]);
      return rows.length > 0 ? new Service(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding service: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 20, search = '', isActive } = options;
      const pageNum = Number.parseInt(String(page), 10);
      const limitNum = Number.parseInt(String(limit), 10);
      const safePage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
      const safeLimit = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20;
      const safeOffset = (safePage - 1) * safeLimit;
      const params = [];
      let query = 'SELECT * FROM services WHERE 1=1';

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(Boolean(isActive) ? 1 : 0);
      }
      if (search && search.trim()) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      query += ` ORDER BY usageCount DESC, name ASC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
      const [rows] = await pool.execute(query, params);
      return rows.map((row) => new Service(row));
    } catch (error) {
      throw new Error(`Error finding services: ${error.message}`);
    }
  }

  /** Same filters as {@link findAll} but returns total row count (no pagination). */
  static async countAll(options = {}) {
    try {
      const { search = '', isActive } = options;
      const params = [];
      let query = 'SELECT COUNT(*) AS total FROM services WHERE 1=1';

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(Boolean(isActive) ? 1 : 0);
      }
      if (search && search.trim()) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      const [rows] = await pool.execute(query, params);
      return Number(rows[0]?.total || 0);
    } catch (error) {
      throw new Error(`Error counting services: ${error.message}`);
    }
  }

  static async findOrCreateByName(payload, connection = null) {
    const exec = connection ? (sql, p) => connection.execute(sql, p) : (sql, p) => pool.execute(sql, p);
    const normalizedName = normalizeServiceName(payload.name);
    if (!normalizedName) {
      throw new Error('Service name is required to create or resolve a system service');
    }

    const [existingRows] = await exec(
      `
      SELECT * FROM services
      WHERE LOWER(TRIM(name)) = ?
      ORDER BY usageCount DESC, createdDate ASC
      LIMIT 1
    `,
      [normalizedName]
    );

    if (existingRows.length > 0) {
      return new Service(existingRows[0]);
    }

    const id = nanoid(10);
    const images = parseImages(payload.images);
    await exec(
      `
      INSERT INTO services (
        id, name, description, images, isActive, isVerified, usageCount, defaultDuration, defaultPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        String(payload.name).trim(),
        payload.description || null,
        images.length > 0 ? JSON.stringify(images) : null,
        true,
        true,
        0,
        payload.defaultDuration == null ? null : Number(payload.defaultDuration),
        payload.defaultPrice == null ? null : Number(payload.defaultPrice),
      ]
    );

    const [createdRows] = await exec('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
    return new Service(createdRows[0]);
  }

  static async update(id, updateData, connection = null) {
    const exec = connection ? (sql, p) => connection.execute(sql, p) : (sql, p) => pool.execute(sql, p);
    const fields = [];
    const values = [];

    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(String(updateData.name).trim());
    }
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      values.push(updateData.description || null);
    }
    if (updateData.images !== undefined) {
      const images = parseImages(updateData.images);
      fields.push('images = ?');
      values.push(images.length > 0 ? JSON.stringify(images) : null);
    }
    if (updateData.isActive !== undefined) {
      fields.push('isActive = ?');
      values.push(Boolean(updateData.isActive));
    }
    if (updateData.isVerified !== undefined) {
      fields.push('isVerified = ?');
      values.push(Boolean(updateData.isVerified));
    }
    if (updateData.defaultDuration !== undefined) {
      fields.push('defaultDuration = ?');
      values.push(updateData.defaultDuration == null ? null : Number(updateData.defaultDuration));
    }
    if (updateData.defaultPrice !== undefined) {
      fields.push('defaultPrice = ?');
      values.push(updateData.defaultPrice == null ? null : Number(updateData.defaultPrice));
    }

    if (fields.length === 0) {
      return await Service.findById(id);
    }

    fields.push('lastModified = CURRENT_TIMESTAMP');
    values.push(id);
    await exec(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);

    return await Service.findById(id);
  }

  static async incrementUsageCount(id, connection = null) {
    const exec = connection ? (sql, p) => connection.execute(sql, p) : (sql, p) => pool.execute(sql, p);
    await exec(
      `
      UPDATE services
      SET usageCount = COALESCE(usageCount, 0) + 1,
          lastModified = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [id]
    );
  }

  static async getTags(serviceId) {
    const { getEntityTags } = require('../utils/entityTags');
    return getEntityTags(EntityType.SERVICE, serviceId);
  }

  static async setTags(serviceId, tagIds, connection = null) {
    const { setEntityTags } = require('../utils/entityTags');
    return setEntityTags(EntityType.SERVICE, serviceId, tagIds, connection);
  }
}

module.exports = Service;

