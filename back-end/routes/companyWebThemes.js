const express = require('express');
const router = express.Router();
const CompanyWebTheme = require('../models/CompanyWebTheme');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Theme validation schema
const themeSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    backgroundColor: Joi.string().max(50).optional().allow('', null),
    bodyTextColor: Joi.string().max(50).optional().allow('', null),
    headingColor: Joi.string().max(50).optional().allow('', null),
    h1Font: Joi.string().max(255).optional().allow('', null),
    h2Font: Joi.string().max(255).optional().allow('', null),
    h3Font: Joi.string().max(255).optional().allow('', null),
    h4Font: Joi.string().max(255).optional().allow('', null),
    h5Font: Joi.string().max(255).optional().allow('', null),
    googleFontUrl: Joi.string().uri().optional().allow('', null),
    isActive: Joi.boolean().optional(),
    isDefault: Joi.boolean().optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    backgroundColor: Joi.string().max(50).optional().allow('', null),
    bodyTextColor: Joi.string().max(50).optional().allow('', null),
    headingColor: Joi.string().max(50).optional().allow('', null),
    h1Font: Joi.string().max(255).optional().allow('', null),
    h2Font: Joi.string().max(255).optional().allow('', null),
    h3Font: Joi.string().max(255).optional().allow('', null),
    h4Font: Joi.string().max(255).optional().allow('', null),
    h5Font: Joi.string().max(255).optional().allow('', null),
    googleFontUrl: Joi.string().uri().optional().allow('', null),
    isActive: Joi.boolean().optional(),
    isDefault: Joi.boolean().optional(),
  }).min(1)
};

// Get all themes for a company
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'companyId is required'
      });
    }

    try {
      const themes = await CompanyWebTheme.findByCompanyId(companyId);
      
      res.json({
        success: true,
        data: themes.map(theme => theme.toJSON())
      });
    } catch (error) {
      console.error('Error fetching themes:', error);
      // If it's a database schema error, provide helpful message
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        return res.status(500).json({
          success: false,
          message: 'Database table needs to be set up. Please run: node scripts/setupCompanyWebThemeTable.js'
        });
      }
      throw error;
    }
  })
);

// Get single theme by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const theme = await CompanyWebTheme.findById(id);
    
    if (!theme) {
      throw notFoundError('Theme not found');
    }
    
    res.json({
      success: true,
      data: theme.toJSON()
    });
  })
);

// Create new theme
router.post('/',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { error, value } = themeSchema.create.validate(req.body);
    
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    const theme = await CompanyWebTheme.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      data: theme.toJSON()
    });
  })
);

// Update theme
router.put('/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, value } = themeSchema.update.validate(req.body);
    
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    const theme = await CompanyWebTheme.update(id, value);
    
    if (!theme) {
      throw notFoundError('Theme not found');
    }
    
    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: theme.toJSON()
    });
  })
);

// Delete theme
router.delete('/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await CompanyWebTheme.delete(id);
    
    if (!deleted) {
      throw notFoundError('Theme not found');
    }
    
    res.json({
      success: true,
      message: 'Theme deleted successfully'
    });
  })
);

module.exports = router;
