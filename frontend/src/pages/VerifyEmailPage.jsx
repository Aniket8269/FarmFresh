import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error verifying email. Please try again.');
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Email Verification</h1>

        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <p className="text-gray-600 text-lg">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-gray-600 text-lg">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <p className="text-gray-600 text-lg mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
