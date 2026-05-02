const express = require('express');
const router = express.Router();
const { products, sellers } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/products - List all products with optional filters
router.get('/', async (req, res) => {
  try {
    let result = [...products];
    const { category, search, min_price, max_price, seller_id, sort } = req.query;

    if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    if (search) result = result.filter(p =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
    if (min_price) result = result.filter(p => p.price >= Number(min_price));
    if (max_price) result = result.filter(p => p.price <= Number(max_price));
    if (seller_id) result = result.filter(p => p.seller_id === Number(seller_id));

    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sort === 'best_selling') result.sort((a, b) => b.sold - a.sold);

    // Log search activity
    if (search) {
      await ActivityLog.create({
        user_id: req.query.user_id || 0,
        username: 'guest',
        action: 'SEARCH',
        details: { query: search, results: result.length },
        status: 'SUCCESS'
      });
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id - Single product
router.get('/:id', async (req, res) => {
  try {
    const product = products.find(p => p.product_id === Number(req.params.id));
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    await ActivityLog.create({
      user_id: req.query.user_id || 0,
      username: req.query.username || 'guest',
      action: 'VIEW_PRODUCT',
      details: { product_id: product.product_id, product_name: product.product_name },
      status: 'SUCCESS'
    });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products - Add new product (Seller only)
router.post('/', async (req, res) => {
  try {
    const { seller_id, product_name, category, price, stock_quantity, description, image } = req.body;
    if (!seller_id || !product_name || !category || !price) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // insert product
    const newProduct = {
      product_id: products.length + 1,
      seller_id: Number(seller_id),
      product_name,
      category,
      price: Number(price),
      stock_quantity: Number(stock_quantity) || 0,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400',
      rating: 0,
      sold: 0
    };
    products.push(newProduct);

    await ActivityLog.create({
      user_id: seller_id,
      username: req.body.seller_name || 'seller',
      role: 'seller',
      action: 'ADD_PRODUCT',
      details: { product_name, category, price },
      status: 'SUCCESS'
    });

    res.status(201).json({ success: true, data: newProduct, message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const idx = products.findIndex(p => p.product_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    Object.assign(products[idx], req.body);

    await ActivityLog.create({
      user_id: req.body.seller_id || 1,
      action: 'UPDATE_PRODUCT',
      details: { product_id: req.params.id, updates: req.body },
      status: 'SUCCESS'
    });

    res.json({ success: true, data: products[idx], message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const idx = products.findIndex(p => p.product_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    const removed = products.splice(idx, 1)[0];
    await ActivityLog.create({
      user_id: req.body.seller_id || 1,
      action: 'DELETE_PRODUCT',
      details: { product_id: req.params.id, product_name: removed.product_name },
      status: 'SUCCESS'
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/categories/list
router.get('/categories/list', (req, res) => {
  const cats = [...new Set(products.map(p => p.category))];
  res.json({ success: true, data: cats });
});

module.exports = router;
