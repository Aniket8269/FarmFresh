import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    createOrderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action) => {
      state.loading = false;
      state.orders.push(action.payload);
      state.selectedOrder = action.payload;
    },
    createOrderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o._id === action.payload.orderId);
      if (order) {
        order.order_status = action.payload.status;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  selectOrder,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatus,
  clearError
} = ordersSlice.actions;

export default ordersSlice.reducer;
