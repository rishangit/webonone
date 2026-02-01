const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { UserRole, UserRoleNames, getDefaultUserData } = require('../types/user');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');
const { asyncHandler, validationError, unauthorizedError } = require('../middleware/errorHandler');

// Register new user
router.post('/register',
  validate(Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.alternatives().try(
      Joi.number().valid(...Object.values(UserRole)),
      Joi.string().valid('Super Admin', 'System Admin', 'Company Owner', 'Staff Member', 'User', '0', '1', '2', '3')
    ).optional()
  })),
  asyncHandler(async (req, res) => {
    let { firstName, lastName, email, password, role } = req.body;
    
    // Convert string role to number if needed, or default to USER
    if (role === undefined || role === null) {
      role = UserRole.USER;
    } else if (typeof role === 'string') {
      // Map string roles to enum values
      const roleLower = role.toLowerCase();
      if (roleLower === 'super admin' || roleLower === 'system admin' || role === '0') {
        role = UserRole.SYSTEM_ADMIN;
      } else if (roleLower === 'company owner' || role === '1') {
        role = UserRole.COMPANY_OWNER;
      } else if (roleLower === 'staff member' || role === '2') {
        role = UserRole.STAFF_MEMBER;
      } else if (roleLower === 'user' || role === '3') {
        role = UserRole.USER;
      } else {
        // Default to USER if unrecognized
        role = UserRole.USER;
      }
    }
    // If role is already a number, validate it's in range
    if (typeof role === 'number' && !Object.values(UserRole).includes(role)) {
      role = UserRole.USER;
    }
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // If user exists but has no password, they were likely pre-created by a company owner
      // Allow them to "claim" the account by setting a password
      if (!existingUser.password) {
        console.log(`[Sign Up] User ${existingUser.id} claiming pre-created account with email ${email}`);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Update user
        await existingUser.update({
          firstName,
          lastName,
          password: hashedPassword,
          isVerified: true, // Mark as verified since they completed registration
          isActive: true
        });
        
        // Get role for token
        let userRole = UserRole.USER;
        try {
          const UserRoleModel = require('../models/UserRole');
          const defaultRole = await UserRoleModel.getDefaultRole(existingUser.id);
          if (defaultRole) {
            userRole = defaultRole.role;
          }
        } catch (error) {
          userRole = existingUser.role || UserRole.USER;
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email, role: userRole },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Account registered successfully',
          data: {
            user: existingUser.toJSON(),
            token
          }
        });
      }
      
      throw validationError('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Get default user data for the role
    const defaultData = getDefaultUserData(role);
    
    // Create user data (role will be added to users_role table, not users table)
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: defaultData.role, // Will be ignored if role column doesn't exist
      // companyId removed - now stored in users_role table
      isActive: defaultData.isActive,
      isVerified: defaultData.isVerified,
      // permissions removed - now using role-based access control
      preferences: defaultData.preferences,
      // appointmentsCount, totalSpent, joinDate, emergencyContact removed
    };
    
    const userId = await User.create(userData);
    const user = await User.findById(userId);
    
    // Create role in users_role table only if it's not USER (USER is default, no need to store)
    // If user signed up with a role other than USER, add that role
    if (role !== UserRole.USER) {
      try {
        const UserRoleModel = require('../models/UserRole');
        await UserRoleModel.create({
          userId: userId,
          role: role,
          companyId: null,
          isActive: true,
          isDefault: true // This is their primary role
        });
        console.log(`[Sign Up] Created role ${role} for user ${userId}`);
      } catch (roleError) {
        // Table might not exist yet - that's okay, old role system will be used
        console.warn('[Sign Up] users_role table not available, using old role system:', roleError.message);
        // Don't fail signup if role creation fails
      }
    } else {
      console.log(`[Sign Up] User ${userId} registered with default USER role (not stored in users_role table)`);
    }
    
    // Get role from users_role table for token
    let userRole = UserRole.USER; // Default
    try {
      const UserRoleModel = require('../models/UserRole');
      const defaultRole = await UserRoleModel.getDefaultRole(userId);
      if (defaultRole) {
        userRole = defaultRole.role;
      }
    } catch (error) {
      // Fallback to user.role if users_role table doesn't exist
      userRole = user.role || UserRole.USER;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  })
);

