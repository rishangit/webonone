const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireRole, requirePermission, requireOwnershipOrAdmin, requireSameCompany } = require('../middleware/auth');
const { validate, userSchemas, querySchemas } = require('../middleware/validation');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');

// Get all users (with pagination, search, filters)
router.get('/', authenticateToken, async (req, res) => {
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
      role: req.query.role || undefined,
      companyId: req.query.companyId ? parseInt(req.query.companyId) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    // Get paginated users
    const result = await User.findAllPaginated(filters);
    
    // Get all roles for each user from users_role table
    const UserRole = require('../models/UserRole');
    const { UserRole: UserRoleEnum } = require('../types/user');
    const usersWithRoles = await Promise.all(result.users.map(async (user) => {
      const userJson = user.toJSON ? user.toJSON() : user;
      try {
        // Get all active roles for this user (excludes USER role by default)
        const roles = await UserRole.findByUserId(user.id, false); // false = only active roles
        // Add roles array to user object
        userJson.roles = roles.map(r => ({
          id: r.id,
          role: r.role,
          companyId: r.companyId,
          isDefault: r.isDefault
        }));
        // If no special roles found, add USER role as the default
        if (userJson.roles.length === 0) {
          userJson.roles.push({
            id: null,
            role: UserRoleEnum.USER, // USER role (3)
            companyId: null,
            isDefault: true
          });
        }
      } catch (error) {
        // If users_role table doesn't exist or error, just use the default role
        console.warn(`Error fetching roles for user ${user.id}:`, error.message);
        userJson.roles = [{
          id: null,
          role: userJson.role || UserRoleEnum.USER,
          companyId: null,
          isDefault: true
        }];
      }
      return userJson;
    }));
    
    // Get user statistics (optional - don't fail if stats fail)
    let stats = null;
    let usersByRole = {};
    try {
      stats = await User.getStats();
      usersByRole = await User.getUsersByRole();
    } catch (statsError) {
      console.warn('Error fetching user statistics:', statsError.message);
      // Continue without stats
    }
    
    res.json({
      success: true,
      data: usersWithRoles,
      pagination: result.pagination,
      ...(stats && { stats: { ...stats, usersByRole } })
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id',
  authenticateToken,
  requireOwnershipOrAdmin('id'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw notFoundError('User');
    }
    
    res.json({
      success: true,
      data: user
    });
  })
);

// Create new user
router.post('/',
  authenticateToken,
  requireRole(1), // Company owners and above
  validate(userSchemas.create),
  asyncHandler(async (req, res) => {
    const { email, firstName, lastName, role, roleLevel, companyId: targetCompanyId } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw validationError('Email already exists');
    }
    
    // Create the user
    // Note: req.body already contains validated fields from Joi
    // Set isActive and isVerified to false for pre-created users
    const userData = {
      ...req.body,
      isActive: false,
      isVerified: false
    };
    
    const userId = await User.create(userData);
    const user = await User.findById(userId);
    
    // If the creator is a company owner, automatically add this user to their company clients
    const creator = req.user;
    const isOwner = creator.roleLevel === 1;
    const companyId = targetCompanyId || creator.companyId;
    
    if (companyId && (isOwner || creator.roleLevel === 0)) {
      try {
        const { addOrUpdateCompanyUser } = require('../utils/companyUsers');
        // Use 'manual' interaction type for pre-created users
        await addOrUpdateCompanyUser(String(companyId), userId, 'manual', 0);
        console.log(`[Users] Linked new user ${userId} to company ${companyId}`);
      } catch (linkError) {
        console.error('[Users] Error linking new user to company:', linkError.message);
        // Don't fail the user creation if linking fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  })
);

// Pre-create user (manual add by company owner, allows no password)
router.post('/pre-create',
  authenticateToken,
  requireRole(1), // Company owners and above
  validate(userSchemas.preCreate),
  asyncHandler(async (req, res) => {
    const { email, firstName, lastName, companyId: targetCompanyId } = req.body;
    const { UserRole: UserRoleEnum } = require('../types/user');
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw validationError('Email already exists');
    }
    
    // Create the user with minimal data and NO password
    const userData = {
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role: 'User',
      roleLevel: UserRoleEnum.USER,
      isActive: false,
      isVerified: false,
      password: '' // Explicitly set empty string to satisfy NOT NULL
    };
    
    const userId = await User.create(userData);
    const user = await User.findById(userId);
    
    // Automatically link to company
    const creator = req.user;
    const companyId = targetCompanyId || creator.companyId;
    
    if (companyId) {
      try {
        const { addOrUpdateCompanyUser } = require('../utils/companyUsers');
        await addOrUpdateCompanyUser(String(companyId), userId, 'manual', 0);
        console.log(`[Users] Linked pre-created user ${userId} to company ${companyId}`);
      } catch (linkError) {
        console.error('[Users] Error linking pre-created user to company:', linkError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'User pre-created successfully',
      data: user
    });
  })
);

// Update user
router.put('/:id',
  authenticateToken,
  requireOwnershipOrAdmin('id'),
  validate(userSchemas.update),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw notFoundError('User');
    }
    
    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findByEmail(req.body.email);
      if (existingUser) {
        throw validationError('Email already exists');
      }
    }
    
    await user.update(req.body);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  })
);

