const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');
const { asyncHandler, validationError } = require('../middleware/errorHandler');
const { UserRole } = require('../types/user');
const Joi = require('joi');

// Company validation schema
const companySchema = {
  create: Joi.object({
    companyName: Joi.string().min(1).max(255).required(),
    name: Joi.string().min(1).max(255).optional(), // Allow both companyName and name
    description: Joi.string().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    city: Joi.string().optional().allow('', null),
    state: Joi.string().optional().allow('', null),
    country: Joi.string().optional().allow('', null),
    postalCode: Joi.string().optional().allow('', null),
    phone: Joi.string().optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    website: Joi.alternatives().try(
      Joi.string().uri(),
      Joi.string().allow(''),
      Joi.string().allow(null)
    ).optional(),
    logo: Joi.string().optional().allow('', null),
    contactPerson: Joi.string().optional().allow('', null),
    employees: Joi.string().optional().allow('', null), // Keep for backward compatibility
    companySize: Joi.string().valid('1-5', '6-10', '11-20', '21-50', '51-200', '201-500', '500+').optional().allow('', null),
    isActive: Joi.boolean().optional(),
    ownerId: Joi.string().optional().allow('', null),
    tagIds: Joi.array().items(Joi.string().length(10)).optional()
  }),
  update: Joi.object({
    companyName: Joi.string().min(1).max(255).required(),
    name: Joi.string().min(1).max(255).optional(), // Optional since companyName will be mapped to name
    description: Joi.string().required().min(1),
    address: Joi.string().required().min(1),
    city: Joi.string().required().min(1),
    state: Joi.string().required().min(1),
    country: Joi.string().optional().allow('', null),
    postalCode: Joi.string().optional().allow('', null),
    latitude: Joi.number().min(-90).max(90).optional().allow(null),
    longitude: Joi.number().min(-180).max(180).optional().allow(null),
    phone: Joi.string().required().pattern(/^\+\d{1,4}\d{4,}$/).messages({
      'string.pattern.base': 'Phone number format is invalid. Please include country code and phone number (e.g., +1234567890)',
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number is required'
    }),
    email: Joi.string().email().required(),
    website: Joi.alternatives().try(
      Joi.string().uri(),
      Joi.string().allow(''),
      Joi.string().allow(null)
    ).optional(),
    logo: Joi.string().optional().allow('', null),
    contactPerson: Joi.string().optional().allow('', null),
    employees: Joi.string().optional().allow('', null), // Keep for backward compatibility
    companySize: Joi.string().valid('1-5', '6-10', '11-20', '21-50', '51-200', '201-500', '500+').optional().allow('', null),
    currencyId: Joi.string().length(10).optional().allow('', null),
    isActive: Joi.boolean().optional(),
    ownerId: Joi.string().optional().allow('', null)
  })
};

// Get all companies (with pagination, search, filters)
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
        ownerId: req.query.ownerId || undefined,
      };

      // Get paginated companies
      const result = await Company.findAllPaginated(filters);
      
      // Fetch tags for each company
      const companiesWithTags = await Promise.all(
        result.companies.map(async (company) => {
          const companyData = company.toJSON();
          try {
            const tags = await Company.getTags(company.id);
            companyData.tags = tags;
          } catch (error) {
            console.error(`Error fetching tags for company ${company.id}:`, error);
            companyData.tags = [];
          }
          return companyData;
        })
      );
      
      res.json({
        success: true,
        data: companiesWithTags,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching companies',
        error: error.message
      });
    }
  })
);

// Get company by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      const companyData = company.toJSON();
      try {
        const tags = await Company.getTags(id);
        companyData.tags = tags;
      } catch (error) {
        console.error(`Error fetching tags for company ${id}:`, error);
        companyData.tags = [];
      }
      
      res.json({
        success: true,
        data: companyData
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching company',
        error: error.message
      });
    }
  })
);

