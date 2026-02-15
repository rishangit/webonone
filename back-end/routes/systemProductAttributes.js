const express = require('express');
const router = express.Router();
const SystemProductAttribute = require('../models/SystemProductAttribute');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// Validation schemas
const attributeSchema = {
  create: Joi.object({
    name: Joi.string().required().max(255),
    description: Joi.string().allow('', null).optional(),
    valueDataType: Joi.string().valid('text', 'number', 'boolean', 'date', 'json').optional(),
    unitOfMeasure: Joi.string().length(10).allow(null, '').optional(),
    isActive: Joi.boolean().optional(),
  }),
  update: Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().allow('', null).optional(),
    valueDataType: Joi.string().valid('text', 'number', 'boolean', 'date', 'json').optional(),
    unitOfMeasure: Joi.string().length(10).allow(null, '').optional(),
    isActive: Joi.boolean().optional(),
  }).min(1)
};

// Get all system product attributes (with pagination, search, filters)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
    const page = parseInt(req.query.page) || 1;
    const calculatedOffset = offset || (page - 1) * limit;

    const filters = {
      limit: Math.min(limit, 100),
      offset: calculatedOffset,
      search: req.query.search || '',
      productId: req.query.productId || undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      type: req.query.type || undefined,
    };

    const result = await SystemProductAttribute.findAllPaginated(filters);
    
    res.json({
      success: true,
      data: result.attributes.map(attr => attr.toJSON()),
      pagination: result.pagination,
    });
  })
);

// Get system product attribute by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const attribute = await SystemProductAttribute.findById(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'System product attribute not found'
      });
    }
    
    res.json({
      success: true,
      data: attribute.toJSON()
    });
  })
);

// Create new system product attribute (Super Admin only)
router.post('/',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { error, value } = attributeSchema.create.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attribute = await SystemProductAttribute.create(value);
    
    res.status(201).json({
      success: true,
      message: 'System product attribute created successfully',
      data: attribute.toJSON()
    });
  })
);

// Update system product attribute (Super Admin only)
router.put('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { error, value } = attributeSchema.update.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attributeId = req.params.id;
    const attribute = await SystemProductAttribute.findById(attributeId);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'System product attribute not found'
      });
    }

    const updatedAttribute = await SystemProductAttribute.update(attributeId, value);
    
    res.json({
      success: true,
      message: 'System product attribute updated successfully',
      data: updatedAttribute.toJSON()
    });
  })
);

// Delete system product attribute (Super Admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const attributeId = req.params.id;
    const attribute = await SystemProductAttribute.findById(attributeId);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'System product attribute not found'
      });
    }

    await SystemProductAttribute.delete(attributeId);
    
    res.json({
      success: true,
      message: 'System product attribute deleted successfully'
    });
  })
);

module.exports = router;
