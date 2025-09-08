const express = require('express');
const { body } = require('express-validator');
const {
  getInventory,
  adjustStock,
  exportInventory,
  bulkUpdateInventoryStatus
} = require('../controllers/inventory');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All inventory routes require authentication and admin role
router.use(protect, authorize('admin', 'super_admin'));

// @desc    Get inventory
// @route   GET /api/v1/inventory
// @access  Private (Admin)
router.get('/', getInventory);

// @desc    Adjust stock
// @route   POST /api/v1/inventory/:id/adjust
// @access  Private (Admin)
router.post('/:id/adjust', [
  body('quantity').isNumeric().withMessage('Quantity must be numeric'),
  body('reason').notEmpty().withMessage('Reason is required')
], adjustStock);

// @desc    Export inventory
// @route   POST /api/v1/inventory/export
// @access  Private (Admin)
router.post('/export', [
  body('ids').optional().isArray().withMessage('IDs must be an array'),
  body('ids.*').optional().isMongoId().withMessage('Invalid product ID')
], exportInventory);

// @desc    Bulk update inventory status
// @route   POST /api/v1/inventory/bulk-update
// @access  Private (Admin)
router.post('/bulk-update', [
  body('ids').isArray().withMessage('IDs must be an array'),
  body('ids.*').isMongoId().withMessage('Invalid product ID'),
  body('status').isIn(['active', 'inactive', 'discontinued']).withMessage('Invalid status')
], bulkUpdateInventoryStatus);

module.exports = router;




