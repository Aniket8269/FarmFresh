import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    priceRange: [0, 10000],
    search: '',
    rating: 0,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      
      // Apply filters
      let filtered = state.products;
      
      if (state.filters.category) {
        filtered = filtered.filter(p => p.category === state.filters.category);
      }
      
      if (state.filters.search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(state.filters.search.toLowerCase())
        );
      }
      
      if (state.filters.rating > 0) {
        filtered = filtered.filter(p => p.rating >= state.filters.rating);
      }
      
      filtered = filtered.filter(p => 
        p.price >= state.filters.priceRange[0] && p.price <= state.filters.priceRange[1]
      );
      
      state.filteredProducts = filtered;
    },
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setFilters,
  selectProduct,
  clearError
} = productsSlice.actions;

export default productsSlice.reducer;
