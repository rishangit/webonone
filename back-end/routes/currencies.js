const express = require('express');
const router = express.Router();
const Currency = require('../models/Currency');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// Currency validation schema
const currencySchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    symbol: Joi.string().min(1).max(10).required(),
    decimals: Joi.number().integer().min(0).max(10).default(2),
    rounding: Joi.number().min(0).default(0.01)
  })
};

// Get all currencies (public endpoint - optional auth)
router.get('/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    try {
      const { isActive } = req.query;
      
      const options = {};
      if (isActive !== undefined) {
        options.isActive = isActive === 'true';
      }
      
      const currencies = await Currency.findAll(options);
      
      res.json({
        success: true,
        data: currencies.map(c => c.toJSON()),
        count: currencies.length
      });
    } catch (error) {
      console.error('Error fetching currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching currencies',
        error: error.message
      });
    }
  })
);

// Get currency by ID (public endpoint - optional auth)
router.get('/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    try {
      const currency = await Currency.findById(req.params.id);
      
      if (!currency) {
        return res.status(404).json({
          success: false,
          message: 'Currency not found'
        });
      }
      
      res.json({
        success: true,
        data: currency.toJSON()
      });
    } catch (error) {
      console.error('Error fetching currency:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching currency',
        error: error.message
      });
    }
  })
);

// Create new currency
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { error, value } = currencySchema.create.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Check if currency with same name already exists
      const existing = await Currency.findByName(value.name);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Currency with name "${value.name}" already exists`
        });
      }

      const currency = await Currency.create(value);
      
      res.status(201).json({
        success: true,
        message: 'Currency created successfully',
        data: currency.toJSON()
      });
    } catch (error) {
      console.error('Error creating currency:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating currency',
        error: error.message
      });
    }
  })
);

module.exports = router;
