const Joi = require('joi');
const { AppointmentStatusValues, normalizeAppointmentStatus } = require('../constants/appointmentStatus');

// User validation schemas
const userSchemas = {
  create: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(255).required(),
    firstName: Joi.string().min(1).max(100).optional(),
    lastName: Joi.string().min(1).max(100).optional(),
    role: Joi.string().valid('Super Admin', 'Company Owner', 'Staff Member', 'User').required(),
    roleLevel: Joi.number().integer().min(0).max(3).required(),
    avatar: Joi.any().optional(), // No validation, accept any value
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional().allow(null),
    phone: Joi.any().optional(), // No backend validation, validated on frontend
    address: Joi.any().optional(), // No validation, accept any value
    dateOfBirth: Joi.date().optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      notifications: Joi.boolean().optional(),
      language: Joi.string().optional()
    }).optional(),
    // permissions removed - now using role-based access control
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional()
    // emergencyContact removed from users table (still in company_staff table)
  }),

  preCreate: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional().allow(null),
  }),

  update: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(255).optional(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('Super Admin', 'Company Owner', 'Staff Member', 'User').optional(),
    roleLevel: Joi.number().integer().min(0).max(3).optional(),
    avatar: Joi.any().optional(), // No validation, accept any value
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional().allow(null),
    phone: Joi.string().required().pattern(/^\+\d{1,4}\d{4,}$/).messages({
      'string.pattern.base': 'Phone number format is invalid. Please include country code and phone number (e.g., +1234567890)',
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number is required'
    }),
    address: Joi.any().optional(), // No validation, accept any value
    dateOfBirth: Joi.date().optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      notifications: Joi.boolean().optional(),
      language: Joi.string().optional()
    }).optional(),
    // permissions removed - now using role-based access control
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional()
    // emergencyContact removed from users table (still in company_staff table)
  })
};

// Appointment validation schemas
const appointmentSchemas = {
  create: Joi.object({
    clientId: Joi.string().required(),
    // Removed duplicate data fields - use IDs only
    // clientName, clientEmail, clientPhone - will be fetched from user table using clientId
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
    // Removed companyName - will be fetched from company table using companyId
    serviceId: Joi.string().optional(),
    // Removed serviceName - will be fetched from services table using serviceId
    staffId: Joi.string().optional(),
    // Use staffId to fetch staff data from company_staff table
    spaceId: Joi.string().optional(),
    // Removed spaceName - will be fetched from spaces table using spaceId
    date: Joi.date().iso().required(),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    duration: Joi.number().integer().min(15).max(480).required(), // 15 minutes to 8 hours
    status: Joi.alternatives().try(
      Joi.number().integer().valid(...AppointmentStatusValues),
      Joi.string().custom((value, helpers) => {
        // Use normalizeAppointmentStatus to validate any string format
        const normalized = normalizeAppointmentStatus(value);
        if (normalized === null) {
          const fieldName = helpers.state.path && helpers.state.path.length > 0 
            ? helpers.state.path[helpers.state.path.length - 1] 
            : 'status';
          return helpers.error('any.invalid', { 
            message: `"${fieldName}" does not match any of the allowed types` 
          });
        }
        return value; // Return original value, normalization happens in route handler
      })
    ).optional(),
    type: Joi.string().valid('Regular', 'Consultation', 'Follow-up', 'Emergency').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional(),
    price: Joi.number().precision(2).min(0).optional(),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Partially Paid', 'Refunded').optional(),
    paymentMethod: Joi.string().optional(),
    notes: Joi.string().max(1000).optional(),
    preferredStaffIds: Joi.array().items(Joi.string()).optional(),
    reminderSent: Joi.boolean().optional()
  }),

  update: Joi.object({
    clientId: Joi.string().optional(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
    serviceId: Joi.string().optional(),
    staffId: Joi.string().optional().allow(null),
    spaceId: Joi.string().optional(),
    clientName: Joi.string().min(2).max(255).optional(),
    clientEmail: Joi.string().email().optional(),
    clientPhone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    companyName: Joi.string().optional(),
    serviceName: Joi.string().optional(),
    providerName: Joi.string().optional(),
    spaceName: Joi.string().optional(),
    date: Joi.date().iso().optional(),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    duration: Joi.number().integer().min(15).max(480).optional(),
    status: Joi.alternatives().try(
      Joi.number().integer().valid(...AppointmentStatusValues),
      Joi.string().custom((value, helpers) => {
        // Use normalizeAppointmentStatus to validate any string format
        const normalized = normalizeAppointmentStatus(value);
        if (normalized === null) {
          const fieldName = helpers.state.path && helpers.state.path.length > 0 
            ? helpers.state.path[helpers.state.path.length - 1] 
            : 'status';
          return helpers.error('any.invalid', { 
            message: `"${fieldName}" does not match any of the allowed types` 
          });
        }
        return value; // Return original value, normalization happens in route handler
      })
    ).optional(),
    type: Joi.string().valid('Regular', 'Consultation', 'Follow-up', 'Emergency').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional(),
    price: Joi.number().precision(2).min(0).optional(),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Partially Paid', 'Refunded').optional(),
    paymentMethod: Joi.string().optional(),
    notes: Joi.string().max(1000).optional(),
    preferredStaffIds: Joi.array().items(Joi.string()).optional(),
    reminderSent: Joi.boolean().optional()
  }).min(1)
};

// Service validation schemas
const serviceSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    duration: Joi.number().integer().min(15).max(480).required(),
    price: Joi.number().precision(2).min(0).required(),
    category: Joi.string().min(2).max(100).required(),
    subcategory: Joi.string().min(2).max(100).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').optional(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
    provider: Joi.object({
      name: Joi.string().required(),
      avatar: Joi.string().uri().optional(),
      staffId: Joi.string().required()
    }).optional(),
    bookings: Joi.object({
      thisMonth: Joi.number().integer().min(0).optional(),
      revenue: Joi.number().precision(2).min(0).optional()
    }).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    image: Joi.string().uri().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    duration: Joi.number().integer().min(15).max(480).optional(),
    price: Joi.number().precision(2).min(0).optional(),
    category: Joi.string().min(2).max(100).optional(),
    subcategory: Joi.string().min(2).max(100).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').optional(),
    provider: Joi.object({
      name: Joi.string().required(),
      avatar: Joi.string().uri().optional(),
      staffId: Joi.string().required()
    }).optional(),
    bookings: Joi.object({
      thisMonth: Joi.number().integer().min(0).optional(),
      revenue: Joi.number().precision(2).min(0).optional()
    }).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    image: Joi.string().uri().optional()
  }).min(1)
};

