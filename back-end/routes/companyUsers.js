const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { authenticateToken, requireRole, requireSameCompany } = require('../middleware/auth');
const { asyncHandler, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Simple body validation schema
const addCompanyUserSchema = Joi.object({
  userId: Joi.string().required(),
});

// Local validation middleware for this route (keeps it self-contained)
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Add an existing user as a company client.
 * This creates or updates a record in the company_users table.
 *
 * Access:
 * - Super Admins
 * - Company Owners for their own company
 */
router.post(
  '/company/:companyId/add-user',
  authenticateToken,
  requireRole(1), // Company owners and above
  requireSameCompany('companyId'),
  validateBody(addCompanyUserSchema),
  asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { userId } = req.body;

    // Ensure the target user exists
    const user = await User.findById(userId);
    if (!user) {
      throw validationError('User not found');
    }

    try {
      const { addOrUpdateCompanyUser } = require('../utils/companyUsers');

      // Use a generic interaction type so we don't change appointment/sale counters
      await addOrUpdateCompanyUser(companyId, userId, 'manual', 0);
    } catch (error) {
      console.error('[CompanyUsers] Error adding user via API:', error);
      throw validationError('Failed to add user to company');
    }

    return res.json({
      success: true,
      message: 'User added to company clients successfully',
      data: user,
    });
  })
);

module.exports = router;

