const Product = require('../models/Product');
const Farmer = require('../models/Farmer');

// Add Product - Farmer adds new product
const addProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      price, 
      unit, 
      weight,
      weight_unit,
      quality,
      specifications,
      quantity_available, 
      image_url, 
      images,
      is_organic,
      is_seasonal,
      harvest_date,
      expiry_date,
      tags
    } = req.body;

    // Validation
    if (!name || !description || !category || !price || !unit || !weight || !quantity_available || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, price, unit, weight, quantity_available, image_url'
      });
    }

    // Get farmer_id from token
    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    // Create product
    const product = await Product.create({
      farmer_id: farmer._id,
      name: name.trim(),
      description,
      category,
      price: parseFloat(price),
      unit,
      weight: parseFloat(weight),
      weight_unit: weight_unit || 'kg',
      quality: quality || 'standard',
      specifications: specifications || '',
      quantity_available: parseInt(quantity_available),
      image_url,
      images: images || [],
      is_organic: is_organic || false,
      is_seasonal: is_seasonal || false,
      harvest_date: harvest_date ? new Date(harvest_date) : null,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      tags: tags || []
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error adding product'
    });
  }
};

// Get all products for a farmer
const getFarmerProducts = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const products = await Product.find({ farmer_id: farmerId, is_active: true })
      .populate('farmer_id', 'farm_name avg_rating')
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get Farmer Products Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// Get all products (public listing)
const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = { is_active: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('farmer_id', 'farm_name avg_rating address')
      .limit(limit * 1)
      .skip(skip)
      .sort({ created_at: -1 });

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    console.error('Get All Products Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('farmer_id', 'farm_name avg_rating address contact_phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

// Update product - Only farmer who created it can update
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      name, 
      description, 
      price, 
      quantity_available,
      weight,
      weight_unit,
      quality,
      specifications,
      image_url,
      images,
      is_active
    } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer owns this product
    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (product.farmer_id.toString() !== farmer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update fields
    if (name) product.name = name.trim();
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (quantity_available !== undefined) product.quantity_available = parseInt(quantity_available);
    if (weight) product.weight = parseFloat(weight);
    if (weight_unit) product.weight_unit = weight_unit;
    if (quality) product.quality = quality;
    if (specifications) product.specifications = specifications;
    if (image_url) product.image_url = image_url;
    if (images) product.images = images;
    if (is_active !== undefined) product.is_active = is_active;
    product.updated_at = new Date();

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer owns this product
    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (product.farmer_id.toString() !== farmer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Soft delete
    product.is_active = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

// Auto-remove products with 0 quantity
const removeZeroQuantityProducts = async (req, res) => {
  try {
    const result = await Product.updateMany(
      { quantity_available: { $lte: 0 } },
      { $set: { is_active: false } }
    );

    return res.status(200).json({
      success: true,
      message: 'Products with zero quantity have been removed',
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error('Remove Zero Quantity Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error removing zero quantity products'
    });
  }
};

// Get product inventory status (for farmer)
const getInventoryStatus = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    const products = await Product.find({ farmer_id: farmer._id })
      .select('name quantity_available quantity_sold is_active price')
      .sort({ created_at: -1 });

    const inventory = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      lowStockProducts: products.filter(p => p.quantity_available > 0 && p.quantity_available <= 5).length,
      outOfStockProducts: products.filter(p => p.quantity_available <= 0).length,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        quantity: p.quantity_available,
        sold: p.quantity_sold,
        isActive: p.is_active,
        price: p.price,
        status: p.quantity_available <= 0 ? 'out_of_stock' : p.quantity_available <= 5 ? 'low_stock' : 'in_stock'
      }))
    };

    return res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching inventory'
    });
  }
};

module.exports = {
  addProduct,
  getFarmerProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  removeZeroQuantityProducts,
  getInventoryStatus
};
