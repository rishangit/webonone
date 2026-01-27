const { pool } = require('../config/database');
const { nanoid } = require('nanoid');

class Sale {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.companyId = data.companyId;
    this.staffId = data.staffId;
    // serviceId and spaceId are now available from company_appointments table via saleId
    this.serviceId = data.serviceId || null; // From joined appointments table
    this.spaceId = data.spaceId || null; // From joined appointments table
    // Items are now stored in company_sales_items table, but we keep these for backward compatibility
    this.servicesUsed = data.servicesUsed || [];
    this.productsUsed = data.productsUsed || [];
    this.totalAmount = data.totalAmount;
    this.subtotal = data.subtotal;
    this.discountAmount = data.discountAmount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      appointmentId: this.appointmentId || null, // From joined appointments table
      userId: this.userId,
      companyId: this.companyId,
      serviceId: this.serviceId,
      staffId: this.staffId,
      spaceId: this.spaceId,
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

  // Create sale record
  static async create(saleData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const id = nanoid(10);
      const {
        userId,
        companyId,
        staffId,
        servicesUsed,
        productsUsed,
        totalAmount,
        subtotal,
        discountAmount
      } = saleData;

      const query = `
        INSERT INTO company_sales (
          id, userId, companyId,
          staffId,
          totalAmount, subtotal, discountAmount, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      // Ensure all values are explicitly set (not undefined)
      const values = [
        id,
        userId ?? null,
        companyId ?? null,
        staffId ?? null,
        totalAmount ?? 0,
        subtotal ?? 0,
        discountAmount ?? 0
      ];

      // Validate that required fields are not null
      if (!userId) {
        throw new Error('userId is required');
      }
      if (!companyId) {
        throw new Error('companyId is required');
      }

      // Prepare items for the new table structure
      const items = [];
      if (servicesUsed && Array.isArray(servicesUsed) && servicesUsed.length > 0) {
        items.push(...servicesUsed.map(service => ({
          itemType: 'service',
          serviceId: service.serviceId,
          productId: null,
          variantId: null,
          quantity: service.quantity || 1,
          unitPrice: parseFloat(service.unitPrice) || 0,
          discount: parseFloat(service.discount) || 0
        })));
      }
      if (productsUsed && Array.isArray(productsUsed) && productsUsed.length > 0) {
        items.push(...productsUsed.map(product => ({
          itemType: 'product',
          serviceId: null,
          // productId is not stored - get from variant when needed
          variantId: product.variantId || null,
          quantity: product.quantity || 1,
          unitPrice: parseFloat(product.unitPrice) || 0,
          discount: parseFloat(product.discount) || 0
        })));
      }

      console.log('[Sale Model] Creating sale with values:', {
        id,
        userId,
        companyId,
        totalAmount,
        itemsCount: items.length
      });

      await connection.execute(query, values);

      // Create sale items in the new table
      if (items.length > 0) {
        const SaleItem = require('./SaleItem');
        await SaleItem.createBulk(id, items, connection);
      }

      // Update stock for products sold
      if (productsUsed && Array.isArray(productsUsed) && productsUsed.length > 0) {
        await this.updateStockForProducts(productsUsed, connection);
      }

      // Add user to company_users table to track company clients
      try {
        const { addOrUpdateCompanyUser } = require('../utils/companyUsers');
        await addOrUpdateCompanyUser(companyId, userId, 'sale', totalAmount);
      } catch (error) {
        // Log but don't fail - company_users is a tracking table
        console.error(`[Sale] Error adding user to company_users: ${error.message}`);
      }

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating sale: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update stock for products sold
  static async updateStockForProducts(productsUsed, connection = null) {
    const useTransaction = connection !== null;
    const dbConnection = connection || await pool.getConnection();
    
    try {
      if (!useTransaction) {
        await dbConnection.beginTransaction();
      }

      const CompanyProductStock = require('./CompanyProductStock');

      for (const productItem of productsUsed) {
        const { variantId, quantity: quantityToDeduct } = productItem;
        
        // variantId is now required for products
        if (!variantId || !quantityToDeduct || quantityToDeduct <= 0) {
          console.warn('[Sale Model] Skipping stock update for invalid product item:', productItem);
          continue;
        }

        // Get all active stock entries for this variant, ordered by purchase date (FIFO)
        const [stockRows] = await dbConnection.execute(
          `SELECT id, quantity, isActive 
           FROM company_product_stock 
           WHERE variantId = ? AND isActive = TRUE 
           ORDER BY purchaseDate ASC, createdAt ASC`,
          [variantId]
        );

        if (stockRows.length === 0) {
          console.warn(`[Sale Model] No active stock found for variant ${variantId}, skipping stock update`);
          continue;
        }

        let remainingQuantity = quantityToDeduct;

        // Deduct from stock entries using FIFO (First In First Out)
        for (const stockEntry of stockRows) {
          if (remainingQuantity <= 0) break;

          const stockId = stockEntry.id;
          const currentQuantity = parseInt(stockEntry.quantity) || 0;
          
          if (currentQuantity <= 0) continue;

          const quantityToDeductFromEntry = Math.min(remainingQuantity, currentQuantity);
          const newQuantity = Math.max(0, currentQuantity - quantityToDeductFromEntry);

          // Update stock entry
          await dbConnection.execute(
            'UPDATE company_product_stock SET quantity = ?, updatedAt = NOW() WHERE id = ?',
            [newQuantity, stockId]
          );

          console.log(`[Sale Model] Updated stock entry ${stockId} for variant ${variantId}: ${currentQuantity} -> ${newQuantity} (deducted ${quantityToDeductFromEntry})`);

          remainingQuantity -= quantityToDeductFromEntry;
        }

        if (remainingQuantity > 0) {
          console.warn(`[Sale Model] Warning: Could not fully deduct ${quantityToDeduct} units for variant ${variantId}. Remaining: ${remainingQuantity}`);
        } else {
          console.log(`[Sale Model] Successfully deducted ${quantityToDeduct} units from variant ${variantId}`);
        }
      }

      if (!useTransaction) {
        await dbConnection.commit();
      }
    } catch (error) {
      if (!useTransaction) {
        await dbConnection.rollback();
      }
      throw new Error(`Error updating stock for products: ${error.message}`);
    } finally {
      if (!useTransaction) {
        dbConnection.release();
      }
    }
  }

  // Find all sale records
  static async findAll(options = {}) {
    try {
      const {
        page = 1, limit = 10, userId, companyId, serviceId, staffId, dateFrom, dateTo
      } = options;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10) || 10));
      const offset = (pageNum - 1) * limitNum;

      let query = `SELECT
        s.*,
        ca.id as appointmentId,
        ca.serviceId as serviceId,
        ca.spaceId as spaceId,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_sales s
      LEFT JOIN users u ON s.userId = u.id
      LEFT JOIN companies c ON s.companyId = c.id
      LEFT JOIN company_appointments ca ON ca.saleId = s.id
      WHERE 1=1`;
      const params = [];

      if (userId) {
        query += ' AND s.userId = ?';
        params.push(userId);
      }
      if (companyId) {
        query += ' AND s.companyId = ?';
        params.push(companyId);
      }
      if (serviceId) {
        query += ' AND ca.serviceId = ?';
        params.push(serviceId);
      }
      if (staffId) {
        query += ' AND s.staffId = ?';
        params.push(staffId);
      }
      if (dateFrom) {
        query += ' AND DATE(s.createdAt) >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        // Include the entire day by using DATE() function or adding time to end of day
        query += ' AND DATE(s.createdAt) <= ?';
        params.push(dateTo);
      }

      query += ` ORDER BY s.createdAt DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [rows] = await pool.execute(query, params);
      const SaleItem = require('./SaleItem');
      
      // Load items for all sales
      const salesWithItems = await Promise.all(rows.map(async (row) => {
        const sale = new Sale(row);
        sale.appointmentId = row.appointmentId || null; // From joined appointments table
        sale.serviceId = row.serviceId || null; // From joined appointments table
        sale.spaceId = row.spaceId || null; // From joined appointments table
        sale.userFirstName = row.userFirstName || null;
        sale.userLastName = row.userLastName || null;
        sale.userName = row.userFirstName && row.userLastName
          ? `${row.userFirstName} ${row.userLastName}`.trim()
          : null;
        sale.userEmail = row.userEmail || null;
        sale.userPhone = row.userPhone || null;
        sale.userAvatar = row.userAvatar || null;
        sale.companyName = row.companyName || null;
        
        // Load items from company_sales_items table
        const items = await SaleItem.findBySaleId(sale.id);
        sale.servicesUsed = items.filter(item => item.itemType === 'service').map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        }));
        sale.productsUsed = items.filter(item => item.itemType === 'product').map(item => ({
          // productId is not stored - get from variant when needed
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        }));
        
        return sale;
      }));
      
      return salesWithItems;
    } catch (error) {
      throw new Error(`Error finding sales: ${error.message}`);
    }
  }

  static async findAllPaginated(options = {}) {
    try {
      const {
        limit = 12,
        offset = 0,
        search = '',
        userId,
        companyId,
        serviceId,
        staffId,
        dateFrom,
        dateTo
      } = options || {};

      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10) || 12;
      const offsetInt = parseInt(offset, 10) || 0;

      let query = `SELECT
        s.*,
        ca.id as appointmentId,
        ca.serviceId as serviceId,
        ca.spaceId as spaceId,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_sales s
      LEFT JOIN users u ON s.userId = u.id
      LEFT JOIN companies c ON s.companyId = c.id
      LEFT JOIN company_appointments ca ON ca.saleId = s.id
      WHERE 1=1`;
      const params = [];

      if (userId) {
        query += ' AND s.userId = ?';
        params.push(userId);
      }
      if (companyId) {
        query += ' AND s.companyId = ?';
        params.push(companyId);
      }
      if (serviceId) {
        query += ' AND ca.serviceId = ?';
        params.push(serviceId);
      }
      if (staffId) {
        query += ' AND s.staffId = ?';
        params.push(staffId);
      }
      if (dateFrom) {
        query += ' AND DATE(s.createdAt) >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND DATE(s.createdAt) <= ?';
        params.push(dateTo);
      }

      // Search filter
      if (search && search.trim()) {
        query += ` AND (
          u.firstName LIKE ? OR 
          u.lastName LIKE ? OR 
          u.email LIKE ? OR 
          u.phone LIKE ? OR
          CONCAT(u.firstName, ' ', u.lastName) LIKE ? OR
          s.id LIKE ?
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Count total matching sales
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT s.id) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
      const [countRows] = await pool.execute(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated sales
      query += ' ORDER BY s.createdAt DESC';
      query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);
      
      // If no rows, return empty array with pagination info
      if (!rows || rows.length === 0) {
        return {
          sales: [],
          pagination: {
            total: 0,
            limit: limitInt,
            offset: offsetInt,
            totalPages: 0,
            currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
          },
        };
      }

      const SaleItem = require('./SaleItem');
      
      // Load items for all sales
      const salesWithItems = await Promise.all(rows.map(async (row) => {
        const sale = new Sale(row);
        sale.appointmentId = row.appointmentId || null;
        sale.serviceId = row.serviceId || null;
        sale.spaceId = row.spaceId || null;
        sale.userFirstName = row.userFirstName || null;
        sale.userLastName = row.userLastName || null;
        sale.userName = row.userFirstName && row.userLastName
          ? `${row.userFirstName} ${row.userLastName}`.trim()
          : null;
        sale.userEmail = row.userEmail || null;
        sale.userPhone = row.userPhone || null;
        sale.userAvatar = row.userAvatar || null;
        sale.companyName = row.companyName || null;
        
        // Load items from company_sales_items table
        const items = await SaleItem.findBySaleId(sale.id);
        sale.servicesUsed = items.filter(item => item.itemType === 'service').map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        }));
        sale.productsUsed = items.filter(item => item.itemType === 'product').map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        }));
        
        return sale;
      }));
      
      return {
        sales: salesWithItems,
        pagination: {
          total,
          limit: limitInt,
          offset: offsetInt,
          totalPages: Math.ceil(total / limitInt) || 1,
          currentPage: Math.floor(offsetInt / limitInt) + 1 || 1,
        },
      };
    } catch (error) {
      throw new Error(`Error finding paginated sales: ${error.message}`);
    }
  }

  // Find sale by ID
  static async findById(id) {
    try {
      const query = `SELECT
        s.*,
        ca.id as appointmentId,
        ca.serviceId as serviceId,
        ca.spaceId as spaceId,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        c.name as companyName
      FROM company_sales s
      LEFT JOIN users u ON s.userId = u.id
      LEFT JOIN companies c ON s.companyId = c.id
      LEFT JOIN company_appointments ca ON ca.saleId = s.id
      WHERE s.id = ?`;

      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const sale = new Sale(row);
      sale.appointmentId = row.appointmentId || null; // From joined appointments table
      sale.serviceId = row.serviceId || null; // From joined appointments table
      sale.spaceId = row.spaceId || null; // From joined appointments table
      sale.userName = row.userFirstName && row.userLastName
        ? `${row.userFirstName} ${row.userLastName}`.trim()
        : null;
      sale.userEmail = row.userEmail || null;
      sale.userPhone = row.userPhone || null;
      sale.userAvatar = row.userAvatar || null;
      sale.companyName = row.companyName || null;
      
      // Load items from company_sales_items table
      const SaleItem = require('./SaleItem');
      const items = await SaleItem.findBySaleId(sale.id);
      sale.servicesUsed = items.filter(item => item.itemType === 'service').map(item => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount
      }));
        sale.productsUsed = items.filter(item => item.itemType === 'product').map(item => ({
          // productId is not stored - get from variant when needed
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        }));
      
      return sale;
    } catch (error) {
      throw new Error(`Error finding sale: ${error.message}`);
    }
  }

  // Get sales by userId
  static async findByUserId(userId, options = {}) {
    try {
      return await this.findAll({ ...options, userId });
    } catch (error) {
      throw new Error(`Error finding sales by user: ${error.message}`);
    }
  }

  // Get sales by companyId
  static async findByCompanyId(companyId, options = {}) {
    try {
      return await this.findAll({ ...options, companyId });
    } catch (error) {
      throw new Error(`Error finding sales by company: ${error.message}`);
    }
  }

  // Find sale by appointmentId (using new relationship: appointment has saleId)
  static async findByAppointmentId(appointmentId) {
    try {
      console.log('[Sale Model] Finding sale for appointmentId:', appointmentId);
      
      // First, get the appointment to find its saleId
      const [appointments] = await pool.execute(
        'SELECT saleId FROM company_appointments WHERE id = ?',
        [appointmentId]
      );
      
      if (appointments.length === 0 || !appointments[0].saleId) {
        console.log('[Sale Model] No sale found for appointment:', appointmentId);
        return null;
      }

      const saleId = appointments[0].saleId;
      
      // Now get the sale
      return await this.findById(saleId);
    } catch (error) {
      throw new Error(`Error finding sale by appointmentId: ${error.message}`);
    }
  }

  // Get users who have sales with a company
  static async getUsersWithAppointments(companyId) {
    try {
      console.log('[Sale] getUsersWithAppointments called with companyId:', companyId);
      
      // First try to get users from sales table
      const salesQuery = `
        SELECT DISTINCT
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.phone,
          u.avatar,
          COUNT(s.id) as appointmentCount,
          MAX(s.createdAt) as lastAppointmentDate
        FROM company_sales s
        INNER JOIN users u ON s.userId = u.id
        WHERE s.companyId = ?
        GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone, u.avatar
        ORDER BY lastAppointmentDate DESC
      `;

      console.log('[Sale] Executing sales query for companyId:', companyId);
      const [salesRows] = await pool.execute(salesQuery, [companyId]);
      console.log('[Sale] Sales query returned', salesRows.length, 'users');
      
      // If we have sales records, return them
      if (salesRows.length > 0) {
        return salesRows.map(row => ({
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
      
      // If no sales, fall back to appointments table
      console.log('[Sale] No sales records found, checking appointments table');
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
      console.log('[Sale] Appointments query returned', appointmentRows.length, 'users');
      
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
      console.error('[Sale] Error in getUsersWithAppointments:', error);
      throw new Error(`Error getting users with appointments: ${error.message}`);
    }
  }

  // Enrich sale data with product/service details
  static async enrichWithDetails(sale) {
    try {
      const CompanyService = require('./CompanyService');
      const CompanyProduct = require('./CompanyProduct');
      const CompanyProductVariant = require('./CompanyProductVariant');

      // Enrich services
      if (sale.servicesUsed && Array.isArray(sale.servicesUsed)) {
        const enrichedServices = await Promise.all(
          sale.servicesUsed.map(async (serviceItem) => {
            if (serviceItem.serviceId) {
              try {
                const service = await CompanyService.findById(serviceItem.serviceId);
                return {
                  ...serviceItem,
                  name: service?.name || 'Service',
                  description: service?.description || null
                };
              } catch (error) {
                console.error(`[Sale] Error enriching service ${serviceItem.serviceId}:`, error.message);
                return {
                  ...serviceItem,
                  name: 'Service',
                  description: null
                };
              }
            }
            return serviceItem;
          })
        );
        sale.servicesUsed = enrichedServices;
      }

      // Enrich products
      if (sale.productsUsed && Array.isArray(sale.productsUsed)) {
        const enrichedProducts = await Promise.all(
          sale.productsUsed.map(async (productItem) => {
            // Get productId from variant (variantId is required for products)
            if (productItem.variantId) {
              try {
                // First get variant to get productId
                const variant = await CompanyProductVariant.findById(productItem.variantId);
                
                if (!variant || !variant.companyProductId) {
                  console.warn(`[Sale] Variant ${productItem.variantId} not found or has no companyProductId`);
                  return {
                    ...productItem,
                    name: 'Product',
                    description: null
                  };
                }
                
                // Get product using companyProductId from variant
                const product = await CompanyProduct.findById(variant.companyProductId);

                const productName = variant 
                  ? `${product?.name || 'Product'} - ${variant.name}`
                  : product?.name || 'Product';
                
                const description = variant
                  ? `${product?.description || ''} (${Object.entries(variant.attributes || {}).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ')})`
                  : product?.description || null;

                return {
                  ...productItem,
                  productId: variant.companyProductId, // Add productId for backward compatibility
                  name: productName,
                  description: description,
                  unit: variant?.stockUnit || product?.unit || null
                };
              } catch (error) {
                console.error(`[Sale] Error enriching product with variant ${productItem.variantId}:`, error.message);
                return {
                  ...productItem,
                  name: 'Product',
                  description: null
                };
              }
            }
            return productItem;
          })
        );
        sale.productsUsed = enrichedProducts;
      }

      return sale;
    } catch (error) {
      console.error('[Sale] Error enriching sale with details:', error.message);
      return sale; // Return original sale if enrichment fails
    }
  }

  // Delete a sale and all its items
  static async deleteById(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete all sale items first (foreign key constraint)
      const SaleItem = require('./SaleItem');
      await SaleItem.deleteBySaleId(id, connection);
      
      // Delete the sale
      const query = `DELETE FROM company_sales WHERE id = ?`;
      const [result] = await connection.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error deleting sale: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Recalculate sale totals based on items
  static async recalculateTotals(saleId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const SaleItem = require('./SaleItem');
      const items = await SaleItem.findBySaleId(saleId, connection);
      
      let subtotal = 0;
      let discountAmount = 0;
      
      items.forEach(item => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = itemSubtotal * (item.discount / 100);
        subtotal += itemSubtotal;
        discountAmount += itemDiscount;
      });
      
      const totalAmount = subtotal - discountAmount;
      
      // Update sale totals
      await connection.execute(
        `UPDATE company_sales 
         SET subtotal = ?, discountAmount = ?, totalAmount = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [subtotal, discountAmount, totalAmount, saleId]
      );
      
      await connection.commit();
      
      // Return updated sale
      return await this.findById(saleId);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error recalculating sale totals: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = Sale;
