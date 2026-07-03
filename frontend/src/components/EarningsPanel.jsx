import React, { useState, useEffect, useCallback } from 'react';
import { FaRupeeSign, FaClock, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import { orderAPI } from '../utils/api';

const EarningsPanel = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getEarnings(period);
      if (response.success) {
        setEarnings(response.data);
      }
    } catch (err) {
      setError('Failed to fetch earnings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading) return <div className="text-center py-8">Loading earnings...</div>;

  return (
    <div>
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'Today', value: 'today' },
          { label: 'This Week', value: 'week' },
          { label: 'This Month', value: 'month' },
          { label: 'All Time', value: 'all' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`px-4 py-2 rounded font-semibold transition ${
              period === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {earnings && (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{earnings.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <FaRupeeSign className="text-5xl text-green-300 opacity-50" />
              </div>
            </div>

            {/* Current Period Earnings */}
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-1">This Period</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{earnings.currentPeriodEarnings.toLocaleString()}
                  </p>
                </div>
                <FaClock className="text-5xl text-blue-300 opacity-50" />
              </div>
            </div>

            {/* Pending Earnings */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{earnings.pendingEarnings.toLocaleString()}
                  </p>
                </div>
                <FaClock className="text-5xl text-orange-300 opacity-50" />
              </div>
            </div>

            {/* Rating */}
            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-1">Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {earnings.rating.toFixed(1)}/5 ⭐
                  </p>
                </div>
                <FaTrophy className="text-5xl text-yellow-300 opacity-50" />
              </div>
            </div>
          </div>

          {/* Deliveries Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-2">Completed This Period</p>
                  <p className="text-4xl font-bold text-green-600">
                    {earnings.completedDeliveries}
                  </p>
                </div>
                <FaCheckCircle className="text-5xl text-green-300" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-2">Total Deliveries</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {earnings.totalDeliveries}
                  </p>
                </div>
                <FaCheckCircle className="text-5xl text-blue-300" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-2">Successful Rate</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {earnings.totalDeliveries > 0
                      ? Math.round((earnings.successfulDeliveries / earnings.totalDeliveries) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <FaTrophy className="text-5xl text-purple-300" />
              </div>
            </div>
          </div>

          {/* Recent Orders Summary */}
          {earnings.orders && earnings.orders.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Order ID</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Your Earning</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b hover:bg-neutral-50">
                        <td className="py-2 font-semibold">{order.order_number}</td>
                        <td className="py-2">₹{order.total_price}</td>
                        <td className="py-2 text-green-600 font-semibold">
                          +₹{order.delivery_charge}
                        </td>
                        <td className="py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarningsPanel;
