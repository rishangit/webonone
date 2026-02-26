const express = require('express');
const router = express.Router();
const CompanyService = require('../models/CompanyService');
const { pool } = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Service validation schema
const serviceSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().optional().allow('', null),
    duration: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().optional().allow('', null),
    subcategory: Joi.string().optional().allow('', null),
    categoryId: Joi.string().length(10).optional().allow('', null),
    subcategoryId: Joi.string().length(10).optional().allow('', null),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    providerName: Joi.string().optional().allow('', null),
    providerAvatar: Joi.string().optional().allow('', null),
    staffId: Joi.string().length(10).optional().allow('', null),
    imageUrl: Joi.string().optional().allow('', null),
    galleryImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string().allow('', null)
    ).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().optional().allow('', null),
    duration: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().optional().allow('', null),
    subcategory: Joi.string().optional().allow('', null),
    categoryId: Joi.string().length(10).optional().allow('', null),
    subcategoryId: Joi.string().length(10).optional().allow('', null),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    providerName: Joi.string().optional().allow('', null),
    providerAvatar: Joi.string().optional().allow('', null),
    staffId: Joi.string().length(10).optional().allow('', null),
    imageUrl: Joi.string().optional().allow('', null),
    galleryImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string().allow('', null)
    ).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }).min(1)
};

// Get all services
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // If user is company owner, filter by their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.query.companyId = req.user.companyId;
    }
    
    // Validate companyId if provided
    if (req.query.companyId && req.query.companyId.length !== 10) {
      throw validationError('Invalid companyId format');
    }
    
    // Check if pagination parameters are provided
    const hasPagination = req.query.limit !== undefined || req.query.offset !== undefined || req.query.page !== undefined;
    
    if (hasPagination) {
      // Use paginated method
      const limit = parseInt(req.query.limit, 10) || 12;
      const page = parseInt(req.query.page, 10) || 1;
      const offset = parseInt(req.query.offset, 10) || (page - 1) * limit;
      
      const options = {
        limit,
        offset,
        search: req.query.search || '',
        companyId: req.query.companyId,
        status: req.query.status,
        categoryId: req.query.categoryId
      };
      
      const result = await CompanyService.findAllPaginated(options);
      
      res.json({
        success: true,
        data: result.services,
        pagination: result.pagination
      });
    } else {
      // Use non-paginated method for backward compatibility
      const options = { 
        companyId: req.query.companyId, 
        status: req.query.status,
        categoryId: req.query.categoryId
      };
      const services = await CompanyService.findAll(options);
      
      res.json({
        success: true,
        data: services,
        count: services.length
      });
    }
  })
);

// Get service by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const service = await CompanyService.findById(req.params.id);
    
    if (!service) {
      throw notFoundError('Service');
    }
    
    // Check if user has access to this service
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && service.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    res.json({
      success: true,
      data: service
    });
  })
);

// Create new service
router.post('/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = serviceSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    // If user is company owner, set companyId to their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      value.companyId = req.user.companyId;
    }
    
    // Verify company exists and user has access
    if (req.user.roleLevel > 0) {
      if (value.companyId !== req.user.companyId) {
        throw validationError('Access denied - cannot create service for different company');
      }
    }
    
    const service = await CompanyService.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  })
);

// Update service
router.put('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = serviceSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    // Get service to check access
    const [serviceRows] = await pool.execute(
      'SELECT * FROM company_services WHERE id = ?',
      [req.params.id]
    );
    
    if (serviceRows.length === 0) {
      throw notFoundError('Service');
    }
    
    // Check if user has access to this service
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && serviceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Get service instance for update
    const service = new CompanyService(serviceRows[0]);
    const updatedService = await service.update(value);
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  })
);

// Delete service
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Get service to check access
    const [serviceRows] = await pool.execute(
      'SELECT companyId FROM company_services WHERE id = ?',
      [req.params.id]
    );
    
    if (serviceRows.length === 0) {
      throw notFoundError('Service');
    }
    
    // Check if user has access to this service
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && serviceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    await CompanyService.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  })
);

module.exports = router;