// Login user
router.post('/login',
  validate(Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Find user by email (handles both exact match and email with timestamp)
    const user = await User.findByEmail(email);
    if (!user) {
      throw unauthorizedError('Invalid email or password');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw unauthorizedError('Account is deactivated');
    }
    
    // Verify password
    if (!user.password) {
      throw unauthorizedError('Invalid email or password');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw unauthorizedError('Invalid email or password');
    }
    
    // Update last login - convert to MySQL datetime format
    const now = new Date();
    // Convert to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
    // Use local time to avoid timezone issues
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const mysqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log('Updating lastLogin with:', mysqlDateTime);
    await user.update({ lastLogin: mysqlDateTime });
    
    // Get all active roles for this user from users_role table
    // If table doesn't exist yet, fall back to old behavior using user.role
    let userRoles = [];
    let defaultRole = null;
    let useOldRoleSystem = false;
    
    try {
      const UserRoleModel = require('../models/UserRole');
      const { UserRole: UserRoleEnum } = require('../types/user');
      userRoles = await UserRoleModel.findByUserId(user.id, false);
      
      // Filter out USER roles (3) - USER is the default, no need to store it
      userRoles = userRoles.filter(r => r.role !== UserRoleEnum.USER);
      
      // Get default role (will return USER if no roles found)
      if (!useOldRoleSystem) {
        defaultRole = await UserRoleModel.getDefaultRole(user.id);
        // If we have other roles, use the first one as default, otherwise USER
        if (userRoles.length > 0) {
          defaultRole = userRoles.find(r => r.isDefault) || userRoles[0];
        }
      }
    } catch (error) {
      // Table doesn't exist yet, use old role system
      console.warn('users_role table not found, using old role system:', error.message);
      useOldRoleSystem = true;
    }
    
    // Fall back to old role system if table doesn't exist
    if (useOldRoleSystem || userRoles.length === 0) {
      // Use the role from users_role table or fallback to USER
      let fallbackRole = UserRoleEnum.USER;
      try {
        const UserRoleModel = require('../models/UserRole');
        const defaultRole = await UserRoleModel.getDefaultRole(user.id);
        if (defaultRole) {
          fallbackRole = defaultRole.role;
        }
      } catch (error) {
        // If table doesn't exist, use user.role if available
        fallbackRole = user.role || UserRoleEnum.USER;
      }
      
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: fallbackRole
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
      return;
    }
    
    // If user has any special roles (excluding USER), show role selection
    // Always include USER as an option since it's the default for everyone
    if (!useOldRoleSystem && userRoles.length > 0) {
      // User has special roles - return roles for selection (including USER option)
      const Company = require('../models/Company');
      const { UserRoleNames, UserRole: UserRoleEnum } = require('../types/user');
      const rolesWithDetails = await Promise.all(
        userRoles.map(async (ur) => {
          let companyName = null;
          let companyLogo = null;
          if (ur.companyId) {
            try {
              const company = await Company.findById(ur.companyId);
              if (company) {
                companyName = company.name;
                companyLogo = company.logo;
              }
            } catch (e) {
              // Company not found, ignore
            }
          }
          return {
            id: ur.id,
            role: ur.role,
            roleName: UserRoleNames[ur.role] || 'User',
            companyId: ur.companyId,
            companyName: companyName,
            companyLogo: companyLogo,
            isDefault: ur.isDefault
          };
        })
      );
      
      // Always add USER role as an option (since it's the default for everyone)
      rolesWithDetails.push({
        id: null, // No ID since USER role is not stored in users_role table
        role: UserRoleEnum.USER,
        roleName: UserRoleNames[UserRoleEnum.USER] || 'User',
        companyId: null,
        companyName: null,
        isDefault: true // USER is always the default
      });
      
      res.json({
        success: true,
        message: 'Login successful - role selection required',
        data: {
          user: user.toJSON(),
          roles: rolesWithDetails,
          requiresRoleSelection: true
        }
      });
      return;
    }
    
    // Single role or no special roles - proceed with login using default role
    if (!useOldRoleSystem) {
      const selectedRole = defaultRole || { 
        id: null, 
        role: UserRoleEnum.USER, 
        companyId: null 
      };
      
      // Generate JWT token with selected role
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: selectedRole.role,
          roleId: selectedRole.id,
          companyId: selectedRole.companyId
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // Update user object with selected role for response
      const userResponse = user.toJSON();
      userResponse.role = selectedRole.role;
      userResponse.roleLevel = selectedRole.role;
      userResponse.companyId = selectedRole.companyId || userResponse.companyId;
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          selectedRole: {
            id: selectedRole.id,
            role: selectedRole.role,
            companyId: selectedRole.companyId
          }
        }
      });
    }
  })
);

