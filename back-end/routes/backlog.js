const express = require('express');
const router = express.Router();
const BacklogItem = require('../models/BacklogItem');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all backlog items (with pagination, search, filters)
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
        type: req.query.type || undefined,
        status: req.query.status || undefined,
        createdBy: req.query.createdBy || undefined,
      };

      // Get paginated backlog items
      const result = await BacklogItem.findAll(filters);
      
      res.json({
        success: true,
        data: result.items.map(item => item.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching backlog items:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching backlog items',
        error: error.message
      });
    }
  })
);

// Get backlog item by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await BacklogItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Backlog item not found'
      });
    }
    
    res.json({
      success: true,
      data: item.toJSON()
    });
  })
);

// Create new backlog item (Authenticated users can create)
router.post('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const itemData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type || 'Issue',
      status: req.body.status || 'New',
      screenshotPath: req.body.screenshotPath || null,
      createdBy: req.user.id
    };

    if (!itemData.title || !itemData.description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Validate type
    if (!['Issue', 'Feature'].includes(itemData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "Issue" or "Feature"'
      });
    }

    // Validate status
    if (itemData.status && !['New', 'Active', 'Done'].includes(itemData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "New", "Active", or "Done"'
      });
    }

    const item = await BacklogItem.create(itemData);
    
    res.status(201).json({
      success: true,
      message: 'Backlog item created successfully',
      data: item.toJSON()
    });
  })
);

// Update backlog item
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const item = await BacklogItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Backlog item not found'
      });
    }

    // Check permissions: Only company owners can update status
    // Regular users can only update their own items (title, description, type, screenshot)
    const userRoleLevel = req.user.roleLevel !== undefined ? req.user.roleLevel : (req.user.role || 3);
    const isCompanyOwner = userRoleLevel <= 1; // SYSTEM_ADMIN (0) or COMPANY_OWNER (1)
    const isOwner = item.createdBy === req.user.id;

    const updateData = {};
    
    // All users can update title, description, type, screenshot
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.type !== undefined) {
      if (!['Issue', 'Feature'].includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "Issue" or "Feature"'
        });
      }
      updateData.type = req.body.type;
    }
    if (req.body.screenshotPath !== undefined) updateData.screenshotPath = req.body.screenshotPath;

    // Only company owners can update status
    if (req.body.status !== undefined) {
      if (!['New', 'Active', 'Done'].includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be "New", "Active", or "Done"'
        });
      }
      
      if (!isCompanyOwner) {
        return res.status(403).json({
          success: false,
          message: 'Only company owners can update status'
        });
      }
      
      updateData.status = req.body.status;
    }

    // Regular users can only update their own items
    if (!isCompanyOwner && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own backlog items'
      });
    }

    const updatedItem = await BacklogItem.update(id, updateData);
    
    res.json({
      success: true,
      message: 'Backlog item updated successfully',
      data: updatedItem.toJSON()
    });
  })
);

// Delete backlog item (Only company owners or item owner)
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const item = await BacklogItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Backlog item not found'
      });
    }

    // Check permissions: Company owners can delete any, users can delete their own
    const userRoleLevel = req.user.roleLevel !== undefined ? req.user.roleLevel : (req.user.role || 3);
    const isCompanyOwner = userRoleLevel <= 1;
    const isOwner = item.createdBy === req.user.id;

    if (!isCompanyOwner && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own backlog items'
      });
    }

    await BacklogItem.delete(id);
    
    res.json({
      success: true,
      message: 'Backlog item deleted successfully'
    });
  })
);

module.exports = router;
