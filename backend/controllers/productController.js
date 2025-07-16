const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  console.log('Decoded user:', req.user); // Debug log
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    if (!req.body) return res.status(400).json({ message: 'No form data received' });
    const title = req.body.title || '';
    const description = req.body.description || '';
    // Parse value as number
    const value = req.body.value ? Number(req.body.value) : 0;
    // Parse tags as array if provided as comma-separated string
    let tags = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else {
        tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    let images = [];
    if (req.file) {
      images.push(`/uploads/${req.file.filename}`);
    }
    const product = new Product({
      title,
      description,
      images,
      tags,
      value,
      owner: req.user.id
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('owner', 'name skills profilePhoto location bio');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'name skills profilePhoto location bio');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    // Handle image update
    if (req.file) {
      product.images = [`/uploads/${req.file.filename}`];
    } else if (req.body.images) {
      // If images are sent in the body (e.g., for removing images)
      product.images = req.body.images;
    }

    // Update other fields
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.value = req.body.value !== undefined ? Number(req.body.value) : product.value;
    product.tags = req.body.tags || product.tags;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 