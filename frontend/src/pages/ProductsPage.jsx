import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { addToCart } from '../redux/slices/cartSlice';
import { FaShoppingCart, FaStar, FaFilter, FaLeaf } from 'react-icons/fa';

const ProductsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Other'];

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 12
      };

      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await productAPI.getAllProducts(params);

      if (response.success) {
        setProducts(response.data || []);
        setTotalPages(response.pages || 1);
        setError('');
      }
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ================= HANDLERS ================= */

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = selectedQuantities[product._id] || 1;

    if (quantity > product.quantity_available) {
      alert(`Only ${product.quantity_available} units available`);
      return;
    }

    dispatch(addToCart({
      _id: product._id,
      product_id: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      weight: product.weight,
      weight_unit: product.weight_unit,
      quality: product.quality,
      category: product.category,
      image_url: product.image_url,
      farmer_id: product.farmer_id,
      quantity,
      quantity_available: product.quantity_available
    }));

    setSelectedQuantities(prev => ({
      ...prev,
      [product._id]: 1
    }));

    alert('Added to cart!');
  };

  if (loading && products.length === 0) {
    return <div className="text-center py-20 text-lg">Loading products...</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen py-10">
      <div className="container-custom">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
            Fresh Farm Products
          </h1>
          <p className="text-neutral-600 mt-2 text-lg">
            Buy directly from farmers — fresh & organic 🌱
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* SEARCH */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="🔎 Search fresh products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-6 py-4 rounded-xl border border-neutral-200 shadow-sm
            focus:ring-2 focus:ring-green-400 outline-none text-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* FILTER SIDEBAR */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">

              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FaFilter /> Categories
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    selectedCategory === ''
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-green-50'
                  }`}
                >
                  All Categories
                </button>

                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'hover:bg-green-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="lg:col-span-3">

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <FaFilter /> Filters
            </button>

            {products.length === 0 ? (
              <div className="text-center py-20 text-neutral-500 text-lg">
                No products found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                  {products.map(product => (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden group"
                    >

                      {/* IMAGE */}
                      <div
                        className="relative h-52 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-neutral-100">
                            <FaLeaf className="text-5xl text-neutral-300" />
                          </div>
                        )}

                        <span className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                          {product.category}
                        </span>

                        {product.is_organic && (
                          <span className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <FaLeaf /> Organic
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">

                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-2 text-sm">
                          <FaStar className="text-yellow-500" />
                          {product.rating}/5
                          <span className="text-neutral-500">
                            ({product.total_reviews})
                          </span>
                        </div>

                        <p className="text-sm text-neutral-600 mb-3">
                          {product.weight} {product.weight_unit} • {product.quality}
                        </p>

                        <p className="text-3xl font-extrabold text-green-600">
                          ₹{product.price}
                        </p>
                        <p className="text-xs text-neutral-500 mb-3">
                          per {product.unit}
                        </p>

                        {/* QUANTITY */}
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="number"
                            min="1"
                            max={product.quantity_available}
                            value={selectedQuantities[product._id] || 1}
                            onChange={(e) =>
                              handleQuantityChange(product._id, e.target.value)
                            }
                            className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                          />
                          <span className="text-xs text-neutral-500">
                            max {product.quantity_available}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity_available === 0}
                          className="w-full flex items-center justify-center gap-2
                          bg-gradient-to-r from-green-600 to-emerald-500
                          text-white py-3 rounded-xl font-semibold
                          hover:scale-[1.02] active:scale-95 transition
                          disabled:opacity-50"
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo(0, 0);
                        }}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'border hover:bg-neutral-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;