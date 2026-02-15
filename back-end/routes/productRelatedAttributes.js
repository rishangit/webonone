const express = require('express');
const router = express.Router();
const ProductRelatedAttribute = require('../models/ProductRelatedAttribute');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// Validation schemas
const productRelatedAttributeSchema = {
  create: Joi.object({
    productId: Joi.string().required().length(10),
    attributeId: Joi.string().required().length(10),
    isVariantDefining: Joi.boolean().optional().default(false),
  }),
  update: Joi.object({
    isVariantDefining: Joi.boolean().optional(),
  }).min(1)
};

// Get all product-related attributes for a specific product
router.get('/product/:productId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const attributes = await ProductRelatedAttribute.findByProductId(productId);
    
    res.json({
      success: true,
      data: attributes,
    });
  })
);

// Get variant-defining attributes for a specific product
router.get('/product/:productId/variant-defining',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const attributes = await ProductRelatedAttribute.findVariantDefiningByProductId(productId);
    
    res.json({
      success: true,
      data: attributes,
    });
  })
);

// Get product-related attribute by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const attribute = await ProductRelatedAttribute.findById(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute not found'
      });
    }
    
    res.json({
      success: true,
      data: attribute.toJSON()
    });
  })
);

// Create new product-related attribute
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { error, value } = productRelatedAttributeSchema.create.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if already exists
    const exists = await ProductRelatedAttribute.exists(value.productId, value.attributeId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'This attribute is already assigned to this product'
      });
    }

    const attribute = await ProductRelatedAttribute.create({
      productId: value.productId,
      attributeId: value.attributeId,
      isVariantDefining: value.isVariantDefining || false
    });
    
    // Get full attribute details with joined data
    const fullAttributes = await ProductRelatedAttribute.findByProductId(value.productId);
    const createdAttribute = fullAttributes.find(a => a.id === attribute.id);
    
    res.status(201).json({
      success: true,
      message: 'Product attribute added successfully',
      data: createdAttribute
    });
  })
);

// Update product-related attribute
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { error, value } = productRelatedAttributeSchema.update.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attributeId = req.params.id;
    const attribute = await ProductRelatedAttribute.findById(attributeId);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute not found'
      });
    }

    // Update the attribute
    const updatedAttribute = await ProductRelatedAttribute.update(attributeId, value);
    
    // Get full attribute details with joined data
    const fullAttributes = await ProductRelatedAttribute.findByProductId(attribute.productId);
    const updatedFullAttribute = fullAttributes.find(a => a.id === attributeId);
    
    res.json({
      success: true,
      message: 'Product attribute updated successfully',
      data: updatedFullAttribute
    });
  })
);

// Delete product-related attribute
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const attributeId = req.params.id;
    const attribute = await ProductRelatedAttribute.findById(attributeId);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Product-related attribute not found'
      });
    }

    await ProductRelatedAttribute.delete(attributeId);
    
    res.json({
      success: true,
      message: 'Product attribute removed successfully'
    });
  })
);

module.exports = router;
