const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Consumer = require('../models/Consumer');
const DeliveryPartner = require('../models/DeliveryPartner');

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ user_type: 'farmer' });
    const totalConsumers = await User.countDocuments({ user_type: 'consumer' });
    const totalDeliveryPartners = await User.countDocuments({ user_type: 'delivery_partner' });
    const verifiedUsers = await User.countDocuments({ is_verified: true });
    const activeUsers = await User.countDocuments({ is_active: true });
    
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    
    const activeDeliveries = await Order.countDocuments({ status: 'in_transit' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalConsumers,
        totalDeliveryPartners,
        verifiedUsers,
        activeUsers,
        totalOrders,
        totalProducts,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeDeliveries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get All Users with Filters
const getAllUsers = async (req, res) => {
  try {
    const { userType, isVerified, isActive, page = 1, limit = 10, search } = req.query;
    
    let filter = {};
    if (userType) filter.user_type = userType;
    if (isVerified !== undefined) filter.is_verified = isVerified === 'true';
    if (isActive !== undefined) filter.is_active = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password_hash -verification_token -phone_otp')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get User Detail with Profile
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password_hash -verification_token -phone_otp');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = null;
    if (user.user_type === 'farmer') {
      profile = await Farmer.findOne({ user_id: userId });
    } else if (user.user_type === 'consumer') {
      profile = await Consumer.findOne({ user_id: userId });
    } else if (user.user_type === 'delivery_partner') {
      profile = await DeliveryPartner.findOne({ user_id: userId });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user detail',
      error: error.message
    });
  }
};

// Update User Status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active, is_verified } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...(is_active !== undefined && { is_active }),
        ...(is_verified !== undefined && { is_verified }),
        updated_at: new Date()
      },
      { new: true }
    ).select('-password_hash -verification_token -phone_otp');

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete associated profile data
    if (user.user_type === 'farmer') {
      await Farmer.findOneAndDelete({ user_id: userId });
    } else if (user.user_type === 'consumer') {
      await Consumer.findOneAndDelete({ user_id: userId });
    } else if (user.user_type === 'delivery_partner') {
      await DeliveryPartner.findOneAndDelete({ user_id: userId });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get Revenue Analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          revenue: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

// Get Order Analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersByCategory = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        ordersByCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics',
      error: error.message
    });
  }
};

// Get User Analytics
const getUserAnalytics = async (req, res) => {
  try {
    const usersByType = await User.aggregate([
      {
        $group: {
          _id: '$user_type',
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$is_verified', 1, 0] }
          },
          active: {
            $sum: { $cond: ['$is_active', 1, 0] }
          }
        }
      }
    ]);

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      {
        $match: { created_at: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        usersByType,
        userGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('consumer_id', 'name email phone')
      .populate('product_id', 'name price')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updated_at: new Date() },
      { new: true }
    ).populate('consumer_id').populate('product_id');

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

module.exports = {
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
};
