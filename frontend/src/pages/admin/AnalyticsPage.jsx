import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AnalyticsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [orderAnalytics, setOrderAnalytics] = useState({ statusBreakdown: [], ordersByCategory: [] });
  const [userAnalytics, setUserAnalytics] = useState({ usersByType: [], userGrowth: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  const STATUS_COLORS = {
    pending: '#14b8a6',
    completed: '#10b981',
    in_transit: '#a855f7',
    cancelled: '#ef4444',
    confirmed: '#0d9488'
  };

  const CATEGORY_COLORS = ['#14b8a6', '#10b981', '#a855f7', '#ef4444', '#0d9488', '#ec4899'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Revenue Analytics
      const revenueRes = await fetch(`${API_URL}/admin/analytics/revenue?days=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const revenueData = await revenueRes.json();
      if (revenueData.success) {
        const chartData = revenueData.data.map(item => ({
          date: item._id,
          revenue: item.revenue,
          orders: item.count
        }));
        setRevenueData(chartData);
      }

      // Fetch Order Analytics
      const orderRes = await fetch(`${API_URL}/admin/analytics/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrderAnalytics(orderData.data);
      }

      // Fetch User Analytics
      const userRes = await fetch(`${API_URL}/admin/analytics/users?days=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      if (userData.success) {
        setUserAnalytics(userData.data);
        // Transform user growth for chart
        const growthData = userData.data.userGrowth.map(item => ({
          date: item._id,
          users: item.count
        }));
        setUserGrowthData(growthData);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Selector */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <div className="flex gap-2">
            {['7', '30', '90', '365'].map(days => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 rounded-lg transition ${
                  dateRange === days
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                {days === '7' ? '7 Days' : days === '30' ? '30 Days' : days === '90' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Revenue Analytics */}
      <div className="card mb-6">
        <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => [`₹${value}`, '']} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                fill="url(#colorRevenue)"
                name="Revenue (₹)"
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="#10b981"
                alpha={0.5}
                name="Orders Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-600 text-center py-8">No revenue data available</p>
        )}
      </div>

      {/* User Growth Analytics */}
      <div className="card mb-6">
        <h3 className="text-xl font-bold mb-4">User Growth</h3>
        {userGrowthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#a855f7"
                fill="url(#colorUsers)"
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-neutral-600 text-center py-8">No user growth data available</p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders by Status */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Orders by Status</h3>
          {orderAnalytics.statusBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderAnalytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
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
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item._id] || '#8884d8' }}
                      ></div>
                      <span className="capitalize font-medium">{item._id}</span>
                    </div>
                    <span className="text-neutral-600">{item.count} orders</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-neutral-600 text-center py-8">No order data available</p>
          )}
        </div>

        {/* Users by Type */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Users by Type</h3>
          {userAnalytics.usersByType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userAnalytics.usersByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {userAnalytics.usersByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {userAnalytics.usersByType.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      ></div>
                      <span className="capitalize font-medium">{item._id}</span>
                    </div>
                    <span className="text-neutral-600">{item.count} users</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-neutral-600 text-center py-8">No user data available</p>
          )}
        </div>
      </div>

      {/* Orders by Category */}
      {orderAnalytics.ordersByCategory.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Orders & Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={orderAnalytics.ordersByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => [`${value}`, '']} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#14b8a6" name="Orders Count" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Statistics Details */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">User Statistics by Type</h3>
        {userAnalytics.usersByType.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Verified</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Active</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Verification Rate</th>
                </tr>
              </thead>
              <tbody>
                {userAnalytics.usersByType.map((item) => (
                  <tr key={item._id} className="border-b border-neutral-200">
                    <td className="px-6 py-3 capitalize font-medium">{item._id}</td>
                    <td className="px-6 py-3">{item.count}</td>
                    <td className="px-6 py-3">{item.verified}</td>
                    <td className="px-6 py-3">{item.active}</td>
                    <td className="px-6 py-3">
                      <span className="font-semibold">
                        {item.count > 0 ? ((item.verified / item.count) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-600 text-center py-8">No user statistics available</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
