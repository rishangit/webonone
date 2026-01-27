const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Appointment = require('../models/Appointment');
const Sale = require('../models/Sale');
const { authenticateToken, requireRole, requirePermission, requireSameCompany } = require('../middleware/auth');
const { validate, appointmentSchemas, querySchemas } = require('../middleware/validation');
const { asyncHandler, notFoundError, validationError } = require('../middleware/errorHandler');
const { AppointmentStatus, AppointmentStatusValues, normalizeAppointmentStatus } = require('../constants/appointmentStatus');

// Get all appointments (with pagination and filters)
router.get('/',
  authenticateToken,
  validate(querySchemas.appointmentFilters, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, clientId, companyId, staffId, status, date, dateFrom, dateTo, search } = req.query;
    
    // If user is not super admin, filter by their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.query.companyId = req.user.companyId;
    }
    
    const options = { page, limit, clientId, companyId, staffId, status, date, dateFrom, dateTo, search };
    const result = await Appointment.findAll(options);
    
    // Get appointment statistics (filter by company if not super admin)
    const filterCompanyId = req.user.roleLevel > 0 && req.user.companyId ? req.user.companyId : companyId;
    const stats = await Appointment.getStats(filterCompanyId);
    
    res.json({
      success: true,
      data: result.appointments || result,
      pagination: result.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Array.isArray(result) ? result.length : 0
      },
      stats
    });
  })
);

// Get appointment by ID
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      throw notFoundError('Appointment');
    }
    
    // Check if user has access to this appointment
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && appointment.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
      if (req.user.roleLevel === 3 && appointment.clientId !== req.user.id) {
        throw validationError('Access denied - not your appointment');
      }
    }
    
    res.json({
      success: true,
      data: appointment
    });
  })
);

// Create new appointment
router.post('/',
  authenticateToken,
  requirePermission('manage_appointments'),
  validate(appointmentSchemas.create),
  asyncHandler(async (req, res) => {
    // If user is not super admin, set companyId to their company
    if (req.user.roleLevel > 0 && req.user.companyId) {
      req.body.companyId = req.user.companyId;
    }
    
    // Normalize status to use enum value
    if (req.body.status) {
      req.body.status = normalizeAppointmentStatus(req.body.status) || AppointmentStatus.PENDING;
    } else {
      req.body.status = AppointmentStatus.PENDING;
    }
    
    const appointmentId = await Appointment.create(req.body);
    const appointment = await Appointment.findById(appointmentId);
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  })
);

// Update appointment
router.put('/:id',
  authenticateToken,
  requirePermission('manage_appointments'),
  validate(appointmentSchemas.update),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      throw notFoundError('Appointment');
    }
    
    // Check if user has access to this appointment
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && appointment.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    // Normalize status to use enum value if provided
    if (req.body.status) {
      req.body.status = normalizeAppointmentStatus(req.body.status);
      if (!req.body.status || !AppointmentStatusValues.includes(req.body.status)) {
        throw validationError(`Invalid status. Must be one of: ${AppointmentStatusValues.join(', ')}`);
      }
    }
    
    await appointment.update(req.body);
    
    // Refetch the appointment to get all related data (staff, client, etc.)
    const updatedAppointment = await Appointment.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  })
);

// Delete appointment
router.delete('/:id',
  authenticateToken,
  requirePermission('manage_appointments'),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      throw notFoundError('Appointment');
    }
    
    // Check if user has access to this appointment
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && appointment.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    const deleted = await Appointment.delete(req.params.id);
    
    if (!deleted) {
      throw notFoundError('Appointment');
    }
    
    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  })
);

// Get appointment statistics
router.get('/stats/overview',
  authenticateToken,
  requireRole(1), // Company owners and above
  asyncHandler(async (req, res) => {
    const stats = await Appointment.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  })
);

// Get appointments by date range
router.get('/range/:startDate/:endDate',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.params;
    const { companyId } = req.query;
    
    // If user is not super admin, filter by their company
    let filterCompanyId = companyId;
    if (req.user.roleLevel > 0 && req.user.companyId) {
      filterCompanyId = req.user.companyId;
    }
    
    const appointments = await Appointment.getByDateRange(startDate, endDate, filterCompanyId);
    
    res.json({
      success: true,
      data: appointments
    });
  })
);

// Get appointments for a specific user
router.get('/user/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status, limit = 10 } = req.query;
    
    // Check if user has access to these appointments
    if (req.user.roleLevel > 0) {
      if (req.user.roleLevel === 3 && req.user.id !== userId) {
        throw validationError('Access denied - can only view your own appointments');
      }
    }
    
    const options = { status, limit };
    const appointments = await Appointment.getByUserId(userId, options);
    
    res.json({
      success: true,
      data: appointments
    });
  })
);

