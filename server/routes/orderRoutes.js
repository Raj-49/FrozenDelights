const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
	createOrder,
	getMyOrders,
	getAllOrdersAdmin,
	getOrderById,
	updateOrderStatus,
	cancelOrder
} = require('../controllers/orderController');

router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/admin/all', verifyToken, requireAdmin, getAllOrdersAdmin);
router.get('/:id', verifyToken, getOrderById);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);
router.post('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
