const express = require('express');
const router = express.Router();
const CompanySpace = require('../models/CompanySpace');
const { pool } = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Space validation schema
const spaceSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    capacity: Joi.number().integer().min(1).required(),
    status: Joi.string().valid('Active', 'Inactive', 'Maintenance').optional(),
    description: Joi.string().optional().allow('', null),
    imageUrl: Joi.string().optional().allow('', null),
    galleryImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string().allow('', null)
    ).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    capacity: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Maintenance').optional(),
    description: Joi.string().optional().allow('', null),
    imageUrl: Joi.string().optional().allow('', null),
    galleryImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string().allow('', null)
    ).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }).min(1)
};

// Get all spaces (with pagination, search, filters)
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

    // Parse pagination parameters
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
    const page = parseInt(req.query.page) || 1;
    const calculatedOffset = offset || (page - 1) * limit;

    // Parse filters
    const options = {
      limit: Math.min(limit, 100), // Max 100 items per page
      offset: calculatedOffset,
      search: req.query.search || '',
      companyId: req.query.companyId || null,
      status: req.query.status || null,
    };
    
    const result = await CompanySpace.findAllPaginated(options);
    
    res.json({
      success: true,
      data: result.spaces || [],
      pagination: result.pagination,
    });
  })
);

// Get space by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const space = await CompanySpace.findById(req.params.id);
    
    if (!space) {
      throw notFoundError('Space');
    }
    
    // Check if user has access to this space
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && space.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    res.json({
      success: true,
      data: space
    });
  })
);

// Create new space
router.post('/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = spaceSchema.create.validate(req.body);
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
        throw validationError('Access denied - cannot create space for different company');
      }
    }
    
    const space = await CompanySpace.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Space created successfully',
      data: space
    });
  })
);

// Update space
router.put('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = spaceSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    // Get space to check access
    const [spaceRows] = await pool.execute(
      'SELECT * FROM company_spaces WHERE id = ?',
      [req.params.id]
    );
    
    if (spaceRows.length === 0) {
      throw notFoundError('Space');
    }
    
    // Check if user has access to this space
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && spaceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Get space instance for update
    const space = new CompanySpace(spaceRows[0]);
    const updatedSpace = await space.update(value);
    
    res.json({
      success: true,
      message: 'Space updated successfully',
      data: updatedSpace
    });
  })
);

// Delete space
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Get space to check access
    const [spaceRows] = await pool.execute(
      'SELECT companyId FROM company_spaces WHERE id = ?',
      [req.params.id]
    );
    
    if (spaceRows.length === 0) {
      throw notFoundError('Space');
    }
    
    // Check if user has access to this space
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && spaceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    await CompanySpace.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Space deleted successfully'
    });
  })
);

module.exports = router;

