import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  const STATUS_OPTIONS = ['pending', 'confirmed', 'in_transit', 'completed', 'cancelled'];
  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`${API_URL}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === selectedOrder._id ? data.data : o));
        setShowModal(false);
        alert('Order status updated successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>

      {/* Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Status</label>
        <select
          className="w-full md:w-64 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Consumer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-3 text-sm font-mono">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-3">
                    <div>
                      <p className="font-medium">{order.consumer_id?.name || 'N/A'}</p>
                      <p className="text-xs text-neutral-600">{order.consumer_id?.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm">{order.product_id?.name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-3 font-semibold">
                    ₹{order.total_amount?.toLocaleString('en-IN') || 0}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-xs rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => openModal(order)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm flex items-center gap-1"
                    >
                      <FaEdit className="text-sm" /> Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-neutral-600">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-neutral-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Update Order Status</h3>
            
            <div className="mb-6">
              <p className="text-neutral-600 mb-4">
                <strong>Order ID:</strong> {selectedOrder._id.substring(0, 8)}...
              </p>
              <p className="text-neutral-600 mb-4">
                <strong>Current Status:</strong> <span className="capitalize">{selectedOrder.status}</span>
              </p>

              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status} className="capitalize">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 btn btn-primary"
              >
                Update
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
