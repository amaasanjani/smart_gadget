// Example data
db.activity_logs.insertMany([
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "LOGIN",          status: "SUCCESS", details: { email: "kasun@example.com" }, timestamp: new Date("2026-04-28T08:00:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "SEARCH",         status: "SUCCESS", details: { query: "Samsung Galaxy" },     timestamp: new Date("2026-04-28T08:02:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "VIEW_PRODUCT",   status: "SUCCESS", details: { product_id: 1 },                timestamp: new Date("2026-04-28T08:03:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "ADD_TO_CART",    status: "SUCCESS", details: { product_id: 1 },                timestamp: new Date("2026-04-28T08:05:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "PLACE_ORDER",    status: "SUCCESS", details: { order_id: 1, amount: 245000 },  timestamp: new Date("2026-04-28T08:10:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "PAYMENT_SUCCESS",status: "SUCCESS", details: { order_id: 1, method: "Card" }, timestamp: new Date("2026-04-28T08:11:00Z") },
  { user_id: 1, username: "Kasun Perera",       role: "customer", action: "LOGOUT",         status: "SUCCESS", details: {},                              timestamp: new Date("2026-04-28T09:00:00Z") },

  { user_id: 2, username: "Nuwan Silva",        role: "customer", action: "LOGIN",          status: "SUCCESS", details: {},                              timestamp: new Date("2026-04-28T09:30:00Z") },
  { user_id: 2, username: "Nuwan Silva",        role: "customer", action: "PAYMENT_FAILED", status: "FAILED",  details: { order_id: 2, reason: "Card declined" }, timestamp: new Date("2026-04-28T09:35:00Z") },
  { user_id: 2, username: "Nuwan Silva",        role: "customer", action: "PAYMENT_FAILED", status: "FAILED",  details: { order_id: 2, reason: "Insufficient funds" }, timestamp: new Date("2026-04-28T09:36:00Z") },
  { user_id: 2, username: "Nuwan Silva",        role: "customer", action: "PAYMENT_FAILED", status: "FAILED",  details: { order_id: 2, reason: "Timeout" }, timestamp: new Date("2026-04-28T09:37:00Z") },

  { user_id: 3, username: "Chamari Fernando",   role: "customer", action: "LOGIN",          status: "FAILED",  details: { reason: "Wrong password" },    timestamp: new Date("2026-04-28T10:00:00Z") },
  { user_id: 3, username: "Chamari Fernando",   role: "customer", action: "LOGIN",          status: "FAILED",  details: { reason: "Wrong password" },    timestamp: new Date("2026-04-28T10:01:00Z") },
  { user_id: 3, username: "Chamari Fernando",   role: "customer", action: "LOGIN",          status: "FAILED",  details: { reason: "Wrong password" },    timestamp: new Date("2026-04-28T10:02:00Z") },
  { user_id: 3, username: "Chamari Fernando",   role: "customer", action: "LOGIN",          status: "SUCCESS", details: {},                              timestamp: new Date("2026-04-28T10:05:00Z") },

  { user_id: 0, username: "admin", role: "admin",    action: "VIEW_DASHBOARD", status: "SUCCESS", details: {},                              timestamp: new Date("2026-04-28T11:00:00Z") },
  { user_id: 5, username: "Nimal Perera",       role: "seller",   action: "ADD_PRODUCT",    status: "SUCCESS", details: { product: "OnePlus 14" },       timestamp: new Date("2026-04-28T12:00:00Z") },
  { user_id: 4, username: "Dinesh Jayawardena", role: "customer", action: "VIEW_PRODUCT",   status: "SUCCESS", details: { product_id: 7 },               timestamp: new Date("2026-04-28T13:00:00Z") },
  { user_id: 4, username: "Dinesh Jayawardena", role: "customer", action: "VIEW_PRODUCT",   status: "SUCCESS", details: { product_id: 2 },               timestamp: new Date("2026-04-28T13:15:00Z") },
  { user_id: 4, username: "Dinesh Jayawardena", role: "customer", action: "PAYMENT_SUCCESS",status: "SUCCESS", details: { order_id: 14, method: "COD" }, timestamp: new Date("2026-04-28T14:00:00Z") },
  { user_id: 6, username: "Amal Gunaratne",     role: "customer", action: "SEARCH",         status: "SUCCESS", details: { query: "MacBook" },            timestamp: new Date("2026-04-28T14:30:00Z") },
  { user_id: 7, username: "Hiruni Dissanayake", role: "customer", action: "SEARCH",         status: "SUCCESS", details: { query: "AirPods" },            timestamp: new Date("2026-04-28T15:00:00Z") },
  { user_id: 8, username: "Lahiru Senanayake",  role: "customer", action: "PLACE_ORDER",    status: "SUCCESS", details: { order_id: 8, amount: 215000 }, timestamp: new Date("2026-04-28T15:30:00Z") },
  { user_id: 9, username: "Nadeesha Rajapaksha",role: "customer", action: "LOGIN",          status: "SUCCESS", details: {},                              timestamp: new Date("2026-04-28T16:00:00Z") },
  { user_id:10, username: "Ruwan Bandara",      role: "customer", action: "PAYMENT_FAILED", status: "FAILED",  details: { reason: "Bank error" },        timestamp: new Date("2026-04-28T16:30:00Z") },

]);

// fetch user actions
print("\n=== QUERY 1: User Activity History (User #1 - Kasun Perera) ===");
db.activity_logs.find(
  { user_id: 1 },
  { _id: 0, action: 1, status: 1, details: 1, timestamp: 1 }
).sort({ timestamp: 1 }).forEach(doc => printjson(doc));

// With count
print("Total actions by Kasun Perera:", db.activity_logs.countDocuments({ user_id: 1 }));

// get peak usage
print("\n=== QUERY 2: Peak Usage Times ===");
db.activity_logs.aggregate([
  {
    $group: {
      _id: { $hour: "$timestamp" },
      total_actions: { $sum: 1 },
      unique_users: { $addToSet: "$user_id" }
    }
  },
  {
    $project: {
      hour: "$_id",
      total_actions: 1,
      unique_user_count: { $size: "$unique_users" },
      _id: 0
    }
  },
  { $sort: { total_actions: -1 } },
  { $limit: 10 }
]).forEach(doc => printjson(doc));

// find failed payments
print("\n=== QUERY 3: Failed Transactions ===");
db.activity_logs.find(
  {
    action: { $in: ["PAYMENT_FAILED", "PAYMENT_ATTEMPT"] },
    status: "FAILED"
  },
  { _id: 0, user_id: 1, username: 1, details: 1, timestamp: 1 }
).sort({ timestamp: -1 }).forEach(doc => printjson(doc));

// Failed payment count per user
print("\n--- Failed Payments by User ---");
db.activity_logs.aggregate([
  { $match: { action: "PAYMENT_FAILED", status: "FAILED" } },
  { $group: { _id: "$username", failed_count: { $sum: 1 } } },
  { $sort: { failed_count: -1 } }
]).forEach(doc => printjson(doc));

// Suspicious activity
print("\n=== QUERY 4: Suspicious Activities (3+ failures in 24h) ===");
const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
db.activity_logs.aggregate([
  {
    $match: {
      status: "FAILED",
      action: { $in: ["LOGIN", "PAYMENT_FAILED", "PAYMENT_ATTEMPT"] },
      timestamp: { $gte: since24h }
    }
  },
  {
    $group: {
      _id: "$user_id",
      username: { $first: "$username" },
      failed_count: { $sum: 1 },
      actions: { $push: "$action" },
      last_attempt: { $max: "$timestamp" }
    }
  },
  { $match: { failed_count: { $gte: 2 } } },
  { $sort: { failed_count: -1 } }
]).forEach(doc => {
  print(`⚠️ SUSPICIOUS: ${doc.username} (User #${doc._id}) — ${doc.failed_count} failed attempts`);
  printjson(doc);
});


print("\n=== EXTRA 1: Most Popular Actions ===");
db.activity_logs.aggregate([
  { $group: { _id: "$action", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).forEach(doc => printjson(doc));

print("\n=== EXTRA 2: Success Rate per Action ===");
db.activity_logs.aggregate([
  {
    $group: {
      _id: "$action",
      total: { $sum: 1 },
      success: { $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } },
      failed:  { $sum: { $cond: [{ $eq: ["$status", "FAILED"]  }, 1, 0] } }
    }
  },
  {
    $project: {
      action: "$_id", total: 1, success: 1, failed: 1,
      success_rate: { $multiply: [{ $divide: ["$success", "$total"] }, 100] },
      _id: 0
    }
  },
  { $sort: { success_rate: 1 } }
]).forEach(doc => printjson(doc));

print("\n=== EXTRA 3: Activity by Role ===");
db.activity_logs.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
]).forEach(doc => printjson(doc));

print("\n=== EXTRA 4: Recent Login Activity ===");
db.activity_logs.find(
  { action: "LOGIN" },
  { _id: 0, username: 1, role: 1, status: 1, timestamp: 1 }
).sort({ timestamp: -1 }).limit(10).forEach(doc => printjson(doc));
