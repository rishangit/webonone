const express = require('express');
const router = express.Router();
const ProductVariant = require('../models/ProductVariant');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all variants for a product
router.get('/product/:productId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const variants = await ProductVariant.findByProductId(req.params.productId);
    
    res.json({
      success: true,
      data: variants.map(v => v.toJSON())
    });
  })
);

// Get variant by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const variant = await ProductVariant.findById(req.params.id);
    
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
  })
);

// Create new variant (Authenticated users - Super Admin creates verified, Company Owners create unverified)
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Set isVerified based on user role: Super Admin (role 0) = verified, Company Owner = unverified
    // Get role from users_role table if user.role is null
    let userRole = req.user.role;
    if (!userRole) {
      try {
        const User = require('../models/User');
        userRole = await User.getCurrentRole(req.user.id);
        req.user.role = userRole;
        req.user.roleLevel = userRole;
      } catch (error) {
        userRole = 3; // Default to USER
      }
    }
    const isSuperAdmin = userRole === 0 || req.user.roleLevel === 0;
    
    // Company owners can only create unverified variants
    // Super admins can create verified variants (unless explicitly set to false)
    const requestedIsVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : isSuperAdmin;
    const finalIsVerified = isSuperAdmin ? requestedIsVerified : false; // Force unverified for non-super admins
    
    const variantData = {
      productId: req.body.productId,
      name: req.body.name,
      sku: req.body.sku,
      color: req.body.color || null,
      size: req.body.size || null,
      weight: req.body.weight || null,
      material: req.body.material || null,
      isDefault: req.body.isDefault || false,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      isVerified: finalIsVerified
    };

    if (!variantData.productId || !variantData.name || !variantData.sku) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, and SKU are required'
      });
    }

    const variant = await ProductVariant.create(variantData);
    
    res.status(201).json({
      success: true,
      message: 'Variant created successfully',
      data: variant.toJSON()
    });
  })
);

// Update variant (Super Admin only)
router.put('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const variantId = req.params.id;
    const variant = await ProductVariant.findById(variantId);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    const updateData = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.sku !== undefined) updateData.sku = req.body.sku;
    if (req.body.color !== undefined) updateData.color = req.body.color || null;
    if (req.body.size !== undefined) updateData.size = req.body.size || null;
    if (req.body.weight !== undefined) updateData.weight = req.body.weight || null;
    if (req.body.material !== undefined) updateData.material = req.body.material || null;
    if (req.body.isDefault !== undefined) updateData.isDefault = Boolean(req.body.isDefault);
    if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);
    if (req.body.isVerified !== undefined) updateData.isVerified = Boolean(req.body.isVerified);

    const updatedVariant = await ProductVariant.update(variantId, updateData);
    
    res.json({
      success: true,
      message: 'Variant updated successfully',
      data: updatedVariant.toJSON()
    });
  })
);

// Delete variant (Super Admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const variantId = req.params.id;
    const variant = await ProductVariant.findById(variantId);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    await ProductVariant.delete(variantId);
    
    res.json({
      success: true,
      message: 'Variant deleted successfully'
    });
  })
);

module.exports = router;

