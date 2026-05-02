# project structure

- frontend: The React Application
- backend: The Node.js and Express.js Application
- database: The Oracle Database and MongoDB Database

# Technologies used

- frontend: React, Axios, React Router, React Hot Toast, GSAP
- backend: Node.js, Express.js, JWT
- database: Oracle Database, MongoDB

# how to run

- npm install in both frontend and backend
- npm run dev in frontend
- npm run start in backend    

# start the backend
- cd backend
- npm run start
- port 5000

# start the frontend
- cd frontend
- npm run dev
- port 3000
- https://localhost:3000/

# roles
- admin - admin@smartgadget.com / admin123
- seller - techzone@example.com / seller123
- customer - kasun@example.com / password123
- delivery - ravi@delivery.com / staff123

# features included

- user registration and login (customer, seller, delivery, admin)
- role base access control
- product browsing with search and filter
- add to cart and checkout (customer)
- order management (customer, seller, admin)
- seller dashboard to view orders and manage products
- admin dashboard to view reports, manage products and system statistics
- PL/SQL procedures for processing orders and payments
- MongoDB integration for tracking user activity and logins

# Database details

- oracle database includes for customers, sellers, products, orders, order items, payments, and deliveries. also implemented seversl PL/SQL features as required by the assignment.
- procedures for adding products and placing orders.
- Functions to calculte revenue and find to products
- Triggers to automatically update stock when an order is placed.

mongodb is used purely for logging activities, such as when a user logs in, place an order, or fails a payment.