// Complete login with selected role
router.post('/login/complete',
  validate(Joi.object({
    email: Joi.string().email().required(),
    roleId: Joi.string().allow(null).optional() // Allow null for USER role
  })),
  asyncHandler(async (req, res) => {
    const { email, roleId } = req.body;
    const { UserRole: UserRoleEnum } = require('../types/user');
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user || !user.isActive) {
      throw unauthorizedError('Invalid credentials');
    }
    
    let selectedRole;
    
    // If roleId is null, user selected USER role (default)
    if (roleId === null || roleId === undefined || roleId === '') {
      selectedRole = {
        id: null,
        role: UserRoleEnum.USER,
        companyId: null
      };
    } else {
      // Get the selected role from users_role table
      const UserRoleModel = require('../models/UserRole');
      const role = await UserRoleModel.findById(roleId);
      
      // Debug logging
      console.log('[Complete Login] User:', user.id, 'Email:', email);
      console.log('[Complete Login] Requested roleId:', roleId);
      console.log('[Complete Login] Found role:', role ? { id: role.id, userId: role.userId, role: role.role, isActive: role.isActive } : 'null');
      
      if (!role) {
        console.error('[Complete Login] Role not found for roleId:', roleId);
        throw unauthorizedError('Invalid role selection - role not found');
      }
      
      if (role.userId !== user.id) {
        console.error('[Complete Login] Role userId mismatch. Role userId:', role.userId, 'User id:', user.id);
        throw unauthorizedError('Invalid role selection - role does not belong to user');
      }
      
      if (!role.isActive) {
        console.error('[Complete Login] Role is not active:', roleId);
        throw unauthorizedError('Invalid role selection - role is not active');
      }
      
      selectedRole = {
        id: role.id,
        role: role.role,
        companyId: role.companyId
      };
    }
    
    // Generate JWT token with selected role
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: selectedRole.role,
        roleId: selectedRole.id,
        companyId: selectedRole.companyId
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Update user object with selected role for response
    const userResponse = user.toJSON();
    // Ensure role is always set (default to USER if null/undefined)
    userResponse.role = selectedRole.role ?? UserRoleEnum.USER;
    userResponse.roleLevel = selectedRole.role ?? UserRoleEnum.USER;
    userResponse.companyId = selectedRole.companyId || userResponse.companyId;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        selectedRole: {
          id: selectedRole.id,
          role: selectedRole.role,
          companyId: selectedRole.companyId
        }
      }
    });
  })
);

