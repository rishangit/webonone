const express = require('express');
const router = express.Router();
const CompanyWebFooter = require('../models/CompanyWebFooter');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const footerSchema = {
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

/** Public: default footer for a company (used on published site layout) */
router.get(
  '/public/:companyId/default',
  asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    const footer = await CompanyWebFooter.findDefaultByCompanyId(companyId);
    res.json({
      success: true,
      data: footer ? footer.toJSON() : null,
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
    const footers = await CompanyWebFooter.findByCompanyId(companyId);
    res.json({
      success: true,
      data: footers.map((f) => f.toJSON()),
    });
  })
);

router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const footer = await CompanyWebFooter.findById(id);
    if (!footer) {
      throw notFoundError('Footer not found');
    }
    res.json({ success: true, data: footer.toJSON() });
  })
);

router.post(
  '/',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { error, value } = footerSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    const emptyContent = { blocks: [], html: '', css: '', js: '' };
    const payload = {
      ...value,
      content: value.content !== undefined ? value.content : emptyContent,
    };
    const footer = await CompanyWebFooter.create(payload);
    res.status(201).json({
      success: true,
      message: 'Footer created successfully',
      data: footer.toJSON(),
    });
  })
);

router.put(
  '/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, value } = footerSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    const footer = await CompanyWebFooter.update(id, value);
    if (!footer) {
      throw notFoundError('Footer not found');
    }
    res.json({
      success: true,
      message: 'Footer updated successfully',
      data: footer.toJSON(),
    });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  requirePermission(['SYSTEM_ADMIN', 'COMPANY_OWNER']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await CompanyWebFooter.delete(id);
    if (!deleted) {
      throw notFoundError('Footer not found');
    }
    res.json({ success: true, message: 'Footer deleted successfully' });
  })
);

module.exports = router;
