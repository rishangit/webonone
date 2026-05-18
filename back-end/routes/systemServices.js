const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Service = require('../models/Service');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, validationError, notFoundError } = require('../middleware/errorHandler');

const serviceSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().optional().allow('', null),
    images: Joi.array().items(Joi.string()).optional(),
    defaultDuration: Joi.number().integer().min(1).optional().allow(null),
    defaultPrice: Joi.number().min(0).optional().allow(null),
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().optional().allow('', null),
    images: Joi.array().items(Joi.string()).optional(),
    defaultDuration: Joi.number().integer().min(1).optional().allow(null),
    defaultPrice: Joi.number().min(0).optional().allow(null),
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    tagIds: Joi.array().items(Joi.string().length(10)).optional(),
  }).min(1),
};

async function serviceToClientJson(service) {
  const base = service.toJSON();
  try {
    const tags = await Service.getTags(service.id);
    base.tags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color || '#3B82F6',
      icon: tag.icon,
      description: tag.description,
      isActive: tag.isActive,
    }));
  } catch {
    base.tags = [];
  }
  return base;
}

router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const search = req.query.search || '';
    const isActive = req.query.isActive === undefined ? undefined : String(req.query.isActive) === 'true';
    const data = await Service.findAll({ page, limit, search, isActive });
    const count = await Service.countAll({ search, isActive });
    const withTags = await Promise.all(data.map((s) => serviceToClientJson(s)));
    res.json({ success: true, data: withTags, count });
  })
);

router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw notFoundError('System service');
    res.json({ success: true, data: await serviceToClientJson(service) });
  })
);

// `manage_company` (role level <= 1) lets COMPANY_OWNER and SYSTEM_ADMIN create system services.
// Only SYSTEM_ADMIN (role level 0) may control the `isVerified` flag — entries submitted by
// company owners always land as **unverified** for later admin review (mirrors how system
// products are created via `AddProductToCompanyDialog`).
router.post(
  '/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = serviceSchema.create.validate(req.body);
    if (error) throw validationError(error.details[0].message);
    const { tagIds, ...rest } = value;
    const isSystemAdmin = Number(req.user?.roleLevel) === 0;
    rest.isVerified = isSystemAdmin
      ? (rest.isVerified === undefined ? true : Boolean(rest.isVerified))
      : false;
    const created = await Service.create(rest);
    if (tagIds && tagIds.length > 0) {
      await Service.setTags(created.id, tagIds);
    }
    res.status(201).json({ success: true, data: await serviceToClientJson(created) });
  })
);

router.put(
  '/:id',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = serviceSchema.update.validate(req.body);
    if (error) throw validationError(error.details[0].message);
    const existing = await Service.findById(req.params.id);
    if (!existing) throw notFoundError('System service');
    const { tagIds, ...rest } = value;
    // Only SYSTEM_ADMIN can toggle `isVerified`; silently drop the field for everyone else.
    if (Number(req.user?.roleLevel) !== 0) {
      delete rest.isVerified;
    }
    if (Object.keys(rest).length > 0) {
      await Service.update(req.params.id, rest);
    }
    if (tagIds !== undefined) {
      await Service.setTags(req.params.id, tagIds || []);
    }
    const final = await Service.findById(req.params.id);
    res.json({ success: true, data: await serviceToClientJson(final) });
  })
);

module.exports = router;