// Create new company (registration) - try to get userId from token, fallback to email match
router.post('/',
  optionalAuth, // Optional auth - try to get user from token
  validate(companySchema.create),
  asyncHandler(async (req, res) => {
    try {
      // Get current user from token if available
      let userId = req.user?.id || null;
      
      // If no userId from token, try to find user by email
      if (!userId && req.body.email) {
        try {
          const User = require('../models/User');
          const user = await User.findByEmail(req.body.email);
          if (user) {
            userId = user.id;
            console.log(`[Company Registration] Found user by email: ${user.email} (ID: ${user.id})`);
          }
        } catch (error) {
          console.log(`[Company Registration] Could not find user by email: ${req.body.email}`);
        }
      }
      
      // Combine address fields into a single address string
      const addressParts = [
        req.body.address,
        req.body.city,
        req.body.state,
        req.body.country,
        req.body.postalCode
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;

      // Get company name (prioritize companyName over name)
      const companyName = req.body.companyName || req.body.name;
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'companyName', message: '"companyName" or "name" is required' }]
        });
      }

      const companyData = {
        name: companyName,
        description: req.body.description || null,
        address: fullAddress,
        phone: req.body.phone || null,
        email: req.body.email || null,
        website: req.body.website || null,
        companySize: req.body.companySize || req.body.employees || null, // Support both companySize and employees for backward compatibility
        logo: req.body.logo || null,
        isActive: false, // New registrations start as inactive (pending approval)
        ownerId: userId
      };
      
      const company = await Company.create(companyData);
      
      // Add COMPANY_OWNER role to users_role table if userId exists
      if (userId) {
        try {
          const UserRole = require('../models/UserRole');
          const { UserRole: UserRoleEnum } = require('../types/user');
          
          // Check if user already has COMPANY_OWNER role for this company
          const hasRole = await UserRole.hasRole(userId, UserRoleEnum.COMPANY_OWNER, company.id);
          if (!hasRole) {
            await UserRole.create({
              userId: userId,
              role: UserRoleEnum.COMPANY_OWNER,
              companyId: company.id,
              isActive: true,
              isDefault: false // Keep USER as default
            });
            console.log(`[Company Registration] Added COMPANY_OWNER role for user ${userId} in company ${company.id}`);
          }
        } catch (roleError) {
          console.error('[Company Registration] Error adding COMPANY_OWNER role:', roleError);
          // Don't fail the request if role creation fails
        }
      }
      
      // Set tags if provided
      console.log('[Company Creation] Received tagIds:', req.body.tagIds);
      console.log('[Company Creation] tagIds type:', typeof req.body.tagIds, 'isArray:', Array.isArray(req.body.tagIds));
      if (req.body.tagIds && Array.isArray(req.body.tagIds) && req.body.tagIds.length > 0) {
        try {
          console.log(`[Company Creation] Setting tags for company ${company.id}:`, req.body.tagIds);
          await Company.setTags(company.id, req.body.tagIds);
          console.log(`[Company Creation] ✓ Tags set successfully for company ${company.id}:`, req.body.tagIds);
        } catch (tagError) {
          console.error('[Company Creation] ✗ Error setting tags for company:', tagError);
          console.error('[Company Creation] Error stack:', tagError.stack);
          // Don't fail the entire request if tags fail, but log it
          // You might want to throw here depending on your requirements
        }
      } else {
        console.log('[Company Creation] No tagIds provided or empty array');
      }
      
      res.status(201).json({
        success: true,
        message: 'Company registration submitted successfully',
        data: company.toJSON()
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating company',
        error: error.message
      });
    }
  })
);

