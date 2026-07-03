import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const DemoNotice = () => {
  const { isDemo } = useSelector((state) => state.auth);

  if (!isDemo) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start gap-3">
        <FaInfoCircle className="text-yellow-600 text-xl mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-yellow-800">Demo Mode Active</h3>
          <p className="text-yellow-700 text-sm">
            You're viewing the admin dashboard with mock data. No backend connection required. 
            To connect to your real backend, set <code className="bg-yellow-100 px-2 py-1 rounded text-xs">DEMO_MODE = false</code> in authSlice.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoNotice;
