const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
	getSalesAnalytics,
	getOrderAnalytics,
	getProductAnalytics,
	getRevenueAnalytics
} = require('../controllers/analyticsController');

router.get('/sales', verifyToken, requireAdmin, getSalesAnalytics);
router.get('/products', verifyToken, requireAdmin, getProductAnalytics);
router.get('/orders', verifyToken, requireAdmin, getOrderAnalytics);
router.get('/revenue', verifyToken, requireAdmin, getRevenueAnalytics);

module.exports = router;