// Update appointment status
router.patch('/:id/status',
  authenticateToken,
  requirePermission('manage_appointments'),
  asyncHandler(async (req, res) => {
    // Normalize status value to match enum values (case-insensitive)
    const normalizedStatus = normalizeAppointmentStatus(req.body.status);
    
    // Validate normalized status
    if (!normalizedStatus || !AppointmentStatusValues.includes(normalizedStatus)) {
      throw validationError(`Invalid status. Must be one of: ${AppointmentStatusValues.join(', ')}`);
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      throw notFoundError('Appointment');
    }
    
    // Check if user has access to this appointment
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && appointment.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    await appointment.update({ status: normalizedStatus });
    
    // If completing appointment, save to history
    if (normalizedStatus === AppointmentStatus.COMPLETED) {
      console.log('[Appointments] Status updated to Completed, checking for completionData');
      console.log('[Appointments] req.body.completionData:', req.body.completionData);
      
      if (req.body.completionData) {
        const completionData = req.body.completionData;
        const appointmentData = await Appointment.findById(req.params.id);
        
        console.log('[Appointments] Saving appointment history for appointment:', appointment.id);
      
      // Extract services and products from billing items - store only IDs and essential data
      console.log('[Appointments] completionData.billingItems:', JSON.stringify(completionData.billingItems, null, 2));
      
      const servicesUsed = completionData.billingItems
        ?.filter(item => item.type === 'service' && item.serviceId)
        .map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Store price at time of sale for historical accuracy
          discount: item.discount || 0
        })) || [];
      
      const productsUsed = completionData.billingItems
        ?.filter(item => item.type === 'product' && item.variantId) // variantId is required for products
        .map(item => ({
          // productId is not stored - get from variant when needed
          variantId: item.variantId, // variantId is required
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Store price at time of sale for historical accuracy
          discount: item.discount || 0
        })) || [];
      
      console.log('[Appointments] Extracted servicesUsed:', JSON.stringify(servicesUsed, null, 2));
      console.log('[Appointments] Extracted productsUsed:', JSON.stringify(productsUsed, null, 2));
      
      // Get space details
      const spaceName = appointmentData.spaceName || null;
      
        try {
          // staffId is always the logged-in user (person making the sale/completing appointment)
          // userId is the customer (from appointment.clientId)
          const sale = await Sale.create({
            userId: appointment.clientId, // Customer from appointment
            companyId: appointment.companyId,
            staffId: req.user.id, // Always the logged-in user making the sale
            // serviceId and spaceId are not stored in sales - they're in the appointment table
            servicesUsed: servicesUsed,
            productsUsed: productsUsed,
            totalAmount: completionData.totalAmount || 0,
            subtotal: completionData.totalAmount || 0,
            discountAmount: 0
          });
          
          // Update appointment with saleId
          await appointment.update({ saleId: sale.id });
          
          console.log('[Appointments] Sale saved successfully and appointment updated with saleId');
        } catch (saleError) {
          console.error('[Appointments] Error saving sale:', saleError);
          // Don't fail the status update if sale save fails
        }
      } else {
        console.log('[Appointments] No completionData provided, skipping history save');
      }
    }
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  })
);

// Update appointment payment status
router.patch('/:id/payment',
  authenticateToken,
  requirePermission('process_payments'),
  validate(Joi.object({
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Partially Paid', 'Refunded').required(),
    paymentMethod: Joi.string().optional()
  })),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      throw notFoundError('Appointment');
    }
    
    // Check if user has access to this appointment
    if (req.user.roleLevel > 0) {
      if (req.user.companyId && appointment.companyId !== req.user.companyId) {
        throw validationError('Access denied - different company');
      }
    }
    
    const updateData = { paymentStatus: req.body.paymentStatus };
    if (req.body.paymentMethod) {
      updateData.paymentMethod = req.body.paymentMethod;
    }
    
    await appointment.update(updateData);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: appointment
    });
  })
);

// Get today's appointments
router.get('/today/list',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { companyId } = req.query;
    
    // If user is not super admin, filter by their company
    let filterCompanyId = companyId;
    if (req.user.roleLevel > 0 && req.user.companyId) {
      filterCompanyId = req.user.companyId;
    }
    
    const appointments = await Appointment.findAll({
      date: today,
      companyId: filterCompanyId,
      limit: 50
    });
    
    res.json({
      success: true,
      data: appointments
    });
  })
);

// Get upcoming appointments
router.get('/upcoming/list',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { limit = 10 } = req.query;
    
    // If user is not super admin, filter by their company
    let options = { dateFrom: today, limit };
    if (req.user.roleLevel > 0 && req.user.companyId) {
      options.companyId = req.user.companyId;
    }
    
    const appointments = await Appointment.findAll(options);
    
    res.json({
      success: true,
      data: appointments
    });
  })
);

module.exports = router;
