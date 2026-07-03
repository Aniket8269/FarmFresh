const Order = require('../models/Order');
const Product = require('../models/Product');
const Consumer = require('../models/Consumer');
const Farmer = require('../models/Farmer');
const DeliveryPartner = require('../models/DeliveryPartner');
const User = require('../models/User');
const { calculateDeliveryCharge } = require('../utils/deliveryCalculator');

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Calculate distance between two coordinates using Haversine formula (fallback)
const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find best delivery partner using proximity algorithm
const findBestDeliveryPartner = async (pickupLocation, deliveryLocation, farmerLocation) => {
  try {
    // Get available delivery partners
    const deliveryPartners = await DeliveryPartner.find({
      availability_status: 'available',
      is_available: true,
      location: { $exists: true, $ne: null }
    }).populate('user_id', 'name phone');

    if (deliveryPartners.length === 0) {
      return null;
    }

    // Calculate score for each delivery partner
    // Priority: 1. Distance from farmer 2. Rating 3. Total deliveries
    const scoredPartners = deliveryPartners.map(partner => {
      const distance = calculateDistanceHaversine(
        partner.location.coordinates[1],
        partner.location.coordinates[0],
        farmerLocation.coordinates[1],
        farmerLocation.coordinates[0]
      );

      // Score calculation: Lower is better
      const baseScore = distance * 2; // Distance weight
      const ratingPenalty = (5 - partner.rating) * 5; // Higher rating = lower penalty
      const deliveryCount = partner.total_deliveries * 0.1; // Experience bonus

      const totalScore = baseScore + ratingPenalty - deliveryCount;

      return {
        id: partner._id,
        name: partner.user_id?.name,
        phone: partner.user_id?.phone,
        distance,
        rating: partner.rating,
        totalDeliveries: partner.total_deliveries,
        score: totalScore
      };
    });

    // Sort by score (lowest = best match)
    scoredPartners.sort((a, b) => a.score - b.score);
    
    return scoredPartners[0]?.id || null;
  } catch (error) {
    console.error('Error finding delivery partner:', error);
    return null;
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const {
      cartItems,
      payment_method,
      delivery_address,
      notes,
      deliveryLocation
    } = req.body;

    // Check if user is consumer
    const user = await User.findById(req.user.id);
    if (!user || user.user_type !== 'consumer') {
      return res.status(403).json({
        success: false,
        message: 'Only consumers can place orders'
      });
    }

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!payment_method || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and delivery address are required'
      });
    }

    // Get consumer
    const consumer = await Consumer.findOne({ user_id: req.user.id });
    if (!consumer) {
      return res.status(404).json({
        success: false,
        message: 'Consumer profile not found'
      });
    }

    // Process each item - group by farmer
    const ordersByFarmer = {};
    let totalSubtotal = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product_id} not found`
        });
      }

      // Check if quantity is available
      if (product.quantity_available < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${product.name}. Available: ${product.quantity_available}`
        });
      }

      // Group by farmer
      const farmerId = product.farmer_id.toString();
      if (!ordersByFarmer[farmerId]) {
        ordersByFarmer[farmerId] = {
          farmer_id: farmerId,
          items: [],
          subtotal: 0,
          products: []
        };
      }

      const itemTotal = product.price * item.quantity;
      
      ordersByFarmer[farmerId].items.push({
        _id: product._id,
        product_id: product._id,
        product_name: product.name,
        quantity: item.quantity,
        unit: product.unit,
        unit_price: product.price,
        total_price: itemTotal
      });

      ordersByFarmer[farmerId].subtotal += itemTotal;
      ordersByFarmer[farmerId].products.push({
        product_id: product._id,
        quantity: item.quantity
      });

      totalSubtotal += itemTotal;
    }

    // Calculate tax (5%) and delivery charge
    const tax = Math.round(totalSubtotal * 0.05);
    let totalDeliveryCharge = 0;

    // Create orders for each farmer
    const createdOrders = [];

    for (const farmerId in ordersByFarmer) {
      const orderData = ordersByFarmer[farmerId];
      
      // Get farmer location
      const farmer = await Farmer.findById(farmerId);
      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      // Calculate delivery charge using Google Maps
      let deliveryCharge = 0;
      let deliveryPartnerId = null;
      let distanceKm = 0;
      let chargeBreakdown = null;
      let estimatedDeliveryTime = '';

      if (deliveryLocation && farmer.location) {
        try {
          // Get pickup location from farmer
          let pickupCoordinates = {
            lat: farmer.location.coordinates[1],
            lng: farmer.location.coordinates[0]
          };

          // Check if farmer has product-specific pickup location
          const products = await Product.find({ farmer_id: farmerId });
          if (products && products[0]?.farmer_pickup_location?.coordinates) {
            pickupCoordinates = {
              lat: products[0].farmer_pickup_location.coordinates[1],
              lng: products[0].farmer_pickup_location.coordinates[0]
            };
          }

          // Get delivery coordinates
          const deliveryCoordinates = {
            lat: deliveryLocation.lat || delivery_address.location?.coordinates[1] || 19.0760,
            lng: deliveryLocation.lng || delivery_address.location?.coordinates[0] || 72.8777
          };

          // Calculate delivery charge using Google Maps API
          const chargeResult = await calculateDeliveryCharge(pickupCoordinates, deliveryCoordinates);

          if (chargeResult.success) {
            distanceKm = chargeResult.distance;
            deliveryCharge = chargeResult.deliveryCharge;
            chargeBreakdown = chargeResult.chargeBreakdown;
            estimatedDeliveryTime = chargeResult.estimatedTime;
            totalDeliveryCharge += deliveryCharge;
          } else {
            console.warn('Google Maps calculation failed:', chargeResult.error);
            // Fallback to default minimum charge if API fails
            deliveryCharge = 30;
            distanceKm = 0;
          }
        } catch (error) {
          console.error('Error calculating delivery charge with Google Maps:', error);
          // Fallback to default minimum charge
          deliveryCharge = 30;
        }

        // Find best delivery partner
        deliveryPartnerId = await findBestDeliveryPartner(
          farmer.location,
          deliveryLocation || delivery_address.location || { coordinates: [72.8777, 19.0760] },
          farmer.location
        );
      }

      // Create order
      const order = await Order.create({
        order_number: generateOrderNumber(),
        consumer_id: consumer._id,
        farmer_id: farmerId,
        delivery_partner_id: deliveryPartnerId,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: Math.round((orderData.subtotal * 0.05)),
        delivery_charge: deliveryCharge,
        distance_km: distanceKm,
        charge_breakdown: chargeBreakdown,
        estimated_delivery_time: estimatedDeliveryTime,
        total_price: orderData.subtotal + Math.round((orderData.subtotal * 0.05)) + deliveryCharge,
        payment_method,
        pickup_location: {
          street: farmer.address || '',
          city: farmer.city || '',
          state: farmer.state || '',
          pincode: farmer.pincode || '',
          location: farmer.location || { 
            type: 'Point',
            coordinates: [72.8777, 19.0760]
          }
        },
        delivery_address: {
          street: delivery_address.street || '',
          city: delivery_address.city || '',
          state: delivery_address.state || '',
          pincode: delivery_address.pincode || '',
          location: delivery_address.location || { 
            type: 'Point',
            coordinates: [72.8777, 19.0760]
          }
        },
        notes: notes || ''
      });

      // Add tracking history
      order.tracking_history.push({
        status: 'pending',
        timestamp: new Date()
      });
      await order.save();

      // Update product quantity
      for (const item of orderData.items) {
        const product = await Product.findById(item.product_id);
        product.quantity_available -= item.quantity;
        product.quantity_sold += item.quantity;
        product.total_orders += 1;
        
        // If quantity becomes 0, mark as inactive
        if (product.quantity_available <= 0) {
          product.is_active = false;
        }
        
        await product.save();
      }

      // Update delivery partner stats
      if (deliveryPartnerId) {
        await DeliveryPartner.findByIdAndUpdate(
          deliveryPartnerId,
          {
            $inc: { total_deliveries: 1 }
          }
        );
      }

      createdOrders.push(order);
    }

    return res.status(201).json({
      success: true,
      message: 'Orders created successfully',
      data: {
        orders: createdOrders,
        totalItems: cartItems.length,
        totalAmount: totalSubtotal + tax + totalDeliveryCharge
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// Get orders - different views for different roles
const getOrders = async (req, res) => {
  try {
    const { role } = req.query; // 'consumer', 'farmer', 'delivery'
    const user = await User.findById(req.user.id);
    let query = {};
    let userRole = role || user.user_type;

    if (userRole === 'consumer') {
      const consumer = await Consumer.findOne({ user_id: req.user.id });
      if (!consumer) {
        return res.status(404).json({
          success: false,
          message: 'Consumer profile not found'
        });
      }
      query = { consumer_id: consumer._id };
    } else if (userRole === 'farmer') {
      const farmer = await Farmer.findOne({ user_id: req.user.id });
      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: 'Farmer profile not found'
        });
      }
      query = { farmer_id: farmer._id };
    } else if (userRole === 'delivery_partner') {
      const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
      if (!deliveryPartner) {
        return res.status(404).json({
          success: false,
          message: 'Delivery partner profile not found'
        });
      }
      query = { delivery_partner_id: deliveryPartner._id };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const orders = await Order.find(query)
      .populate('consumer_id', 'name phone')
      .populate('farmer_id', 'farm_name address')
      .populate('delivery_partner_id', 'user_id')
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('consumer_id', 'name phone email')
      .populate('farmer_id', 'farm_name address avg_rating')
      .populate('delivery_partner_id', 'user_id vehicle_type rating')
      .populate('items.product_id', 'name category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order'
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, estimated_delivery } = req.body;

    const validStatuses = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

    if (!order_status || !validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.order_status = order_status;
    if (estimated_delivery) {
      order.estimated_delivery = new Date(estimated_delivery);
    }

    if (order_status === 'delivered') {
      order.actual_delivery = new Date();
    }

    // Add to tracking history
    order.tracking_history.push({
      status: order_status,
      timestamp: new Date()
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

// Get available orders for delivery partners (unaccepted orders)
const getAvailableOrders = async (req, res) => {
  try {
    const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found'
      });
    }

    // Get orders that are pending and not yet accepted by anyone
    const availableOrders = await Order.find({
      order_status: 'pending',
      delivery_partner_id: null,
      accepted_by_partner_id: null
    })
      .populate('consumer_id', 'user_id')
      .populate({
        path: 'consumer_id',
        populate: {
          path: 'user_id',
          select: 'name phone'
        }
      })
      .populate({
        path: 'farmer_id',
        populate: {
          path: 'user_id',
          select: 'name phone'
        }
      })
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: availableOrders.length,
      data: availableOrders
    });
  } catch (error) {
    console.error('Get Available Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching available orders'
    });
  }
};

