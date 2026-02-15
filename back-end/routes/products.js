const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all products (with pagination, search, filters, and tags)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Parse pagination parameters
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
    const page = parseInt(req.query.page) || 1;
    const calculatedOffset = offset || (page - 1) * limit;

    // Parse filters
    const filters = {
      limit: Math.min(limit, 100), // Max 100 items per page
      offset: calculatedOffset,
      search: req.query.search || '',
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isVerified: req.query.isVerified !== undefined ? req.query.isVerified === 'true' : undefined,
      tagIds: req.query.tagIds ? (Array.isArray(req.query.tagIds) ? req.query.tagIds : [req.query.tagIds]) : [],
    };

    // Get paginated products
    const result = await Product.findAllPaginated(filters);
    
    // Fetch tags for each product
    const productsWithTags = await Promise.all(
      result.products.map(async (product) => {
        const productData = product.toJSON();
        try {
          const tags = await Product.getTags(product.id);
          productData.tags = tags;
        } catch (error) {
          console.error(`Error fetching tags for product ${product.id}:`, error);
          productData.tags = [];
        }
        return productData;
      })
    );
    
    res.json({
      success: true,
      data: productsWithTags,
      pagination: result.pagination,
    });
  })
);

// Get product by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const productData = product.toJSON();
    try {
      const tags = await Product.getTags(product.id);
      productData.tags = tags;
    } catch (error) {
      console.error(`Error fetching tags for product ${product.id}:`, error);
      productData.tags = [];
    }
    
    res.json({
      success: true,
      data: productData
    });
  })
);

// Create new product (Authenticated users - Super Admin creates verified, Company Owners create unverified)
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
    
    // Company owners can only create unverified products
    // Super admins can create verified products (unless explicitly set to false)
    const requestedIsVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : isSuperAdmin;
    const finalIsVerified = isSuperAdmin ? requestedIsVerified : false; // Force unverified for non-super admins
    
    const productData = {
      // Removed brand field
      name: req.body.name,
      description: req.body.description || null,
      imageUrl: req.body.imageUrl || null,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      isVerified: finalIsVerified
    };

    if (!productData.name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const productId = await Product.create(productData);
    
    // Set tags if provided (using tagIds array)
    console.log('[Product Creation] Received tagIds:', req.body.tagIds);
    console.log('[Product Creation] tagIds type:', typeof req.body.tagIds, 'isArray:', Array.isArray(req.body.tagIds));
    if (req.body.tagIds && Array.isArray(req.body.tagIds) && req.body.tagIds.length > 0) {
      try {
        console.log(`[Product Creation] Setting tags for product ${productId}:`, req.body.tagIds);
        await Product.setTags(productId, req.body.tagIds);
        console.log(`[Product Creation] ✓ Tags set successfully for product ${productId}:`, req.body.tagIds);
      } catch (tagError) {
        console.error('[Product Creation] ✗ Error setting tags for product:', tagError);
        console.error('[Product Creation] Error stack:', tagError.stack);
        // Don't fail the entire request if tags fail, but log it
      }
    } else {
      console.log('[Product Creation] No tagIds provided or empty array');
    }
    
    const product = await Product.findById(productId);
    const productDataResponse = product.toJSON();
    
    // Fetch tags from junction table
    try {
      const tags = await Product.getTags(productId);
      productDataResponse.tags = tags;
    } catch (error) {
      console.error(`Error fetching tags for product ${productId}:`, error);
      productDataResponse.tags = [];
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productDataResponse
    });
  })
);

// Update product (Super Admin only)
router.put('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};
    
    // Removed brand field
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);
    if (req.body.isVerified !== undefined) updateData.isVerified = Boolean(req.body.isVerified);
    
    // Handle tags separately via product_tags junction table
    if (req.body.tagIds !== undefined && Array.isArray(req.body.tagIds)) {
      try {
        await Product.setTags(productId, req.body.tagIds);
      } catch (tagError) {
        console.error('Error setting tags for product:', tagError);
        // Don't fail the entire request if tags fail, but log it
      }
    }

    const updatedProduct = await Product.update(productId, updateData);
    const productDataResponse = updatedProduct.toJSON();
    
    // Fetch tags from junction table
    try {
      const tags = await Product.getTags(productId);
      productDataResponse.tags = tags;
    } catch (error) {
      console.error(`Error fetching tags for product ${productId}:`, error);
      productDataResponse.tags = [];
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: productDataResponse
    });
  })
);

// Delete product (Super Admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.delete(productId);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  })
);

module.exports = router;

