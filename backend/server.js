require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// init uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// req logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// db connect
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_gadget_logs')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.log('⚠️  MongoDB not connected (running locally):', err.message));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/categories', require('./routes/categories'));

app.use('/api/admins', require('./routes/admins').router);
app.use('/api/logs', require('./routes/logs'));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

// health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Gadget Marketplace API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404
app.use('/{*splat}', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// err handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(` Smart Gadget Marketplace API running on http://localhost:${PORT}`);
  console.log(` Admin Login: admin@smartgadget.com / admin123`);
  console.log(` Sample Customer: kasun@example.com / password123`);
  console.log(` Sample Seller: techzone@example.com / seller123\n`);
});

module.exports = app;
