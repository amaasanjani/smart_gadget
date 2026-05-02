const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  username: { type: String, default: 'anonymous' },
  role: { type: String, enum: ['customer', 'seller', 'admin', 'delivery'], default: 'customer' },
  action: {
    type: String,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE',
      'VIEW_PRODUCT', 'SEARCH', 'ADD_TO_CART', 'REMOVE_FROM_CART',
      'PLACE_ORDER', 'CANCEL_ORDER',
      'PAYMENT_ATTEMPT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
      'DELIVERY_UPDATE', 'UPDATE_DELIVERY_STATUS', 'ASSIGN_COURIER',
      'ADD_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
      'ADD_CATEGORY', 'EDIT_CATEGORY', 'DELETE_CATEGORY',
      'ACTIVATE_CATEGORY', 'DEACTIVATE_CATEGORY', 'ASSIGN_PRODUCTS_CATEGORY',
      'VIEW_DASHBOARD', 'SUSPICIOUS_ACTIVITY'
    ],
    required: true
  },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
  ip_address: { type: String, default: '0.0.0.0' },
  timestamp: { type: Date, default: Date.now },
});

activityLogSchema.index({ user_id: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ status: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

