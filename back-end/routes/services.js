const express = require('express');
const router = express.Router();
const CompanyService = require('../models/CompanyService');
const { pool } = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const defaultProductEntrySchema = Joi.object({
  companyProductId: Joi.string().length(10).required(),
  // Allow fractional positive quantities to match POS cart behaviour (e.g. 0.1, 1.5).
  quantity: Joi.number().positive().required(),
  // Optional row discount (0-100) carried from the wizard UI; backend tolerates but does not require it.
  discount: Joi.number().min(0).max(100).optional(),
});

// Service validation schema
const serviceSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    systemServiceId: Joi.string().length(10).optional().allow('', null),
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().optional().allow('', null),
    duration: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    images: Joi.array().items(Joi.string()).optional(),
    defaultProducts: Joi.array().items(defaultProductEntrySchema).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }).or('name', 'systemServiceId'),
  update: Joi.object({
    systemServiceId: Joi.string().length(10).optional().allow('', null),
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().optional().allow('', null),
    duration: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    images: Joi.array().items(Joi.string()).optional(),
    defaultProducts: Joi.array().items(defaultProductEntrySchema).optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }).min(1),
};

// Get all services
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.query.companyId = req.user.companyId;
    }

    if (req.query.companyId && req.query.companyId.length !== 10) {
      throw validationError('Invalid companyId format');
    }

    const hasPagination =
      req.query.limit !== undefined || req.query.offset !== undefined || req.query.page !== undefined;

    if (hasPagination) {
      const limit = parseInt(req.query.limit, 10) || 12;
      const page = parseInt(req.query.page, 10) || 1;
      const offset = parseInt(req.query.offset, 10) || (page - 1) * limit;

      const options = {
        limit,
        offset,
        search: req.query.search || '',
        companyId: req.query.companyId,
        status: req.query.status,
      };

      const result = await CompanyService.findAllPaginated(options);

      res.json({
        success: true,
        data: result.services,
        pagination: result.pagination,
      });
    } else {
      const options = {
        companyId: req.query.companyId,
        status: req.query.status,
      };
      const services = await CompanyService.findAll(options);

      res.json({
        success: true,
        data: services,
        count: services.length,
      });
    }
  })
);

// Get service by ID
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const service = await CompanyService.findById(req.params.id);

    if (!service) {
      throw notFoundError('Service');
    }

    if (req.user.roleLevel > 0) {
      if (req.user.companyId && service.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }

    res.json({
      success: true,
      data: service,
    });
  })
);

// Create new service
router.post(
  '/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = serviceSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }

    if (req.user.roleLevel > 0 && req.user.companyId) {
      value.companyId = req.user.companyId;
    }

    if (req.user.roleLevel > 0) {
      if (value.companyId !== req.user.companyId) {
        throw validationError('Access denied - cannot create service for different company');
      }
    }

    try {
      const service = await CompanyService.create(value);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (e) {
      if (e.message && (e.message.includes('Company product') || e.message.includes('systemServiceId') || e.message.includes('Service name is required'))) {
        throw validationError(e.message);
      }
      throw e;
    }
  })
);

// Update service
router.put(
  '/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = serviceSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }

    const [serviceRows] = await pool.execute('SELECT * FROM company_services WHERE id = ?', [req.params.id]);

    if (serviceRows.length === 0) {
      throw notFoundError('Service');
    }

    if (req.user.roleLevel > 0) {
      if (req.user.companyId && serviceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }

    try {
      const service = new CompanyService(serviceRows[0]);
      const updatedService = await service.update(value);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: updatedService,
      });
    } catch (e) {
      if (e.message && (e.message.includes('Company product') || e.message.includes('systemServiceId') || e.message.includes('Service name is required'))) {
        throw validationError(e.message);
      }
      throw e;
    }
  })
);

// Delete service
router.delete(
  '/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const [serviceRows] = await pool.execute('SELECT companyId FROM company_services WHERE id = ?', [
      req.params.id,
    ]);

    if (serviceRows.length === 0) {
      throw notFoundError('Service');
    }

    if (req.user.roleLevel > 0) {
      if (req.user.companyId && serviceRows[0].companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }

    await CompanyService.delete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  })
);

module.exports = router;
