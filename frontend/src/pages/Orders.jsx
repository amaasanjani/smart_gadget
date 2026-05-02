import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusIcon = (s) => {
  if (s === 'Delivered') return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
  if (s === 'Cancelled') return <XCircle size={16} style={{ color: 'var(--danger)' }} />;
  if (s === 'Shipped') return <Truck size={16} style={{ color: 'var(--info)' }} />;
  return <Clock size={16} style={{ color: 'var(--warning)' }} />;
};

const statusClass = { Delivered: 'badge-success', Shipped: 'badge-info', Processing: 'badge-warning', Pending: 'badge-muted', Cancelled: 'badge-danger', Packed: 'badge-accent' };

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const fmt = (p) => `Rs. ${p?.toLocaleString()}`;

  useEffect(() => {
    api.get(`/orders?customer_id=${user.id}`).then(r => setOrders(r.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCancel = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, { customer_id: user.id });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'Cancelled' } : o));
    } catch (err) { alert(err.response?.data?.error); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div><h3>No orders yet</h3><p>Start shopping to see your orders here!</p></div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.order_id} className="card p-3 mb-3">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semi">Order #{order.order_id}</span>
                    <span className={`badge ${statusClass[order.status] || 'badge-muted'}`}>
                      {statusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-1">Placed on {order.order_date}</div>
                </div>
                <div className="text-right">
                  <div className="product-price">{fmt(order.total_amount)}</div>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(selected?.order_id === order.order_id ? null : order)}>
                      {selected?.order_id === order.order_id ? 'Hide' : 'View'} Details
                    </button>
                    {['Processing', 'Pending'].includes(order.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.order_id)}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {order.items?.slice(0, 3).map(item => (
                  <div key={item.item_id} className="flex items-center gap-2" style={{ background: 'var(--bg3)', borderRadius: 8, padding: '6px 12px' }}>
                    <img src={item.product?.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                    <span className="text-sm">{item.product?.product_name}</span>
                    <span className="text-xs text-muted">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Delivery status */}
              {order.delivery && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Truck size={14} style={{ color: 'var(--info)' }} />
                  <span className="text-muted">Delivery: <strong>{order.delivery.delivery_status}</strong></span>
                  {order.delivery.courier_name && <span className="text-muted">· {order.delivery.courier_name}</span>}
                  {order.delivery.tracking_number && <span className="badge badge-info">{order.delivery.tracking_number}</span>}
                </div>
              )}

              {/* Expanded details */}
              {selected?.order_id === order.order_id && (
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                  <div className="grid-2" style={{ gap: 16 }}>
                    <div>
                      <h4 className="mb-2">Order Items</h4>
                      <div className="table-wrap">
                        <table>
                          <thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr></thead>
                          <tbody>
                            {order.items?.map(item => (
                              <tr key={item.item_id}>
                                <td>{item.product?.product_name || `Product #${item.product_id}`}</td>
                                <td>{item.quantity}</td>
                                <td>{fmt(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2">Payment Info</h4>
                      {order.payment && (
                        <div className="card p-2">
                          <div className="flex justify-between text-sm mb-1"><span className="text-muted">Method</span><span>{order.payment.payment_method}</span></div>
                          <div className="flex justify-between text-sm mb-1"><span className="text-muted">Status</span>
                            <span className={`badge ${order.payment.payment_status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{order.payment.payment_status}</span>
                          </div>
                          <div className="flex justify-between text-sm"><span className="text-muted">Amount</span><span className="text-accent font-bold">{fmt(order.payment.amount)}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
