import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userType: '',
    isVerified: '',
    search: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusChange, setStatusChange] = useState({ is_active: true, is_verified: false });

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.isVerified && { isVerified: filters.isVerified }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${selectedUser._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(statusChange)
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u._id === selectedUser._id ? data.data : u));
        setShowModal(false);
        alert('User status updated successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setStatusChange({
      is_active: user.is_active,
      is_verified: user.is_verified
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Name, email, or phone"
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">User Type</label>
          <select
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.userType}
            onChange={(e) => {
              setFilters({ ...filters, userType: e.target.value });
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="farmer">Farmer</option>
            <option value="consumer">Consumer</option>
            <option value="delivery_partner">Delivery Partner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Verification Status</label>
          <select
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.isVerified}
            onChange={(e) => {
              setFilters({ ...filters, isVerified: e.target.value });
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Verified</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-3">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-neutral-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm">{user.phone}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {user.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {user.is_verified ? (
                      <FaCheck className="text-green-600 text-lg" />
                    ) : (
                      <FaTimes className="text-red-600 text-lg" />
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm flex items-center gap-1"
                      >
                        <FaEdit className="text-sm" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm flex items-center gap-1"
                      >
                        <FaTrash className="text-sm" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-neutral-600">
                  No users found
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
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Update User Status</h3>
            <p className="text-neutral-600 mb-6">
              Updating status for {selectedUser.name}
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusChange.is_active}
                  onChange={(e) => setStatusChange({ ...statusChange, is_active: e.target.checked })}
                  className="mr-3"
                />
                <span className="text-neutral-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusChange.is_verified}
                  onChange={(e) => setStatusChange({ ...statusChange, is_verified: e.target.checked })}
                  className="mr-3"
                />
                <span className="text-neutral-700">Verified</span>
              </label>
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

export default UsersManagement;
