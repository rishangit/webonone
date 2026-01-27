const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const CompanyProductVariant = require('../models/CompanyProductVariant');
const Joi = require('joi');

const variantSchema = {
  create: Joi.object({
    companyProductId: Joi.string().length(10).required(),
    systemProductVariantId: Joi.string().length(10).required(),
    type: Joi.string().valid('sell', 'service', 'both').optional(),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    minStock: Joi.number().integer().min(0).optional(),
    maxStock: Joi.number().integer().min(0).optional()
  }),
  update: Joi.object({
    systemProductVariantId: Joi.string().length(10).optional(),
    type: Joi.string().valid('sell', 'service', 'both').optional(),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    activeStockId: Joi.string().length(10).optional().allow(null),
    minStock: Joi.number().integer().min(0).optional(),
    maxStock: Joi.number().integer().min(0).optional()
  }).min(1),
  bulk: Joi.object({
    companyProductId: Joi.string().length(10).required(),
    variants: Joi.array().items(Joi.object({
      systemProductVariantId: Joi.string().length(10).required(),
      type: Joi.string().valid('sell', 'service', 'both').optional(),
      isDefault: Joi.boolean().optional(),
      isActive: Joi.boolean().optional(),
      minStock: Joi.number().integer().min(0).optional(),
      maxStock: Joi.number().integer().min(0).optional()
    })).min(1).required()
  })
};

// Get variants by company product ID
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { companyProductId } = req.query;
      
      if (!companyProductId) {
        return res.status(400).json({
          success: false,
          message: 'companyProductId is required'
        });
      }
      
      const variants = await CompanyProductVariant.findByCompanyProductId(companyProductId);
      
      res.json({
        success: true,
        data: variants.map(v => v.toJSON()),
        count: variants.length
      });
    } catch (error) {
      console.error('Error fetching variants:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching variants',
        error: error.message
      });
    }
  })
);

// Get variant by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const variant = await CompanyProductVariant.findById(id);
      
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      
      res.json({
        success: true,
        data: variant.toJSON()
      });
    } catch (error) {
      console.error('Error fetching variant:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching variant',
        error: error.message
      });
    }
  })
);

// Create single variant
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { error, value } = variantSchema.create.validate(req.body);
      
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
      
      const variant = await CompanyProductVariant.create(value);
      
      res.status(201).json({
        success: true,
        message: 'Variant created successfully',
        data: variant.toJSON()
      });
    } catch (error) {
      console.error('Error creating variant:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating variant',
        error: error.message
      });
    }
  })
);

// Create multiple variants (bulk)
router.post('/bulk',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      console.log('Bulk variant creation request received:', {
        companyProductId: req.body.companyProductId,
        variantsCount: req.body.variants?.length || 0
      });
      
      const { error, value } = variantSchema.bulk.validate(req.body);
      
      if (error) {
        console.error('Variant validation error:', error.details);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
      
      console.log('Creating variants for product:', value.companyProductId);
      console.log('Variants to create:', value.variants);
      
      const variants = await CompanyProductVariant.createBulk(value.companyProductId, value.variants);
      
      console.log('Variants created successfully:', variants.length);
      
      res.status(201).json({
        success: true,
        message: `${variants.length} variant(s) created successfully`,
        data: variants.map(v => v.toJSON())
      });
    } catch (error) {
      console.error('Error creating variants:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating variants',
        error: error.message
      });
    }
  })
);

// Update variant
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = variantSchema.update.validate(req.body);
      
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
      
      const variant = await CompanyProductVariant.update(id, value);
      
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Variant updated successfully',
        data: variant.toJSON()
      });
    } catch (error) {
      console.error('Error updating variant:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating variant',
        error: error.message
      });
    }
  })
);

// Delete variant
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await CompanyProductVariant.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Variant deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting variant:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting variant',
        error: error.message
      });
    }
  })
);

module.exports = router;

