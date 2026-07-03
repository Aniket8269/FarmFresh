import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import PhoneVerificationModal from './PhoneVerificationModal';

export default function VerificationStatusWidget({ userId, email, phone }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [userId]);

  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/verification-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader className="w-5 h-5 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading verification status...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Verification Status</h3>

        {/* Email Verification */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
          {status.email_verified ? (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">Email Verification</h4>
            <p className="text-sm text-gray-600">{status.email}</p>
            <p className={`text-sm font-semibold mt-1 ${status.email_verified ? 'text-green-600' : 'text-yellow-600'}`}>
              {status.email_verified ? '✓ Verified' : '⚠ Pending'}
            </p>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
          {status.phone_verified ? (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">Phone Verification</h4>
            <p className="text-sm text-gray-600">{status.phone}</p>
            <div className="flex items-center justify-between mt-1">
              <p className={`text-sm font-semibold ${status.phone_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {status.phone_verified ? '✓ Verified' : '⚠ Pending'}
              </p>
              {!status.phone_verified && (
                <button
                  onClick={() => setShowPhoneVerification(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-800">
            {status.is_verified ? (
              <span className="text-green-700 font-semibold">✓ All verifications complete</span>
            ) : (
              <span className="text-yellow-700">⚠ Please complete all verifications</span>
            )}
          </p>
        </div>
      </div>

      {/* Phone Verification Modal */}
      {showPhoneVerification && (
        <PhoneVerificationModal
          email={status.email}
          phone={status.phone}
          onVerified={() => {
            setShowPhoneVerification(false);
            fetchVerificationStatus();
          }}
          onCancel={() => setShowPhoneVerification(false)}
        />
      )}
    </>
  );
}
