import React, { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle, Clock, MapPin, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusSteps = ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const statusColor = {
  Pending: 'badge-muted',
  Packed: 'badge-warning',
  Shipped: 'badge-info',
  'Out for Delivery': 'badge-accent',
  Delivered: 'badge-success',
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/delivery-staff/${user.id}/deliveries`);
      setDeliveries(res.data.data || []);
    } catch {
      // Fallback: show all non-delivered deliveries
      try {
        const res = await api.get('/deliveries');
        setDeliveries(res.data.data?.filter(d => d.delivery_status !== 'Delivered') || []);
      } catch { toast.error('Failed to load deliveries'); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeliveries(); }, [user.id]);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    setUpdating(deliveryId);
    try {
      await api.put('/delivery-staff/update-status', {
        delivery_id: deliveryId,
        delivery_status: newStatus,
        staff_id: user.id,
      });
      setDeliveries(prev => prev.map(d =>
        d.delivery_id === deliveryId
          ? { ...d, delivery_status: newStatus, delivery_date: newStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : d.delivery_date }
          : d
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally { setUpdating(null); }
  };

  const getNextStatus = (current) => {
    const idx = statusSteps.indexOf(current);
    return idx < statusSteps.length - 1 ? statusSteps[idx + 1] : null;
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.delivery_status === 'Pending').length,
    inProgress: deliveries.filter(d => ['Packed', 'Shipped', 'Out for Delivery'].includes(d.delivery_status)).length,
    delivered: deliveries.filter(d => d.delivery_status === 'Delivered').length,
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>🚚 Delivery Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome, {user.name} — Manage your assigned deliveries</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDeliveries}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📦</div>
          <div className="value">{stats.total}</div>
          <div className="label">Assigned Deliveries</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⏳</div>
          <div className="value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
          <div className="label">Pending Dispatch</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--info)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🚛</div>
          <div className="value" style={{ color: 'var(--info)' }}>{stats.inProgress}</div>
          <div className="label">In Progress</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>✅</div>
          <div className="value" style={{ color: 'var(--success)' }}>{stats.delivered}</div>
          <div className="label">Delivered</div>
        </div>
      </div>

      {/* Deliveries List */}
      <div>
        {deliveries.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🚚</div>
            <h3>No deliveries assigned</h3>
            <p>You will see your assigned deliveries here once the admin assigns them.</p>
          </div>
        ) : (
          deliveries.map(d => {
            const nextStatus = getNextStatus(d.delivery_status);
            const stepIdx = statusSteps.indexOf(d.delivery_status);
            return (
              <div key={d.delivery_id} className="card p-3 mb-3">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Delivery #{d.delivery_id}</span>
                      <span className={`badge ${statusColor[d.delivery_status] || 'badge-muted'}`}>
                        {d.delivery_status}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-1">
                      Order #{d.order_id}
                      {d.tracking_number && <span className="badge badge-accent" style={{ marginLeft: 8 }}>{d.tracking_number}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {d.delivery_date && (
                      <div className="text-xs text-success">✓ Delivered: {d.delivery_date}</div>
                    )}
                    {d.courier_name && <div className="text-xs text-muted">{d.courier_name}</div>}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    {statusSteps.map((s, i) => (
                      <span key={s} style={{ color: i <= stepIdx ? 'var(--accent)' : 'var(--muted)', fontWeight: i === stepIdx ? 700 : 400 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: 'linear-gradient(to right, var(--accent), var(--accent2))',
                      width: `${(stepIdx / (statusSteps.length - 1)) * 100}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* Order Items */}
                {d.items && d.items.length > 0 && (
                  <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                    {d.items.slice(0, 3).map(item => (
                      <div key={item.item_id} className="flex items-center gap-2"
                        style={{ background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px' }}>
                        {item.product?.image && (
                          <img src={item.product.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <span className="text-sm">{item.product?.product_name || `Product #${item.product_id}`}</span>
                        <span className="text-xs text-muted">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Address */}
                {d.order && (
                  <div className="flex items-center gap-2 text-sm text-muted mb-3">
                    <MapPin size={14} />
                    <span>Customer #{d.order.customer_id} · Rs. {d.order.total_amount?.toLocaleString()}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {nextStatus && d.delivery_status !== 'Delivered' && (
                    <button
                      className="btn btn-primary"
                      disabled={updating === d.delivery_id}
                      onClick={() => handleUpdateStatus(d.delivery_id, nextStatus)}
                      style={{ flex: 1 }}>
                      <ArrowRight size={14} />
                      {updating === d.delivery_id ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  )}
                  {d.delivery_status === 'Delivered' && (
                    <div className="flex items-center gap-2 text-success" style={{ padding: '8px 16px', background: 'rgba(72,199,142,0.1)', borderRadius: 8, flex: 1, justifyContent: 'center' }}>
                      <CheckCircle size={16} /> Successfully Delivered
                    </div>
                  )}
                  {/* Quick status updates */}
                  {d.delivery_status !== 'Delivered' && (
                    <select className="select" style={{ padding: '8px 12px' }}
                      value={d.delivery_status}
                      onChange={e => handleUpdateStatus(d.delivery_id, e.target.value)}>
                      {statusSteps.filter((_, i) => i >= statusSteps.indexOf(d.delivery_status)).map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
