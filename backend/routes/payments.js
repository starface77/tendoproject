/**
 * 💳 PAYMENT ROUTES
 * Routes for payment processing with Uzbekistan payment systems
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const { idempotencyMiddleware } = require('../middleware/idempotency');
const { verifyPaymeBasicAuth } = require('../middleware/paymentAuth');

const {
  getPaymentMethods,
  createPayment,
  getPayment,
  cancelPayment,
  paymentSuccess,
  paymentFailure,
  paymeWebhook,
  clickWebhook,
  verifyPayment,
  getUserPayments
} = require('../controllers/payments');

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.post('/success', paymentSuccess);
router.post('/failure', paymentFailure);

// Webhook routes (public but secured by signature verification)
router.post('/webhook/payme', verifyPaymeBasicAuth, paymeWebhook);
router.post('/webhook/click', clickWebhook);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .get(getUserPayments)
  .post(idempotencyMiddleware('payments:create'), createPayment);

router.route('/:id')
  .get(getPayment);

router.post('/:id/cancel', cancelPayment);
router.post('/:id/verify', verifyPayment);

module.exports = router;