// Category validation schemas
const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).allow('').optional(),
    icon: Joi.string().max(10).allow('').optional(),
    isActive: Joi.boolean().optional(),
    companyCount: Joi.number().integer().min(0).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    icon: Joi.string().max(10).allow('').optional(),
    isActive: Joi.boolean().optional(),
    companyCount: Joi.number().integer().min(0).optional()
  }).min(1)
};

// Subcategory validation schemas
const subcategorySchemas = {
  create: Joi.object({
    categoryId: Joi.number().integer().min(1).required(),
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).allow('').optional(),
    icon: Joi.string().max(10).allow('').optional(),
    isActive: Joi.boolean().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    icon: Joi.string().max(10).allow('').optional(),
    isActive: Joi.boolean().optional()
  }).min(1)
};

// Query parameter validation
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  userFilters: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional(),
    search: Joi.string().optional().allow(''),
    role: Joi.string().valid('Super Admin', 'Company Owner', 'Staff Member', 'User').optional(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
    isActive: Joi.boolean().optional()
  }),

  appointmentFilters: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(1000).optional(), // Increased max for dashboard stats
    clientId: Joi.string().optional(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
    staffId: Joi.string().optional(),
    status: Joi.alternatives().try(
      Joi.number().integer().valid(...AppointmentStatusValues),
      Joi.string().custom((value, helpers) => {
        // Use normalizeAppointmentStatus to validate any string format
        const normalized = normalizeAppointmentStatus(value);
        if (normalized === null) {
          const fieldName = helpers.state.path && helpers.state.path.length > 0 
            ? helpers.state.path[helpers.state.path.length - 1] 
            : 'status';
          return helpers.error('any.invalid', { 
            message: `"${fieldName}" does not match any of the allowed types` 
          });
        }
        return value; // Return original value, normalization happens in route handler
      })
    ).optional(),
    date: Joi.date().iso().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional()
  }),

  serviceFilters: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    companyId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').optional(),
    search: Joi.string().max(100).optional()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

// Validation functions for categories
const validateCategory = validate(categorySchemas.create);
const validateSubcategory = validate(subcategorySchemas.create);

module.exports = {
  userSchemas,
  appointmentSchemas,
  serviceSchemas,
  categorySchemas,
  subcategorySchemas,
  querySchemas,
  validate,
  validateCategory,
  validateSubcategory
};