// Delete user
router.delete('/:id',
  authenticateToken,
  requireRole(0), // Only super admins can delete users
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw notFoundError('User');
    }
    
    // Prevent deletion of super admins
    // Check if user is system admin from users_role table
    let userRoleLevel = user.roleLevel;
    if (userRoleLevel === undefined || userRoleLevel === null) {
      try {
        const UserRole = require('../models/UserRole');
        const { UserRole: UserRoleEnum } = require('../types/user');
        const hasAdminRole = await UserRole.hasRole(user.id, UserRoleEnum.SYSTEM_ADMIN);
        if (hasAdminRole) {
          userRoleLevel = 0;
        } else {
          const defaultRole = await UserRole.getDefaultRole(user.id);
          userRoleLevel = defaultRole ? defaultRole.role : 3;
        }
      } catch (error) {
        userRoleLevel = user.role || 3;
      }
    }
    
    if (userRoleLevel === 0) {
      throw validationError('Cannot delete super admin users');
    }
    
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      throw notFoundError('User');
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

// Get user statistics
router.get('/stats/overview',
  authenticateToken,
  requireRole(1), // Company owners and above
  asyncHandler(async (req, res) => {
    const stats = await User.getStats();
    const usersByRole = await User.getUsersByRole();
    
    res.json({
      success: true,
      data: {
        ...stats,
        usersByRole
      }
    });
  })
);

// Get users by role
router.get('/stats/by-role',
  authenticateToken,
  requireRole(1), // Company owners and above
  asyncHandler(async (req, res) => {
    const usersByRole = await User.getUsersByRole();
    
    res.json({
      success: true,
      data: usersByRole
    });
  })
);

// Get current user profile
router.get('/profile/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const Company = require('../models/Company');
    const userResponse = req.user.toJSON ? req.user.toJSON() : req.user;
    
    // Get companies owned by this user
    try {
      const ownedCompanies = await Company.findAll({ ownerId: req.user.id });
      userResponse.companies = ownedCompanies.map(company => company.toJSON ? company.toJSON() : company);
    } catch (error) {
      console.warn('Error fetching user companies:', error.message);
      userResponse.companies = [];
    }
    
    res.json({
      success: true,
      data: userResponse
    });
  })
);

// Update current user profile
router.put('/profile/me',
  authenticateToken,
  validate(userSchemas.update),
  asyncHandler(async (req, res) => {
    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findByEmail(req.body.email);
      if (existingUser) {
        throw validationError('Email already exists');
      }
    }
    
    await req.user.update(req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: req.user
    });
  })
);

