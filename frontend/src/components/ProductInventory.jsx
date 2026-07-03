import React, { useState, useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSync
} from 'react-icons/fa';
import { productAPI } from '../utils/api';

const ProductInventory = () => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getInventoryStatus();
      if (response.success) setInventory(response.data);
    } catch (err) {
      setError('Failed to fetch inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS BADGE ---------------- */
  const getStatusBadge = (status) => {
    const base =
      "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm";

    switch (status) {
      case 'in_stock':
        return (
          <span className={`${base} bg-emerald-50 text-emerald-600`}>
            <FaCheckCircle /> In Stock
          </span>
        );
      case 'low_stock':
        return (
          <span className={`${base} bg-amber-50 text-amber-600`}>
            <FaExclamationTriangle /> Low Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className={`${base} bg-red-50 text-red-600`}>
            <FaTimesCircle /> Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  const filteredProducts = inventory
    ? filter === 'all'
      ? inventory.products
      : inventory.products.filter(p => p.status === filter)
    : [];

  /* ---------------- SKELETON LOADER ---------------- */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-neutral-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-neutral-200 rounded-2xl" />
      </div>
    );
  }

  if (!inventory)
    return (
      <div className="text-center py-10 text-neutral-500">
        No inventory data
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {[
          { label: "Total Products", value: inventory.totalProducts, color: "blue" },
          { label: "Active Products", value: inventory.activeProducts, color: "emerald" },
          { label: "Low Stock", value: inventory.lowStockProducts, color: "amber" },
          { label: "Out of Stock", value: inventory.outOfStockProducts, color: "red" }
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 border border-neutral-100 border-l-4 border-${card.color}-500`}
          >
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 text-${card.color}-600`}>
              {card.value}
            </p>
          </div>
        ))}

      </div>

      {/* ================= FILTER + REFRESH ================= */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 bg-neutral-100 p-1 rounded-xl">
          {[
            { label: 'All', value: 'all' },
            { label: 'In Stock', value: 'in_stock' },
            { label: 'Low Stock', value: 'low_stock' },
            { label: 'Out', value: 'out_of_stock' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${
                filter === opt.value
                  ? 'bg-white shadow text-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* REFRESH */}
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition disabled:opacity-50"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          Refresh
        </button>

      </div>

      {/* ================= TABLE ================= */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 text-center py-12">
          <p className="text-neutral-500 text-sm">
            No products found for this filter
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 text-neutral-600 text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Product</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Available</th>
                <th className="px-6 py-4 text-right font-semibold">Sold</th>
                <th className="px-6 py-4 text-right font-semibold">Price (₹)</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(product => (
                <tr
                  key={product._id}
                  className="border-b last:border-none hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold">
                    {product.name}
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(product.status)}
                  </td>

                  <td
                    className={`px-6 py-4 text-right font-bold
                    ${
                      product.quantity === 0
                        ? 'text-red-500'
                        : product.quantity <= 5
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {product.quantity}
                  </td>

                  <td className="px-6 py-4 text-right text-neutral-600">
                    {product.sold}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    ₹{product.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= WARNING ================= */}
      {inventory.outOfStockProducts > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-600 mt-1" />
          <p className="text-amber-800 text-sm">
            You have <strong>{inventory.outOfStockProducts}</strong> products
            that are out of stock and hidden from customers.
          </p>
        </div>
      )}

    </div>
  );
};

export default ProductInventory;