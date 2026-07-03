import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { orderAPI } from '../utils/api';
import { FaTrash, FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import GoogleMapsLocationPicker from '../components/GoogleMapsLocationPicker';
import DeliveryChargePreview from '../components/DeliveryChargePreview';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice, totalItems } = useSelector(state => state.cart);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Default Mumbai coordinates
    }
  });

  const [checkoutData, setCheckoutData] = useState({
    payment_method: 'cod',
    notes: ''
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ product_id: productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCheckout = () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      setError('Please fill all address fields');
      return false;
    }
    if (!checkoutData.payment_method) {
      setError('Please select a payment method');
      return false;
    }
    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateCheckout()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        cartItems: items.map(item => ({
          product_id: item._id,
          quantity: item.quantity
        })),
        payment_method: checkoutData.payment_method,
        delivery_address: deliveryAddress,
        notes: checkoutData.notes,
        deliveryLocation: deliveryLocation || {
          lat: deliveryAddress.location?.coordinates[1] || 19.0760,
          lng: deliveryAddress.location?.coordinates[0] || 72.8777
        }
      };

      const response = await orderAPI.createOrder(orderPayload);

      if (response.success) {
        setOrderCreated(true);
        dispatch(clearCart());
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  // Tax calculation
  const tax = Math.round(totalPrice * 0.05);
  const deliveryCharge = totalItems > 0 ? 50 : 0;
  const grandTotal = totalPrice + tax + deliveryCharge;

  if (orderCreated) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-md mx-auto">
          <div className="card text-center py-12">
            <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Created Successfully!</h2>
            <p className="text-neutral-600 mb-6">Your order has been placed. You will be redirected to your orders page.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              View Your Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !showCheckoutForm) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-md mx-auto">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-neutral-600 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <FaChevronLeft /> Continue Shopping
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!showCheckoutForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-6">Shopping Cart ({totalItems} items)</h1>

              <div className="space-y-4">
                {items.map(item => (
                  <div key={item._id} className="card flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-100" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {item.weight} {item.weight_unit} • {item.quality} • {item.category}
                      </p>
                      <p className="text-sm font-semibold text-primary-600 mb-3">
                        ₹{item.price} per {item.unit}
                      </p>

                      {/* Quantity and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border border-neutral-300 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-600 hover:text-red-800 ml-auto"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Delivery Charge</span>
                    <span className="font-semibold">₹{deliveryCharge}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-6 mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary-600">₹{grandTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 border border-neutral-300 py-3 rounded-lg hover:bg-neutral-50 font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Delivery Address & Location</h2>

              {/* Google Maps Location Picker */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Select Delivery Location on Map</h3>
                <GoogleMapsLocationPicker
                  onLocationSelect={(location) => {
                    setDeliveryLocation(location);
                    setDeliveryAddress(prev => ({
                      ...prev,
                      location: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat]
                      },
                      street: location.address || prev.street
                    }));
                  }}
                  initialLocation={deliveryLocation}
                  placeholder="Search your delivery location..."
                  showAddress={true}
                />
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={deliveryAddress.street}
                    onChange={handleAddressChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="400001"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Payment Method</h3>

                <div className="space-y-3">
                  <label className="flex items-center border border-neutral-300 rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={checkoutData.payment_method === 'cod'}
                      onChange={handleCheckoutChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-neutral-600">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className="flex items-center border border-neutral-300 rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={checkoutData.payment_method === 'upi'}
                      onChange={handleCheckoutChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">UPI</p>
                      <p className="text-sm text-neutral-600">Google Pay, PhonePe, PayTM</p>
                    </div>
                  </label>

                  <label className="flex items-center border border-neutral-300 rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={checkoutData.payment_method === 'card'}
                      onChange={handleCheckoutChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Debit/Credit Card</p>
                      <p className="text-sm text-neutral-600">Visa, Mastercard</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={checkoutData.notes}
                    onChange={handleCheckoutChange}
                    placeholder="E.g., Ring the bell thrice"
                    rows="3"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 border border-neutral-300 py-3 rounded-lg hover:bg-neutral-50 font-semibold"
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="card sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="mb-6 max-h-96 overflow-y-auto">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between mb-2 pb-2 border-b">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-neutral-600">{item.quantity} {item.unit}</p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery Charge Preview */}
                {deliveryLocation && (
                  <div className="mb-6">
                    <DeliveryChargePreview
                      pickupLocation={{ lat: 19.0760, lng: 72.8777 }} // Default location for preview
                      deliveryLocation={deliveryLocation}
                      loading={loading}
                    />
                  </div>
                )}

                <div className="space-y-3 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Delivery Charge</span>
                    <span className="font-semibold">₹{deliveryCharge}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <span className="text-lg font-bold">Grand Total</span>
                  <span className="text-2xl font-bold text-primary-600">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
