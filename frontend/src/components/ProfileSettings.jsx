import React, { useState } from 'react';
import { FaLock, FaUser, FaPhone, FaImage, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authAPI } from '../utils/api';

const ProfileSettings = ({ userProfile, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Profile update state
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    profile_pic: userProfile?.profile_pic || '',
  });

  // Password reset state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileForm);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-semibold transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FaUser /> Update Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 font-semibold transition flex items-center gap-2 ${
            activeTab === 'password'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FaLock /> Reset Password
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <FaCheckCircle />
          ) : (
            <FaTimesCircle />
          )}
          {message.text}
        </div>
      )}

      {/* Update Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaUser className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaImage className="inline mr-2" />
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profile_pic"
              value={profileForm.profile_pic}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/profile.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )}

      {/* Reset Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaLock className="inline mr-2" />
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaLock className="inline mr-2" />
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              <FaLock className="inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
