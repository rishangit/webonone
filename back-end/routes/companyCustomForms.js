const express = require('express');
const router = express.Router();
const CompanyCustomForm = require('../models/CompanyCustomForm');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const fieldLayoutSchema = Joi.object({
  gridRowStart: Joi.number().integer().min(1).required(),
  gridColumnStart: Joi.number().integer().min(1).max(12).required(),
  rowSpan: Joi.number().integer().min(1).required(),
  colSpan: Joi.number().integer().min(1).max(12).required(),
});

const fieldOptionSchema = Joi.object({
  id: Joi.string().optional(),
  label: Joi.string().required(),
  value: Joi.string().required(),
});

const fieldSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string()
    .valid('text', 'textarea', 'checkbox', 'radio', 'dropdown', 'date', 'number')
    .required(),
  label: Joi.string().required(),
  placeholder: Joi.string().allow('', null).optional(),
  required: Joi.boolean().optional(),
  validation: Joi.object().optional(),
  layout: fieldLayoutSchema.required(),
  zIndex: Joi.number().integer().optional(),
  options: Joi.array().items(fieldOptionSchema).optional(),
  display: Joi.string().valid('inline', 'vertical').optional(),
});

const definitionSchema = Joi.object({
  version: Joi.number().integer().valid(1).required(),
  canvas: Joi.object({
    minHeightPx: Joi.number().integer().min(200).optional(),
    rowHeightPx: Joi.number().integer().min(20).optional(),
  }).optional(),
  fields: Joi.array().items(fieldSchema).required(),
});

const formSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().allow('', null).optional(),
    isActive: Joi.boolean().optional(),
    definition: definitionSchema.optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().allow('', null).optional(),
    isActive: Joi.boolean().optional(),
    definition: definitionSchema.optional(),
  }).min(1),
};

function scopeCompanyId(req) {
  if (req.user.roleLevel > 0 && req.user.companyId) {
    return req.user.companyId;
  }
  return req.query.companyId || req.body.companyId;
}

function assertFormCompanyAccess(req, form) {
  if (!form) {
    throw notFoundError('Custom form not found');
  }
  if (req.user.roleLevel > 0 && req.user.companyId && form.companyId !== req.user.companyId) {
    const err = new Error('Access denied - different company');
    err.statusCode = 403;
    throw err;
  }
}

router.get(
  '/',
  authenticateToken,
  requireRole(2),
  asyncHandler(async (req, res) => {
    const companyId = scopeCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    if (req.user.roleLevel > 0 && req.user.companyId && companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const activeOnly = req.query.activeOnly === 'true' || req.query.activeOnly === '1';
    const forms = await CompanyCustomForm.findByCompanyId(companyId, { activeOnly });
    res.json({
      success: true,
      data: forms.map((f) => f.toJSON()),
    });
  })
);

router.post(
  '/',
  authenticateToken,
  requireRole(1),
  asyncHandler(async (req, res) => {
    const { error, value } = formSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    if (req.user.roleLevel > 0 && req.user.companyId && value.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const form = await CompanyCustomForm.create(value);
    res.status(201).json({
      success: true,
      message: 'Custom form created successfully',
      data: form.toJSON(),
    });
  })
);

router.post(
  '/:id/duplicate',
  authenticateToken,
  requireRole(1),
  asyncHandler(async (req, res) => {
    const existing = await CompanyCustomForm.findById(req.params.id);
    assertFormCompanyAccess(req, existing);
    const duplicated = await CompanyCustomForm.duplicate(req.params.id);
    if (!duplicated) {
      throw notFoundError('Custom form not found');
    }
    res.status(201).json({
      success: true,
      message: 'Custom form duplicated successfully',
      data: duplicated.toJSON(),
    });
  })
);

router.get(
  '/:id',
  authenticateToken,
  requireRole(2),
  asyncHandler(async (req, res) => {
    const form = await CompanyCustomForm.findById(req.params.id);
    assertFormCompanyAccess(req, form);
    res.json({ success: true, data: form.toJSON() });
  })
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(1),
  asyncHandler(async (req, res) => {
    const existing = await CompanyCustomForm.findById(req.params.id);
    assertFormCompanyAccess(req, existing);
    const { error, value } = formSchema.update.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }
    const form = await CompanyCustomForm.update(req.params.id, value);
    if (!form) {
      throw notFoundError('Custom form not found');
    }
    res.json({
      success: true,
      message: 'Custom form updated successfully',
      data: form.toJSON(),
    });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(1),
  asyncHandler(async (req, res) => {
    const existing = await CompanyCustomForm.findById(req.params.id);
    assertFormCompanyAccess(req, existing);
    const deleted = await CompanyCustomForm.delete(req.params.id);
    if (!deleted) {
      throw notFoundError('Custom form not found');
    }
    res.json({ success: true, message: 'Custom form deleted successfully' });
  })
);

module.exports = router;
