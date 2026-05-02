const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { products, orders, payments, customers, sellers, deliveries } = require('../models/dataStore');

// GET /api/logs - Activity logs
router.get('/', async (req, res) => {
  try {
    const { user_id, action, status, limit = 100, skip = 0 } = req.query;
    const filter = {};
    if (user_id) filter.user_id = Number(user_id);
    if (action) filter.action = action;
    if (status) filter.status = status;

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await ActivityLog.countDocuments(filter);
    res.json({ success: true, total, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/peak-usage - Peak Usage Times
router.get('/peak-usage', async (req, res) => {
  try {
    const result = await ActivityLog.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
          actions: { $push: '$action' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 24 }
    ]);
    res.json({ success: true, data: result.map(r => ({ hour: r._id, count: r.count })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/failed-transactions - failed transactions
router.get('/failed-transactions', async (req, res) => {
  try {
    const failed = await ActivityLog.find({
      action: { $in: ['PAYMENT_FAILED', 'PAYMENT_ATTEMPT'] },
      status: 'FAILED'
    }).sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, count: failed.length, data: failed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/suspicious - Suspicious Activities
router.get('/suspicious', async (req, res) => {
  try {
    // Users with 3+ failed login/payment attempts in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const suspicious = await ActivityLog.aggregate([
      {
        $match: {
          status: 'FAILED',
          action: { $in: ['LOGIN', 'PAYMENT_ATTEMPT', 'PAYMENT_FAILED'] },
          timestamp: { $gte: since }
        }
      },
      { $group: { _id: '$user_id', count: { $sum: 1 }, actions: { $push: '$action' }, last_attempt: { $max: '$timestamp' } } },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: suspicious });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/dashboard - Admin Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalRevenue = payments.filter(p => p.payment_status === 'Completed').reduce((s, p) => s + p.amount, 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalSellers = sellers.length;
    const totalProducts = products.length;
    const failedPayments = payments.filter(p => p.payment_status === 'Failed').length;
    const pendingDeliveries = deliveries.filter(d => d.delivery_status === 'Pending').length;
    const lowStock = products.filter(p => p.stock_quantity <= 5);

    // Top selling products
    const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map(p => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category: p.category,
      sold: p.sold,
      revenue: p.sold * p.price
    }));

    // Recent activity logs
    const recentLogs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(20);

    // Revenue by category
    const categoryRevenue = {};
    products.forEach(p => {
      const orderItemsForProduct = require('../models/dataStore').order_items.filter(oi => oi.product_id === p.product_id);
      const rev = orderItemsForProduct.reduce((sum, oi) => sum + oi.subtotal, 0);
      categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + rev;
    });

    const orderStatusBreakdown = {};
    orders.forEach(o => { orderStatusBreakdown[o.status] = (orderStatusBreakdown[o.status] || 0) + 1; });

    res.json({
      success: true,
      data: {
        stats: { totalRevenue, totalOrders, totalCustomers, totalSellers, totalProducts, failedPayments, pendingDeliveries },
        topProducts,
        lowStockAlerts: lowStock,
        recentActivity: recentLogs,
        categoryRevenue: Object.entries(categoryRevenue).map(([cat, rev]) => ({ category: cat, revenue: rev })),
        orderStatusBreakdown: Object.entries(orderStatusBreakdown).map(([status, count]) => ({ status, count }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/logs - Manual log entry
router.post('/', async (req, res) => {
  try {
    const log = await ActivityLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