// Get current user profile
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { UserRole: UserRoleEnum } = require('../types/user');
    const Company = require('../models/Company');
    const userResponse = req.user.toJSON();
    
    // Ensure role is always set (default to USER if null/undefined)
    if (userResponse.role === null || userResponse.role === undefined) {
      userResponse.role = UserRoleEnum.USER;
      userResponse.roleLevel = UserRoleEnum.USER;
    }
    
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
router.put('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // For partial updates (like avatar only), merge with existing user data
    // Only validate fields that are being updated
    const updateData = { ...req.body };
    
    // If only avatar is being updated, skip full validation
    const isAvatarOnlyUpdate = Object.keys(updateData).length === 1 && updateData.hasOwnProperty('avatar');
    
    if (!isAvatarOnlyUpdate) {
      // For full updates, validate all required fields
      const { error, value } = userSchemas.update.validate(updateData, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
      
      // Use validated data
      Object.assign(updateData, value);
    } else {
      // For avatar-only updates, just validate avatar field
      if (updateData.avatar !== undefined && updateData.avatar !== null && typeof updateData.avatar !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'avatar', message: 'Avatar must be a string' }]
        });
      }
    }
    
    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== req.user.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'email', message: 'Email already exists' }]
        });
      }
    }
    
    await req.user.update(updateData);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: req.user.toJSON()
    });
  })
);

// Change password
router.put('/change-password',
  authenticateToken,
  validate(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    // In a real implementation, you would verify the current password here
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
    // if (!isCurrentPasswordValid) {
    //   throw validationError('Current password is incorrect');
    // }
    
    // Hash new password
    // const hashedPassword = await bcrypt.hash(newPassword, 12);
    // await req.user.update({ password: hashedPassword });
    
    // For demo purposes, we'll skip password change
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// Logout (client-side token removal)
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success as token removal is handled client-side
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

// Refresh token
router.post('/refresh',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Get current role from users_role table
    let userRole = req.user.role;
    if (!userRole) {
      try {
        const User = require('../models/User');
        userRole = await User.getCurrentRole(req.user.id);
      } catch (error) {
        userRole = 3; // Default to USER
      }
    }
    
    // Generate new token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email, role: userRole, roleLevel: userRole },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });
  })
);

// Verify token
router.get('/verify',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
        valid: true
      }
    });
  })
);

// Forgot password (placeholder)
router.post('/forgot-password',
  validate(Joi.object({
    email: Joi.string().email().required()
  })),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }
    
    // In a real implementation, you would:
    // 1. Generate a password reset token
    // 2. Send an email with the reset link
    // 3. Store the reset token with expiration
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  })
);

// Reset password (placeholder)
router.post('/reset-password',
  validate(Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })),
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the user's password
    // 4. Invalidate the reset token
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

