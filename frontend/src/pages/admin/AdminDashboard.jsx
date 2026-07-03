import React, { useState, useEffect } from 'react';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaTruck, FaLeaf, FaBox, FaCheckCircle, FaHourglassEnd } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DemoNotice from '../../components/DemoNotice';
import UsersManagement from './UsersManagement';
import OrdersManagement from './OrdersManagement';
import AnalyticsPage from './AnalyticsPage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderAnalytics, setOrderAnalytics] = useState({ statusBreakdown: [], ordersByCategory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    // Fetch dashboard stats
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats
        const statsResponse = await fetch(`${API_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        if (statsData.success) setStats(statsData.data);

        // Fetch revenue analytics
        const revenueResponse = await fetch(`${API_URL}/admin/analytics/revenue?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const revenueData = await revenueResponse.json();
        if (revenueData.success) {
          // Transform data for chart
          const chartData = revenueData.data.map(item => ({
            date: item._id,
            revenue: item.revenue,
            orders: item.count
          }));
          setRevenueData(chartData);
        }

        // Fetch order analytics
        const orderResponse = await fetch(`${API_URL}/admin/analytics/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderData = await orderResponse.json();
        if (orderData.success) {
          setOrderAnalytics(orderData.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="section-padding bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get colors for pie chart
  const STATUS_COLORS = {
    pending: '#14b8a6',
    completed: '#10b981',
    in_transit: '#a855f7',
    cancelled: '#ef4444',
    confirmed: '#0d9488'
  };

  return (
    <div className="section-padding bg-neutral-50 min-h-screen">
      <div className="container-custom">
        <DemoNotice />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button className="btn btn-primary" onClick={() => window.print()}>Export Report</button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-neutral-300 overflow-x-auto">
          {['overview', 'users', 'orders', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                    <p className="text-green-600 text-sm mt-1">Active: {stats?.activeUsers || 0}</p>
                  </div>
                  <FaUsers className="text-4xl text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                    <p className="text-green-600 text-sm mt-1">Completed: {stats?.completedOrders || 0}</p>
                  </div>
                  <FaShoppingCart className="text-4xl text-cyan-500 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-green-600 text-sm mt-1">This month</p>
                  </div>
                  <FaMoneyBillWave className="text-4xl text-green-500 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Active Deliveries</p>
                    <p className="text-3xl font-bold">{stats?.activeDeliveries || 0}</p>
                    <p className="text-green-600 text-sm mt-1">In Transit</p>
                  </div>
                  <FaTruck className="text-4xl text-orange-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* User Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Farmers</p>
                    <p className="text-2xl font-bold">{stats?.totalFarmers || 0}</p>
                  </div>
                  <FaLeaf className="text-3xl text-green-600 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Consumers</p>
                    <p className="text-2xl font-bold">{stats?.totalConsumers || 0}</p>
                  </div>
                  <FaBox className="text-3xl text-purple-600 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Delivery Partners</p>
                    <p className="text-2xl font-bold">{stats?.totalDeliveryPartners || 0}</p>
                  </div>
                  <FaTruck className="text-3xl text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">Verified Users</p>
                    <p className="text-2xl font-bold">{stats?.verifiedUsers || 0}</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Revenue Trend (Last 30 Days)</h3>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Revenue (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-neutral-600 text-center py-8">No revenue data available</p>
                )}
              </div>

              {/* Orders Status Chart */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Orders by Status</h3>
                {orderAnalytics.statusBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderAnalytics.statusBreakdown}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="_id"
                        >
                          {orderAnalytics.statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry._id] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {orderAnalytics.statusBreakdown.map((item) => (
                        <div key={item._id} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[item._id] || '#8884d8' }}
                          ></div>
                          <span className="capitalize">{item._id}: {item.count} orders</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-neutral-600 text-center py-8">No order data available</p>
                )}
              </div>
            </div>

            {/* Category Chart */}
            {orderAnalytics.ordersByCategory.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Orders by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderAnalytics.ordersByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend />
                    <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Orders" />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersManagement />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrdersManagement />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </div>
    </div>
  );
};

export default AdminDashboard;
