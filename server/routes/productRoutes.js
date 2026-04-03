const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { uploadProductImages } = require('../config/cloudinary');
const {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleAvailable,
  deleteProduct
} = require('../controllers/productController');

const allowUnauthAdminRead = process.env.ALLOW_UNAUTH_PRODUCT_ADMIN_READ === 'true';
const adminReadMiddleware = allowUnauthAdminRead ? [] : [verifyToken, requireAdmin];

// Public routes
router.get('/', getProducts);

// Admin routes
router.get('/admin/all', ...adminReadMiddleware, getAllProductsAdmin);
router.post('/', verifyToken, requireAdmin, uploadProductImages, createProduct);
router.put('/:id', verifyToken, requireAdmin, uploadProductImages, updateProduct);
router.patch('/:id/toggle', verifyToken, requireAdmin, toggleAvailable);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

// Public route with param (keep this after static admin route to avoid shadowing)
router.get('/:id', getProductById);

module.exports = router;
