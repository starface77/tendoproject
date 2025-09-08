const express = require('express');
const { body } = require('express-validator');
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  updateCustomerStatus,
  getCustomerStats
} = require('../controllers/customers');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All customer routes require authentication and admin role
router.use(protect, authorize('admin', 'super_admin'));

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private (Admin)
router.get('/', [
  // Add validation for query params if needed
], getCustomers);

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private (Admin)
router.get('/:id', getCustomer);

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private (Admin)
router.put('/:id', [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().matches(/^\+998[0-9]{9}$/).withMessage('Invalid phone format')
], updateCustomer);

// @desc    Update customer status
// @route   PATCH /api/v1/customers/:id/status
// @access  Private (Admin)
router.patch('/:id/status', [
  body('status').isIn(['active', 'inactive', 'blocked']).withMessage('Invalid status')
], updateCustomerStatus);

// @desc    Get customer statistics
// @route   GET /api/v1/customers/stats
// @access  Private (Admin)
router.get('/stats/overview', getCustomerStats);

module.exports = router;




