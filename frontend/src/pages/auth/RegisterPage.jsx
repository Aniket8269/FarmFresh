import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaTruck, FaIdCard } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { registerStart, registerSuccess, registerFailure } from '../../redux/slices/authSlice';
import { authAPI } from '../../utils/api';
import PhoneVerificationModal from '../../components/PhoneVerificationModal';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userType, setUserType] = useState('consumer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Delivery partner fields
    vehicle_type: 'bike',
    vehicle_number: '',
    license_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate delivery partner fields
    if (userType === 'delivery_partner') {
      if (!formData.vehicle_number || !formData.license_number) {
        setError('Please provide vehicle number and license number');
        return;
      }
    }

    dispatch(registerStart());
    setLoading(true);

    try {
      const requestData = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        name: formData.name,
        user_type: userType
      };

      // Add delivery partner fields if registering as delivery partner
      if (userType === 'delivery_partner') {
        requestData.vehicle_type = formData.vehicle_type;
        requestData.vehicle_number = formData.vehicle_number;
        requestData.license_number = formData.license_number;
      }

      const response = await authAPI.register(requestData);

      if (response.success) {
        dispatch(registerSuccess({
          token: response.token,
          user: response.user
        }));
        
        // Store user data for phone verification
        setRegisteredUser({
          email: formData.email,
          phone: formData.phone
        });
        
        // Show phone verification modal
        setShowPhoneVerification(true);
      } else {
        setError(response.message || 'Registration failed');
        dispatch(registerFailure(response.message || 'Registration failed'));
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      dispatch(registerFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gradient">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* User Type Selection */}
        <div className="mb-6 p-4 bg-neutral-100 rounded-lg">
          <p className="font-bold mb-3">I am a:</p>
          <div className="space-y-2">
            {['consumer', 'farmer', 'delivery_partner'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  checked={userType === type}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span className="capitalize font-medium">{type === 'delivery_partner' ? 'Delivery Partner' : type}</span>
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input pl-10"
                placeholder="+91 98765 43210"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pl-10"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input pl-10"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Delivery Partner Fields */}
          {userType === 'delivery_partner' && (
            <>
              <div>
                <label className="label">Vehicle Type</label>
                <div className="relative">
                  <FaTruck className="absolute left-3 top-3 text-neutral-400" />
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="input pl-10"
                    disabled={loading}
                  >
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Vehicle Number</label>
                <div className="relative">
                  <FaTruck className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="MH 01 AB 1234"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="label">License Number</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="DL123456789"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full btn-lg"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      {/* Phone Verification Modal */}
      {showPhoneVerification && registeredUser && (
        <PhoneVerificationModal
          email={registeredUser.email}
          phone={registeredUser.phone}
          onVerified={() => {
            setShowPhoneVerification(false);
            navigate('/');
          }}
          onCancel={() => {
            setShowPhoneVerification(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default RegisterPage;
