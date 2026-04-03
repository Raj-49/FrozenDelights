const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  validateCoupon,
  createCoupon,
  getCouponsAdmin,
  toggleCoupon
} = require('../controllers/couponController');

router.post('/validate', verifyToken, validateCoupon);
router.get('/admin/all', verifyToken, requireAdmin, getCouponsAdmin);
router.post('/admin', verifyToken, requireAdmin, createCoupon);
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, toggleCoupon);

module.exports = router;
