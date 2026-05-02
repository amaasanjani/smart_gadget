const express = require('express');
const router = express.Router();
const { payments, orders } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    let result = [...payments];
    if (req.query.status) result = result.filter(p => p.payment_status === req.query.status);
    if (req.query.order_id) result = result.filter(p => p.order_id === Number(req.query.order_id));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/process - Process Payment
router.post('/process', async (req, res) => {
  try {
    const { order_id, payment_method, customer_id } = req.body;
    if (!order_id || !payment_method) {
      return res.status(400).json({ success: false, error: 'order_id and payment_method required' });
    }

    const order = orders.find(o => o.order_id === Number(order_id));
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // handle payment processing
    // simulate payment gateway
    const isSuccess = Math.random() > 0.1;

    const payment = payments.find(p => p.order_id === Number(order_id) && p.payment_status === 'Pending');
    if (payment) {
      payment.payment_status = isSuccess ? 'Completed' : 'Failed';
      payment.payment_method = payment_method;
    }

    if (isSuccess) {
      order.status = 'Processing';
      await ActivityLog.create({
        user_id: customer_id || order.customer_id,
        action: 'PAYMENT_SUCCESS',
        details: { order_id, payment_method, amount: order.total_amount },
        status: 'SUCCESS'
      });
      res.json({ success: true, message: 'Payment processed successfully', payment });
    } else {
      // log failed payment
      await ActivityLog.create({
        user_id: customer_id || order.customer_id,
        action: 'PAYMENT_FAILED',
        details: { order_id, payment_method, amount: order.total_amount, reason: 'Gateway declined' },
        status: 'FAILED'
      });
      res.status(402).json({ success: false, message: 'Payment failed. Please try again.', error: 'Gateway declined' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/reports/revenue - Total Revenue report
router.get('/reports/revenue', async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly
    const completed = payments.filter(p => p.payment_status === 'Completed');

    // calculate total revenue
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const failed = payments.filter(p => p.payment_status === 'Failed');
    const pending = payments.filter(p => p.payment_status === 'Pending');

    // Monthly breakdown
    const monthlyBreakdown = {};
    completed.forEach(p => {
      const month = p.payment_date.substring(0, 7);
      monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + p.amount;
    });

    const methodBreakdown = {};
    completed.forEach(p => {
      methodBreakdown[p.payment_method] = (methodBreakdown[p.payment_method] || 0) + p.amount;
    });

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        total_transactions: completed.length,
        failed_transactions: failed.length,
        pending_transactions: pending.length,
        monthly_breakdown: Object.entries(monthlyBreakdown).map(([month, amount]) => ({ month, amount })),
        method_breakdown: Object.entries(methodBreakdown).map(([method, amount]) => ({ method, amount }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/reports/failed
router.get('/reports/failed', async (req, res) => {
  try {
    // fetch payment failures
    const failedLogs = await ActivityLog.find({ action: { $in: ['PAYMENT_FAILED', 'PAYMENT_ATTEMPT'] }, status: 'FAILED' })
      .sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, data: { db_failed: payments.filter(p => p.payment_status === 'Failed'), mongo_logs: failedLogs } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
