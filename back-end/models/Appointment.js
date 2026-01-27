const { pool } = require('../config/database');
const { nanoid } = require('nanoid');
const { AppointmentStatus } = require('../constants/appointmentStatus');

class Appointment {
  constructor(data) {
    this.id = data.id;
    this.clientId = data.clientId;
    // Removed duplicate data fields - use clientId to fetch from users table
    // this.clientName, this.clientEmail, this.clientPhone
    this.companyId = data.companyId;
    // Removed duplicate data field - use companyId to fetch from companies table
    // this.companyName
    this.serviceId = data.serviceId;
    // Removed duplicate data field - use serviceId to fetch from company_services table
    // this.serviceName
    this.staffId = data.staffId;
    // Use staffId to fetch staff data from company_staff table
    // this.providerName
    this.spaceId = data.spaceId;
    // Removed duplicate data field - use spaceId to fetch from spaces table
    // this.spaceName
    this.saleId = data.saleId; // Reference to sale when appointment is completed
    this.date = data.date;
    this.time = data.time;
    this.duration = data.duration;
    this.status = data.status;
    this.type = data.type;
    this.priority = data.priority;
    this.price = data.price;
    this.paymentStatus = data.paymentStatus;
    this.paymentMethod = data.paymentMethod;
    this.notes = data.notes;
    this.reminderSent = data.reminderSent;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new appointment
  static async create(appointmentData) {
    try {
      // Normalize status to use enum value
      if (appointmentData.status) {
        const { normalizeAppointmentStatus } = require('../constants/appointmentStatus');
        appointmentData.status = normalizeAppointmentStatus(appointmentData.status) || AppointmentStatus.PENDING;
      } else {
        appointmentData.status = AppointmentStatus.PENDING;
      }
      
      const {
        clientId,
        companyId, serviceId, staffId,
        spaceId, date, time, duration, status, type, priority,
        price, paymentStatus, paymentMethod, notes, reminderSent,
        preferredStaffIds
      } = appointmentData;

      const id = nanoid(10); // Generate NanoID for new appointment
      
      // Insert appointment with only IDs - removed duplicate data fields
      // Only using ID references - all related data should be fetched from referenced tables
      const query = `
        INSERT INTO company_appointments (
          id, clientId, companyId, serviceId, staffId, spaceId, 
          date, time, status, notes, preferredStaffIds, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      // Prepare preferredStaffIds as JSON
      const preferredStaffIdsJson = (preferredStaffIds && Array.isArray(preferredStaffIds) && preferredStaffIds.length > 0)
        ? JSON.stringify(preferredStaffIds)
        : null;

      const values = [
        id,
        clientId,
        companyId,
        serviceId || null,
        staffId || null,
        spaceId || null,
        date,
        time,
        status || AppointmentStatus.PENDING,
        notes || null,
        preferredStaffIdsJson
      ];

      await pool.execute(query, values);
      
      // Add user to company_users table to track company clients
      try {
        const { addOrUpdateCompanyUser } = require('../utils/companyUsers');
        await addOrUpdateCompanyUser(companyId, clientId, 'appointment', 0);
      } catch (error) {
        // Log but don't fail - company_users is a tracking table
        console.error(`[Appointment] Error adding user to company_users: ${error.message}`);
      }
      
      return id;
    } catch (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }
  }

  // Get appointment by ID
  static async findById(id) {
    try {
      const query = `SELECT 
        ca.*,
        u.firstName as clientFirstName,
        u.lastName as clientLastName,
        u.email as clientEmail,
        u.phone as clientPhone,
        u.avatar as clientAvatar,
        c.name as companyName,
        cs.name as serviceName,
        cs.duration as serviceDuration,
        cs.price as servicePrice,
        cs.imageUrl as serviceImageUrl,
        staffUser.firstName as providerFirstName,
        staffUser.lastName as providerLastName,
        staffUser.avatar as providerAvatar,
        staff.status as providerStatus,
        sp.name as spaceName,
        sp.capacity as spaceCapacity,
        sp.imageUrl as spaceImageUrl
      FROM company_appointments ca
      LEFT JOIN users u ON ca.clientId = u.id
      LEFT JOIN companies c ON ca.companyId = c.id
      LEFT JOIN company_services cs ON ca.serviceId = cs.id
      LEFT JOIN company_staff staff ON ca.staffId = staff.id
      LEFT JOIN users staffUser ON staff.userId = staffUser.id
      LEFT JOIN company_spaces sp ON ca.spaceId = sp.id
      WHERE ca.id = ?`;
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      const appointment = new Appointment(row);
      // Add related data to appointment object
      appointment.clientName = row.clientFirstName && row.clientLastName 
        ? `${row.clientFirstName} ${row.clientLastName}`.trim() 
        : null;
      appointment.clientEmail = row.clientEmail || null;
      appointment.clientPhone = row.clientPhone || null;
      appointment.clientAvatar = row.clientAvatar || null;
      appointment.companyName = row.companyName || null;
      appointment.serviceName = row.serviceName || null;
      appointment.serviceDuration = row.serviceDuration || null;
      appointment.servicePrice = row.servicePrice || null;
      appointment.serviceImageUrl = row.serviceImageUrl || null;
      appointment.providerName = row.providerFirstName && row.providerLastName
        ? `${row.providerFirstName} ${row.providerLastName}`.trim()
        : null;
      appointment.providerAvatar = row.providerAvatar || null;
      appointment.providerStatus = row.providerStatus || null;
      appointment.spaceName = row.spaceName || null;
      appointment.spaceCapacity = row.spaceCapacity || null;
      appointment.spaceImageUrl = row.spaceImageUrl || null;
      
      // Parse preferredStaffIds from JSON
      if (row.preferredStaffIds) {
        try {
          appointment.preferredStaffIds = typeof row.preferredStaffIds === 'string' 
            ? JSON.parse(row.preferredStaffIds) 
            : row.preferredStaffIds;
        } catch (error) {
          console.error('Error parsing preferredStaffIds:', error);
          appointment.preferredStaffIds = null;
        }
      } else {
        appointment.preferredStaffIds = null;
      }
      
      return appointment;
    } catch (error) {
      throw new Error(`Error finding appointment: ${error.message}`);
    }
  }

  // Get appointments with filters
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        clientId,
        companyId,
        staffId,
        status,
        date,
        dateFrom,
        dateTo,
        search
      } = options;

      // Ensure page and limit are integers and valid
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10) || 10)); // Max 1000 to prevent abuse
      const offset = (pageNum - 1) * limitNum;
      
      // Use LEFT JOIN to get related data from other tables
      let query = `SELECT 
        ca.*,
        u.firstName as clientFirstName,
        u.lastName as clientLastName,
        u.email as clientEmail,
        u.phone as clientPhone,
        u.avatar as clientAvatar,
        c.name as companyName,
        cs.name as serviceName,
        cs.duration as serviceDuration,
        cs.price as servicePrice,
        cs.imageUrl as serviceImageUrl,
        staffUser.firstName as providerFirstName,
        staffUser.lastName as providerLastName,
        staffUser.avatar as providerAvatar,
        staff.status as providerStatus,
        sp.name as spaceName,
        sp.capacity as spaceCapacity,
        sp.imageUrl as spaceImageUrl
      FROM company_appointments ca
      LEFT JOIN users u ON ca.clientId = u.id
      LEFT JOIN companies c ON ca.companyId = c.id
      LEFT JOIN company_services cs ON ca.serviceId = cs.id
      LEFT JOIN company_staff staff ON ca.staffId = staff.id
      LEFT JOIN users staffUser ON staff.userId = staffUser.id
      LEFT JOIN company_spaces sp ON ca.spaceId = sp.id
      WHERE 1=1`;
      const params = [];

      if (clientId) {
        query += ' AND ca.clientId = ?';
        params.push(clientId);
      }

      if (companyId) {
        query += ' AND ca.companyId = ?';
        params.push(companyId);
      }

      if (staffId) {
        query += ' AND ca.staffId = ?';
        params.push(staffId);
      }

      if (status) {
        // Normalize status to number if it's a string
        const { normalizeAppointmentStatus } = require('../constants/appointmentStatus');
        const normalizedStatus = normalizeAppointmentStatus(status);
        if (normalizedStatus !== null) {
          query += ' AND ca.status = ?';
          params.push(normalizedStatus);
        }
      }

      if (date) {
        // Use DATE() function to ensure consistent comparison
        // This handles cases where date might be stored as DATETIME or have time components
        query += ' AND DATE(ca.date) = DATE(?)';
        params.push(date);
      }

      if (dateFrom) {
        query += ' AND ca.date >= ?';
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ' AND ca.date <= ?';
        params.push(dateTo);
      }

      // Search filter - search in client name, email, phone, service name
      if (search && search.trim()) {
        query += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR cs.name LIKE ?)`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Count total matching appointments for pagination
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT ca.id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // LIMIT and OFFSET must be in the query string, not as placeholders
      query += ` ORDER BY ca.date DESC, ca.time DESC LIMIT ${limitNum} OFFSET ${offset}`;

      if (date) {
        console.log('[Appointment.findAll] Filtering by date:', date);
        console.log('[Appointment.findAll] Query:', query.replace(/\s+/g, ' '));
        console.log('[Appointment.findAll] Params:', JSON.stringify(params));
      }
      const [rows] = await pool.execute(query, params);
      if (date) {
        console.log('[Appointment.findAll] Rows returned for date', date, ':', rows.length);
        if (rows.length === 0 && companyId) {
          // Debug: Check what dates exist in the database for this company
          const [debugRows] = await pool.execute(
            'SELECT id, date, companyId, status FROM company_appointments WHERE companyId = ? ORDER BY date DESC LIMIT 10',
            [companyId]
          );
          if (debugRows.length > 0) {
            console.log('[Appointment.findAll] Sample dates in DB for company:', debugRows.map(r => ({ 
              id: r.id, 
              date: r.date, 
              dateStr: String(r.date),
              dateISO: r.date ? new Date(r.date).toISOString().split('T')[0] : null,
              status: r.status
            })));
            // Try to match using DATE() function in SQL
            const [matchingRows] = await pool.execute(
              'SELECT COUNT(*) as count FROM company_appointments WHERE companyId = ? AND DATE(date) = DATE(?)',
              [companyId, date]
            );
            console.log('[Appointment.findAll] SQL DATE() comparison count:', matchingRows[0].count);
          } else {
            console.log('[Appointment.findAll] No appointments found for company:', companyId);
          }
        }
      }
      
      // Map rows to include related data
      return rows.map(row => {
        // Ensure date is returned as YYYY-MM-DD string (not converted to datetime)
        // This prevents timezone issues when the date is serialized to JSON
        if (row.date) {
          // If date is a Date object, convert to YYYY-MM-DD string
          if (row.date instanceof Date) {
            const year = row.date.getFullYear();
            const month = String(row.date.getMonth() + 1).padStart(2, '0');
            const day = String(row.date.getDate()).padStart(2, '0');
            row.date = `${year}-${month}-${day}`;
          }
          // If it's already a string but has time component, extract just the date part
          else if (typeof row.date === 'string' && row.date.includes('T')) {
            row.date = row.date.split('T')[0];
          }
          // If it's a string with space (date time), extract just the date part
          else if (typeof row.date === 'string' && row.date.includes(' ')) {
            row.date = row.date.split(' ')[0];
          }
        }
        
        const appointment = new Appointment(row);
        // Add related data to appointment object
        appointment.clientName = row.clientFirstName && row.clientLastName 
          ? `${row.clientFirstName} ${row.clientLastName}`.trim() 
          : null;
        appointment.clientEmail = row.clientEmail || null;
        appointment.clientPhone = row.clientPhone || null;
        appointment.clientAvatar = row.clientAvatar || null;
        appointment.companyName = row.companyName || null;
        appointment.serviceName = row.serviceName || null;
        appointment.serviceDuration = row.serviceDuration || null;
        appointment.servicePrice = row.servicePrice || null;
        appointment.serviceImageUrl = row.serviceImageUrl || null;
        appointment.providerName = row.providerFirstName && row.providerLastName
          ? `${row.providerFirstName} ${row.providerLastName}`.trim()
          : null;
        appointment.providerAvatar = row.providerAvatar || null;
        appointment.providerStatus = row.providerStatus || null;
        appointment.spaceName = row.spaceName || null;
        appointment.spaceCapacity = row.spaceCapacity || null;
        appointment.spaceImageUrl = row.spaceImageUrl || null;
        
        // Parse preferredStaffIds from JSON
        if (row.preferredStaffIds) {
          try {
            appointment.preferredStaffIds = typeof row.preferredStaffIds === 'string' 
              ? JSON.parse(row.preferredStaffIds) 
              : row.preferredStaffIds;
          } catch (error) {
            console.error('Error parsing preferredStaffIds:', error);
            appointment.preferredStaffIds = null;
          }
        } else {
          appointment.preferredStaffIds = null;
        }
        
        return appointment;
      });

      // Return appointments with pagination metadata
      return {
        appointments,
        pagination: {
          total,
          limit: limitNum,
          offset: offset,
          totalPages: Math.ceil(total / limitNum) || 1,
          currentPage: pageNum,
        }
      };
    } catch (error) {
      throw new Error(`Error finding appointments: ${error.message}`);
    }
  }

  // Update appointment
  async update(updateData) {
    try {
      // Normalize status to use enum value if provided
      if (updateData.status) {
        const { normalizeAppointmentStatus, AppointmentStatusValues } = require('../constants/appointmentStatus');
        const normalizedStatus = normalizeAppointmentStatus(updateData.status);
        if (normalizedStatus && AppointmentStatusValues.includes(normalizedStatus)) {
          updateData.status = normalizedStatus;
        } else {
          throw new Error(`Invalid status: ${updateData.status}`);
        }
      }
      
      // Handle preferredStaffIds - convert to JSON if it's an array
      if (updateData.preferredStaffIds !== undefined) {
        updateData.preferredStaffIds = (updateData.preferredStaffIds && Array.isArray(updateData.preferredStaffIds) && updateData.preferredStaffIds.length > 0)
          ? JSON.stringify(updateData.preferredStaffIds)
          : null;
      }
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) return;

      fields.push('updatedAt = NOW()');
      values.push(this.id);

      const query = `UPDATE company_appointments SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);

      // Update local instance - parse preferredStaffIds back to array
      const updateDataCopy = { ...updateData };
      if (updateDataCopy.preferredStaffIds && typeof updateDataCopy.preferredStaffIds === 'string') {
        try {
          updateDataCopy.preferredStaffIds = JSON.parse(updateDataCopy.preferredStaffIds);
        } catch (error) {
          console.error('Error parsing preferredStaffIds in update:', error);
        }
      }
      Object.assign(this, updateDataCopy);
    } catch (error) {
      throw new Error(`Error updating appointment: ${error.message}`);
    }
  }

  // Delete appointment
  static async delete(id) {
    try {
      const query = 'DELETE FROM company_appointments WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }

  // Get appointment statistics
  static async getStats(companyId = null) {
    try {
      let whereClause = '';
      const params = [];

      if (companyId) {
        whereClause = 'WHERE companyId = ?';
        params.push(companyId);
      }

      const queries = [
        `SELECT COUNT(*) as totalAppointments FROM company_appointments ${whereClause}`,
        `SELECT COUNT(*) as confirmedAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.CONFIRMED}`,
        `SELECT COUNT(*) as pendingAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.PENDING}`,
        `SELECT COUNT(*) as cancelledAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.CANCELLED}`,
        `SELECT COUNT(*) as completedAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.COMPLETED}`,
        `SELECT COUNT(*) as inProgressAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.IN_PROGRESS}`,
        `SELECT COUNT(*) as noShowAppointments FROM company_appointments ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = ${AppointmentStatus.NO_SHOW}`
      ];

      const [totalAppointments] = await pool.execute(queries[0], params);
      const [confirmedAppointments] = await pool.execute(queries[1], params);
      const [pendingAppointments] = await pool.execute(queries[2], params);
      const [cancelledAppointments] = await pool.execute(queries[3], params);
      const [completedAppointments] = await pool.execute(queries[4], params);
      const [inProgressAppointments] = await pool.execute(queries[5], params);
      const [noShowAppointments] = await pool.execute(queries[6], params);

      return {
        totalAppointments: totalAppointments[0].totalAppointments,
        confirmedAppointments: confirmedAppointments[0].confirmedAppointments,
        pendingAppointments: pendingAppointments[0].pendingAppointments,
        cancelledAppointments: cancelledAppointments[0].cancelledAppointments,
        completedAppointments: completedAppointments[0].completedAppointments,
        inProgressAppointments: inProgressAppointments[0].inProgressAppointments,
        noShowAppointments: noShowAppointments[0].noShowAppointments
      };
    } catch (error) {
      throw new Error(`Error getting appointment statistics: ${error.message}`);
    }
  }

  // Get appointments by date range
  static async getByDateRange(startDate, endDate, companyId = null) {
    try {
      let query = `SELECT 
        ca.*,
        u.firstName as clientFirstName,
        u.lastName as clientLastName,
        u.email as clientEmail,
        u.phone as clientPhone,
        u.avatar as clientAvatar,
        c.name as companyName,
        cs.name as serviceName,
        cs.duration as serviceDuration,
        cs.price as servicePrice,
        cs.imageUrl as serviceImageUrl,
        staffUser.firstName as providerFirstName,
        staffUser.lastName as providerLastName,
        staffUser.avatar as providerAvatar,
        staff.status as providerStatus,
        sp.name as spaceName,
        sp.capacity as spaceCapacity,
        sp.imageUrl as spaceImageUrl
      FROM company_appointments ca
      LEFT JOIN users u ON ca.clientId = u.id
      LEFT JOIN companies c ON ca.companyId = c.id
      LEFT JOIN company_services cs ON ca.serviceId = cs.id
      LEFT JOIN company_staff staff ON ca.staffId = staff.id
      LEFT JOIN users staffUser ON staff.userId = staffUser.id
      LEFT JOIN company_spaces sp ON ca.spaceId = sp.id
      WHERE ca.date BETWEEN ? AND ?`;
      const params = [startDate, endDate];

      if (companyId) {
        query += ' AND ca.companyId = ?';
        params.push(companyId);
      }

      query += ' ORDER BY ca.date, ca.time';

      const [rows] = await pool.execute(query, params);
      
      // Map rows to include related data
      return rows.map(row => {
        const appointment = new Appointment(row);
        appointment.clientName = row.clientFirstName && row.clientLastName 
          ? `${row.clientFirstName} ${row.clientLastName}`.trim() 
          : null;
        appointment.clientEmail = row.clientEmail || null;
        appointment.clientPhone = row.clientPhone || null;
        appointment.clientAvatar = row.clientAvatar || null;
        appointment.companyName = row.companyName || null;
        appointment.serviceName = row.serviceName || null;
        appointment.serviceDuration = row.serviceDuration || null;
        appointment.servicePrice = row.servicePrice || null;
        appointment.serviceImageUrl = row.serviceImageUrl || null;
        appointment.providerName = row.providerFirstName && row.providerLastName
          ? `${row.providerFirstName} ${row.providerLastName}`.trim()
          : null;
        appointment.providerAvatar = row.providerAvatar || null;
        appointment.providerStatus = row.providerStatus || null;
        appointment.spaceName = row.spaceName || null;
        appointment.spaceCapacity = row.spaceCapacity || null;
        appointment.spaceImageUrl = row.spaceImageUrl || null;
        
        // Parse preferredStaffIds from JSON
        if (row.preferredStaffIds) {
          try {
            appointment.preferredStaffIds = typeof row.preferredStaffIds === 'string' 
              ? JSON.parse(row.preferredStaffIds) 
              : row.preferredStaffIds;
          } catch (error) {
            console.error('Error parsing preferredStaffIds:', error);
            appointment.preferredStaffIds = null;
          }
        } else {
          appointment.preferredStaffIds = null;
        }
        
        return appointment;
      });
    } catch (error) {
      throw new Error(`Error getting appointments by date range: ${error.message}`);
    }
  }

  // Get appointments for a specific user
  static async getByUserId(userId, options = {}) {
    try {
      const { status, limit = 10 } = options;
      const limitNum = parseInt(limit, 10) || 10;
      
      let query = `SELECT 
        ca.*,
        u.firstName as clientFirstName,
        u.lastName as clientLastName,
        u.email as clientEmail,
        u.phone as clientPhone,
        u.avatar as clientAvatar,
        c.name as companyName,
        cs.name as serviceName,
        cs.duration as serviceDuration,
        cs.price as servicePrice,
        cs.imageUrl as serviceImageUrl,
        staffUser.firstName as providerFirstName,
        staffUser.lastName as providerLastName,
        staffUser.avatar as providerAvatar,
        staff.status as providerStatus,
        sp.name as spaceName,
        sp.capacity as spaceCapacity,
        sp.imageUrl as spaceImageUrl
      FROM company_appointments ca
      LEFT JOIN users u ON ca.clientId = u.id
      LEFT JOIN companies c ON ca.companyId = c.id
      LEFT JOIN company_services cs ON ca.serviceId = cs.id
      LEFT JOIN company_staff staff ON ca.staffId = staff.id
      LEFT JOIN users staffUser ON staff.userId = staffUser.id
      LEFT JOIN company_spaces sp ON ca.spaceId = sp.id
      WHERE ca.clientId = ?`;
      const params = [userId];

      if (status) {
        // Normalize status to number if it's a string
        const { normalizeAppointmentStatus } = require('../constants/appointmentStatus');
        const normalizedStatus = normalizeAppointmentStatus(status);
        if (normalizedStatus !== null) {
          query += ' AND ca.status = ?';
          params.push(normalizedStatus);
        }
      }

      query += ` ORDER BY ca.date DESC, ca.time DESC LIMIT ${limitNum}`;

      const [rows] = await pool.execute(query, params);
      
      // Map rows to include related data
      return rows.map(row => {
        const appointment = new Appointment(row);
        appointment.clientName = row.clientFirstName && row.clientLastName 
          ? `${row.clientFirstName} ${row.clientLastName}`.trim() 
          : null;
        appointment.clientEmail = row.clientEmail || null;
        appointment.clientPhone = row.clientPhone || null;
        appointment.clientAvatar = row.clientAvatar || null;
        appointment.companyName = row.companyName || null;
        appointment.serviceName = row.serviceName || null;
        appointment.serviceDuration = row.serviceDuration || null;
        appointment.servicePrice = row.servicePrice || null;
        appointment.serviceImageUrl = row.serviceImageUrl || null;
        appointment.providerName = row.providerFirstName && row.providerLastName
          ? `${row.providerFirstName} ${row.providerLastName}`.trim()
          : null;
        appointment.providerAvatar = row.providerAvatar || null;
        appointment.providerStatus = row.providerStatus || null;
        appointment.spaceName = row.spaceName || null;
        appointment.spaceCapacity = row.spaceCapacity || null;
        appointment.spaceImageUrl = row.spaceImageUrl || null;
        
        // Parse preferredStaffIds from JSON
        if (row.preferredStaffIds) {
          try {
            appointment.preferredStaffIds = typeof row.preferredStaffIds === 'string' 
              ? JSON.parse(row.preferredStaffIds) 
              : row.preferredStaffIds;
          } catch (error) {
            console.error('Error parsing preferredStaffIds:', error);
            appointment.preferredStaffIds = null;
          }
        } else {
          appointment.preferredStaffIds = null;
        }
        
        return appointment;
      });
    } catch (error) {
      throw new Error(`Error getting appointments for user: ${error.message}`);
    }
  }
}

module.exports = Appointment;

