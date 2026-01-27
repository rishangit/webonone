const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all tags (with pagination, search, filters)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
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
      };

      // Get paginated tags
      const result = await Tag.findAllPaginated(filters);
      
      res.json({
        success: true,
        data: result.tags.map(tag => tag.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tags',
        error: error.message
      });
    }
  })
);

// Get tag by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tag = await Tag.findById(parseInt(id));
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    res.json({
      success: true,
      data: tag.toJSON()
    });
  })
);

// Create new tag (Authenticated users - Company owners can create tags for their spaces/products)
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const tagData = {
      name: req.body.name,
      description: req.body.description || null,
      color: req.body.color || '#3B82F6',
      icon: req.body.icon || null,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
    };

    if (!tagData.name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Check if tag with same name already exists (case-insensitive)
    const allTags = await Tag.findAll({});
    const existingTag = allTags.find(tag => 
      tag.name.toLowerCase() === tagData.name.toLowerCase()
    );
    
    if (existingTag) {
      // Return existing tag instead of creating duplicate
      return res.status(200).json({
        success: true,
        message: 'Tag already exists',
        data: existingTag.toJSON()
      });
    }

    const tag = await Tag.create(tagData);
    
    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag.toJSON()
    });
  })
);

// Update tag (Super Admin only)
router.put('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tagId = parseInt(id);
    
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const updateData = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.color !== undefined) updateData.color = req.body.color;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);

    const updatedTag = await Tag.update(tagId, updateData);
    
    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: updatedTag.toJSON()
    });
  })
);

// Delete tag (Super Admin only)
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_system'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tagId = parseInt(id);
    
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    await Tag.delete(tagId);
    
    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  })
);

module.exports = router;

