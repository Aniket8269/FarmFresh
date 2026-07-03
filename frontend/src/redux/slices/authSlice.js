import { createSlice } from '@reduxjs/toolkit';

// Demo mode - set to true to see dashboard without backend
const DEMO_MODE = false;

const initialState = {
  isAuthenticated: DEMO_MODE ? true : !!localStorage.getItem('token'),
  user: DEMO_MODE 
    ? null 
    : (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null),
  token: DEMO_MODE 
    ? 'demo_token_for_testing' 
    : (localStorage.getItem('token') || null),
  loading: false,
  error: null,
  isDemo: DEMO_MODE,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // Save profile IDs to localStorage
      if (action.payload.user.farmerId) {
        localStorage.setItem('farmerId', action.payload.user.farmerId);
      }
      if (action.payload.user.consumerId) {
        localStorage.setItem('consumerId', action.payload.user.consumerId);
      }
      if (action.payload.user.deliveryPartnerId) {
        localStorage.setItem('deliveryPartnerId', action.payload.user.deliveryPartnerId);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('farmerId');
      localStorage.removeItem('consumerId');
      localStorage.removeItem('deliveryPartnerId');
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // Save profile IDs to localStorage
      if (action.payload.user.farmerId) {
        localStorage.setItem('farmerId', action.payload.user.farmerId);
      }
      if (action.payload.user.consumerId) {
        localStorage.setItem('consumerId', action.payload.user.consumerId);
      }
      if (action.payload.user.deliveryPartnerId) {
        localStorage.setItem('deliveryPartnerId', action.payload.user.deliveryPartnerId);
      }
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
