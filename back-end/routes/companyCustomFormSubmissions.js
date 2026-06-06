const express = require('express');
const router = express.Router();
const CompanyCustomForm = require('../models/CompanyCustomForm');
const CompanyCustomFormSubmission = require('../models/CompanyCustomFormSubmission');
const Appointment = require('../models/Appointment');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const submissionSchema = {
  create: Joi.object({
    companyId: Joi.string().length(10).required(),
    formId: Joi.string().length(10).required(),
    appointmentId: Joi.string().length(10).required(),
    clientId: Joi.string().length(10).allow(null).optional(),
    values: Joi.object().required(),
  }),
};

function scopeCompanyId(req) {
  if (req.user.roleLevel > 0 && req.user.companyId) {
    return req.user.companyId;
  }
  return req.query.companyId || req.body.companyId;
}

function assertSubmissionCompanyAccess(req, submission) {
  if (!submission) {
    throw notFoundError('Form submission not found');
  }
  if (req.user.roleLevel > 0 && req.user.companyId && submission.companyId !== req.user.companyId) {
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
    const { appointmentId, formId } = req.query;
    const companyId = scopeCompanyId(req);

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId is required',
      });
    }

    if (req.user.roleLevel > 0 && req.user.companyId && companyId && companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let submissions = await CompanyCustomFormSubmission.findByAppointmentId(
      appointmentId,
      companyId || undefined
    );

    if (formId) {
      submissions = submissions.filter((s) => s.formId === formId);
    }

    res.json({
      success: true,
      data: submissions.map((s) => s.toJSON()),
    });
  })
);

router.get(
  '/:id',
  authenticateToken,
  requireRole(2),
  asyncHandler(async (req, res) => {
    const submission = await CompanyCustomFormSubmission.findById(req.params.id);
    assertSubmissionCompanyAccess(req, submission);
    res.json({ success: true, data: submission.toJSON() });
  })
);

router.post(
  '/',
  authenticateToken,
  requireRole(2),
  asyncHandler(async (req, res) => {
    const { error, value } = submissionSchema.create.validate(req.body);
    if (error) {
      throw validationError(error.details[0].message);
    }

    if (req.user.roleLevel > 0 && req.user.companyId && value.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const form = await CompanyCustomForm.findById(value.formId);
    if (!form || form.companyId !== value.companyId) {
      throw notFoundError('Custom form not found');
    }
    if (!form.isActive) {
      throw validationError('This form is not active');
    }

    const appointment = await Appointment.findById(value.appointmentId);
    if (!appointment || appointment.companyId !== value.companyId) {
      throw notFoundError('Appointment not found');
    }

    const clientId = value.clientId ?? appointment.clientId ?? null;

    const submission = await CompanyCustomFormSubmission.create({
      companyId: value.companyId,
      formId: value.formId,
      appointmentId: value.appointmentId,
      clientId,
      submittedByUserId: req.user.id,
      values: value.values,
    });

    res.status(201).json({
      success: true,
      message: 'Form submission saved successfully',
      data: submission.toJSON(),
    });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(2),
  asyncHandler(async (req, res) => {
    const existing = await CompanyCustomFormSubmission.findById(req.params.id);
    assertSubmissionCompanyAccess(req, existing);
    const deleted = await CompanyCustomFormSubmission.delete(req.params.id);
    if (!deleted) {
      throw notFoundError('Form submission not found');
    }
    res.json({ success: true, message: 'Form submission deleted successfully' });
  })
);

module.exports = router;
