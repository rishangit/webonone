const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Get current role from JWT token (priority) or users_role table
    // The JWT token contains the selected role from login
    const { UserRole: UserRoleEnum } = require('../types/user');
    
    // Get companyId from users_role table (always, since users table no longer has companyId)
    let userCompanyId = null;
    try {
      const UserRole = require('../models/UserRole');
      if (decoded.roleId) {
        // Get companyId from the selected role
        const selectedRole = await UserRole.findById(decoded.roleId);
        if (selectedRole && selectedRole.userId === user.id) {
          userCompanyId = selectedRole.companyId;
        }
      } else if (decoded.companyId) {
        // Use companyId from token if available
        userCompanyId = decoded.companyId;
      } else {
        // Get default role's companyId
        const defaultRole = await UserRole.getDefaultRole(user.id);
        if (defaultRole) {
          userCompanyId = defaultRole.companyId;
        }
      }
    } catch (error) {
      console.warn('Could not get companyId from users_role table:', error.message);
    }

    if (decoded.role !== undefined && decoded.role !== null) {
      // Use role from JWT token (this is the role selected during login)
      user.role = decoded.role;
      user.roleLevel = decoded.role;
      user.companyId = userCompanyId;
    } else if (decoded.roleId) {
      // Fallback: Get role from users_role table using roleId from token
      try {
        const UserRole = require('../models/UserRole');
        const selectedRole = await UserRole.findById(decoded.roleId);
        if (selectedRole && selectedRole.userId === user.id) {
          user.role = selectedRole.role;
          user.roleLevel = selectedRole.role;
          user.companyId = selectedRole.companyId || userCompanyId;
        } else {
          // If role not found, default to USER
          user.role = UserRoleEnum.USER;
          user.roleLevel = UserRoleEnum.USER;
          user.companyId = userCompanyId;
        }
      } catch (error) {
        // If users_role table doesn't exist or error, use default
        console.warn('Could not get role from users_role table:', error.message);
        user.role = UserRoleEnum.USER;
        user.roleLevel = UserRoleEnum.USER;
        user.companyId = userCompanyId;
      }
    } else if (!user.role || user.role === null) {
      // If user.role is null and no role in token, try to get from users_role table
      try {
        const currentRole = await User.getCurrentRole(user.id, userCompanyId);
        user.role = currentRole;
        user.roleLevel = currentRole;
        user.companyId = userCompanyId;
      } catch (error) {
        // Fallback to USER role
        user.role = UserRoleEnum.USER;
        user.roleLevel = UserRoleEnum.USER;
        user.companyId = userCompanyId;
      }
    } else {
      // Ensure companyId is set even if role is already set
      user.companyId = userCompanyId;
    }
    
    // Ensure role is never null - default to USER if still null
    if (user.role === null || user.role === undefined) {
      user.role = UserRoleEnum.USER;
      user.roleLevel = UserRoleEnum.USER;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Check if user has required role level
const requireRole = (minRoleLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.roleLevel > minRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user has specific permission (now role-based)
// Maps permissions to role levels for backward compatibility
const requirePermission = (permission) => {
  // Map permissions to role levels
  const permissionToRole = {
    'manage_system': 0,        // SYSTEM_ADMIN
    'manage_company': 1,       // COMPANY_OWNER
    'manage_staff': 1,         // COMPANY_OWNER
    'view_analytics': 1,       // COMPANY_OWNER
    'manage_appointments': 2,  // STAFF_MEMBER or COMPANY_OWNER (<= 1)
    'process_payments': 2,     // STAFF_MEMBER or COMPANY_OWNER (<= 1)
    'manage_services': 1,      // COMPANY_OWNER
    'view_reports': 1,         // COMPANY_OWNER
    'view_client_info': 2,     // STAFF_MEMBER or COMPANY_OWNER (<= 1)
    'update_appointments': 2,  // STAFF_MEMBER or COMPANY_OWNER (<= 1)
    'view_schedule': 2,         // STAFF_MEMBER or COMPANY_OWNER (<= 1)
    'book_appointments': 3,     // USER or above
    'view_history': 3,          // USER or above
    'manage_profile': 3,        // USER or above
    'view_services': 3          // USER or above
  };

  const requiredRoleLevel = permissionToRole[permission] !== undefined 
    ? permissionToRole[permission] 
    : 3; // Default to USER if permission not found

  return requireRole(requiredRoleLevel);
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's role - check users_role table if role is null
    let userRoleLevel = req.user.roleLevel;
    if (userRoleLevel === undefined || userRoleLevel === null) {
      if (req.user.role !== undefined && req.user.role !== null) {
        userRoleLevel = req.user.role;
      } else if (req.user.id) {
        try {
          const User = require('../models/User');
          const currentRole = await User.getCurrentRole(req.user.id);
          userRoleLevel = currentRole;
          req.user.roleLevel = currentRole;
          req.user.role = currentRole;
        } catch (error) {
          userRoleLevel = 3; // Default to USER
        }
      } else {
        userRoleLevel = 3; // Default to USER
      }
    }
    
    // Super admins and company owners can access everything
    if (userRoleLevel <= 1) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your resource'
      });
    }

    next();
  };
};

// Check if user belongs to the same company
const requireSameCompany = (companyIdField = 'companyId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's role - check users_role table if role is null
    let userRoleLevel = req.user.roleLevel;
    if (userRoleLevel === undefined || userRoleLevel === null) {
      if (req.user.role !== undefined && req.user.role !== null) {
        userRoleLevel = req.user.role;
      } else if (req.user.id) {
        try {
          const User = require('../models/User');
          const currentRole = await User.getCurrentRole(req.user.id);
          userRoleLevel = currentRole;
          req.user.roleLevel = currentRole;
          req.user.role = currentRole;
        } catch (error) {
          userRoleLevel = 3; // Default to USER
        }
      } else {
        userRoleLevel = 3; // Default to USER
      }
    }
    
    // Super admins can access everything
    if (userRoleLevel === 0) {
      return next();
    }

    // Check if user has a company
    if (!req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Company access required'
      });
    }

    // Check if the resource belongs to the same company
    const resourceCompanyId = req.params[companyIdField] || req.body[companyIdField];
    if (resourceCompanyId && resourceCompanyId !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - different company'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  requireSameCompany,
  optionalAuth
};

