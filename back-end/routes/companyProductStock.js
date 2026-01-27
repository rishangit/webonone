const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const CompanyProductStock = require('../models/CompanyProductStock');
const CompanyProductVariant = require('../models/CompanyProductVariant');
const Joi = require('joi');

const stockSchema = {
  create: Joi.object({
    variantId: Joi.string().length(10).required(),
    quantity: Joi.number().integer().min(1).required(),
    costPrice: Joi.number().min(0).required(),
    sellPrice: Joi.number().min(0).optional().allow(null),
    purchaseDate: Joi.date().optional().allow(null),
    expiryDate: Joi.date().optional().allow(null),
    supplierId: Joi.string().optional().allow(null),
    batchNumber: Joi.string().optional().allow('', null)
  }),
  update: Joi.object({
    quantity: Joi.number().integer().min(0).optional(),
    costPrice: Joi.number().min(0).optional(),
    sellPrice: Joi.number().min(0).optional().allow(null),
    purchaseDate: Joi.date().optional().allow(null),
    expiryDate: Joi.date().optional().allow(null),
    supplierId: Joi.string().optional().allow(null),
    batchNumber: Joi.string().optional().allow('', null),
    isActive: Joi.boolean().optional()
  }).min(1)
};

// Get all stock entries for a variant
router.get('/variant/:variantId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { variantId } = req.params;
      const { activeOnly } = req.query;
      
      const stockEntries = await CompanyProductStock.findByVariantId(variantId, {
        activeOnly: activeOnly === 'true'
      });
      
      res.json({
        success: true,
        data: stockEntries
      });
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stock entries',
        error: error.message
      });
    }
  })
);

// Get total stock for a variant
router.get('/variant/:variantId/total',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { variantId } = req.params;
      const totalStock = await CompanyProductStock.getTotalStock(variantId);
      
      res.json({
        success: true,
        data: { totalStock }
      });
    } catch (error) {
      console.error('Error calculating total stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating total stock',
        error: error.message
      });
    }
  })
);

// Get stock entry by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const stockEntry = await CompanyProductStock.findById(id);
      
      if (!stockEntry) {
        return res.status(404).json({
          success: false,
          message: 'Stock entry not found'
        });
      }
      
      res.json({
        success: true,
        data: stockEntry.toJSON()
      });
    } catch (error) {
      console.error('Error fetching stock entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stock entry',
        error: error.message
      });
    }
  })
);

// Create new stock entry
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { error, value } = stockSchema.create.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        });
      }

      const stockEntry = await CompanyProductStock.create(value);
      
      // Set this stock entry as active stock for the variant if variant doesn't have one
      const variant = await CompanyProductVariant.findById(value.variantId);
      if (variant && !variant.activeStockId) {
        await CompanyProductVariant.update(value.variantId, {
          activeStockId: stockEntry.id
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Stock entry created successfully',
        data: stockEntry.toJSON()
      });
    } catch (error) {
      console.error('Error creating stock entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating stock entry',
        error: error.message
      });
    }
  })
);

// Update stock entry
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const stockEntry = await CompanyProductStock.findById(id);
      
      if (!stockEntry) {
        return res.status(404).json({
          success: false,
          message: 'Stock entry not found'
        });
      }

      const { error, value } = stockSchema.update.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        });
      }

      const updated = await stockEntry.update(value);
      
      res.json({
        success: true,
        message: 'Stock entry updated successfully',
        data: updated.toJSON()
      });
    } catch (error) {
      console.error('Error updating stock entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stock entry',
        error: error.message
      });
    }
  })
);

// Delete stock entry
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await CompanyProductStock.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Stock entry not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Stock entry deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting stock entry',
        error: error.message
      });
    }
  })
);

// Deactivate stock entry
router.put('/:id/deactivate',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const deactivated = await CompanyProductStock.deactivate(id);
      
      if (!deactivated) {
        return res.status(404).json({
          success: false,
          message: 'Stock entry not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Stock entry deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating stock entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error deactivating stock entry',
        error: error.message
      });
    }
  })
);

module.exports = router;

