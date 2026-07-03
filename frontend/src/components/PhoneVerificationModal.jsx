import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function PhoneVerificationModal({ email, phone, onVerified, onCancel }) {
  const [step, setStep] = useState('request'); // request, enter-otp
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState(null); // For development mode
  const [isDevMode, setIsDevMode] = useState(false);
  const countdownInterval = useRef(null);

  // Request OTP
  const handleRequestOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone || undefined,
          email: email || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setStep('enter-otp');
        setCountdown(60);
        
        // Development mode: show OTP for testing
        if (data.otp && data.isDevMode) {
          setDevOtp(data.otp);
          setIsDevMode(true);
        }
        
        // Start countdown
        countdownInterval.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Error sending OTP. Please try again.');
      console.error('OTP request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone,
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        onVerified?.();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Error verifying OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify Phone Number</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === 'request' ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              We'll send a verification code to {phone}
            </p>
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Skip for Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to {phone}
            </p>
            
            {isDevMode && devOtp && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-3">
                <p className="text-blue-900 text-sm font-semibold mb-2">🔧 Development Mode</p>
                <p className="text-blue-800 text-xs mb-2">Your OTP for testing:</p>
                <p className="text-center text-3xl font-bold font-mono text-blue-600 tracking-widest">{devOtp}</p>
                <p className="text-blue-700 text-xs mt-2">Enter this code below to verify</p>
              </div>
            )}
            
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:border-green-500 focus:outline-none"
            />

            {countdown > 0 && (
              <p className="text-center text-sm text-gray-600">
                Resend OTP in {countdown}s
              </p>
            )}

            {countdown === 0 && otpSent && (
              <button
                onClick={() => {
                  setOtpSent(false);
                  setStep('request');
                  setOtp('');
                }}
                className="w-full text-green-500 hover:text-green-600 font-bold py-2 text-sm"
              >
                Didn't receive code? Resend
              </button>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
