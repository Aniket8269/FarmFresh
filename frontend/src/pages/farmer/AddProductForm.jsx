import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../utils/api';
import { FaCloudUploadAlt, FaPlus, FaTimes } from 'react-icons/fa';
import GoogleMapsLocationPicker from '../../components/GoogleMapsLocationPicker';

const AddProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [pickupLocation, setPickupLocation] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    weight: '',
    weight_unit: 'kg',
    quality: 'standard',
    specifications: '',
    quantity_available: '',
    image_url: '',
    is_organic: false,
    is_seasonal: false,
    harvest_date: '',
    expiry_date: '',
    tags: ''
  });

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Other'];
  const units = ['kg', 'liter', 'piece', 'dozen', 'bundle'];
  const qualities = ['premium', 'standard', 'economy'];
  const weightUnits = ['kg', 'g', 'liter', 'ml'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // For demo, use data URLs; in production, upload to cloud storage
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });

      // For API, we'll use the first image as main image
      if (fileArray[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            image_url: reader.result
          }));
        };
        reader.readAsDataURL(fileArray[0]);
      }
    }
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.price || 
        !formData.weight || !formData.quantity_available || !formData.image_url) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        quantity_available: parseInt(formData.quantity_available),
        images: previewUrls,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        harvest_date: formData.harvest_date || null,
        expiry_date: formData.expiry_date || null,
        farmer_pickup_location: pickupLocation ? {
          type: 'Point',
          coordinates: [pickupLocation.lng, pickupLocation.lat],
          address: pickupLocation.address
        } : null
      };

      const response = await productAPI.addProduct(productData);
      
      if (response.success) {
        setSuccess('Product added successfully!');
        setTimeout(() => {
          navigate('/farmer/dashboard');
        }, 2000);
      } else {
        setError(response.message || 'Failed to add product');
      }
    } catch (err) {
      setError(err.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom max-w-2xl">
        <h1 className="text-4xl font-bold mb-2">Add New Product</h1>
        <p className="text-neutral-600 mb-8">Fill in the details to add a new product to your farm</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Tomatoes"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product in detail..."
                rows="4"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Pricing & Quantity */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pricing & Quantity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  name="quantity_available"
                  value={formData.quantity_available}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Weight *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <select
                    name="weight_unit"
                    value={formData.weight_unit}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {weightUnits.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quality
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {qualities.map(q => (
                    <option key={q} value={q}>{q.charAt(0).toUpperCase() + q.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Specifications / Details
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder="e.g., Size: Large, Color: Red, Freshness: 2 days old"
                rows="3"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_organic"
                  checked={formData.is_organic}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-neutral-700">Organic Product</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_seasonal"
                  checked={formData.is_seasonal}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-neutral-700">Seasonal Product</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Harvest Date
                </label>
                <input
                  type="date"
                  name="harvest_date"
                  value={formData.harvest_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., fresh, premium, local"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pickup Location</h2>
            <p className="text-neutral-600 text-sm mb-4">
              Select the location from where customers can pick up this product
            </p>
            <GoogleMapsLocationPicker
              onLocationSelect={setPickupLocation}
              initialLocation={pickupLocation}
              placeholder="Search your farm location..."
              showAddress={true}
            />
            {pickupLocation && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✓ Location selected: {pickupLocation.address}
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center">
              <FaCloudUploadAlt className="text-4xl text-primary-500 mx-auto mb-3" />
              <label className="cursor-pointer">
                <p className="text-neutral-700 mb-2">Click to upload images or drag and drop</p>
                <p className="text-sm text-neutral-500 mb-4">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaPlus />
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/farmer/dashboard')}
              className="flex-1 bg-neutral-200 text-neutral-800 py-3 rounded-lg font-semibold hover:bg-neutral-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
