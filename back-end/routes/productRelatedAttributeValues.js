const express = require('express');
const router = express.Router();
const ProductRelatedAttributeValue = require('../models/ProductRelatedAttributeValue');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// Validation schemas
const productRelatedAttributeValueSchema = {
  create: Joi.object({
    variantId: Joi.string().required().length(10),
    productRelatedAttributeId: Joi.string().required().length(10),
    attributeValue: Joi.string().allow('', null).optional(),
  }),
  update: Joi.object({
    attributeValue: Joi.string().allow('', null).optional(),
  }).min(1),
  upsert: Joi.object({
    variantId: Joi.string().required().length(10),
    productRelatedAttributeId: Joi.string().required().length(10),
    attributeValue: Joi.string().allow('', null).optional(),
  })
};

// Get all attribute values for a specific variant
router.get('/variant/:variantId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { variantId } = req.params;
    const values = await ProductRelatedAttributeValue.findByVariantId(variantId);
    
    res.json({
      success: true,
      data: values,
    });
  })
);

// Get attribute value by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const value = await ProductRelatedAttributeValue.findById(req.params.id);
    
    if (!value) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute value not found'
      });
    }
    
    res.json({
      success: true,
      data: value.toJSON()
    });
  })
);

// Create new attribute value
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { error, value } = productRelatedAttributeValueSchema.create.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attributeValue = await ProductRelatedAttributeValue.create(value);
    
    // Get full details with joined data
    const fullValues = await ProductRelatedAttributeValue.findByVariantId(value.variantId);
    const createdValue = fullValues.find(v => v.id === attributeValue.id);
    
    res.status(201).json({
      success: true,
      message: 'Attribute value created successfully',
      data: createdValue
    });
  })
);

// Upsert attribute value (create or update)
router.post('/upsert',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { error, value } = productRelatedAttributeValueSchema.upsert.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attributeValue = await ProductRelatedAttributeValue.upsert(value);
    
    // Get full details with joined data
    const fullValues = await ProductRelatedAttributeValue.findByVariantId(value.variantId);
    const updatedValue = fullValues.find(v => v.id === attributeValue.id);
    
    res.status(200).json({
      success: true,
      message: 'Attribute value saved successfully',
      data: updatedValue
    });
  })
);

// Bulk upsert attribute values for a variant
router.post('/variant/:variantId/bulk',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { variantId } = req.params;
    const { values } = req.body;

    if (!Array.isArray(values)) {
      return res.status(400).json({
        success: false,
        message: 'Values must be an array'
      });
    }

    const results = [];
    for (const valueData of values) {
      const { error, value } = productRelatedAttributeValueSchema.upsert.validate({
        variantId,
        ...valueData
      });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const attributeValue = await ProductRelatedAttributeValue.upsert(value);
      results.push(attributeValue);
    }

    // Get full details with joined data
    const fullValues = await ProductRelatedAttributeValue.findByVariantId(variantId);
    
    res.status(200).json({
      success: true,
      message: 'Attribute values saved successfully',
      data: fullValues
    });
  })
);

// Update attribute value
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { error, value } = productRelatedAttributeValueSchema.update.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attributeValueId = req.params.id;
    const attributeValue = await ProductRelatedAttributeValue.findById(attributeValueId);
    
    if (!attributeValue) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute value not found'
      });
    }

    const updatedValue = await ProductRelatedAttributeValue.update(attributeValueId, value);
    
    // Get full details with joined data
    const fullValues = await ProductRelatedAttributeValue.findByVariantId(attributeValue.variantId);
    const updatedFullValue = fullValues.find(v => v.id === updatedValue.id);
    
    res.json({
      success: true,
      message: 'Attribute value updated successfully',
      data: updatedFullValue
    });
  })
);

// Delete attribute value
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const attributeValueId = req.params.id;
    const attributeValue = await ProductRelatedAttributeValue.findById(attributeValueId);
    
    if (!attributeValue) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute value not found'
      });
    }

    await ProductRelatedAttributeValue.delete(attributeValueId);
    
    res.json({
      success: true,
      message: 'Attribute value deleted successfully'
    });
  })
);

module.exports = router;
