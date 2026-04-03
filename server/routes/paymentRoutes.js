const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
	createPaymentOrder,
	verifyPayment,
	getPaymentStatus,
	reconcilePayment,
	razorpayWebhook
} = require('../controllers/paymentController');

router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);
router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);
router.post('/reconcile/:orderId', verifyToken, reconcilePayment);
router.get('/:orderId', verifyToken, getPaymentStatus);

module.exports = router;
