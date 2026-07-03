const express = require('express');
const router = express.Router();
const {
  addProduct,
  getFarmerProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  removeZeroQuantityProducts,
  getInventoryStatus
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Must put specific routes before generic /:id routes
router.get('/all', getAllProducts);
router.get('/farmer/:farmerId', getFarmerProducts);

// Farmer routes (protected) - specific paths before generic ones
router.get('/inventory/status', protect, getInventoryStatus); // Get inventory status
router.post('/cleanup/zero-quantity', protect, removeZeroQuantityProducts); // Remove zero quantity products

// General farmer routes (protected)
router.post('/add', protect, addProduct);
router.put('/:productId', protect, updateProduct);
router.delete('/:productId', protect, deleteProduct);

// Generic routes (after specific ones)
router.get('/:productId', getProductById);

module.exports = router;