// Deactivate user (soft delete)
router.patch('/:id/deactivate',
  authenticateToken,
  requireRole(1), // Company owners and above
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw notFoundError('User');
    }
    
    // Prevent deactivation of super admins
    // Check if user is system admin from users_role table
    let userRoleLevel = user.roleLevel;
    if (userRoleLevel === undefined || userRoleLevel === null) {
      try {
        const UserRole = require('../models/UserRole');
        const { UserRole: UserRoleEnum } = require('../types/user');
        const hasAdminRole = await UserRole.hasRole(user.id, UserRoleEnum.SYSTEM_ADMIN);
        if (hasAdminRole) {
          userRoleLevel = 0;
        } else {
          const defaultRole = await UserRole.getDefaultRole(user.id);
          userRoleLevel = defaultRole ? defaultRole.role : 3;
        }
      } catch (error) {
        userRoleLevel = user.role || 3;
      }
    }
    
    if (userRoleLevel === 0) {
      throw validationError('Cannot deactivate super admin users');
    }
    
    await user.update({ isActive: false });
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

// Activate user
router.patch('/:id/activate',
  authenticateToken,
  requireRole(1), // Company owners and above
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw notFoundError('User');
    }
    
    await user.update({ isActive: true });
    
    res.json({
      success: true,
      message: 'User activated successfully'
    });
  })
);

// Get users by company
router.get('/company/:companyId',
  authenticateToken,
  requireSameCompany('companyId'),
  validate(querySchemas.userFilters, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, offset, search, role, isActive } = req.query;
    
    // Debug: Log received query parameters
    console.log('[GET /users/company/:companyId] Query params:', { page, limit, offset, search, role, isActive });
    
    // Check if pagination parameters are provided
    const hasPagination = limit !== undefined || offset !== undefined || page !== undefined;
    
    if (hasPagination) {
      // Use paginated method
      const limitNum = parseInt(limit, 10) || 12;
      const pageNum = parseInt(page, 10) || 1;
      const offsetNum = parseInt(offset, 10) || (pageNum - 1) * limitNum;
      
      // Ensure search is properly formatted
      let searchValue = undefined;
      if (search) {
        if (typeof search === 'string') {
          searchValue = search.trim();
        } else {
          searchValue = String(search).trim();
        }
        // Only include search if it has content
        if (searchValue.length === 0) {
          searchValue = undefined;
        }
      }
      
      const options = {
        limit: limitNum,
        offset: offsetNum,
        search: searchValue,
        role: role ? parseInt(role, 10) : undefined,
        companyId: req.params.companyId,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined
      };
      
      console.log('[GET /users/company/:companyId] Raw search from query:', search);
      console.log('[GET /users/company/:companyId] Processed searchValue:', searchValue);
      console.log('[GET /users/company/:companyId] Options passed to findAllPaginated:', JSON.stringify(options, null, 2));
      
      const result = await User.findAllPaginated(options);
      
      // Get roles for each user
      const { UserRole: UserRoleEnum } = require('../types/user');
      const usersWithRoles = await Promise.all(result.users.map(async (user) => {
        const userJson = user.toJSON ? user.toJSON() : user;
        try {
          const UserRole = require('../models/UserRole');
          const roles = await UserRole.findByUserId(user.id, false);
          userJson.roles = roles.map(r => ({
            id: r.id,
            role: r.role,
            companyId: r.companyId,
            isDefault: r.isDefault
          }));
          if (userJson.roles.length === 0) {
            userJson.roles.push({
              id: null,
              role: UserRoleEnum.USER,
              companyId: null,
              isDefault: true
            });
          }
        } catch (error) {
          console.warn(`Error fetching roles for user ${user.id}:`, error.message);
          userJson.roles = [{
            id: null,
            role: userJson.role || UserRoleEnum.USER,
            companyId: null,
            isDefault: true
          }];
        }
        return userJson;
      }));
      
      res.json({
        success: true,
        data: usersWithRoles,
        pagination: result.pagination
      });
    } else {
      // Use non-paginated method for backward compatibility
      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        role: role ? parseInt(role, 10) : undefined,
        companyId: req.params.companyId,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined
      };
      
      const users = await User.findAll(options);
      
      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10
        }
      });
    }
  })
);

module.exports = router;