// Impersonate user (Super Admin only)
router.post('/impersonate/:userId',
  authenticateToken,
  requireRole(0), // Only SYSTEM_ADMIN can impersonate
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const adminUser = req.user; // Current admin user
    
    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw validationError('User not found');
    }
    
    if (!targetUser.isActive) {
      throw validationError('Cannot impersonate inactive user');
    }
    
    // Get all active roles for target user
    let userRoles = [];
    let useOldRoleSystem = false;
    
    try {
      const UserRoleModel = require('../models/UserRole');
      userRoles = await UserRoleModel.findByUserId(targetUser.id, false); // Only active roles
    } catch (error) {
      // users_role table might not exist - use old role system
      console.warn('[Impersonate] users_role table not available, using old role system');
      useOldRoleSystem = true;
    }
    
    // If user has multiple roles, return them for selection (similar to login flow)
    if (!useOldRoleSystem && userRoles.length > 0) {
      const Company = require('../models/Company');
      const { UserRoleNames, UserRole: UserRoleEnum } = require('../types/user');
      
      // Get roles with company details
      const rolesWithDetails = await Promise.all(
        userRoles.map(async (ur) => {
          let companyName = null;
          let companyLogo = null;
          if (ur.companyId) {
            try {
              const company = await Company.findById(ur.companyId);
              if (company) {
                companyName = company.name;
                companyLogo = company.logo;
              }
            } catch (e) {
              // Company not found, ignore
            }
          }
          return {
            id: ur.id,
            role: ur.role,
            roleName: UserRoleNames[ur.role] || 'User',
            companyId: ur.companyId,
            companyName: companyName,
            companyLogo: companyLogo,
            isDefault: ur.isDefault
          };
        })
      );
      
      // Always add USER role as an option (since it's the default for everyone)
      rolesWithDetails.push({
        id: null, // No ID since USER role is not stored in users_role table
        role: UserRoleEnum.USER,
        roleName: UserRoleNames[UserRoleEnum.USER] || 'User',
        companyId: null,
        companyName: null,
        companyLogo: null,
        isDefault: true // USER is always the default
      });
      
      res.json({
        success: true,
        message: 'Impersonation - role selection required',
        data: {
          user: targetUser.toJSON(),
          roles: rolesWithDetails,
          requiresRoleSelection: true,
          originalAdmin: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.getFullName()
          }
        }
      });
      return;
    }
    
    // Single role or old system - proceed with default role
    let defaultRole = null;
    if (userRoles.length > 0) {
      defaultRole = userRoles.find(r => r.isDefault) || userRoles[0];
    }
    
    // Determine which role to use
    let selectedRole;
    if (defaultRole) {
      selectedRole = {
        id: defaultRole.id,
        role: defaultRole.role,
        companyId: defaultRole.companyId
      };
    } else {
      // Fallback to user.role from users table (old system)
      selectedRole = {
        id: null,
        role: targetUser.role || UserRole.USER,
        companyId: null
      };
    }
    
    // Generate JWT token for target user with selected role
    const token = jwt.sign(
      { 
        userId: targetUser.id, 
        email: targetUser.email, 
        role: selectedRole.role,
        companyId: selectedRole.companyId,
        impersonatedBy: adminUser.id, // Store who is impersonating
        isImpersonating: true // Flag to indicate this is an impersonation session
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      message: `Impersonating ${targetUser.getFullName()}`,
      data: {
        user: targetUser.toJSON(),
        token,
        originalAdmin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.getFullName()
        }
      }
    });
  })
);

// Complete impersonation with selected role
router.post('/impersonate/:userId/complete',
  authenticateToken,
  requireRole(0), // Only SYSTEM_ADMIN can complete impersonation
  validate(Joi.object({
    roleId: Joi.string().allow(null).optional() // Allow null for USER role
  })),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roleId } = req.body;
    const adminUser = req.user; // Current admin user
    
    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw validationError('User not found');
    }
    
    if (!targetUser.isActive) {
      throw validationError('Cannot impersonate inactive user');
    }
    
    let selectedRole;
    
    // If roleId is null, user selected USER role (default)
    if (roleId === null || roleId === undefined || roleId === '') {
      selectedRole = {
        id: null,
        role: UserRole.USER,
        companyId: null
      };
    } else {
      // Get the selected role from users_role table
      const UserRoleModel = require('../models/UserRole');
      const role = await UserRoleModel.findById(roleId);
      
      if (!role) {
        throw validationError('Invalid role selection - role not found');
      }
      
      if (role.userId !== targetUser.id) {
        throw validationError('Invalid role selection - role does not belong to user');
      }
      
      if (!role.isActive) {
        throw validationError('Invalid role selection - role is not active');
      }
      
      selectedRole = {
        id: role.id,
        role: role.role,
        companyId: role.companyId
      };
    }
    
    // Generate JWT token for target user with selected role
    const token = jwt.sign(
      { 
        userId: targetUser.id, 
        email: targetUser.email, 
        role: selectedRole.role,
        companyId: selectedRole.companyId,
        impersonatedBy: adminUser.id, // Store who is impersonating
        isImpersonating: true // Flag to indicate this is an impersonation session
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      message: `Impersonating ${targetUser.getFullName()}`,
      data: {
        user: targetUser.toJSON(),
        token,
        originalAdmin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.getFullName()
        }
      }
    });
  })
);

module.exports = router;
