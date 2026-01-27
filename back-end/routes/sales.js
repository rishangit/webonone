const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');
const { nanoid } = require('nanoid');
const Sale = require('../models/Sale');
const CompanyStaff = require('../models/CompanyStaff');
const { pool } = require('../config/database');

// Validation schemas
const saleSchemas = {
  create: Joi.object({
    companyId: Joi.string().required(),
    clientId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().optional().default('Cash'),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Refunded').optional().default('Paid'),
    saleDate: Joi.date().optional(),
    items: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('product', 'service').required(),
        productId: Joi.string().optional(), // productId for products
        serviceId: Joi.string().optional(), // serviceId for services
        name: Joi.string().required(),
        description: Joi.string().optional(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
        discount: Joi.number().min(0).max(100).optional().default(0),
        unit: Joi.string().optional(),
        variantId: Joi.string().optional(),
        variantName: Joi.string().optional()
      })
    ).optional().default([]),
    notes: Joi.string().allow(null).optional()
  })
};

// Get all sales for a company (following users route pattern)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page, limit, companyId: queryCompanyId, dateFrom, dateTo } = req.query;
    
    // If user is not super admin, use their companyId
    let filterCompanyId = queryCompanyId || req.user.companyId;
    if (req.user.roleLevel > 0 && req.user.companyId) {
      filterCompanyId = req.user.companyId;
    }
    
    if (!filterCompanyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Build options exactly like users route - only include defined values
    const options = {};
    
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);
    if (filterCompanyId) options.companyId = filterCompanyId;
    // Only apply date filters if both are provided
    if (dateFrom && dateTo) {
      options.dateFrom = dateFrom;
      options.dateTo = dateTo;
    }

    const sales = await Sale.findByCompanyId(filterCompanyId, options);
    
    res.json({
      success: true,
      data: sales.map(sale => sale.toJSON()),
      count: sales.length
    });
  })
);

// Get sale by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Check if sale belongs to user's company
    if (sale.companyId !== req.user.companyId && req.user.roleLevel > 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: sale.toJSON()
    });
  })
);

// Create new sale
router.post('/',
  authenticateToken,
  validate(saleSchemas.create),
  asyncHandler(async (req, res) => {
    // If user is not super admin, set companyId to their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.body.companyId = req.user.companyId;
    }

    // Transform request data to match Sale model expectations
    const { clientId, amount, items, notes, saleDate } = req.body;
    
    console.log('[Sales Route] Creating sale with data:', {
      clientId,
      amount,
      companyId: req.body.companyId,
      itemsCount: items?.length || 0
    });
    
    // Validate required fields
    if (!clientId) {
      throw new Error('clientId is required');
    }
    if (!req.body.companyId) {
      throw new Error('companyId is required');
    }
    
    // Separate items into products and services
    const productsUsed = items
      ?.filter(item => item.type === 'product' && item.variantId) // Only include items with variantId
      .map(item => ({
        // productId is not stored - get from variant when needed
        variantId: item.variantId, // variantId is required for products
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: item.discount || 0
      })) || [];
    
    const servicesUsed = items
      ?.filter(item => item.type === 'service' && item.serviceId) // Only include items with serviceId
      .map(item => ({
        serviceId: item.serviceId, // serviceId is required
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: item.discount || 0
      })) || [];

    console.log('[Sales Route] Extracted productsUsed:', productsUsed.length);
    console.log('[Sales Route] Extracted servicesUsed:', servicesUsed.length);

    // Prepare sale data for Sale.create
    // staffId should reference company_staff.id, not users.id
    // For POS sales, find or create staff record for the logged-in user
    let staffId = null;
    try {
      // First, try to find existing staff record
      let [staffRows] = await pool.execute(
        'SELECT id FROM company_staff WHERE userId = ? AND companyId = ?',
        [req.user.id, req.body.companyId]
      );
      
      if (staffRows.length > 0) {
        staffId = staffRows[0].id;
      } else {
        // If no staff record exists, create one for the logged-in user
        const newStaff = await CompanyStaff.create({
          id: nanoid(10),
          userId: req.user.id,
          companyId: req.body.companyId,
          status: 'Active'
        });
        
        staffId = newStaff.id;
        console.log('[Sales Route] Created staff record for user:', req.user.id, 'staffId:', staffId);
      }
    } catch (error) {
      console.error('[Sales Route] Error finding/creating staff record:', error);
      throw new Error(`Failed to get staff record for logged-in user: ${error.message}`);
    }

    // userId is the customer (person buying the product/service)
    const saleData = {
      userId: clientId, // Customer who is buying (from request)
      companyId: req.body.companyId,
      staffId: staffId, // Staff member making the sale (null if not a staff member)
      // serviceId and spaceId are not stored in sales table - they come from appointments
      servicesUsed: servicesUsed.length > 0 ? servicesUsed : null,
      productsUsed: productsUsed.length > 0 ? productsUsed : null,
      totalAmount: parseFloat(amount) || 0,
      subtotal: parseFloat(amount) || 0,
      discountAmount: 0 // Can be calculated from items if needed
    };

    console.log('[Sales Route] Sale data prepared:', {
      userId: saleData.userId,
      companyId: saleData.companyId,
      totalAmount: saleData.totalAmount,
      productsCount: productsUsed.length,
      servicesCount: servicesUsed.length
    });

    const sale = await Sale.create(saleData);
    
    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale.toJSON()
    });
  })
);

module.exports = router;

