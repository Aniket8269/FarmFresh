import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaTruck, FaUser, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MyProfile from '../../components/MyProfile';
import ProfileSettings from '../../components/ProfileSettings';
import { authAPI, orderAPI } from '../../utils/api';

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshProfile, setRefreshProfile] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [refreshProfile]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders('consumer');
      if (response.success) {
        setUserOrders(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleProfileUpdate = () => {
    setRefreshProfile(!refreshProfile);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      assigned: 'bg-blue-100 text-blue-700',
      picked_up: 'bg-orange-100 text-orange-700',
      in_transit: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) return <div className="section-padding text-center text-xl">Loading...</div>;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {userProfile?.name}! 👋</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaUser /> My Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaShoppingBag /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaCog /> Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'profile' && (
            <div>
              <MyProfile showEditModal={true} onEditClick={() => setActiveTab('settings')} />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
              <div className="space-y-4">
                {userOrders && userOrders.length > 0 ? (
                  userOrders.map(order => (
                    <div 
                      key={order._id} 
                      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg">{order.order_number}</p>
                          <p className="text-neutral-600 text-sm">
                            {order.items?.length || 0} items from {typeof order.farmer_id === 'object' ? order.farmer_id.farm_name || 'Farmer' : 'Farm'}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{order.total_price}</p>
                          <span className={`px-3 py-1 rounded text-xs font-semibold inline-block mt-2 ${getStatusColor(order.order_status)}`}>
                            {order.order_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-600">
                    <p>No orders yet. Start shopping!</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
};

export default ConsumerDashboard;
