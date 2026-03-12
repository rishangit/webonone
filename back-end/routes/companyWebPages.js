const express = require('express');
const router = express.Router();
const CompanyWebPage = require('../models/CompanyWebPage');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Webpage validation schema
const webpageSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    url: Joi.string().min(1).max(500).required(),
    isActive: Joi.boolean().optional(),
    content: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()).optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    url: Joi.string().min(1).max(500).optional(),
    isActive: Joi.boolean().optional(),
    content: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()).optional(),
  }).min(1)
};

// Public route: Get webpage by companyId and URL (no auth required)
// This must come before other routes to avoid conflicts
router.get('/public/:companyId/*',
  asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const url = req.params[0]; // Get the splat parameter
    
    if (!companyId || !url) {
      return res.status(400).json({
        success: false,
        message: 'companyId and URL are required'
      });
    }
    
    // Decode URL if it was encoded, and ensure it starts with /
    let decodedUrl = decodeURIComponent(url);
    if (!decodedUrl.startsWith('/')) {
      decodedUrl = '/' + decodedUrl;
    }
    
    console.log('Public route - Looking for webpage:', { companyId, url: decodedUrl });
    
    // Try to find the webpage (allow inactive pages for testing/preview)
    // Set requireActive to true if you only want to show active pages
    const webpage = await CompanyWebPage.findByCompanyIdAndUrl(companyId, decodedUrl, false);
    
    if (!webpage) {
      console.log('Webpage not found for:', { companyId, url: decodedUrl });
      throw notFoundError('Webpage not found');
    }
    
    console.log('Webpage found:', webpage.id);
    
    res.json({
      success: true,
      data: webpage.toJSON()
    });
  })
);

// Get all webpages for a company
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
      const webPages = await CompanyWebPage.findByCompanyId(companyId);
      
      res.json({
        success: true,
        data: webPages.map(webpage => webpage.toJSON())
      });
    } catch (error) {
      console.error('Error fetching webpages:', error);
      // If it's a database schema error, provide helpful message
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown column")) {
        return res.status(500).json({
          success: false,
          message: 'Database table needs to be set up. Please run: node scripts/1.7.0/setupCompanyWebPagesTable.js'
        });
      }
      throw error;
    }
  })
);

// Get single webpage by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const webpage = await CompanyWebPage.findById(id);
    
    if (!webpage) {
      throw notFoundError('Webpage not found');
    }
    
    res.json({
      success: true,
      data: webpage.toJSON()
    });
  })
);

// Create new webpage
router.post('/',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { error, value } = webpageSchema.create.validate(req.body);
    
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    const webpage = await CompanyWebPage.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Webpage created successfully',
      data: webpage.toJSON()
    });
  })
);

// Update webpage
router.put('/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, value } = webpageSchema.update.validate(req.body);
    
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    const webpage = await CompanyWebPage.update(id, value);
    
    if (!webpage) {
      throw notFoundError('Webpage not found');
    }
    
    res.json({
      success: true,
      message: 'Webpage updated successfully',
      data: webpage.toJSON()
    });
  })
);

// Delete webpage
router.delete('/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await CompanyWebPage.delete(id);
    
    if (!deleted) {
      throw notFoundError('Webpage not found');
    }
    
    res.json({
      success: true,
      message: 'Webpage deleted successfully'
    });
  })
);

module.exports = router;
