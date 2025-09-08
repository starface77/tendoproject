const express = require('express');
const { body } = require('express-validator');
const {
  getSupportTickets,
  getSupportTicket,
  updateTicketStatus,
  sendTicketMessage,
  getTicketMessages,
  assignTicket
} = require('../controllers/support');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All support routes require authentication and admin role
router.use(protect, authorize('admin', 'super_admin'));

// @desc    Get all support tickets
// @route   GET /api/v1/support/tickets
// @access  Private (Admin)
router.get('/tickets', getSupportTickets);

// @desc    Get single support ticket
// @route   GET /api/v1/support/tickets/:id
// @access  Private (Admin)
router.get('/tickets/:id', getSupportTicket);

// @desc    Update ticket status
// @route   PATCH /api/v1/support/tickets/:id/status
// @access  Private (Admin)
router.patch('/tickets/:id/status', [
  body('status').isIn(['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']).withMessage('Invalid status')
], updateTicketStatus);

// @desc    Assign ticket
// @route   PATCH /api/v1/support/tickets/:id/assign
// @access  Private (Admin)
router.patch('/tickets/:id/assign', [
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID')
], assignTicket);

// @desc    Send ticket message
// @route   POST /api/v1/support/tickets/:id/messages
// @access  Private (Admin)
router.post('/tickets/:id/messages', [
  body('message').notEmpty().withMessage('Message is required'),
  body('message').isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
], sendTicketMessage);

// @desc    Get ticket messages
// @route   GET /api/v1/support/tickets/:id/messages
// @access  Private (Admin)
router.get('/tickets/:id/messages', getTicketMessages);

module.exports = router;




