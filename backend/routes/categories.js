const express = require('express');
const router = express.Router();
const { products, categories } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/categories - list all with optional search + status filter
router.get('/', (req, res) => {
  try {
    let result = [...categories];
    const { search, active } = req.query;
    if (search) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (active !== undefined) {
      result = result.filter(c => c.active === (active === 'true'));
    }
    // Enrich with product counts
    const enriched = result.map(c => ({
      ...c,
      product_count: products.filter(p => p.category === c.name).length,
    }));
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories/:id
router.get('/:id', (req, res) => {
  try {
    const cat = categories.find(c => c.category_id === Number(req.params.id));
    if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
    const catProducts = products.filter(p => p.category === cat.name);
    res.json({ success: true, data: { ...cat, products: catProducts, product_count: catProducts.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories - Add category
router.post('/', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ success: false, error: 'Category already exists' });
    }
    const newCat = {
      category_id: categories.length + 1,
      name,
      description: description || '',
      image: image || '📦',
      active: true,
      created_at: new Date().toISOString().split('T')[0],
    };
    categories.push(newCat);

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      username: 'admin',
      role: 'admin',
      action: 'ADD_CATEGORY',
      details: { name },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: newCat, message: 'Category added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id - Edit category
router.put('/:id', async (req, res) => {
  try {
    const idx = categories.findIndex(c => c.category_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Category not found' });

    const oldName = categories[idx].name;
    const { name, description, image } = req.body;

    if (name && name !== oldName) {
      // Rename products under old category to new category name
      products.forEach(p => { if (p.category === oldName) p.category = name; });
    }
    if (name) categories[idx].name = name;
    if (description !== undefined) categories[idx].description = description;
    if (image !== undefined) categories[idx].image = image;

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'EDIT_CATEGORY',
      details: { category_id: req.params.id, updates: req.body },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: categories[idx], message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const idx = categories.findIndex(c => c.category_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Category not found' });
    const removed = categories.splice(idx, 1)[0];

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'DELETE_CATEGORY',
      details: { name: removed.name },
      status: 'SUCCESS',
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id/toggle - Activate / Deactivate
router.put('/:id/toggle', async (req, res) => {
  try {
    const cat = categories.find(c => c.category_id === Number(req.params.id));
    if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
    cat.active = !cat.active;

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: cat.active ? 'ACTIVATE_CATEGORY' : 'DEACTIVATE_CATEGORY',
      details: { category_id: cat.category_id, name: cat.name },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: cat, message: `Category ${cat.active ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories/:id/assign - Assign products to category
router.post('/:id/assign', async (req, res) => {
  try {
    const cat = categories.find(c => c.category_id === Number(req.params.id));
    if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
    const { product_ids } = req.body;
    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({ success: false, error: 'product_ids array required' });
    }
    let updated = 0;
    product_ids.forEach(pid => {
      const p = products.find(p => p.product_id === Number(pid));
      if (p) { p.category = cat.name; updated++; }
    });

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'ASSIGN_PRODUCTS_CATEGORY',
      details: { category: cat.name, count: updated },
      status: 'SUCCESS',
    });

    res.json({ success: true, message: `${updated} product(s) assigned to ${cat.name}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories/reports/summary - Category reports
router.get('/reports/summary', (req, res) => {
  try {
    const report = categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat.name);
      const totalRevenue = catProducts.reduce((s, p) => s + p.price * p.sold, 0);
      const totalSold = catProducts.reduce((s, p) => s + p.sold, 0);
      const totalStock = catProducts.reduce((s, p) => s + p.stock_quantity, 0);
      return {
        category_id: cat.category_id,
        name: cat.name,
        active: cat.active,
        product_count: catProducts.length,
        total_sold: totalSold,
        total_revenue: totalRevenue,
        total_stock: totalStock,
        avg_price: catProducts.length ? Math.round(catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length) : 0,
      };
    }).sort((a, b) => b.total_revenue - a.total_revenue);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
