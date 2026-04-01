const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleAvailable,
  deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, getAllProductsAdmin);
router.post('/', verifyToken, requireAdmin, upload, createProduct);
router.put('/:id', verifyToken, requireAdmin, upload, updateProduct);
router.patch('/:id/toggle', verifyToken, requireAdmin, toggleAvailable);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
