import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { FaTruck, FaCheck, FaClock, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders('consumer');
      
      if (response.success) {
        setOrders(response.data || []);
        
        if (orderId && response.data) {
          const found = response.data.find(o => o._id === orderId);
          if (found) {
            setSelectedOrder(found);
          } else if (response.data.length > 0) {
            setSelectedOrder(response.data[0]);
          }
        } else if (response.data && response.data.length > 0) {
          setSelectedOrder(response.data[0]);
        }
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-600" />,
      confirmed: <FaCheck className="text-blue-600" />,
      assigned: <FaTruck className="text-blue-600" />,
      picked_up: <FaTruck className="text-orange-600" />,
      in_transit: <FaTruck className="text-purple-600" />,
      delivered: <FaCheck className="text-green-600" />,
      cancelled: <FaTimes className="text-red-600" />
    };
    return icons[status] || <FaClock />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      assigned: 'bg-blue-100 text-blue-700',
      picked_up: 'bg-orange-100 text-orange-700',
      in_transit: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <div className="section-padding text-center">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-md mx-auto">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-neutral-600">You haven't placed any orders yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Track Your Orders</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Your Orders</h2>
            <div className="space-y-3">
              {orders.map(o => (
                <button
                  key={o._id}
                  onClick={() => setSelectedOrder(o)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedOrder?._id === o._id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <p className="font-semibold text-sm">{o.order_number}</p>
                  <p className="text-xs text-neutral-600 mt-1">₹{o.total_price}</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${getStatusColor(o.order_status)}`}>
                    {o.order_status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOrder.order_number}</h2>
                    <p className="text-neutral-600 text-sm">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Order Timeline */}
                <h3 className="font-bold mb-4">Order Status</h3>
                <div className="space-y-4">
                  {selectedOrder.tracking_history && selectedOrder.tracking_history.length > 0 && (
                    <div className="relative">
                      {selectedOrder.tracking_history.map((history, index) => (
                        <div key={index} className="flex gap-4 mb-6">
                          <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                              ['delivered', 'confirmed', 'assigned', 'picked_up', 'in_transit'].includes(history.status)
                                ? 'bg-green-600'
                                : 'bg-gray-400'
                            }`}>
                              {getStatusIcon(history.status)}
                            </div>
                            {index !== selectedOrder.tracking_history.length - 1 && (
                              <div className="w-1 h-12 bg-gray-300 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-semibold capitalize">{history.status.replace('_', ' ')}</p>
                            <p className="text-sm text-neutral-600">
                              {new Date(history.timestamp).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Estimated Delivery */}
                {selectedOrder.estimated_delivery && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      <p className="font-semibold">Estimated Delivery</p>
                    </div>
                    <p className="text-blue-700">{formatDate(selectedOrder.estimated_delivery)}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="card mb-6">
                <h3 className="font-bold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-3 border-b">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-neutral-600">{item.quantity} {item.unit}</p>
                      </div>
                      <p className="font-semibold">₹{item.total_price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card mb-6">
                <h3 className="font-bold mb-4">Pickup Location</h3>
                <div className="text-sm">
                  {selectedOrder.pickup_location ? (
                    <>
                      <p className="font-semibold">{selectedOrder.pickup_location.street || 'Farmer Location'}</p>
                      <p className="text-neutral-600">
                        {selectedOrder.pickup_location.city}, {selectedOrder.pickup_location.state}
                      </p>
                      <p className="text-neutral-600">Pincode: {selectedOrder.pickup_location.pincode}</p>
                    </>
                  ) : (
                    <p className="text-neutral-600">No pickup location available</p>
                  )}
                </div>
              </div>

              <div className="card mb-6">
                <h3 className="font-bold mb-4">Delivery Address</h3>
                <div className="text-sm">
                  <p className="font-semibold">{selectedOrder.delivery_address.street}</p>
                  <p className="text-neutral-600">
                    {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}
                  </p>
                  <p className="text-neutral-600">Pincode: {selectedOrder.delivery_address.pincode}</p>
                </div>
              </div>

              {/* Price Summary */}
              <div className="card">
                <h3 className="font-bold mb-4">Price Summary</h3>
                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>₹{selectedOrder.delivery_charge}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₹{selectedOrder.total_price}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