// Accept order by delivery partner
const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already accepted
    if (order.accepted_by_partner_id) {
      return res.status(400).json({
        success: false,
        message: 'Order already accepted by another delivery partner'
      });
    }

    // Update order
    order.delivery_partner_id = deliveryPartner._id;
    order.accepted_by_partner_id = deliveryPartner._id;
    order.accepted_at = new Date();
    order.order_status = 'assigned';

    // Add tracking history
    order.tracking_history.push({
      status: 'assigned',
      timestamp: new Date()
    });

    await order.save();

    // Update delivery partner info
    deliveryPartner.total_deliveries += 1;
    await deliveryPartner.save();

    return res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
  } catch (error) {
    console.error('Accept Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error accepting order'
    });
  }
};

// Get orders accepted by current delivery partner
const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query; // 'active', 'completed', 'all'

    const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found'
      });
    }

    let query = { accepted_by_partner_id: deliveryPartner._id };

    if (status === 'active') {
      query.order_status = { $in: ['assigned', 'picked_up', 'in_transit'] };
    } else if (status === 'completed') {
      query.order_status = 'delivered';
    }

    const orders = await Order.find(query)
      .populate('consumer_id')
      .populate({
        path: 'consumer_id',
        populate: {
          path: 'user_id',
          select: 'name phone'
        }
      })
      .populate('farmer_id')
      .populate({
        path: 'farmer_id',
        populate: {
          path: 'user_id',
          select: 'name phone'
        }
      })
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// Get delivery partner earnings
const getDeliveryPartnerEarnings = async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month', 'all'

    const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found'
      });
    }

    let dateFilter = {};
    const now = new Date();

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { created_at: { $gte: startOfDay } };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      dateFilter = { created_at: { $gte: startOfWeek } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { created_at: { $gte: startOfMonth } };
    }

    const orders = await Order.find({
      accepted_by_partner_id: deliveryPartner._id,
      order_status: 'delivered',
      ...dateFilter
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.delivery_charge, 0);
    const completedDeliveries = orders.length;

    // Get pending earnings (orders that are not yet delivered)
    const pendingOrders = await Order.find({
      accepted_by_partner_id: deliveryPartner._id,
      order_status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });

    const pendingEarnings = pendingOrders.reduce((sum, order) => sum + order.delivery_charge, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings: deliveryPartner.earnings.total,
        currentPeriodEarnings: totalEarnings,
        pendingEarnings,
        completedDeliveries,
        totalDeliveries: deliveryPartner.total_deliveries,
        successfulDeliveries: deliveryPartner.successful_deliveries,
        rating: deliveryPartner.rating,
        orders: orders
      }
    });
  } catch (error) {
    console.error('Get Earnings Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching earnings'
    });
  }
};

// Update order delivery status (for delivery partner)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    const deliveryPartner = await DeliveryPartner.findOne({ user_id: req.user.id });
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to this delivery partner
    if (order.accepted_by_partner_id.toString() !== deliveryPartner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
    }

    const validStatuses = ['picked_up', 'in_transit', 'delivered'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status for delivery partner'
      });
    }

    order.order_status = order_status;

    if (order_status === 'delivered') {
      order.actual_delivery = new Date();
      // Update earnings
      deliveryPartner.earnings.total += order.delivery_charge;
      deliveryPartner.earnings.pending -= order.delivery_charge;
      deliveryPartner.successful_deliveries += 1;
      await deliveryPartner.save();
    }

    // Add tracking history
    order.tracking_history.push({
      status: order_status,
      timestamp: new Date()
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order_status}`,
      data: order
    });
  } catch (error) {
    console.error('Update Delivery Status Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating delivery status'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  findBestDeliveryPartner,
  calculateDeliveryCharge,
  getAvailableOrders,
  acceptOrder,
  getMyOrders,
  getDeliveryPartnerEarnings,
  updateDeliveryStatus
};
