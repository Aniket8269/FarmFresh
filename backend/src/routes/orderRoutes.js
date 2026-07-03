const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAvailableOrders,
  acceptOrder,
  getMyOrders,
  getDeliveryPartnerEarnings,
  updateDeliveryStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All order routes are protected

// Specific routes (must come before generic :orderId routes)
router.post('/create', protect, createOrder);
router.get('/available/orders', protect, getAvailableOrders); // Get unaccepted orders
router.get('/delivery/my-orders', protect, getMyOrders); // Get partner's accepted orders
router.get('/delivery/earnings', protect, getDeliveryPartnerEarnings); // Get earnings

// Generic routes with :orderId
router.post('/:orderId/accept', protect, acceptOrder); // Accept an order
router.put('/:orderId/delivery-status', protect, updateDeliveryStatus); // Update delivery status
router.put('/:orderId', protect, updateOrderStatus); // Update order status (general)
router.get('/:orderId', protect, getOrderById); // Get single order

// List all orders (must come last)
router.get('/', protect, getOrders);

module.exports = router;
