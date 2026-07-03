import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [],
  totalPrice: 0,
  totalItems: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      const existingItem = state.items.find(item => item._id === payload._id);
      
      if (existingItem) {
        existingItem.quantity += payload.quantity || 1;
      } else {
        state.items.push({
          _id: payload._id,
          product_id: payload._id,
          name: payload.name,
          price: payload.price,
          unit: payload.unit,
          weight: payload.weight,
          weight_unit: payload.weight_unit,
          quality: payload.quality,
          category: payload.category,
          image_url: payload.image_url,
          farmer_id: payload.farmer_id,
          quantity: payload.quantity || 1,
          maxQuantity: payload.quantity_available || 100
        });
      }
      
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item._id === action.payload.product_id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
