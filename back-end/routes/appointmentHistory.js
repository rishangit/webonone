const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { authenticateToken, requireRole, requirePermission, requireSameCompany } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');

// Get all sales (with pagination and filters)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userId, companyId, serviceId, staffId, dateFrom, dateTo } = req.query;
    
    // If user is not super admin, filter by their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.query.companyId = req.user.companyId;
    }
    
    const options = { page, limit, userId, companyId, serviceId, staffId, dateFrom, dateTo };
    const sales = await Sale.findAll(options);
    
    // Optionally enrich with product/service details
    const enrich = req.query.enrich === 'true';
    const enrichedSales = enrich 
      ? await Promise.all(sales.map(sale => Sale.enrichWithDetails(sale)))
      : sales;
    
    res.json({
      success: true,
      data: enrichedSales.map(s => s.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sales.length
      }
    });
  })
);

// Get sale by appointmentId (MUST be before /:id route)
router.get('/appointment/:appointmentId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log('[Sale Route] Fetching sale for appointmentId:', req.params.appointmentId);
    const sale = await Sale.findByAppointmentId(req.params.appointmentId);
    
    if (!sale) {
      console.log('[Sale Route] No sale found for appointmentId:', req.params.appointmentId);
      // Return null instead of throwing error - frontend will handle fallback
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
        data: null
      });
    }
    
    console.log('[Sale Route] Sale found:', sale.id);
    
    // Check if user has access
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && sale.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Always enrich with details for appointment history lookup
    const enrichedSale = await Sale.enrichWithDetails(sale);
    
    res.json({
      success: true,
      data: enrichedSale.toJSON()
    });
  })
);

// Get sales by user ID
router.get('/user/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, companyId, dateFrom, dateTo } = req.query;
    const userId = req.params.userId;
    
    // If user is not super admin, filter by their company
    const filterCompanyId = req.user.roleLevel > 0 && req.user.companyId 
      ? req.user.companyId 
      : companyId;
    
    const options = { page, limit, userId, companyId: filterCompanyId, dateFrom, dateTo };
    const sales = await Sale.findByUserId(userId, options);
    
    // Optionally enrich with product/service details
    const enrich = req.query.enrich === 'true';
    const enrichedSales = enrich 
      ? await Promise.all(sales.map(sale => Sale.enrichWithDetails(sale)))
      : sales;
    
    res.json({
      success: true,
      data: enrichedSales.map(s => s.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sales.length
      }
    });
  })
);

// Get sale by ID (MUST be after specific routes)
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      throw notFoundError('Sale');
    }
    
    // Check if user has access
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && sale.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Optionally enrich with product/service details
    const enrich = req.query.enrich === 'true';
    const enrichedSale = enrich ? await Sale.enrichWithDetails(sale) : sale;
    
    res.json({
      success: true,
      data: enrichedSale.toJSON()
    });
  })
);

// Get users who have appointments with a company
router.get('/company/:companyId/users',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    
    // Check if user has access - must be super admin or same company
    if (req.user.roleLevel > 0) {
      if (!req.user.companyId || req.user.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - different company'
        });
      }
    }
    
    try {
      const users = await Sale.getUsersWithAppointments(companyId);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users with appointments:', error);
      throw error;
    }
  })
);

module.exports = router;

