const express = require('express');
const router = express.Router();
const { orders, order_items, products, payments, deliveries, customers } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/orders - All orders (admin) or by customer
router.get('/', async (req, res) => {
  try {
    let result = [...orders];
    if (req.query.customer_id) {
      result = result.filter(o => o.customer_id === Number(req.query.customer_id));
    }
    // Enrich with items
    const enriched = result.map(order => ({
      ...order,
      customer: customers.find(c => c.customer_id === order.customer_id),
      items: order_items.filter(i => i.order_id === order.order_id).map(item => ({
        ...item,
        product: products.find(p => p.product_id === item.product_id)
      })),
      payment: payments.find(p => p.order_id === order.order_id && p.payment_status !== 'Failed'),
      delivery: deliveries.find(d => d.order_id === order.order_id)
    }));
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = orders.find(o => o.order_id === Number(req.params.id));
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const result = {
      ...order,
      customer: customers.find(c => c.customer_id === order.customer_id),
      items: order_items.filter(i => i.order_id === order.order_id).map(item => ({
        ...item,
        product: products.find(p => p.product_id === item.product_id)
      })),
      payment: payments.filter(p => p.order_id === order.order_id),
      delivery: deliveries.find(d => d.order_id === order.order_id)
    };
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  try {
    const { customer_id, items, payment_method } = req.body;
    if (!customer_id || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'customer_id and items are required' });
    }

    // inventory check and update
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = products.find(p => p.product_id === item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
      }
      // check if out of stock
      if (product.stock_quantity < item.quantity) {
        await ActivityLog.create({
          user_id: customer_id,
          action: 'PLACE_ORDER',
          details: { error: 'Out of stock', product_id: item.product_id },
          status: 'FAILED'
        });
        return res.status(400).json({ success: false, error: `Product "${product.product_name}" is out of stock` });
      }
      const subtotal = product.price * item.quantity;
      total += subtotal;
      // update stock counts
      product.stock_quantity -= item.quantity;
      product.sold += item.quantity;
      orderItems.push({ item_id: order_items.length + orderItems.length + 1, order_id: orders.length + 1, product_id: item.product_id, quantity: item.quantity, subtotal });
    }

    const newOrder = {
      order_id: orders.length + 1,
      customer_id: Number(customer_id),
      order_date: new Date().toISOString().split('T')[0],
      total_amount: total,
      status: 'Processing'
    };
    orders.push(newOrder);
    order_items.push(...orderItems);

    // Add payment
    const newPayment = {
      payment_id: payments.length + 1,
      order_id: newOrder.order_id,
      payment_method: payment_method || 'Card',
      payment_status: 'Pending',
      payment_date: new Date().toISOString().split('T')[0],
      amount: total
    };
    payments.push(newPayment);

    // Add delivery
    const newDelivery = {
      delivery_id: deliveries.length + 1,
      order_id: newOrder.order_id,
      delivery_status: 'Pending',
      courier_name: null,
      delivery_date: null,
      tracking_number: null
    };
    deliveries.push(newDelivery);

    await ActivityLog.create({
      user_id: customer_id,
      action: 'PLACE_ORDER',
      details: { order_id: newOrder.order_id, total_amount: total, items: items.length },
      status: 'SUCCESS'
    });

    res.status(201).json({ success: true, data: { ...newOrder, payment: newPayment, delivery: newDelivery }, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = orders.find(o => o.order_id === Number(req.params.id));
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (['Shipped', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel a shipped or delivered order' });
    }

    order.status = 'Cancelled';
    // Restore stock
    const items = order_items.filter(i => i.order_id === order.order_id);
    items.forEach(item => {
      const product = products.find(p => p.product_id === item.product_id);
      if (product) { product.stock_quantity += item.quantity; product.sold -= item.quantity; }
    });

    await ActivityLog.create({
      user_id: req.body.customer_id || order.customer_id,
      action: 'CANCEL_ORDER',
      details: { order_id: order.order_id },
      status: 'SUCCESS'
    });

    res.json({ success: true, data: order, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/reports/top-selling
router.get('/reports/top-selling', (req, res) => {
  try {
    // fetch top-selling products
    const salesMap = {};
    order_items.forEach(item => {
      if (!salesMap[item.product_id]) salesMap[item.product_id] = { qty: 0, revenue: 0 };
      salesMap[item.product_id].qty += item.quantity;
      salesMap[item.product_id].revenue += item.subtotal;
    });
    const topSelling = Object.entries(salesMap)
      .map(([pid, data]) => {
        const product = products.find(p => p.product_id === Number(pid));
        return { product_id: Number(pid), product_name: product?.product_name, category: product?.category, quantity_sold: data.qty, revenue: data.revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({ success: true, data: topSelling });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/reports/seller-sales?seller_id=X
router.get('/reports/seller-sales', (req, res) => {
  try {
    const { seller_id } = req.query;
    let sellerProducts = seller_id
      ? products.filter(p => p.seller_id === Number(seller_id))
      : products;

    const report = sellerProducts.map(p => {
      const items = order_items.filter(i => i.product_id === p.product_id);
      const revenue = items.reduce((s, i) => s + i.subtotal, 0);
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        category: p.category,
        price: p.price,
        stock_quantity: p.stock_quantity,
        units_sold: p.sold,
        revenue,
        orders_count: items.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const totals = {
      total_products: report.length,
      total_revenue: report.reduce((s, p) => s + p.revenue, 0),
      total_sold: report.reduce((s, p) => s + p.units_sold, 0),
    };

    res.json({ success: true, data: { products: report, totals } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/reports/stock-levels
router.get('/reports/stock-levels', (req, res) => {
  try {
    const stockReport = products.map(p => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category: p.category,
      seller_id: p.seller_id,
      stock_quantity: p.stock_quantity,
      sold: p.sold,
      status: p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity <= 5 ? 'Critical' : p.stock_quantity <= 15 ? 'Low' : 'Adequate',
    })).sort((a, b) => a.stock_quantity - b.stock_quantity);

    res.json({ success: true, data: stockReport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
