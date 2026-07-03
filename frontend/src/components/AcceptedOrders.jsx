import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBox,
  FaTruck,
  FaCheckCircle,
 
} from 'react-icons/fa';
import { orderAPI } from '../utils/api';

const AcceptedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchMyOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders(activeTab);
      if (response.success) setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  /* ---------------- UPDATE STATUS ---------------- */
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      const response = await orderAPI.updateDeliveryStatus(orderId, {
        order_status: newStatus,
      });
      if (response.success) fetchMyOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  /* ---------------- STATUS STYLE ---------------- */
  const statusStyle = {
    assigned: "bg-blue-50 text-blue-600",
    picked_up: "bg-purple-50 text-purple-600",
    in_transit: "bg-amber-50 text-amber-600",
    delivered: "bg-emerald-50 text-emerald-600",
  };

  const statusText = {
    assigned: "Assigned",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
  };

  /* ---------------- SKELETON ---------------- */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="h-40 bg-neutral-200 rounded-2xl"/>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap gap-2 bg-neutral-100 p-1 rounded-xl w-fit">
        {[
          { label: "Active", value: "active" },
          { label: "Completed", value: "completed" },
          { label: "All", value: "all" },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition
            ${
              activeTab === tab.value
                ? "bg-white shadow text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm text-center py-12">
          <p className="text-neutral-500">
            No orders found for this category
          </p>
        </div>
      )}

      {/* ================= ORDER CARDS ================= */}
      <div className="space-y-5">
        {orders.map(order => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition p-6"
          >

            {/* HEADER */}
            <div className="flex flex-wrap justify-between gap-4 border-b pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  #{order.order_number}
                </h3>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[order.order_status]}`}
                >
                  {statusText[order.order_status]}
                </span>
              </div>

              <div className="text-right">
                <p className="font-bold text-xl">
                  ₹{order.total_price}
                </p>
                <p className="text-emerald-600 text-sm font-semibold">
                  +₹{order.delivery_charge} earning
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* ITEMS */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FaBox className="text-amber-500"/>
                  Items ({order.items.length})
                </h4>

                <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                  {order.items.map(item => (
                    <p key={item._id} className="text-neutral-600">
                      {item.product_name} × {item.quantity} {item.unit}
                    </p>
                  ))}
                </div>
              </div>

              {/* PICKUP */}
              <div>
                <h4 className="font-semibold mb-2 text-emerald-600 flex gap-2 items-center">
                  <FaMapMarkerAlt/> Pickup
                </h4>

                <p className="font-medium">
                  {order.farmer_id?.user_id?.name}
                </p>
                <p className="text-neutral-600 text-sm">
                  {order.farmer_id?.farm_name}
                </p>

                {order.farmer_id?.user_id?.phone && (
                  <a
                    href={`tel:${order.farmer_id.user_id.phone}`}
                    className="text-blue-600 text-sm flex gap-1 items-center hover:underline"
                  >
                    <FaPhoneAlt className="text-xs"/>
                    {order.farmer_id.user_id.phone}
                  </a>
                )}
              </div>

              {/* DELIVERY */}
              <div>
                <h4 className="font-semibold mb-2 text-blue-600 flex gap-2 items-center">
                  <FaTruck/> Deliver To
                </h4>

                <p className="font-medium">
                  {order.consumer_id?.user_id?.name}
                </p>

                <p className="text-neutral-600 text-sm">
                  {order.delivery_address?.street}
                </p>

                <p className="text-neutral-600 text-sm">
                  {order.delivery_address?.city},{" "}
                  {order.delivery_address?.pincode}
                </p>

                {order.consumer_id?.user_id?.phone && (
                  <a
                    href={`tel:${order.consumer_id.user_id.phone}`}
                    className="text-blue-600 text-sm flex gap-1 items-center hover:underline"
                  >
                    <FaPhoneAlt className="text-xs"/>
                    {order.consumer_id.user_id.phone}
                  </a>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {activeTab !== "completed" && (
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">

                {order.order_status === "assigned" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order._id, "picked_up")
                    }
                    disabled={updatingStatus === order._id}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                  >
                    {updatingStatus === order._id
                      ? "Updating..."
                      : "Mark Picked Up"}
                  </button>
                )}

                {order.order_status === "picked_up" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order._id, "in_transit")
                    }
                    className="px-5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
                  >
                    Mark In Transit
                  </button>
                )}

                {order.order_status === "in_transit" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order._id, "delivered")
                    }
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2"
                  >
                    <FaCheckCircle/>
                    Delivered
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default AcceptedOrders;