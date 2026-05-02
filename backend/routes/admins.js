const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_gadget_secret';

const { admins } = require('../models/dataStore');

// GET /api/admins - List all admins
router.get('/', (req, res) => {
  try {
    const safe = admins.map(({ password, ...rest }) => rest);
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admins - Add new admin
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role_label, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    if (admins.find(a => a.email === email)) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    const newAdmin = {
      admin_id: admins.length + 1,
      name,
      email,
      phone: phone || '',
      role_label: role_label || 'Admin',
      password,
      active: true,
      created_at: new Date().toISOString().split('T')[0],
    };
    admins.push(newAdmin);

    await ActivityLog.create({
      user_id: 0,
      username: 'admin',
      role: 'admin',
      action: 'REGISTER',
      details: { name, email, role_label },
      status: 'SUCCESS',
    });

    const { password: _, ...safe } = newAdmin;
    res.status(201).json({ success: true, data: safe, message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admins/:id - Edit admin
router.put('/:id', async (req, res) => {
  try {
    const idx = admins.findIndex(a => a.admin_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Admin not found' });

    const { name, email, phone, role_label, password } = req.body;
    if (name) admins[idx].name = name;
    if (email) admins[idx].email = email;
    if (phone !== undefined) admins[idx].phone = phone;
    if (role_label) admins[idx].role_label = role_label;
    if (password) admins[idx].password = password;

    const { password: _, ...safe } = admins[idx];
    res.json({ success: true, data: safe, message: 'Admin updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admins/:id
router.delete('/:id', async (req, res) => {
  try {
    const idx = admins.findIndex(a => a.admin_id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Admin not found' });
    if (admins[idx].admin_id === 1) {
      return res.status(403).json({ success: false, error: 'Cannot delete super admin' });
    }
    const removed = admins.splice(idx, 1)[0];
    res.json({ success: true, message: `Admin "${removed.name}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admins/:id/toggle - Activate / Deactivate admin
router.put('/:id/toggle', async (req, res) => {
  try {
    const admin = admins.find(a => a.admin_id === Number(req.params.id));
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' });
    if (admin.admin_id === 1) return res.status(403).json({ success: false, error: 'Cannot deactivate super admin' });
    admin.active = !admin.active;
    const { password, ...safe } = admin;
    res.json({ success: true, data: safe, message: `Admin ${admin.active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admins/login - Admin login (supports sub-admins)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = admins.find(a => a.email === email && a.password === password && a.active);
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    const { password: _, ...safe } = admin;
    const token = jwt.sign({ id: admin.admin_id, role: 'admin', name: admin.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: admin.admin_id, name: admin.name, email: admin.email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, admins };
