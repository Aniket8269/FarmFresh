import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { authAPI } from '../utils/api';

const MyProfile = ({ showEditModal = false, onEditClick = null }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError('Failed to fetch profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (!profile) return <div className="text-center py-8">No profile data</div>;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeDisplay = (type) => {
    const types = {
      consumer: '🛒 Consumer',
      farmer: '🚜 Farmer',
      delivery_partner: '🚚 Delivery Partner',
      admin: '👨‍💼 Admin'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Profile Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6 pb-6 border-b">
          <div className="flex items-center gap-4">
            {profile.profile_pic ? (
              <img
                src={profile.profile_pic}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-500">
                <FaUser className="text-2xl text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{profile.name}</h2>
              <p className="text-lg text-primary-600 font-semibold">
                {getUserTypeDisplay(profile.user_type)}
              </p>
            </div>
          </div>
          {showEditModal && onEditClick && (
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
              <FaEnvelope /> Email
            </label>
            <p className="text-lg font-semibold text-neutral-900">{profile.email}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
              <FaPhone /> Phone
            </label>
            <p className="text-lg font-semibold text-neutral-900">{profile.phone}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
              <FaCheckCircle /> Verification
            </label>
            <p className={`text-lg font-semibold ${
              profile.is_verified ? 'text-green-600' : 'text-orange-600'
            }`}>
              {profile.is_verified ? '✓ Verified' : 'Not Verified'}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
              <FaCalendar /> Member Since
            </label>
            <p className="text-lg font-semibold text-neutral-900">
              {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        {/* Last Login */}
        {profile.last_login && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-neutral-600 text-sm">
              Last login: {formatDate(profile.last_login)}
            </p>
          </div>
        )}
      </div>

      {/* Role-Specific Details */}
      {profile.farmerDetails && (
        <FarmerDetails farmer={profile.farmerDetails} />
      )}

      {profile.consumerDetails && (
        <ConsumerDetails consumer={profile.consumerDetails} />
      )}

      {profile.deliveryPartnerDetails && (
        <DeliveryPartnerDetails deliveryPartner={profile.deliveryPartnerDetails} />
      )}
    </div>
  );
};

// Farmer Details Card
const FarmerDetails = ({ farmer }) => {
  return (
    <div className="card border-l-4 border-green-500">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🚜</span> Farm Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-neutral-600 text-sm">Farm Name</p>
          <p className="text-lg font-semibold">{farmer.farm_name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Total Products</p>
          <p className="text-lg font-semibold">{farmer.total_products || 0}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Average Rating</p>
          <p className="text-lg font-semibold">
            <span className="text-yellow-500">★</span> {farmer.avg_rating?.toFixed(1) || '0'}/5
          </p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Total Orders</p>
          <p className="text-lg font-semibold">{farmer.total_orders || 0}</p>
        </div>
      </div>
    </div>
  );
};

// Consumer Details Card
const ConsumerDetails = ({ consumer }) => {
  return (
    <div className="card border-l-4 border-blue-500">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🛒</span> Shopping Profile
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-neutral-600 text-sm">Total Orders Placed</p>
          <p className="text-lg font-semibold">{consumer.total_orders || 0}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Total Spent</p>
          <p className="text-lg font-semibold">₹{consumer.total_spent?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </div>
  );
};

// Delivery Partner Details Card
const DeliveryPartnerDetails = ({ deliveryPartner }) => {
  return (
    <div className="card border-l-4 border-orange-500">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🚚</span> Delivery Partner Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-neutral-600 text-sm">Vehicle Type</p>
          <p className="text-lg font-semibold capitalize">{deliveryPartner.vehicle_type || 'N/A'}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Vehicle Number</p>
          <p className="text-lg font-semibold">{deliveryPartner.vehicle_number || 'N/A'}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Total Deliveries</p>
          <p className="text-lg font-semibold">{deliveryPartner.total_deliveries || 0}</p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Rating</p>
          <p className="text-lg font-semibold">
            <span className="text-yellow-500">★</span> {deliveryPartner.rating?.toFixed(1) || '0'}/5
          </p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Availability Status</p>
          <p className="text-lg font-semibold capitalize">
            <span className={`px-2 py-1 rounded text-sm ${
              deliveryPartner.availability_status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-neutral-100 text-neutral-700'
            }`}>
              {deliveryPartner.availability_status || 'N/A'}
            </span>
          </p>
        </div>
        <div>
          <p className="text-neutral-600 text-sm">Total Earnings</p>
          <p className="text-lg font-semibold">₹{deliveryPartner.earnings?.total?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
