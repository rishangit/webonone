const express = require('express');
const router = express.Router();
const CompanyWebHeader = require('../models/CompanyWebHeader');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const headerSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    isDefault: Joi.boolean().optional(),
    content: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()).allow(null).optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    isDefault: Joi.boolean().optional(),
    content: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()).allow(null).optional(),
  }).min(1),
};

/** Public: default header for a company (used on published site layout) */
router.get(
  '/public/:companyId/default',
  asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    const header = await CompanyWebHeader.findDefaultByCompanyId(companyId);
    res.json({
      success: true,
      data: header ? header.toJSON() : null,
    });
  })
);

router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    const headers = await CompanyWebHeader.findByCompanyId(companyId);
    res.json({
      success: true,
      data: headers.map((h) => h.toJSON()),
    });
  })
);

router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const header = await CompanyWebHeader.findById(id);
    if (!header) {
      throw notFoundError('Header not found');
    }
    res.json({ success: true, data: header.toJSON() });
  })
);

router.post(
  '/',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { error, value } = headerSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    const emptyContent = { blocks: [], html: '', css: '', js: '' };
    const payload = {
      ...value,
      content: value.content !== undefined ? value.content : emptyContent,
    };
    const header = await CompanyWebHeader.create(payload);
    res.status(201).json({
      success: true,
      message: 'Header created successfully',
      data: header.toJSON(),
    });
  })
);

router.put(
  '/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, value } = headerSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    const header = await CompanyWebHeader.update(id, value);
    if (!header) {
      throw notFoundError('Header not found');
    }
    res.json({
      success: true,
      message: 'Header updated successfully',
      data: header.toJSON(),
    });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await CompanyWebHeader.delete(id);
    if (!deleted) {
      throw notFoundError('Header not found');
    }
    res.json({ success: true, message: 'Header deleted successfully' });
  })
);

module.exports = router;
