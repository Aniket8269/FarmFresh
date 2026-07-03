import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaBox, FaCheckCircle } from 'react-icons/fa';
import { orderAPI } from '../utils/api';

const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAvailableOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setAccepting(orderId);
      const response = await orderAPI.acceptOrder(orderId);
      if (response.success) {
        // Remove accepted order from list
        setOrders(orders.filter(o => o._id !== orderId));
        alert('Order accepted successfully!');
      }
    } catch (err) {
      alert('Failed to accept order: ' + err.message);
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-neutral-600">No available orders at the moment</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card border-l-4 border-blue-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order Info */}
              <div>
                <h3 className="font-bold text-lg mb-2">{order.order_number}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-600">
                    <strong>Items:</strong> {order.items.length} items
                  </p>
                  <p className="text-neutral-600">
                    <strong>Total:</strong> ₹{order.total_price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <FaBox className="text-orange-500" />
                    <span className="text-blue-600 font-medium">
                      Delivery: ₹{order.delivery_charge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup Location (Farmer) */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt /> Pickup Location
                </h4>
                {order.farmer_id?.user_id ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.farmer_id.user_id.name}</p>
                    <p className="text-neutral-600">{order.farmer_id.farm_name || 'Farm'}</p>
                    <p className="text-neutral-600 text-xs">
                      📍 {order.delivery_address?.city || 'Location'}
                    </p>
                    {order.farmer_id.user_id.phone && (
                      <p className="text-blue-600 flex items-center gap-1">
                        <FaPhoneAlt className="text-xs" />
                        {order.farmer_id.user_id.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500">Farmer location unavailable</p>
                )}
              </div>

              {/* Delivery Location (Consumer) */}
              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt /> Delivery Location
                </h4>
                {order.consumer_id?.user_id ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.consumer_id.user_id.name}</p>
                    <p className="text-neutral-600">
                      {order.delivery_address?.street}, {order.delivery_address?.city}
                    </p>
                    <p className="text-neutral-600 text-xs">
                      📍 {order.delivery_address?.pincode || 'Pincode'}
                    </p>
                    {order.consumer_id.user_id.phone && (
                      <p className="text-blue-600 flex items-center gap-1">
                        <FaPhoneAlt className="text-xs" />
                        {order.consumer_id.user_id.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500">Customer address unavailable</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleAcceptOrder(order._id)}
                disabled={accepting === order._id}
                className="btn-primary flex items-center gap-2"
              >
                <FaCheckCircle />
                {accepting === order._id ? 'Accepting...' : 'Accept Order'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AvailableOrders;
