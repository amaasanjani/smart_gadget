const express = require('express');
const router = express.Router();
const { deliveries, orders, products, order_items, deliveryStaff } = require('../models/dataStore');
const ActivityLog = require('../models/ActivityLog');

// GET /api/delivery-staff - List all staff (admin)
router.get('/', (req, res) => {
  try {
    const safe = deliveryStaff.map(({ password, ...rest }) => rest);
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/delivery-staff/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    if (deliveryStaff.find(s => s.email === email)) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const newStaff = {
      staff_id: deliveryStaff.length + 1,
      name, email, phone: phone || '',
      password,
      status: 'Active',
      assigned_count: 0,
    };
    deliveryStaff.push(newStaff);
    const { password: _, ...safe } = newStaff;
    res.status(201).json({ success: true, data: safe, message: 'Delivery staff registered' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/delivery-staff/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = deliveryStaff.find(s => s.email === email && s.password === password);
    if (!staff) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const { password: _, ...safe } = staff;
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'smart_gadget_secret';
    const token = jwt.sign({ id: staff.staff_id, role: 'delivery', name: staff.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: staff.staff_id, name: staff.name, email: staff.email, role: 'delivery' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/delivery-staff/:id/deliveries - Get assigned deliveries for a staff
router.get('/:id/deliveries', (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const assigned = deliveries.filter(d => d.assigned_to === staffId || (!d.assigned_to && d.delivery_status !== 'Delivered'));
    const enriched = assigned.map(d => ({
      ...d,
      order: orders.find(o => o.order_id === d.order_id),
      items: order_items.filter(i => i.order_id === d.order_id).map(item => ({
        ...item,
        product: products.find(p => p.product_id === item.product_id),
      })),
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/delivery-staff/assign - Assign delivery to staff
router.put('/assign', async (req, res) => {
  try {
    const { delivery_id, staff_id, courier_name, tracking_number } = req.body;
    const delivery = deliveries.find(d => d.delivery_id === Number(delivery_id));
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });

    delivery.assigned_to = Number(staff_id);
    if (courier_name) delivery.courier_name = courier_name;
    if (tracking_number) delivery.tracking_number = tracking_number;
    if (delivery.delivery_status === 'Pending') delivery.delivery_status = 'Packed';

    // Update order status
    const order = orders.find(o => o.order_id === delivery.order_id);
    if (order && order.status === 'Processing') order.status = 'Packed';

    await ActivityLog.create({
      user_id: req.body.admin_id || 0,
      role: 'admin',
      action: 'ASSIGN_COURIER',
      details: { delivery_id, staff_id, courier_name },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: delivery, message: 'Courier assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/delivery-staff/update-status - Delivery staff updates dispatch/delivery status
router.put('/update-status', async (req, res) => {
  try {
    const { delivery_id, delivery_status, staff_id } = req.body;
    const delivery = deliveries.find(d => d.delivery_id === Number(delivery_id));
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });

    const validStatuses = ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(delivery_status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    delivery.delivery_status = delivery_status;
    if (delivery_status === 'Delivered') {
      delivery.delivery_date = new Date().toISOString().split('T')[0];
      const order = orders.find(o => o.order_id === delivery.order_id);
      if (order) order.status = 'Delivered';
    } else if (delivery_status === 'Shipped') {
      const order = orders.find(o => o.order_id === delivery.order_id);
      if (order) order.status = 'Shipped';
    }

    await ActivityLog.create({
      user_id: staff_id || 0,
      role: 'delivery',
      action: 'UPDATE_DELIVERY_STATUS',
      details: { delivery_id, new_status: delivery_status },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: delivery, message: `Delivery status updated to ${delivery_status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, deliveryStaff };
