const express = require('express');
const router = express.Router();
const UnitsOfMeasure = require('../models/UnitsOfMeasure');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// Validation schemas
const unitSchema = {
  create: Joi.object({
    unitName: Joi.string().required().max(255),
    symbol: Joi.string().required().max(50),
    baseUnit: Joi.string().length(10).allow(null, '').optional(),
    multiplier: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
  }),
  update: Joi.object({
    unitName: Joi.string().max(255).optional(),
    symbol: Joi.string().max(50).optional(),
    baseUnit: Joi.string().length(10).allow(null, '').optional(),
    multiplier: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1)
};

// Get all units of measure (with pagination, search, filters)
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
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    const result = await UnitsOfMeasure.findAllPaginated(filters);
    
    res.json({
      success: true,
      data: result.units.map(unit => unit.toJSON()),
      pagination: result.pagination,
    });
  })
);

// Get all active units of measure (for dropdowns)
router.get('/active',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const units = await UnitsOfMeasure.findAllActive();
    
    res.json({
      success: true,
      data: units.map(unit => unit.toJSON())
    });
  })
);

// Get unit of measure by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const unit = await UnitsOfMeasure.findById(req.params.id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }
    
    res.json({
      success: true,
      data: unit.toJSON()
    });
  })
);

// Create new unit of measure (Super Admin only)
router.post('/',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { error, value } = unitSchema.create.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const unit = await UnitsOfMeasure.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Unit of measure created successfully',
      data: unit.toJSON()
    });
  })
);

// Update unit of measure (Super Admin only)
router.put('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { error, value } = unitSchema.update.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const unitId = req.params.id;
    const unit = await UnitsOfMeasure.findById(unitId);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }

    const updatedUnit = await UnitsOfMeasure.update(unitId, value);
    
    res.json({
      success: true,
      message: 'Unit of measure updated successfully',
      data: updatedUnit.toJSON()
    });
  })
);

// Delete unit of measure (Super Admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const unitId = req.params.id;
    const unit = await UnitsOfMeasure.findById(unitId);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }

    await UnitsOfMeasure.delete(unitId);
    
    res.json({
      success: true,
      message: 'Unit of measure deleted successfully'
    });
  })
);

module.exports = router;