// Approve company (set isActive to true)
router.put('/:id/approve',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      // Store original isActive value before update
      const originalIsActive = company.isActive;
      
      // Update isActive to true
      const updated = await company.update({ isActive: true });
      
      // Check if company is being approved (isActive changed from false/0 to true/1)
      const isBeingApproved = (originalIsActive === false || originalIsActive === 0 || originalIsActive === null);
      
      // If company is being approved, update the owner's role to Company Owner
      if (isBeingApproved) {
        try {
          let owner = null;
          
          // First, try to find owner by ownerId if it exists
          if (company.ownerId) {
            const ownerIdInt = typeof company.ownerId === 'string' ? parseInt(company.ownerId, 10) : company.ownerId;
            
            if (!isNaN(ownerIdInt)) {
              console.log(`Attempting to find owner by ID ${ownerIdInt} (from ${company.ownerId}) for company ${id}`);
              owner = await User.findById(ownerIdInt);
            } else {
              console.warn(`Invalid ownerId format for company ${id}: ${company.ownerId}`);
            }
          }
          
          // If owner not found by ID, try to find by email (for companies registered without auth)
          if (!owner && company.email) {
            console.log(`Owner not found by ID, trying to find by email ${company.email} for company ${id}`);
            owner = await User.findByEmail(company.email);
          }
          
          if (owner) {
            console.log(`Found owner: ${owner.id}, email: ${owner.email}, current role: ${owner.role}, current companyId: ${owner.companyId}`);
            
            // Add COMPANY_OWNER role to users_role table
            try {
              const UserRoleModel = require('../models/UserRole');
              const hasRole = await UserRoleModel.hasRole(owner.id, UserRole.COMPANY_OWNER, company.id);
              if (!hasRole) {
                await UserRoleModel.create({
                  userId: owner.id,
                  role: UserRole.COMPANY_OWNER,
                  companyId: company.id,
                  isActive: true,
                  isDefault: false
                });
                console.log(`[Company Approval] Added COMPANY_OWNER role for user ${owner.id} in company ${id}`);
              }
            } catch (roleError) {
              console.error('[Company Approval] Error adding COMPANY_OWNER role:', roleError);
            }
            
            // Update user role if column exists (for backward compatibility)
            const updateData = {};
            try {
              const pool = require('../config/database');
              const [columns] = await pool.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'role'
              `);
              if (columns.length > 0) {
                updateData.role = UserRole.COMPANY_OWNER;
              }
            } catch (e) {
              // Role column doesn't exist, that's fine
            }
            
            await owner.update(updateData);
            
            // Also update the company's ownerId if it wasn't set
            if (!company.ownerId) {
              await updated.update({ ownerId: owner.id.toString() });
              console.log(`Updated company ${id} ownerId to ${owner.id}`);
            }
          } else {
            console.warn(`Owner not found for company ${id}. ownerId: ${company.ownerId}, email: ${company.email}`);
          }
        } catch (userUpdateError) {
          console.error('Error updating owner role:', userUpdateError);
        }
      }
      
      res.json({
        success: true,
        message: 'Company approved successfully',
        data: updated.toJSON()
      });
    } catch (error) {
      console.error('Error approving company:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving company',
        error: error.message
      });
    }
  })
);

// Reject company (set isActive to false)
router.put('/:id/reject',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body; // Optional rejection reason
      
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      // Update isActive to false
      const updateData = { isActive: false };
      if (reason) {
        // Store rejection reason if your schema supports it
        // updateData.rejectionReason = reason;
      }
      
      const updated = await company.update(updateData);
      
      res.json({
        success: true,
        message: 'Company rejected successfully',
        data: updated.toJSON()
      });
    } catch (error) {
      console.error('Error rejecting company:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting company',
        error: error.message
      });
    }
  })
);

// Update company
router.put('/:id',
  authenticateToken,
  validate(companySchema.update),
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      const updateData = {
        ...req.body,
        name: req.body.companyName || req.body.name,
        companySize: req.body.companySize || req.body.employees || undefined // Support both companySize and employees for backward compatibility
      };
      
      // Store original isActive value before update
      const originalIsActive = company.isActive;
      
      // Check if company is being approved (isActive changed from false/0 to true/1)
      // Handle both boolean and numeric values (database stores as 0/1)
      const isBeingApproved = (updateData.isActive === true || updateData.isActive === 1) && 
                              (originalIsActive === false || originalIsActive === 0 || originalIsActive === null);
      
      console.log(`Company ${id} update check:`, {
        originalIsActive,
        newIsActive: updateData.isActive,
        isBeingApproved,
        ownerId: company.ownerId
      });
      
      const updated = await company.update(updateData);
      
      // If company is being approved, update the owner's role to Company Owner
      if (isBeingApproved) {
        try {
          let owner = null;
          
          // First, try to find owner by ownerId if it exists
          if (company.ownerId) {
            // Convert ownerId to integer if it's a string (companies.ownerId is VARCHAR, users.id is INT)
            const ownerIdInt = typeof company.ownerId === 'string' ? parseInt(company.ownerId, 10) : company.ownerId;
            
            if (!isNaN(ownerIdInt)) {
              console.log(`Attempting to find owner by ID ${ownerIdInt} (from ${company.ownerId}) for company ${id}`);
              owner = await User.findById(ownerIdInt);
            } else {
              console.warn(`Invalid ownerId format for company ${id}: ${company.ownerId}`);
            }
          }
          
          // If owner not found by ID, try to find by email (for companies registered without auth)
          if (!owner && company.email) {
            console.log(`Owner not found by ID, trying to find by email ${company.email} for company ${id}`);
            owner = await User.findByEmail(company.email);
          }
          
          if (owner) {
            console.log(`Found owner: ${owner.id}, email: ${owner.email}, current role: ${owner.role}, current companyId: ${owner.companyId}`);
            
            // Add COMPANY_OWNER role to users_role table
            try {
              const UserRoleModel = require('../models/UserRole');
              const hasRole = await UserRoleModel.hasRole(owner.id, UserRole.COMPANY_OWNER, company.id);
              if (!hasRole) {
                await UserRoleModel.create({
                  userId: owner.id,
                  role: UserRole.COMPANY_OWNER,
                  companyId: company.id,
                  isActive: true,
                  isDefault: false // Keep USER as default
                });
                console.log(`[Company Approval] Added COMPANY_OWNER role for user ${owner.id} in company ${id}`);
              }
            } catch (roleError) {
              console.error('[Company Approval] Error adding COMPANY_OWNER role:', roleError);
            }
            
            // Update user companyId and permissions
            // Note: role is now managed in users_role table, not users table
            const updateData = {
              // companyId removed - now stored in users_role table
              // permissions removed - now using role-based access control
            };
            
            // Only update role if column still exists (for backward compatibility during migration)
            try {
              const [columns] = await pool.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'role'
              `);
              if (columns.length > 0) {
                updateData.role = UserRole.COMPANY_OWNER;
              }
            } catch (e) {
              // Role column doesn't exist, that's fine
            }
            
            await owner.update(updateData);
            
            // Also update the company's ownerId if it wasn't set
            if (!company.ownerId) {
              await updated.update({ ownerId: owner.id.toString() });
              console.log(`Updated company ${id} ownerId to ${owner.id}`);
            }
            
            // Verify the update
            const updatedOwner = await User.findById(owner.id);
            let verifiedRole = 'N/A';
            try {
              verifiedRole = await User.getCurrentRole(owner.id, company.id);
            } catch (e) {
              // Ignore
            }
            console.log(`User ${owner.id} role updated successfully. New role: ${verifiedRole}, Company ID: ${updatedOwner.companyId}`);
          } else {
            console.warn(`Owner not found for company ${id}. ownerId: ${company.ownerId}, email: ${company.email}`);
          }
        } catch (userUpdateError) {
          // Log error but don't fail the company update
          console.error('Error updating owner role:', userUpdateError);
          console.error('Error message:', userUpdateError.message);
          console.error('Error stack:', userUpdateError.stack);
        }
      } else {
        if (!isBeingApproved) {
          console.log(`Company ${id} is not being approved. Original: ${originalIsActive} (type: ${typeof originalIsActive}), New: ${updateData.isActive} (type: ${typeof updateData.isActive})`);
        }
      }
      
      res.json({
        success: true,
        message: 'Company updated successfully',
        data: updated.toJSON()
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating company',
        error: error.message
      });
    }
  })
);

// Delete company
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Company.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting company',
        error: error.message
      });
    }
  })
);

module.exports = router;

