# 🚀 Smart Gadget Marketplace Management System

> **Full-stack assignment project** covering Oracle DB, PL/SQL, MongoDB, React frontend, Node.js/Express backend, real-time dashboard, reports, and activity logging.

---

## 📌 Project Overview

A complete gadget marketplace where customers buy, sellers sell, and admins monitor everything — built with:

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React.js (Vite), Vanilla CSS, GSAP  |
| Backend      | Node.js, Express.js                 |
| Main DB      | Oracle Database                     |
| NoSQL DB     | MongoDB (Activity Logs)             |
| Auth         | JWT (JSON Web Tokens)               |

---

## 🏗 Project Structure

```
smart_gadget/
├── frontend/           # React app (Vite)
│   └── src/
│       ├── pages/      # Home, Products, Cart, Checkout, Orders, Admin, Seller, Login, Register
│       ├── components/ # Navbar, Footer
│       ├── context/    # AuthContext, CartContext
│       └── utils/      # api.js (Axios)
├── backend/            # Node.js/Express API
│   ├── models/         # ActivityLog.js (MongoDB), mockData.js (Oracle sim)
│   └── routes/         # auth, products, orders, payments, deliveries, logs
└── database/
    ├── oracle/
    │   ├── 01_schema.sql       # Tables, sequences, indexes, views
    │   ├── 02_sample_data.sql  # 20+ products, 10+ customers, 15+ orders
    │   └── 03_plsql.sql        # Procedures, Functions, Triggers, Cursors
    └── mongodb/
        └── mongodb_queries.js  # All 4 required + bonus queries
```

---

## ⚡ Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 🔐 Demo Login Credentials

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@smartgadget.com        | admin123     |
| Customer | alice@example.com            | password123  |
| Seller   | techzone@example.com         | seller123    |

---

## 📡 API Endpoints

| Method | Endpoint                       | Description             |
|--------|-------------------------------|-------------------------|
| POST   | /api/auth/login               | Login                   |
| POST   | /api/auth/register/customer   | Register customer        |
| POST   | /api/auth/register/seller     | Register seller          |
| GET    | /api/products                 | List/filter products     |
| POST   | /api/products                 | Add product              |
| GET    | /api/products/:id             | Product detail           |
| POST   | /api/orders                   | Place order              |
| GET    | /api/orders?customer_id=X     | Customer orders          |
| PUT    | /api/orders/:id/cancel        | Cancel order             |
| POST   | /api/payments/process         | Process payment          |
| GET    | /api/payments/reports/revenue | Revenue report           |
| PUT    | /api/deliveries/:id/status    | Update delivery          |
| GET    | /api/logs                     | Activity logs            |
| GET    | /api/logs/dashboard           | Admin dashboard stats    |
| GET    | /api/logs/suspicious          | Suspicious activities    |

---

## 🗂 Oracle Database Tables

| Table        | Key Fields                                           |
|--------------|-----------------------------------------------------|
| customers    | customer_id, name, email, phone, address            |
| sellers      | seller_id, shop_name, owner_name, email, verified   |
| products     | product_id, seller_id, category, price, stock       |
| orders       | order_id, customer_id, total_amount, status         |
| order_items  | item_id, order_id, product_id, quantity, subtotal   |
| payments     | payment_id, order_id, payment_method, payment_status|
| deliveries   | delivery_id, order_id, delivery_status, courier     |

---

## 🔥 PL/SQL Objects

### Procedures
1. `add_new_product` — Validates seller & adds product
2. `process_payment` — Processes payment with status output
3. `place_order` — Full order flow with stock check

### Functions
1. `calculate_total_revenue(from, to)` — Revenue with date filter
2. `get_top_selling_product` — Best seller name
3. `get_customer_order_count(id)` — Order count for a customer

### Triggers
1. `trg_auto_update_stock` — Auto-decrements stock on order
2. `trg_failed_payment` — Resets order to Pending on failed payment
3. `trg_prevent_duplicate_seller` — Blocks duplicate seller emails

### Cursors
1. Top-Selling Products Cursor
2. Monthly Revenue Report Cursor

### Exception Handling
- Out of stock, Duplicate seller, Invalid data, Payment failure

---

## 📊 Reports

| Report | Description |
|--------|-------------|
| Top Selling Products | Product name, qty sold, revenue |
| Total Revenue | By method, monthly breakdown |
| Low Stock Alert | Products with ≤5 stock |

---

## 🍃 MongoDB Queries

| Query | Description |
|-------|-------------|
| Q1 | User Activity History — all actions by a user |
| Q2 | Peak Usage Times — busiest hours |
| Q3 | Failed Transactions — payment failures |
| Q4 | Suspicious Activities — 3+ failures in 24h |

---

## 🎯 Modules Covered

- ✅ User Management (Customer, Seller, Admin)
- ✅ Product Management (CRUD, search, filter)
- ✅ Seller Management (verification, store)
- ✅ Customer Management (cart, wishlist, history)
- ✅ Order Management (place, cancel, track)
- ✅ Payment Processing (Card, Bank, COD)
- ✅ Delivery Tracking (status updates)
- ✅ MongoDB Activity Logging
- ✅ Admin Dashboard (live stats, reports)
- ✅ Role-Based Access Control

---

*Built for academic assignment — Smart Gadget Marketplace Management System*
