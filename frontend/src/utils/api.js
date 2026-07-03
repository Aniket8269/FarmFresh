// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Make API requests with token
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API endpoints
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },

  getUserProfile: async () => {
    return apiCall('/auth/profile', {
      method: 'GET',
    });
  },

  resetPassword: async (currentPassword, newPassword, confirmPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  updateProfile: async (profileData) => {
    return apiCall('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },
};

// Product API endpoints
export const productAPI = {
  addProduct: async (productData) => {
    return apiCall('/products/add', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  getFarmerProducts: async (farmerId) => {
    return apiCall(`/products/farmer/${farmerId}`, {
      method: 'GET',
    });
  },

  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products/all${queryString ? '?' + queryString : ''}`;
    return apiCall(endpoint, {
      method: 'GET',
    });
  },

  getProductById: async (productId) => {
    return apiCall(`/products/${productId}`, {
      method: 'GET',
    });
  },

  updateProduct: async (productId, productData) => {
    return apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (productId) => {
    return apiCall(`/products/${productId}`, {
      method: 'DELETE',
    });
  },

  getInventoryStatus: async () => {
    return apiCall('/products/inventory/status', {
      method: 'GET',
    });
  },

  removeZeroQuantityProducts: async () => {
    return apiCall('/products/cleanup/zero-quantity', {
      method: 'POST',
    });
  },
};

// Order API endpoints
export const orderAPI = {
  createOrder: async (orderData) => {
    return apiCall('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async (role) => {
    const queryRole = role || 'consumer';
    return apiCall(`/orders?role=${queryRole}`, {
      method: 'GET',
    });
  },

  getOrderById: async (orderId) => {
    return apiCall(`/orders/${orderId}`, {
      method: 'GET',
    });
  },

  updateOrderStatus: async (orderId, statusData) => {
    return apiCall(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },

  // Delivery Partner endpoints
  getAvailableOrders: async () => {
    return apiCall('/orders/available/orders', {
      method: 'GET',
    });
  },

  acceptOrder: async (orderId) => {
    return apiCall(`/orders/${orderId}/accept`, {
      method: 'POST',
    });
  },

  getMyOrders: async (status = 'all') => {
    return apiCall(`/orders/delivery/my-orders?status=${status}`, {
      method: 'GET',
    });
  },

  getEarnings: async (period = 'all') => {
    return apiCall(`/orders/delivery/earnings?period=${period}`, {
      method: 'GET',
    });
  },

  updateDeliveryStatus: async (orderId, statusData) => {
    return apiCall(`/orders/${orderId}/delivery-status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },
};

export default apiCall;
