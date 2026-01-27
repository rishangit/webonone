const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Currency {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.symbol = data.symbol;
    this.decimals = data.decimals !== undefined ? parseInt(data.decimals) : 2;
    this.rounding = data.rounding !== undefined ? parseFloat(data.rounding) : 0.01;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      rounding: this.rounding,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(data) {
    try {
      const id = nanoid(10);
      const query = `
        INSERT INTO currencies (id, name, symbol, decimals, rounding, isActive)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        data.name,
        data.symbol,
        data.decimals !== undefined ? parseInt(data.decimals) : 2,
        data.rounding !== undefined ? parseFloat(data.rounding) : 0.01,
        data.isActive !== undefined ? data.isActive : true
      ];

      await pool.execute(query, values);
      const currency = await Currency.findById(id);
      return currency;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error(`Currency with name "${data.name}" already exists`);
      }
      throw new Error(`Error creating currency: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM currencies WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }

      return new Currency(rows[0]);
    } catch (error) {
      throw new Error(`Error finding currency: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { isActive } = options;
      
      let query = 'SELECT * FROM currencies WHERE 1=1';
      const params = [];

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(isActive ? 1 : 0);
      }

      query += ' ORDER BY name ASC';

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Currency(row));
    } catch (error) {
      throw new Error(`Error finding currencies: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM currencies WHERE name = ?',
        [name]
      );
      
      if (rows.length === 0) {
        return null;
      }

      return new Currency(rows[0]);
    } catch (error) {
      throw new Error(`Error finding currency by name: ${error.message}`);
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
      if (data.symbol !== undefined) {
        fields.push('symbol = ?');
        values.push(data.symbol);
      }
      if (data.decimals !== undefined) {
        fields.push('decimals = ?');
        values.push(parseInt(data.decimals));
      }
      if (data.rounding !== undefined) {
        fields.push('rounding = ?');
        values.push(parseFloat(data.rounding));
      }
      if (data.isActive !== undefined) {
        fields.push('isActive = ?');
        values.push(data.isActive ? 1 : 0);
      }

      if (fields.length === 0) {
        return this;
      }

      values.push(this.id);

      const query = `UPDATE currencies SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      const updated = await Currency.findById(this.id);
      return updated;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error(`Currency with name "${data.name}" already exists`);
      }
      throw new Error(`Error updating currency: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Check if currency is being used by any companies
      const [companies] = await pool.execute(
        'SELECT COUNT(*) as count FROM companies WHERE currencyId = ?',
        [id]
      );

      if (companies[0].count > 0) {
        throw new Error('Cannot delete currency that is in use by companies');
      }

      const [result] = await pool.execute(
        'DELETE FROM currencies WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting currency: ${error.message}`);
    }
  }
}

module.exports = Currency;
