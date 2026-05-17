const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createCheckoutSession,
  verifyPayment,
  getPaymentSessionDetails,
} = require('../controllers/paymentController');

// Create checkout session (requires authentication as participant)
router.post(
  '/create-checkout-session',
  authMiddleware,
  roleMiddleware(['participant']),
  createCheckoutSession
);

// Get payment session details (requires authentication as participant)
router.get(
  '/session-details',
  authMiddleware,
  roleMiddleware(['participant']),
  getPaymentSessionDetails
);

// Verify Razorpay payment (requires authentication as participant)
router.post(
  '/verify-payment',
  authMiddleware,
  roleMiddleware(['participant']),
  verifyPayment
);

module.exports = router;
