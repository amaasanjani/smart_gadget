const express = require('express');
const router = express.Router();
const { customers, sellers } = require('../models/dataStore');

const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_gadget_secret';

// POST /api/auth/register/customer
router.post('/register/customer', async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    if (customers.find(c => c.email === email)) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const newCustomer = {
      customer_id: customers.length + 1,
      name, email, phone: phone || '', address: address || '',
      password,
      created_at: new Date().toISOString().split('T')[0]
    };
    customers.push(newCustomer);

    await ActivityLog.create({
      user_id: newCustomer.customer_id,
      username: name,
      role: 'customer',
      action: 'REGISTER',
      details: { email },
      status: 'SUCCESS'
    });

    const token = jwt.sign({ id: newCustomer.customer_id, role: 'customer', name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: newCustomer.customer_id, name, email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register/seller
router.post('/register/seller', async (req, res) => {
  try {
    const { shop_name, owner_name, email, phone, address, password } = req.body;
    if (!shop_name || !owner_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    if (sellers.find(s => s.email === email)) {
      return res.status(409).json({ success: false, error: 'Email already registered as a seller' });
    }
    const newSeller = {
      seller_id: sellers.length + 1,
      shop_name, owner_name, email, phone: phone || '', address: address || '',
      verified: false, rating: 0, password,
      created_at: new Date().toISOString().split('T')[0]
    };
    sellers.push(newSeller);

    await ActivityLog.create({
      user_id: newSeller.seller_id,
      username: owner_name,
      role: 'seller',
      action: 'REGISTER',
      details: { email, shop_name },
      status: 'SUCCESS'
    });

    const token = jwt.sign({ id: newSeller.seller_id, role: 'seller', name: owner_name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: newSeller.seller_id, name: owner_name, shop: shop_name, email, role: 'seller' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    let user = null;
    let userRole = role || 'customer';

    if (email === 'admin@smartgadget.com' && password === 'admin123') {
      user = { id: 0, name: 'Admin', email, role: 'admin' };
      userRole = 'admin';
    } else if (userRole === 'seller') {
      const seller = sellers.find(s => s.email === email && s.password === password);
      if (seller) user = { id: seller.seller_id, name: seller.owner_name, shop: seller.shop_name, email, role: 'seller' };

    } else {
      const customer = customers.find(c => c.email === email && c.password === password);
      if (customer) user = { id: customer.customer_id, name: customer.name, email, role: 'customer' };
    }

    if (!user) {
      await ActivityLog.create({
        user_id: 0, username: email,
        action: 'LOGIN',
        details: { email, role: userRole },
        status: 'FAILED'
      });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await ActivityLog.create({
      user_id: user.id, username: user.name, role: userRole,
      action: 'LOGIN',
      details: { email },
      status: 'SUCCESS'
    });

    const token = jwt.sign({ id: user.id, role: userRole, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { user_id, username } = req.body;
    await ActivityLog.create({
      user_id: user_id || 0,
      username: username || 'user',
      action: 'LOGOUT',
      details: {},
      status: 'SUCCESS'
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/customers
router.get('/customers', (req, res) => {
  const safe = customers.map(({ password, ...rest }) => rest);
  res.json({ success: true, data: safe });
});

// GET /api/auth/sellers
router.get('/sellers', (req, res) => {
  const safe = sellers.map(({ password, ...rest }) => rest);
  res.json({ success: true, data: safe });
});

// PUT /api/auth/customers/:id - Update customer profile & delivery address
router.put('/customers/:id', async (req, res) => {
  try {
    const idx = customers.findIndex(c => c.customer_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Customer not found' });
    const { name, phone, address } = req.body;
    if (name) customers[idx].name = name;
    if (phone !== undefined) customers[idx].phone = phone;
    if (address !== undefined) customers[idx].address = address;
    const { password, ...safe } = customers[idx];
    await ActivityLog.create({
      user_id: customers[idx].customer_id,
      username: customers[idx].name,
      role: 'customer',
      action: 'UPDATE_PROFILE',
      details: { updates: { name, phone, address } },
      status: 'SUCCESS',
    });
    res.json({ success: true, data: safe, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/sellers/:id - Update seller profile
router.put('/sellers/:id', async (req, res) => {
  try {
    const idx = sellers.findIndex(s => s.seller_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Seller not found' });
    const { owner_name, shop_name, phone, address } = req.body;
    if (owner_name) sellers[idx].owner_name = owner_name;
    if (shop_name) sellers[idx].shop_name = shop_name;
    if (phone !== undefined) sellers[idx].phone = phone;
    if (address !== undefined) sellers[idx].address = address;
    const { password, ...safe } = sellers[idx];
    res.json({ success: true, data: safe, message: 'Seller profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/sellers/:id/verify - Toggle seller verified status (admin)
router.put('/sellers/:id/verify', async (req, res) => {
  try {
    const seller = sellers.find(s => s.seller_id === Number(req.params.id));
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found' });
    seller.verified = !seller.verified;
    const { password, ...safe } = seller;
    res.json({ success: true, data: safe, message: `Seller ${seller.verified ? 'verified' : 'unverified'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/sellers/:id/suspend - Toggle seller active/suspended (admin)
router.put('/sellers/:id/suspend', async (req, res) => {
  try {
    const seller = sellers.find(s => s.seller_id === Number(req.params.id));
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found' });
    seller.active = !seller.active;
    const { password, ...safe } = seller;
    res.json({ success: true, data: safe, message: `Seller ${seller.active ? 'activated' : 'suspended'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/sellers/:id - Delete seller (admin)
router.delete('/sellers/:id', async (req, res) => {
  try {
    const idx = sellers.findIndex(s => s.seller_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Seller not found' });
    const removed = sellers.splice(idx, 1)[0];
    res.json({ success: true, message: `Seller "${removed.shop_name}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/customers/:id - Delete customer (admin)
router.delete('/customers/:id', async (req, res) => {
  try {
    const idx = customers.findIndex(c => c.customer_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Customer not found' });
    const removed = customers.splice(idx, 1)[0];
    res.json({ success: true, message: `Customer "${removed.name}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

