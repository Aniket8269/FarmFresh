import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, orderAPI, authAPI } from '../../utils/api';
import { FaBoxOpen, FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaClock, FaTruck, FaUser, FaCog } from 'react-icons/fa';
import ProductInventory from '../../components/ProductInventory';
import MyProfile from '../../components/MyProfile';
import ProfileSettings from '../../components/ProfileSettings';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState(null);
  const [refreshProfile, setRefreshProfile] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'settings') {
      fetchUserProfile();
    }
  }, [activeTab, refreshProfile]);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleProfileUpdate = () => {
    setRefreshProfile(!refreshProfile);
  };

  const farmerId = localStorage.getItem('farmerId') || localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')).farmerId || '' 
    : '';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only fetch if we have a farmerId
      if (!farmerId) {
        setError('Farmer profile not found. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch farmer products
      const productsResponse = await productAPI.getFarmerProducts(farmerId);
      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
      }

      // Fetch farmer orders
      const ordersResponse = await orderAPI.getOrders('farmer');
      if (ordersResponse.success) {
        setOrders(ordersResponse.data || []);
      }

      // Calculate stats
      setStats({
        totalProducts: (productsResponse.success ? productsResponse.data?.length : 0) || 0,
        totalOrders: (ordersResponse.success ? ordersResponse.data?.length : 0) || 0,
        totalRevenue: calculateRevenue((ordersResponse.success ? ordersResponse.data : []) || []),
        pendingOrders: ((ordersResponse.success ? ordersResponse.data : []) || []).filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const calculateRevenue = (orders) => {
    if (!orders || orders.length === 0) return 0;
    return orders.reduce((sum, order) => {
      const amount = order.order_status === 'delivered' ? (order.total_price || 0) : 0;
      return sum + amount;
    }, 0);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(productId);
        setProducts(products.filter(p => p._id !== productId));
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="section-padding text-center">Loading...</div>;
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Farmer Dashboard</h1>
            <p className="text-neutral-600">Manage your products and orders</p>
          </div>
          <button
            onClick={() => navigate('/farmer/add-product')}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
          >
            <FaPlus /> Add Product
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 mb-2">Total Products</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalProducts}</p>
              </div>
              <FaBoxOpen className="text-4xl text-primary-500 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-secondary-600">{stats.totalOrders}</p>
              </div>
              <FaTruck className="text-4xl text-secondary-500 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 mb-2">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <FaClock className="text-4xl text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <FaMoneyBillWave className="text-4xl text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'inventory'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            📦 Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'orders'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            🚚 Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaUser /> Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaCog /> Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Products Section */}
            <div className="card mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Products</h2>
                <span className="text-sm text-neutral-600">{products.length} products listed</span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <FaBoxOpen className="text-6xl text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600 mb-6">No products added yet</p>
                  <button
                    onClick={() => navigate('/farmer/add-product')}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                  >
                    <FaPlus /> Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Product Name</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Category</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Price</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Quantity</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Quality</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Rating</th>
                        <th className="px-6 py-3 text-left font-semibold text-neutral-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id} className="border-b hover:bg-neutral-50">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-xs text-neutral-500">{product.weight} {product.weight_unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-semibold">₹{product.price}</td>
                          <td className="px-6 py-3">
                            {product.quantity_available} {product.unit}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              {product.quality}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-semibold">{product.rating}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/farmer/edit-product/${product._id}`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Orders Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
                <span className="text-sm text-neutral-600">{orders.length} orders</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-neutral-600">
                  No orders yet
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-neutral-600">Order Number</p>
                          <p className="font-semibold">{order.order_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Customer</p>
                          <p className="font-semibold">{order.consumer_id?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Amount</p>
                          <p className="font-semibold text-green-600">₹{order.total_price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Items</p>
                          <p className="font-semibold">{order.items?.length || 0} items</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.order_status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.order_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length > 5 && (
                    <button
                      onClick={() => navigate('/farmer/orders')}
                      className="w-full text-center py-3 text-primary-600 hover:text-primary-700 font-semibold mt-4"
                    >
                      View All Orders
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <ProductInventory />
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-neutral-600">
                No orders yet
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-neutral-600">Order Number</p>
                        <p className="font-semibold">{order.order_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Customer</p>
                        <p className="font-semibold">{order.consumer_id?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Amount</p>
                        <p className="font-semibold text-green-600">₹{order.total_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Items</p>
                        <p className="font-semibold">{order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.order_status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.order_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <MyProfile showEditModal={true} onEditClick={() => setActiveTab('settings')} />
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <ProfileSettings 
              userProfile={userProfile} 
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;

