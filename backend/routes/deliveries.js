const express = require('express');
const router = express.Router();
const { deliveries, orders, order_items, products, customers } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/deliveries
router.get('/', (req, res) => {
  try {
    let result = [...deliveries];
    if (req.query.status) result = result.filter(d => d.delivery_status === req.query.status);
    if (req.query.order_id) result = result.filter(d => d.order_id === Number(req.query.order_id));

    // Enrich with order & customer info
    const enriched = result.map(d => {
      const order = orders.find(o => o.order_id === d.order_id);
      const customer = order ? customers.find(c => c.customer_id === order.customer_id) : null;
      const items = order_items.filter(i => i.order_id === d.order_id).map(item => ({
        ...item,
        product: products.find(p => p.product_id === item.product_id),
      }));
      return {
        ...d,
        order,
        customer_name: customer ? customer.name : `Customer #${order?.customer_id}`,
        customer_address: customer ? customer.address : '',
        items,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deliveries/:id - Single delivery details
router.get('/:id', (req, res) => {
  try {
    const delivery = deliveries.find(d => d.delivery_id === Number(req.params.id));
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });

    const order = orders.find(o => o.order_id === delivery.order_id);
    const customer = order ? customers.find(c => c.customer_id === order.customer_id) : null;
    const items = order_items.filter(i => i.order_id === delivery.order_id).map(item => ({
      ...item,
      product: products.find(p => p.product_id === item.product_id),
    }));

    res.json({
      success: true,
      data: {
        ...delivery,
        order,
        customer_name: customer?.name,
        customer_address: customer?.address,
        customer_phone: customer?.phone,
        items,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/deliveries/:id/status - Update delivery status + courier details
router.put('/:id/status', async (req, res) => {
  try {
    const delivery = deliveries.find(d => d.delivery_id === Number(req.params.id));
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });

    const { delivery_status, courier_name, tracking_number, assigned_to } = req.body;
    const validStatuses = ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

    if (delivery_status) {
      if (!validStatuses.includes(delivery_status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
      }
      delivery.delivery_status = delivery_status;
      if (delivery_status === 'Delivered') {
        delivery.delivery_date = new Date().toISOString().split('T')[0];
        const order = orders.find(o => o.order_id === delivery.order_id);
        if (order) order.status = 'Delivered';
      } else if (delivery_status === 'Shipped') {
        const order = orders.find(o => o.order_id === delivery.order_id);
        if (order && order.status !== 'Delivered') order.status = 'Shipped';
      }
    }

    if (courier_name !== undefined) delivery.courier_name = courier_name;
    if (tracking_number !== undefined) delivery.tracking_number = tracking_number;
    if (assigned_to !== undefined) delivery.assigned_to = assigned_to;

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'DELIVERY_UPDATE',
      details: {
        delivery_id: delivery.delivery_id,
        order_id: delivery.order_id,
        new_status: delivery_status,
        courier_name,
        tracking_number,
      },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: delivery, message: 'Delivery updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/deliveries/:id/assign - Assign courier details
router.put('/:id/assign', async (req, res) => {
  try {
    const delivery = deliveries.find(d => d.delivery_id === Number(req.params.id));
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });

    const { courier_name, tracking_number, assigned_to, staff_name } = req.body;
    if (courier_name) delivery.courier_name = courier_name;
    if (tracking_number) delivery.tracking_number = tracking_number;
    if (assigned_to !== undefined) delivery.assigned_to = assigned_to;
    if (staff_name !== undefined) delivery.staff_name = staff_name;

    // Auto-advance status from Pending to Packed when assigned
    if (delivery.delivery_status === 'Pending' && courier_name) {
      delivery.delivery_status = 'Packed';
      const order = orders.find(o => o.order_id === delivery.order_id);
      if (order && order.status === 'Processing') order.status = 'Packed';
    }

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'ASSIGN_COURIER',
      details: { delivery_id: delivery.delivery_id, courier_name, tracking_number, assigned_to },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: delivery, message: 'Courier assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
