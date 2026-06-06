const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, validationError } = require('../middleware/errorHandler');

const resolveCompanyId = (req) => {
  let filterCompanyId = req.query.companyId;
  if (req.user.roleLevel > 0 && req.user.companyId) {
    filterCompanyId = req.user.companyId;
  }
  return filterCompanyId;
};

// Sales summary totals (revenue + transaction counts)
router.get('/summary',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const filterCompanyId = resolveCompanyId(req);
    if (!filterCompanyId) {
      throw validationError('Company ID is required');
    }

    const { userId, serviceId, staffId, dateFrom, dateTo, search, saleType } = req.query;
    const summary = await Sale.getSalesSummary({
      companyId: filterCompanyId,
      userId,
      serviceId,
      staffId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search || '',
      saleType: saleType || undefined
    });

    res.json({ success: true, data: summary });
  })
);

// Per-product sales statistics
router.get('/product-stats/:companyProductId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const filterCompanyId = resolveCompanyId(req);
    if (!filterCompanyId) {
      throw validationError('Company ID is required');
    }

    const { dateFrom, dateTo, staffId } = req.query;
    const stats = await Sale.getProductStats(req.params.companyProductId, {
      companyId: filterCompanyId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      staffId: staffId || undefined
    });

    res.json({ success: true, data: stats });
  })
);

// Get all sales for a company (following users route pattern)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page, limit, offset, search, userId, companyId, serviceId, staffId, dateFrom, dateTo, saleType } = req.query;

    const filterCompanyId = resolveCompanyId(req);

    if (!filterCompanyId) {
      throw validationError('Company ID is required');
    }
    
    // Check if pagination parameters are provided
    const hasPagination = limit !== undefined || offset !== undefined || page !== undefined;
    
    if (hasPagination) {
      // Use paginated method
      const limitNum = parseInt(limit, 10) || 12;
      const pageNum = parseInt(page, 10) || 1;
      const offsetNum = parseInt(offset, 10) || (pageNum - 1) * limitNum;
      
      const options = {
        limit: limitNum,
        offset: offsetNum,
        search: search || '',
        companyId: filterCompanyId,
        userId,
        serviceId,
        staffId,
        saleType: saleType || undefined
      };

      if (dateFrom && dateTo) {
        options.dateFrom = dateFrom;
        options.dateTo = dateTo;
      }
      
      const result = await Sale.findAllPaginated(options);
      
      // Optionally enrich with product/service details
      const enrich = req.query.enrich === 'true';
      const enrichedSales = enrich 
        ? await Promise.all(result.sales.map(sale => Sale.enrichWithDetails(sale)))
        : result.sales;
      
      res.json({
        success: true,
        data: enrichedSales.map(s => s.toJSON()),
        pagination: result.pagination
      });
    } else {
      // Use non-paginated method for backward compatibility
      const options = {};
      
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);
      if (filterCompanyId) options.companyId = filterCompanyId;
      if (userId) options.userId = userId;
      if (serviceId) options.serviceId = serviceId;
      if (staffId) options.staffId = staffId;
      // Only apply date filters if both are provided AND applyDateFilter is explicitly set to 'true'
      if (dateFrom && dateTo && req.query.applyDateFilter === 'true') {
        options.dateFrom = dateFrom;
        options.dateTo = dateTo;
      }
      
      const sales = await Sale.findAll(options);
      
      // Optionally enrich with product/service details
      const enrich = req.query.enrich === 'true';
      const enrichedSales = enrich 
        ? await Promise.all(sales.map(sale => Sale.enrichWithDetails(sale)))
        : sales;
      
      res.json({
        success: true,
        data: enrichedSales.map(s => s.toJSON()),
        count: enrichedSales.length
      });
    }
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
        message: 'Sale not found',
        data: null
      });
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

// Delete a sale (Company Owner only)
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Check if user is company owner (roleLevel === 1) or super admin (roleLevel === 0)
    if (req.user.roleLevel > 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Company Owner permission required'
      });
    }
    
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
        data: null
      });
    }
    
    // Check if user has access to this company's sales
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && sale.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    const deleted = await Sale.deleteById(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found or could not be deleted'
      });
    }
    
    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  })
);

// Delete a sale item (Company Owner only)
router.delete('/:saleId/items/:itemId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Check if user is company owner (roleLevel === 1) or super admin (roleLevel === 0)
    if (req.user.roleLevel > 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Company Owner permission required'
      });
    }
    
    const { saleId, itemId } = req.params;
    
    // Verify sale exists and user has access
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    // Check if user has access to this company's sales
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && sale.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Verify item exists and belongs to this sale
    const SaleItem = require('../models/SaleItem');
    const item = await SaleItem.findById(itemId);
    
    if (!item || item.saleId !== saleId) {
      return res.status(404).json({
        success: false,
        message: 'Sale item not found'
      });
    }
    
    // Delete the item
    const deleted = await SaleItem.deleteById(itemId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sale item could not be deleted'
      });
    }
    
    // Recalculate sale totals
    const updatedSale = await Sale.recalculateTotals(saleId);
    
    res.json({
      success: true,
      message: 'Sale item deleted successfully',
      data: updatedSale.toJSON()
    });
  })
);

module.exports = router;

