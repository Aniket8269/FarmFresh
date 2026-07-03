import React, { useState } from 'react';
import { FaTruck, FaMapMarkerAlt, FaMoneyBillWave, FaStar, FaUser, FaCog } from 'react-icons/fa';
import AvailableOrders from '../../components/AvailableOrders';
import AcceptedOrders from '../../components/AcceptedOrders';
import EarningsPanel from '../../components/EarningsPanel';
import MyProfile from '../../components/MyProfile';
import ProfileSettings from '../../components/ProfileSettings';
import { authAPI } from '../../utils/api';

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [userProfile, setUserProfile] = useState(null);

  const handleProfileUpdate = async () => {
    try {
      const profile = await authAPI.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Delivery Partner Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'available'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            📦 Available Orders
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'accepted'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            🚚 My Orders
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'earnings'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            💰 Earnings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaUser /> My Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaCog /> Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'available' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Available Orders</h2>
              <p className="text-neutral-600 mb-6">
                Accept orders from farmers and earn money by delivering to consumers.
              </p>
              <AvailableOrders />
            </div>
          )}

          {activeTab === 'accepted' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
              <p className="text-neutral-600 mb-6">
                Track your accepted orders and update delivery status.
              </p>
              <AcceptedOrders />
            </div>
          )}

          {activeTab === 'earnings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Earnings & Performance</h2>
              <p className="text-neutral-600 mb-6">
                View your earnings, ratings, and delivery statistics.
              </p>
              <EarningsPanel />
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
    </div>
  );
};

export default DeliveryDashboard;
