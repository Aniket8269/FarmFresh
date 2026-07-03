// Mock data for demo mode
export const mockAdminUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'admin@freshfarm.com',
  name: 'Admin User',
  user_type: 'admin',
  profile_pic: 'https://via.placeholder.com/150',
  is_verified: true
};

export const mockRevenueData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 70000 },
];

export const mockOrderData = [
  { name: 'Pending', value: 120, color: '#14b8a6' },
  { name: 'Confirmed', value: 450, color: '#a855f7' },
  { name: 'In Transit', value: 280, color: '#10b981' },
  { name: 'Delivered', value: 1850, color: '#ef4444' },
];

export const mockCategoryData = [
  { name: 'Vegetables', orders: 450 },
  { name: 'Fruits', orders: 380 },
  { name: 'Dairy', orders: 290 },
  { name: 'Grains', orders: 210 },
  { name: 'Herbs', orders: 160 },
];

export const mockStats = [
  {
    label: 'Total Users',
    value: '2,450',
    color: 'primary',
    change: '+12.5%'
  },
  {
    label: 'Total Orders',
    value: '2,700',
    color: 'blue',
    change: '+8.2%'
  },
  {
    label: 'Revenue',
    value: '₹3.2L',
    color: 'green',
    change: '+15.3%'
  },
  {
    label: 'Active Deliveries',
    value: '280',
    color: 'yellow',
    change: '+5.1%'
  },
];

export const mockOrders = [
  {
    _id: '1',
    order_number: 'ORD-2026-02-26-001',
    consumer_id: { name: 'John Doe' },
    farmer_id: { farm_name: 'Green Valley Farm' },
    total_price: 315,
    order_status: 'delivered',
    created_at: '2026-02-26T10:30:00Z'
  },
  {
    _id: '2',
    order_number: 'ORD-2026-02-26-002',
    consumer_id: { name: 'Jane Smith' },
    farmer_id: { farm_name: 'Organic Harvest' },
    total_price: 520,
    order_status: 'in_transit',
    created_at: '2026-02-26T11:15:00Z'
  },
];

export const mockUsers = [
  {
    _id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@farm.com',
    user_type: 'farmer',
    is_verified: true,
    created_at: '2026-02-20T08:00:00Z'
  },
  {
    _id: '2',
    name: 'Priya Sharma',
    email: 'priya@consumer.com',
    user_type: 'consumer',
    is_verified: true,
    created_at: '2026-02-21T09:00:00Z'
  },
];
