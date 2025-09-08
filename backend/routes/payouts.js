const express = require('express');
const { body } = require('express-validator');
const {
  getPayouts,
  getPayout,
  createPayout,
  updatePayoutStatus,
  bulkUpdatePayouts,
  processPayout
} = require('../controllers/payouts');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All payout routes require authentication and admin role
router.use(protect, authorize('admin', 'super_admin'));

// @desc    Get all payouts
// @route   GET /api/v1/payouts
// @access  Private (Admin)
router.get('/', getPayouts);

// @desc    Get single payout
// @route   GET /api/v1/payouts/:id
// @access  Private (Admin)
router.get('/:id', getPayout);

// @desc    Create payout
// @route   POST /api/v1/payouts
// @access  Private (Admin)
router.post('/', [
  body('seller').isMongoId().withMessage('Valid seller ID is required'),
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('amount').custom(value => value > 0).withMessage('Amount must be positive'),
  body('paymentMethod').isIn(['bank_transfer', 'card', 'cash', 'crypto']).withMessage('Invalid payment method'),
  body('orders').optional().isArray().withMessage('Orders must be an array'),
  body('orders.*').optional().isMongoId().withMessage('Invalid order ID')
], createPayout);

// @desc    Update payout status
// @route   PATCH /api/v1/payouts/:id/status
// @access  Private (Admin)
router.patch('/:id/status', [
  body('status').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
], updatePayoutStatus);

// @desc    Process payout
// @route   POST /api/v1/payouts/:id/process
// @access  Private (Admin)
router.post('/:id/process', processPayout);

// @desc    Bulk update payouts
// @route   POST /api/v1/payouts/bulk-update
// @access  Private (Admin)
router.post('/bulk-update', [
  body('ids').isArray().withMessage('IDs must be an array'),
  body('ids.*').isMongoId().withMessage('Invalid payout ID'),
  body('status').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
], bulkUpdatePayouts);

module.exports = router;




