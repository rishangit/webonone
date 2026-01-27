const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const CompanyProduct = require('../models/CompanyProduct');
const Joi = require('joi');

const variantSchema = Joi.object({
  systemProductVariantId: Joi.string().length(10).required(),
  type: Joi.string().valid('sell', 'service', 'both').optional(),
  isDefault: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  // Pricing and stock information (optional - will create stock entry if provided)
  costPrice: Joi.number().min(0).optional(),
  sellPrice: Joi.number().min(0).optional().allow(null),
  currentStock: Joi.number().min(0).optional(),
  minStock: Joi.number().min(0).optional(),
  maxStock: Joi.number().min(0).optional(),
  stockUnit: Joi.string().optional()
});

const companyProductSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    systemProductId: Joi.string().length(10).required(),
    isAvailableForPurchase: Joi.boolean().optional(),
    notes: Joi.string().optional().allow('', null),
    variants: Joi.array().items(variantSchema).optional().min(1)
    // type, price, and stock are now in variants
    // tagIds removed - tags are inherited from system product
  }),
  update: Joi.object({
    systemProductId: Joi.string().length(10).optional().allow('', null),
    isAvailableForPurchase: Joi.boolean().optional(),
    notes: Joi.string().optional().allow('', null)
    // type, price, and stock are now in variants
    // tagIds removed - tags are inherited from system product
  }).min(1)
};

// Get all company products
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { companyId, systemProductId } = req.query;
      
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
          companyId,
          systemProductId
        };
        
        const result = await CompanyProduct.findAllPaginated(options);
        
        res.json({
          success: true,
          data: result.products,
          pagination: result.pagination
        });
      } else {
        // Use non-paginated method for backward compatibility
        const filters = {};
        
        if (companyId) filters.companyId = companyId;
        if (systemProductId) filters.systemProductId = systemProductId;
        
        const products = await CompanyProduct.findAll(filters);
        
        res.json({
          success: true,
          data: products,
          count: products.length
        });
      }
    } catch (error) {
      console.error('Error fetching company products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching company products',
        error: error.message
      });
    }
  })
);

// Get company product by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const product = await CompanyProduct.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Company product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching company product:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching company product',
        error: error.message
      });
    }
  })
);

// Create company product
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { error, value } = companyProductSchema.create.validate(req.body);
      
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
      
      // Extract variants if provided
      const variants = value.variants || [];
      delete value.variants; // Remove variants from product data
      
      // Create product with variants in one transaction
      const product = await CompanyProduct.create(value, variants);
      
      res.status(201).json({
        success: true,
        message: `Company product created successfully${variants.length > 0 ? ` with ${variants.length} variant(s)` : ''}`,
        data: product
      });
    } catch (error) {
      console.error('Error creating company product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating company product',
        error: error.message
      });
    }
  })
);

// Update company product
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = companyProductSchema.update.validate(req.body);
      
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
      
      const product = await CompanyProduct.update(id, value);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Company product not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Company product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating company product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating company product',
        error: error.message
      });
    }
  })
);

// Delete company product
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await CompanyProduct.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Company product not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Company product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting company product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting company product',
        error: error.message
      });
    }
  })
);

module.exports = router;

