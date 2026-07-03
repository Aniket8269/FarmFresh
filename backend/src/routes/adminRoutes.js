const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  deleteUser,
  getRevenueAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying admin'
    });
  }
};

// All routes protected with auth and admin verification
router.use(protect, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users Management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetail);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Orders Management
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/users', getUserAnalytics);

module.exports = router;
