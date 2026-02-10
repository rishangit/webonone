const express = require('express');
const router = express.Router();
const CompanyStaff = require('../models/CompanyStaff');
const { pool } = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Staff validation schema
const staffSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    userId: Joi.string().length(10).required(), // userId is now required
    status: Joi.string().valid('Active', 'Inactive', 'Pending').optional(),
    bio: Joi.string().optional().allow('', null),
    permissions: Joi.object().optional(),
    emergencyContact: Joi.object().optional(),
    workSchedule: Joi.object().optional(),
    joinDate: Joi.date().optional(),
    lastActive: Joi.string().optional(),
  }),
  update: Joi.object({
    userId: Joi.string().length(10).optional(), // Allow changing user reference
    status: Joi.string().valid('Active', 'Inactive', 'Pending').optional(),
    bio: Joi.string().optional().allow('', null),
    permissions: Joi.object().optional(),
    emergencyContact: Joi.object().optional(),
    workSchedule: Joi.object().optional(),
    lastActive: Joi.string().optional(),
  }).min(1)
};

// Get all staff (with pagination, search, filters)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // If user is company owner, filter by their company
      if (req.user && req.user.roleLevel > 0 && req.user.companyId) {
        req.query.companyId = req.user.companyId;
      }
      
      // Validate companyId if provided
      if (req.query.companyId && req.query.companyId.length !== 10) {
        throw validationError('Invalid companyId format');
      }

      // Parse pagination parameters
      const limit = parseInt(req.query.limit) || 12;
      const offset = parseInt(req.query.offset) || 0;
      const page = parseInt(req.query.page) || 1;
      const calculatedOffset = offset || (page - 1) * limit;

      // Parse filters
      const options = {
        limit: Math.min(limit, 100), // Max 100 items per page
        offset: calculatedOffset,
        search: req.query.search || '',
        companyId: req.query.companyId || null,
        status: req.query.status || null,
        role: req.query.role || null,
        department: req.query.department || null,
      };
      
      const result = await CompanyStaff.findAllPaginated(options);
      
      res.json({
        success: true,
        data: result.staff || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error in GET /api/staff:', error);
      throw error;
    }
  })
);

// Get staff by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const staff = await CompanyStaff.findById(req.params.id);
    
    if (!staff) {
      throw notFoundError('Staff');
    }
    
    // Check if user has access to this staff
    if (req.user && req.user.roleLevel > 0) {
      if (req.user.companyId && staff.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    res.json({
      success: true,
      data: staff
    });
  })
);

// Create new staff
router.post('/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = staffSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    // If user is company owner, set companyId to their company
    if (req.user && req.user.roleLevel > 0 && req.user.companyId) {
      value.companyId = req.user.companyId;
    }
    
    // Verify company exists and user has access
    if (req.user && req.user.roleLevel > 0) {
      if (value.companyId !== req.user.companyId) {
        throw validationError('Access denied - cannot create staff for different company');
      }
    }
    
    // Verify that the userId exists in users table
    if (value.userId) {
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ?',
        [value.userId]
      );
      if (userRows.length === 0) {
        throw validationError('User not found');
      }
      
      // Check if user is already staff for this company
      const [existingStaffRows] = await pool.execute(
        'SELECT id FROM company_staff WHERE companyId = ? AND userId = ?',
        [value.companyId, value.userId]
      );
      if (existingStaffRows.length > 0) {
        throw validationError('User is already a staff member for this company');
      }
    }
    
    const staff = await CompanyStaff.create(value);
    
    // Add STAFF_MEMBER role to users_role table if userId exists
    if (value.userId) {
      try {
        const UserRole = require('../models/UserRole');
        const { UserRole: UserRoleEnum } = require('../types/user');
        
        // Check if user already has STAFF_MEMBER role for this company
        const hasRole = await UserRole.hasRole(value.userId, UserRoleEnum.STAFF_MEMBER, value.companyId);
        if (!hasRole) {
          await UserRole.create({
            userId: value.userId,
            role: UserRoleEnum.STAFF_MEMBER,
            companyId: value.companyId,
            isActive: true,
            isDefault: false // Keep USER as default
          });
          console.log(`[Staff Creation] Added STAFF_MEMBER role for user ${value.userId} in company ${value.companyId}`);
        }
      } catch (roleError) {
        console.error('[Staff Creation] Error adding STAFF_MEMBER role:', roleError);
        // Don't fail the request if role creation fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff
    });
  })
);

// Update staff
router.put('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = staffSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    
    // Get staff to check access
    const [staffRows] = await pool.execute(
      'SELECT * FROM company_staff WHERE id = ?',
      [req.params.id]
    );
    
    if (staffRows.length === 0) {
      throw notFoundError('Staff');
    }
    
    // Check if user has access to this staff
    if (req.user && req.user.roleLevel > 0) {
      if (req.user.companyId && staffRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Get staff instance for update
    const staff = new CompanyStaff(staffRows[0]);
    const updatedStaff = await staff.update(value);
    
    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: updatedStaff
    });
  })
);

// Delete staff
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    // Get staff to check access
    const [staffRows] = await pool.execute(
      'SELECT companyId FROM company_staff WHERE id = ?',
      [req.params.id]
    );
    
    if (staffRows.length === 0) {
      throw notFoundError('Staff');
    }
    
    // Check if user has access to this staff
    if (req.user && req.user.roleLevel > 0) {
      if (req.user.companyId && staffRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    await CompanyStaff.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Staff deleted successfully'
    });
  })
);

module.exports = router;

