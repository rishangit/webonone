const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class AppointmentHistory {
  constructor(data) {
    this.id = data.id;
    this.appointmentId = data.appointmentId;
    this.userId = data.userId;
    this.companyId = data.companyId;
    this.serviceId = data.serviceId;
    this.serviceName = data.serviceName;
    this.servicePrice = data.servicePrice;
    this.staffId = data.staffId;
    this.staffName = data.staffName;
    this.spaceId = data.spaceId;
    this.spaceName = data.spaceName;
    this.appointmentDate = data.appointmentDate;
    this.appointmentTime = data.appointmentTime;
    this.completionStatus = data.completionStatus;
    this.completionNotes = data.completionNotes;
    this.servicesUsed = data.servicesUsed;
    this.productsUsed = data.productsUsed;
    this.totalAmount = data.totalAmount;
    this.subtotal = data.subtotal;
    this.discountAmount = data.discountAmount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      appointmentId: this.appointmentId,
      userId: this.userId,
      companyId: this.companyId,
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      servicePrice: this.servicePrice,
      staffId: this.staffId,
      staffName: this.staffName,
      spaceId: this.spaceId,
      spaceName: this.spaceName,
      appointmentDate: this.appointmentDate,
      appointmentTime: this.appointmentTime,
      completionStatus: this.completionStatus,
      completionNotes: this.completionNotes,
      servicesUsed: this.servicesUsed,
      productsUsed: this.productsUsed,
      totalAmount: this.totalAmount,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Include joined user data if available
      userName: this.userName || null,
      userEmail: this.userEmail || null,
      userPhone: this.userPhone || null,
      userAvatar: this.userAvatar || null,
      userFirstName: this.userFirstName || null,
      userLastName: this.userLastName || null,
      companyName: this.companyName || null
    };
  }

  // Create appointment history record
  static async create(historyData) {
    try {
      const id = nanoid(10);
      const {
        appointmentId,
        userId,
        companyId,
        serviceId,
        serviceName,
        servicePrice,
        staffId,
        staffName,
        spaceId,
        spaceName,
        appointmentDate,
        appointmentTime,
        completionStatus,
        completionNotes,
        servicesUsed,
        productsUsed,
        totalAmount,
        subtotal,
        discountAmount
      } = historyData;

      // Convert arrays to JSON strings
      const servicesUsedJson = servicesUsed && Array.isArray(servicesUsed) && servicesUsed.length > 0
        ? JSON.stringify(servicesUsed)
        : null;
      const productsUsedJson = productsUsed && Array.isArray(productsUsed) && productsUsed.length > 0
        ? JSON.stringify(productsUsed)
        : null;

      const query = `
        INSERT INTO company_appointments_history (
          id, appointmentId, userId, companyId, serviceId, serviceName, servicePrice,
          staffId, staffName, spaceId, spaceName, appointmentDate, appointmentTime,
          completionStatus, completionNotes, servicesUsed, productsUsed,
          totalAmount, subtotal, discountAmount, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await pool.execute(query, [
        id,
        appointmentId,
        userId,
        companyId,
        serviceId || null,
        serviceName || null,
        servicePrice || 0,
        staffId || null,
        staffName || null,
        spaceId || null,
        spaceName || null,
        appointmentDate,
        appointmentTime,
        completionStatus || 'completed',
        completionNotes || null,
        servicesUsedJson,
        productsUsedJson,
        totalAmount || 0,
        subtotal || 0,
        discountAmount || 0
      ]);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error creating appointment history: ${error.message}`);
    }
  }

  // Find all appointment history records
  static async findAll(options = {}) {
    try {
      const {
        page = 1, limit = 10, userId, companyId, serviceId, staffId, dateFrom, dateTo
      } = options;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10) || 10));
      const offset = (pageNum - 1) * limitNum;

      let query = `SELECT
        ah.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_appointments_history ah
      LEFT JOIN users u ON ah.userId = u.id
      LEFT JOIN companies c ON ah.companyId = c.id
      WHERE 1=1`;
      const params = [];

      if (userId) {
        query += ' AND ah.userId = ?';
        params.push(userId);
      }
      if (companyId) {
        query += ' AND ah.companyId = ?';
        params.push(companyId);
      }
      if (serviceId) {
        query += ' AND ah.serviceId = ?';
        params.push(serviceId);
      }
      if (staffId) {
        query += ' AND ah.staffId = ?';
        params.push(staffId);
      }
      if (dateFrom) {
        query += ' AND ah.appointmentDate >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND ah.appointmentDate <= ?';
        params.push(dateTo);
      }

      query += ` ORDER BY ah.appointmentDate DESC, ah.appointmentTime DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [rows] = await pool.execute(query, params);
      return rows.map(row => {
        const history = new AppointmentHistory(row);
        history.userFirstName = row.userFirstName || null;
        history.userLastName = row.userLastName || null;
        history.userName = row.userFirstName && row.userLastName
          ? `${row.userFirstName} ${row.userLastName}`.trim()
          : null;
        history.userEmail = row.userEmail || null;
        history.userPhone = row.userPhone || null;
        history.userAvatar = row.userAvatar || null;
        history.companyName = row.companyName || null;
        
        // Parse JSON fields
        if (row.servicesUsed) {
          try {
            history.servicesUsed = typeof row.servicesUsed === 'string' 
              ? JSON.parse(row.servicesUsed) 
              : row.servicesUsed;
          } catch (e) {
            history.servicesUsed = [];
          }
        }
        if (row.productsUsed) {
          try {
            history.productsUsed = typeof row.productsUsed === 'string'
              ? JSON.parse(row.productsUsed)
              : row.productsUsed;
          } catch (e) {
            history.productsUsed = [];
          }
        }
        
        return history;
      });
    } catch (error) {
      throw new Error(`Error finding appointment history: ${error.message}`);
    }
  }

  // Find appointment history by ID
  static async findById(id) {
    try {
      const query = `SELECT
        ah.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_appointments_history ah
      LEFT JOIN users u ON ah.userId = u.id
      LEFT JOIN companies c ON ah.companyId = c.id
      WHERE ah.id = ?`;

      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const history = new AppointmentHistory(row);
      history.userName = row.userFirstName && row.userLastName
        ? `${row.userFirstName} ${row.userLastName}`.trim()
        : null;
      history.userEmail = row.userEmail || null;
      history.userPhone = row.userPhone || null;
      history.userAvatar = row.userAvatar || null;
      history.companyName = row.companyName || null;
      
      // Parse JSON fields
      if (row.servicesUsed) {
        try {
          history.servicesUsed = typeof row.servicesUsed === 'string'
            ? JSON.parse(row.servicesUsed)
            : row.servicesUsed;
        } catch (e) {
          history.servicesUsed = [];
        }
      }
      if (row.productsUsed) {
        try {
          history.productsUsed = typeof row.productsUsed === 'string'
            ? JSON.parse(row.productsUsed)
            : row.productsUsed;
        } catch (e) {
          history.productsUsed = [];
        }
      }
      
      return history;
    } catch (error) {
      throw new Error(`Error finding appointment history: ${error.message}`);
    }
  }

  // Get appointment history by userId
  static async findByUserId(userId, options = {}) {
    try {
      return await this.findAll({ ...options, userId });
    } catch (error) {
      throw new Error(`Error finding appointment history by user: ${error.message}`);
    }
  }

  // Get appointment history by companyId
  static async findByCompanyId(companyId, options = {}) {
    try {
      return await this.findAll({ ...options, companyId });
    } catch (error) {
      throw new Error(`Error finding appointment history by company: ${error.message}`);
    }
  }

  // Find appointment history by appointmentId
  static async findByAppointmentId(appointmentId) {
    try {
      console.log('[AppointmentHistory Model] Finding history for appointmentId:', appointmentId);
      const query = `SELECT
        ah.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_appointments_history ah
      LEFT JOIN users u ON ah.userId = u.id
      LEFT JOIN companies c ON ah.companyId = c.id
      WHERE ah.appointmentId = ?
      ORDER BY ah.createdAt DESC
      LIMIT 1`;

      const [rows] = await pool.execute(query, [appointmentId]);
      console.log('[AppointmentHistory Model] Query returned', rows.length, 'rows');
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const history = new AppointmentHistory(row);
      history.userFirstName = row.userFirstName || null;
      history.userLastName = row.userLastName || null;
      history.userName = row.userFirstName && row.userLastName
        ? `${row.userFirstName} ${row.userLastName}`.trim()
        : null;
      history.userEmail = row.userEmail || null;
      history.userPhone = row.userPhone || null;
      history.userAvatar = row.userAvatar || null;
      history.companyName = row.companyName || null;
      
      // Parse JSON fields
      if (row.servicesUsed) {
        try {
          history.servicesUsed = typeof row.servicesUsed === 'string'
            ? JSON.parse(row.servicesUsed)
            : row.servicesUsed;
        } catch (e) {
          history.servicesUsed = [];
        }
      }
      if (row.productsUsed) {
        try {
          history.productsUsed = typeof row.productsUsed === 'string'
            ? JSON.parse(row.productsUsed)
            : row.productsUsed;
        } catch (e) {
          history.productsUsed = [];
        }
      }
      
      return history;
    } catch (error) {
      throw new Error(`Error finding appointment history by appointmentId: ${error.message}`);
    }
  }

  // Get users who have appointments with a company
  static async getUsersWithAppointments(companyId) {
    try {
      console.log('[AppointmentHistory] getUsersWithAppointments called with companyId:', companyId);
      
      // First try to get users from appointment history
      const historyQuery = `
        SELECT DISTINCT
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.phone,
          u.avatar,
          COUNT(ah.id) as appointmentCount,
          MAX(ah.appointmentDate) as lastAppointmentDate
        FROM company_appointments_history ah
        INNER JOIN users u ON ah.userId = u.id
        WHERE ah.companyId = ?
        GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone, u.avatar
        ORDER BY lastAppointmentDate DESC
      `;

      console.log('[AppointmentHistory] Executing history query for companyId:', companyId);
      const [historyRows] = await pool.execute(historyQuery, [companyId]);
      console.log('[AppointmentHistory] History query returned', historyRows.length, 'users');
      
      // If we have history records, return them
      if (historyRows.length > 0) {
        return historyRows.map(row => ({
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          avatar: row.avatar,
          appointmentCount: parseInt(row.appointmentCount) || 0,
          lastAppointmentDate: row.lastAppointmentDate
        }));
      }
      
      // If no history, fall back to appointments table
      console.log('[AppointmentHistory] No history records found, checking appointments table');
      const appointmentsQuery = `
        SELECT DISTINCT
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.phone,
          u.avatar,
          COUNT(ca.id) as appointmentCount,
          MAX(ca.date) as lastAppointmentDate
        FROM company_appointments ca
        INNER JOIN users u ON ca.clientId = u.id
        WHERE ca.companyId = ?
        GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone, u.avatar
        ORDER BY lastAppointmentDate DESC
      `;
      
      const [appointmentRows] = await pool.execute(appointmentsQuery, [companyId]);
      console.log('[AppointmentHistory] Appointments query returned', appointmentRows.length, 'users');
      
      return appointmentRows.map(row => ({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        avatar: row.avatar,
        appointmentCount: parseInt(row.appointmentCount) || 0,
        lastAppointmentDate: row.lastAppointmentDate
      }));
    } catch (error) {
      console.error('[AppointmentHistory] Error in getUsersWithAppointments:', error);
      throw new Error(`Error getting users with appointments: ${error.message}`);
    }
  }
}

module.exports = AppointmentHistory;

