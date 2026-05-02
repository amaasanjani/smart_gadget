import React, { useEffect, useState, useCallback } from 'react';
import { BarChart2, Users, Package, TrendingUp, AlertTriangle, Activity, ShoppingBag, XCircle, Truck, DollarSign, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color = 'var(--accent)', sub }) => (
  <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{icon}</div>
    <div className="value" style={{ color }}>{value}</div>
    <div className="label">{label}</div>
    {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [failed, setFailed] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const fmt = (p) => `Rs. ${Number(p || 0).toLocaleString()}`;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, logsRes, custRes, sellRes, delivRes, failRes, suspRes] = await Promise.all([
        api.get('/logs/dashboard'),
        api.get('/logs?limit=30'),
        api.get('/auth/customers'),
        api.get('/auth/sellers'),
        api.get('/deliveries'),
        api.get('/logs/failed-transactions'),
        api.get('/logs/suspicious'),
      ]);
      setData(dash.data.data);
      setLogs(logsRes.data.data || []);
      setCustomers(custRes.data.data || []);
      setSellers(sellRes.data.data || []);
      setDeliveries(delivRes.data.data || []);
      setFailed(failRes.data.data || []);
      setSuspicious(suspRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateDelivery = async (id, status) => {
    try {
      await api.put(`/deliveries/${id}/status`, { delivery_status: status, admin_id: 0 });
      setDeliveries(prev => prev.map(d => d.delivery_id === id ? { ...d, delivery_status: status } : d));
    } catch (err) { alert(err.response?.data?.error); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const stats = data?.stats || {};
  const tabs = ['overview', 'products', 'orders', 'customers', 'sellers', 'deliveries', 'payments', 'admins', 'categories', 'stock', 'logs', 'reports'];
  const actionColor = (a) => ({ LOGIN: 'var(--success)', LOGOUT: 'var(--muted)', PAYMENT_FAILED: 'var(--danger)', PLACE_ORDER: 'var(--accent)', SEARCH: 'var(--info)', ADD_PRODUCT: 'var(--accent2)' }[a] || 'var(--text)');

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>👑 Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">Smart Gadget Marketplace — Management Console</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 0', marginBottom: 28, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid-4 mb-4">
            <StatCard icon="💰" label="Total Revenue" value={fmt(stats.totalRevenue)} color="var(--success)" />
            <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="var(--accent)" />
            <StatCard icon="👥" label="Customers" value={stats.totalCustomers} color="var(--info)" />
            <StatCard icon="🏪" label="Sellers" value={stats.totalSellers} color="var(--accent2)" />
          </div>
          <div className="grid-4 mb-4">
            <StatCard icon="🛍️" label="Products Listed" value={stats.totalProducts} color="var(--warning)" />
            <StatCard icon="❌" label="Failed Payments" value={stats.failedPayments} color="var(--danger)" />
            <StatCard icon="🚚" label="Pending Deliveries" value={stats.pendingDeliveries} color="var(--muted)" />
            <StatCard icon="⚠️" label="Low Stock Items" value={data?.lowStockAlerts?.length || 0} color="var(--warning)" />
          </div>

          <div className="grid-2 mb-4">
            {/* Top Products */}
            <div className="card p-3">
              <h3 className="mb-3">🔥 Top Selling Products</h3>
              {data?.topProducts?.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-2 mb-2" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="badge badge-accent" style={{ minWidth: 28, justifyContent: 'center' }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div className="font-medium text-sm">{p.product_name}</div>
                    <div className="text-xs text-muted">{p.category} · {p.sold} sold</div>
                  </div>
                  <span className="text-success text-sm font-semi">{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>

            {/* Revenue by Category */}
            <div className="card p-3">
              <h3 className="mb-3">📊 Revenue by Category</h3>
              {data?.categoryRevenue?.sort((a,b) => b.revenue - a.revenue).map((c, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.category}</span><span className="text-accent">{fmt(c.revenue)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(to right, var(--accent), var(--accent2))', width: `${Math.min(100, (c.revenue / Math.max(...(data?.categoryRevenue || []).map(x => x.revenue))) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div className="card p-3 mb-4">
            <h3 className="mb-3">📋 Order Status Breakdown</h3>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              {data?.orderStatusBreakdown?.map(s => (
                <div key={s.status} className="card p-2" style={{ minWidth: 120, textAlign: 'center' }}>
                  <div className="font-bold text-2xl" style={{ color: 'var(--accent)' }}>{s.count}</div>
                  <div className="text-sm text-muted">{s.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {data?.lowStockAlerts?.length > 0 && (
            <div className="card p-3" style={{ borderColor: 'rgba(255,209,102,0.3)', background: 'rgba(255,209,102,0.03)' }}>
              <h3 className="mb-2"><AlertTriangle size={16} style={{ color: 'var(--warning)', marginRight: 8, verticalAlign: 'middle' }} />Low Stock Alerts</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {data?.lowStockAlerts?.map(p => (
                  <div key={p.product_id} className="badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    {p.product_name} — {p.stock_quantity} left
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMERS */}
      {activeTab === 'customers' && <CustomersTab />}

      {/* SELLERS - full management */}
      {activeTab === 'sellers' && <SellersTab />}

      {/* DELIVERIES - full management */}
      {activeTab === 'deliveries' && <DeliveriesTab />}

      {/* LOGS */}
      {activeTab === 'logs' && (
        <div>
          <div className="grid-2 mb-3">
            <div className="card p-3">
              <h3 className="mb-3"><Activity size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Live Activity Logs</h3>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {logs.map(log => (
                  <div key={log._id} className={`log-entry ${log.status === 'FAILED' ? 'failed' : 'success'}`}>
                    <span className="action" style={{ color: actionColor(log.action) }}>{log.action}</span>
                    <span className="text-muted text-xs">User #{log.user_id} · {log.username}</span>
                    <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 'auto' }}>{log.status}</span>
                    <span className="text-xs text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-muted text-center">No logs yet. Interact with the app to generate logs.</p>}
              </div>
            </div>

            <div>
              <div className="card p-3 mb-3" style={{ borderColor: 'rgba(255,101,132,0.2)' }}>
                <h3 className="mb-2"><XCircle size={16} style={{ color: 'var(--danger)', marginRight: 8, verticalAlign: 'middle' }} />Failed Transactions ({failed.length})</h3>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  {failed.map(f => (
                    <div key={f._id} className="log-entry failed">
                      <span className="action text-danger">{f.action}</span>
                      <span className="text-xs text-muted">User #{f.user_id}</span>
                      <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{new Date(f.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {failed.length === 0 && <p className="text-muted text-sm">No failed transactions logged.</p>}
                </div>
              </div>
              <div className="card p-3" style={{ borderColor: 'rgba(255,209,102,0.2)' }}>
                <h3 className="mb-2">⚠️ Suspicious Activities ({suspicious.length})</h3>
                {suspicious.length === 0 ? <p className="text-muted text-sm">No suspicious activity detected.</p> : (
                  suspicious.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <span>User #{s._id}</span>
                      <span className="badge badge-danger">{s.count} failed attempts</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === 'reports' && (
        <ReportsTab />
      )}

      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'admins' && <AdminsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'stock' && <StockLevelsTab />}
    </div>
  );
}

function ReportsTab() {
  const [revenue, setRevenue] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const fmt = (p) => `Rs. ${Number(p || 0).toLocaleString()}`;

  useEffect(() => {
    api.get('/payments/reports/revenue').then(r => setRevenue(r.data.data));
    api.get('/orders/reports/top-selling').then(r => setTopSelling(r.data.data));
  }, []);

  return (
    <div>
      <h2 className="mb-4">📊 Reports</h2>
      {revenue && (
        <div className="grid-4 mb-4">
          <StatCard icon="💰" label="Total Revenue" value={fmt(revenue.total_revenue)} color="var(--success)" />
          <StatCard icon="✅" label="Completed Payments" value={revenue.total_transactions} color="var(--accent)" />
          <StatCard icon="❌" label="Failed Payments" value={revenue.failed_transactions} color="var(--danger)" />
          <StatCard icon="⏳" label="Pending Payments" value={revenue.pending_transactions} color="var(--warning)" />
        </div>
      )}
      <div className="grid-2 mb-4">
        <div className="card p-3">
          <h3 className="mb-3">💳 Revenue by Payment Method</h3>
          {revenue?.method_breakdown?.map((m, i) => (
            <div key={i} className="flex justify-between items-center mb-2 p-2" style={{ background: 'var(--bg3)', borderRadius: 8 }}>
              <span>{m.method}</span><span className="text-success font-semi">{fmt(m.amount)}</span>
            </div>
          ))}
        </div>
        <div className="card p-3">
          <h3 className="mb-3">📅 Monthly Revenue</h3>
          {revenue?.monthly_breakdown?.sort((a,b) => a.month.localeCompare(b.month)).map((m, i) => (
            <div key={i} className="flex justify-between items-center mb-2 p-2" style={{ background: 'var(--bg3)', borderRadius: 8 }}>
              <span className="text-muted">{m.month}</span><span className="text-accent font-semi">{fmt(m.amount)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-3">
        <h3 className="mb-3">🏆 Top Selling Products Report</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {topSelling.map((p, i) => (
                <tr key={p.product_id}>
                  <td><span className="badge badge-accent">#{i + 1}</span></td>
                  <td className="font-medium">{p.product_name}</td>
                  <td><span className="tag">{p.category}</span></td>
                  <td>{p.quantity_sold}</td>
                  <td className="text-success font-semi">{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/auth/customers').then(r => setCustomers(r.data.data || [])); }, []);
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try { await api.delete(`/auth/customers/${id}`); setCustomers(p => p.filter(c => c.customer_id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  return (
    <div className="card p-3">
      <div className="flex justify-between items-center mb-3">
        <h3>👥 Customer Management ({customers.length})</h3>
        <input className="input" style={{ width: 220 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.customer_id}>
                <td><span className="badge badge-muted">{c.customer_id}</span></td>
                <td className="font-medium">{c.name}</td>
                <td className="text-muted">{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td className="text-muted">{c.address || '—'}</td>
                <td className="text-muted">{c.created_at}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.customer_id, c.name)}><Trash2 size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellersTab() {
  const [sellers, setSellers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editSeller, setEditSeller] = useState(null);
  const [form, setForm] = useState({ owner_name: '', shop_name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/auth/sellers').then(r => setSellers(r.data.data || [])); }, []);
  const filtered = sellers.filter(s =>
    s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_name.toLowerCase().includes(search.toLowerCase())
  );
  const openEdit = (s) => { setForm({ owner_name: s.owner_name, shop_name: s.shop_name, email: s.email, phone: s.phone || '', address: s.address || '' }); setEditSeller(s); setShowForm(true); };
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const res = await api.put(`/auth/sellers/${editSeller.seller_id}`, form); setSellers(p => p.map(s => s.seller_id === editSeller.seller_id ? res.data.data : s)); toast.success('Updated'); setShowForm(false); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };
  const handleVerify = async (id) => {
    try { const res = await api.put(`/auth/sellers/${id}/verify`); setSellers(p => p.map(s => s.seller_id === id ? res.data.data : s)); toast.success(res.data.message); }
    catch { toast.error('Failed'); }
  };
  const handleSuspend = async (id) => {
    try { const res = await api.put(`/auth/sellers/${id}/suspend`); setSellers(p => p.map(s => s.seller_id === id ? res.data.data : s)); toast.success(res.data.message); }
    catch { toast.error('Failed'); }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete seller "${name}"?`)) return;
    try { await api.delete(`/auth/sellers/${id}`); setSellers(p => p.filter(s => s.seller_id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  return (
    <div className="card p-3">
      <div className="flex justify-between items-center mb-3">
        <h3>🏪 Seller Management ({sellers.length})</h3>
        <input className="input" style={{ width: 220 }} placeholder="Search sellers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Shop</th><th>Owner</th><th>Email</th><th>Rating</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.seller_id}>
                <td><span className="badge badge-muted">{s.seller_id}</span></td>
                <td className="font-medium">{s.shop_name}</td>
                <td>{s.owner_name}</td>
                <td className="text-muted">{s.email}</td>
                <td>⭐ {s.rating}</td>
                <td><span className={`badge ${s.verified ? 'badge-success' : 'badge-warning'}`}>{s.verified ? 'Verified' : 'Pending'}</span></td>
                <td><span className={`badge ${s.active !== false ? 'badge-success' : 'badge-danger'}`}>{s.active !== false ? 'Active' : 'Suspended'}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}><Edit size={11} /></button>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleVerify(s.seller_id)}>{s.verified ? 'Unverify' : 'Verify'}</button>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleSuspend(s.seller_id)}>{s.active !== false ? 'Suspend' : 'Activate'}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.seller_id, s.shop_name)}><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Seller — {editSeller?.shop_name}</h3><button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="grid-2 mb-3" style={{ gap: 12 }}>
                <div className="form-group"><label>Owner Name</label><input className="input" value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} /></div>
                <div className="form-group"><label>Shop Name</label><input className="input" value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} /></div>
                <div className="form-group"><label>Email</label><input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="form-group mb-3"><label>Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignForm, setAssignForm] = useState({ courier_name: '', tracking_number: '', delivery_status: '', assigned_to: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const statusBadge = { Pending: 'badge-warning', Packed: 'badge-accent', Shipped: 'badge-info', 'Out for Delivery': 'badge-accent', Delivered: 'badge-success' };
  useEffect(() => { 
    api.get('/deliveries').then(r => setDeliveries(r.data.data || [])); 
    api.get('/delivery-staff').then(r => setStaffList(r.data.data || []));
  }, []);
  const filtered = filterStatus === 'all' ? deliveries : deliveries.filter(d => d.delivery_status === filterStatus);
  const openManage = (d) => { setSelected(d); setAssignForm({ courier_name: d.courier_name || '', tracking_number: d.tracking_number || '', delivery_status: d.delivery_status, assigned_to: d.assigned_to || '' }); };
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...assignForm, assigned_to: assignForm.assigned_to ? Number(assignForm.assigned_to) : null };
      const res = await api.put(`/deliveries/${selected.delivery_id}/status`, payload);
      setDeliveries(p => p.map(d => d.delivery_id === selected.delivery_id ? { ...d, ...res.data.data } : d));
      toast.success('Delivery updated'); setSelected(null);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <h3>🚚 Delivery Management ({deliveries.length})</h3>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          {['all', 'Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map(s => (
            <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)} style={{ fontSize: '0.75rem' }}>{s}</button>
          ))}
        </div>
      </div>
      <div className="grid-4 mb-3">
        {[['Pending','badge-warning'],['Packed','badge-accent'],['Shipped','badge-info'],['Delivered','badge-success']].map(([st, cls]) => (
          <div key={st} className="stat-card" style={{ borderLeft: '3px solid var(--accent)', cursor: 'pointer' }} onClick={() => setFilterStatus(st)}>
            <div className="value">{deliveries.filter(d => d.delivery_status === st).length}</div>
            <div className="label">{st}</div>
          </div>
        ))}
      </div>
      <div className="card p-3">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Order</th><th>Customer</th><th>Status</th><th>Courier</th><th>Tracking</th><th>Delivered</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.delivery_id}>
                  <td>{d.delivery_id}</td>
                  <td>#{d.order_id}</td>
                  <td className="text-muted">{d.customer_name || `Customer #${d.order?.customer_id}`}</td>
                  <td><span className={`badge ${statusBadge[d.delivery_status] || 'badge-muted'}`}>{d.delivery_status}</span></td>
                  <td>
                    {d.courier_name || (d.assigned_to ? staffList.find(s => s.staff_id === d.assigned_to)?.name || `Staff #${d.assigned_to}` : '—')}
                  </td>
                  <td>{d.tracking_number ? <span className="badge badge-accent">{d.tracking_number}</span> : '—'}</td>
                  <td className="text-muted">{d.delivery_date || '—'}</td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => openManage(d)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Manage Delivery #{selected.delivery_id} — Order #{selected.order_id}</h3><button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕</button></div>
            {selected.customer_name && (
              <div className="card p-2 mb-3" style={{ background: 'var(--bg3)' }}>
                <div className="text-sm font-medium">{selected.customer_name}</div>
                {selected.customer_address && <div className="text-xs text-muted mt-1">📍 {selected.customer_address}</div>}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="form-group mb-3"><label>Delivery Status</label>
                <select className="select w-full" value={assignForm.delivery_status} onChange={e => setAssignForm(f => ({ ...f, delivery_status: e.target.value }))}>
                  {['Pending','Packed','Shipped','Out for Delivery','Delivered'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group mb-3"><label>Assign Internal Staff</label>
                <select className="select w-full" value={assignForm.assigned_to} onChange={e => setAssignForm(f => ({ ...f, assigned_to: e.target.value }))}>
                  <option value="">-- None (Third Party Courier) --</option>
                  {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-3"><label>Courier / Company (Optional)</label><input className="input" placeholder="e.g. DHL Express" value={assignForm.courier_name} onChange={e => setAssignForm(f => ({ ...f, courier_name: e.target.value }))} /></div>
              <div className="form-group mb-4"><label>Tracking Number</label><input className="input" placeholder="e.g. DHL001234" value={assignForm.tracking_number} onChange={e => setAssignForm(f => ({ ...f, tracking_number: e.target.value }))} /></div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving…' : 'Update Delivery'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminsTab() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role_label: 'Admin', password: '' });
  const [saving, setSaving] = useState(false);
  const roleOptions = ['Super Admin', 'Admin', 'Sales Manager', 'Delivery Manager', 'Support'];
  useEffect(() => { api.get('/admins').then(r => setAdmins(r.data.data || [])); }, []);
  const openAdd = () => { setForm({ name: '', email: '', phone: '', role_label: 'Admin', password: '' }); setEditAdmin(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ name: a.name, email: a.email, phone: a.phone || '', role_label: a.role_label, password: '' }); setEditAdmin(a); setShowForm(true); };
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editAdmin) { const res = await api.put(`/admins/${editAdmin.admin_id}`, form); setAdmins(p => p.map(a => a.admin_id === editAdmin.admin_id ? res.data.data : a)); toast.success('Admin updated'); }
      else { const res = await api.post('/admins', form); setAdmins(p => [...p, res.data.data]); toast.success('Admin added'); }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };
  const handleToggle = async (id) => {
    try { const res = await api.put(`/admins/${id}/toggle`); setAdmins(p => p.map(a => a.admin_id === id ? res.data.data : a)); toast.success(res.data.message); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"?`)) return;
    try { await api.delete(`/admins/${id}`); setAdmins(p => p.filter(a => a.admin_id !== id)); toast.success('Admin deleted'); }
    catch (err) { toast.error(err.response?.data?.error || 'Cannot delete super admin'); }
  };
  return (
    <div className="card p-3">
      <div className="flex justify-between items-center mb-3">
        <h3>👑 Admin Management ({admins.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Add Admin</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.admin_id}>
                <td><span className="badge badge-accent">{a.admin_id}</span></td>
                <td className="font-medium">{a.name}</td>
                <td className="text-muted">{a.email}</td>
                <td>{a.phone || '—'}</td>
                <td><span className="tag">{a.role_label}</span></td>
                <td><span className={`badge ${a.active ? 'badge-success' : 'badge-danger'}`}>{a.active ? 'Active' : 'Inactive'}</span></td>
                <td className="text-muted">{a.created_at}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><Edit size={11} /></button>
                    {a.admin_id !== 1 && <>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleToggle(a.admin_id)}>{a.active ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.admin_id, a.name)}><Trash2 size={11} /></button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editAdmin ? `Edit — ${editAdmin.name}` : 'Add New Admin'}</h3><button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="grid-2 mb-3" style={{ gap: 12 }}>
                <div className="form-group"><label>Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label>Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label>Role</label>
                  <select className="select w-full" value={form.role_label} onChange={e => setForm(f => ({ ...f, role_label: e.target.value }))}>
                    {roleOptions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group mb-4"><label>Password {editAdmin ? '(leave blank to keep)' : '*'}</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editAdmin} placeholder="••••••••" /></div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving…' : editAdmin ? 'Update Admin' : 'Create Admin'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
const emptyForm = { product_name: '', category: 'Smartphones', price: '', stock_quantity: '', description: '', seller_id: 1, image: '' };
const categories = ['Smartphones', 'Laptops', 'Accessories', 'Tablets', 'Smart Watches', 'Headphones', 'Other'];

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { api.get('/products').then(r => setProducts(r.data.data)); }, []);
  const fmt = (p) => `Rs. ${p?.toLocaleString()}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = form.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.url;
      }
      const payload = { ...form, image: finalImageUrl, seller_id: form.seller_id || 1 };

      if (editId) {
        const res = await api.put(`/products/${editId}`, payload);
        setProducts(prev => prev.map(p => p.product_id === editId ? res.data.data : p));
        toast.success('Product updated!');
      } else {
        payload.seller_name = 'Admin';
        const res = await api.post('/products', payload);
        setProducts(prev => [...prev, res.data.data]);
        toast.success('Product added!');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null); setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`, { data: { seller_id: 1 } });
      setProducts(prev => prev.filter(p => p.product_id !== id));
      toast.success('Product deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleEdit = (p) => {
    setForm({ product_name: p.product_name, category: p.category, price: p.price, stock_quantity: p.stock_quantity, description: p.description, seller_id: p.seller_id || 1, image: p.image || '' });
    setEditId(p.product_id); setShowForm(true); setImageFile(null);
  };

  return (
    <div className="card p-3">
      <div className="flex justify-between items-center mb-3">
        <h3>🛍️ All Products ({products.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group mb-3">
                <label>Product Name *</label>
                <input className="input" value={form.product_name} onChange={e => set('product_name', e.target.value)} required />
              </div>
              <div className="grid-2 mb-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="select w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required />
                </div>
              </div>
              <div className="grid-2 mb-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input className="input" type="number" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Seller ID</label>
                  <input className="input" type="number" value={form.seller_id} onChange={e => set('seller_id', e.target.value)} />
                </div>
              </div>
              <div className="form-group mb-3">
                <label>Product Image</label>
                <input className="input" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                {form.image && !imageFile && <div className="text-xs text-muted mt-1">Current: <a href={form.image} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>View Image</a></div>}
              </div>
              <div className="form-group mb-4">
                <label>Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td className="font-medium">{p.product_name}</td>
                <td><span className="tag">{p.category}</span></td>
                <td className="text-accent">{fmt(p.price)}</td>
                <td><span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                <td>{p.sold}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}><Edit size={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.product_id)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const fmt = (p) => `Rs. ${p?.toLocaleString()}`;
  useEffect(() => { api.get('/orders').then(r => setOrders(r.data.data)); }, []);
  const statusColor = { Delivered: 'badge-success', Shipped: 'badge-info', Processing: 'badge-warning', Pending: 'badge-muted', Cancelled: 'badge-danger', Packed: 'badge-accent' };
  return (
    <div className="card p-3">
      <h3 className="mb-3">📦 All Orders ({orders.length})</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Items</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>
                  <div className="font-medium">{o.customer?.name || `Customer #${o.customer_id}`}</div>
                  {o.customer && (
                    <div className="text-xs text-muted mt-1" style={{ lineHeight: '1.4' }}>
                      {o.customer.phone && <div>📞 {o.customer.phone}</div>}
                      {o.customer.address && <div>📍 {o.customer.address}</div>}
                    </div>
                  )}
                </td>
                <td className="text-muted">{o.order_date}</td>
                <td className="text-accent font-semi">{fmt(o.total_amount)}</td>
                <td><span className={`badge ${statusColor[o.status] || 'badge-muted'}`}>{o.status}</span></td>
                <td>{o.items?.length || 0} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const fmt = (p) => `Rs. ${p?.toLocaleString()}`;
  useEffect(() => { api.get('/payments').then(r => setPayments(r.data.data)); }, []);
  const statusColor = { Completed: 'badge-success', Failed: 'badge-danger', Pending: 'badge-warning' };
  return (
    <div className="card p-3">
      <h3 className="mb-3">💳 All Payments ({payments.length})</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Payment ID</th><th>Order</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id}>
                <td>#{p.payment_id}</td>
                <td>#{p.order_id}</td>
                <td>{p.payment_method}</td>
                <td className="text-accent">{fmt(p.amount)}</td>
                <td><span className={`badge ${statusColor[p.payment_status] || 'badge-muted'}`}>{p.payment_status}</span></td>
                <td className="text-muted">{p.payment_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '📦' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const emojis = ['📱', '💻', '🖱️', '📟', '⌚', '🎧', '🔌', '📷', '🖥️', '🎮', '📦'];

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.data || [])); }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/categories/${editId}`, form);
        setCategories(prev => prev.map(c => c.category_id === editId ? res.data.data : c));
        toast.success('Category updated!');
      } else {
        const res = await api.post('/categories', form);
        setCategories(prev => [...prev, res.data.data]);
        toast.success('Category added!');
      }
      setShowForm(false); setForm({ name: '', description: '', image: '📦' }); setEditId(null);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.category_id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/categories/${id}/toggle`);
      setCategories(prev => prev.map(c => c.category_id === id ? res.data.data : c));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3>🏷️ Category Management ({categories.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', image: '📦' }); }}>
          <Plus size={14} /> Add Category
        </button>
      </div>
      <div className="card p-2 mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input className="input" style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1 }}
          placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {filtered.map(cat => (
          <div key={cat.category_id} className="card p-3"
            style={{ borderLeft: `3px solid ${cat.active ? 'var(--accent)' : 'var(--border)'}`, opacity: cat.active ? 1 : 0.65 }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '1.6rem' }}>{cat.image}</span>
              <div style={{ flex: 1 }}>
                <div className="font-bold">{cat.name}</div>
                <div className="text-xs text-muted">{cat.product_count} products</div>
              </div>
              <span className={`badge ${cat.active ? 'badge-success' : 'badge-warning'}`}>{cat.active ? 'Active' : 'Off'}</span>
            </div>
            <p className="text-xs text-muted mb-2">{cat.description || '—'}</p>
            <div className="flex gap-1">
              <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ name: cat.name, description: cat.description, image: cat.image }); setEditId(cat.category_id); setShowForm(true); }}><Edit size={11} /></button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(cat.category_id)} style={{ fontSize: '0.75rem' }}>{cat.active ? 'Deactivate' : 'Activate'}</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.category_id)}><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Category' : 'Add Category'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group mb-3"><label>Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group mb-3"><label>Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div className="form-group mb-4">
                <label>Icon</label>
                <div className="flex gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                  {emojis.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, image: em }))}
                      style={{ fontSize: '1.4rem', padding: '4px 8px', borderRadius: 8, cursor: 'pointer', background: form.image === em ? 'var(--accent)' : 'var(--bg3)', border: `2px solid ${form.image === em ? 'var(--accent)' : 'transparent'}` }}>{em}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Category'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StockLevelsTab() {
  const [stock, setStock] = useState([]);
  const [filter, setFilter] = useState('all');
  const fmt = p => `Rs. ${Number(p || 0).toLocaleString()}`;
  const statusColor = { 'Out of Stock': 'badge-danger', Critical: 'badge-danger', Low: 'badge-warning', Adequate: 'badge-success' };

  useEffect(() => {
    api.get('/orders/reports/stock-levels').then(r => setStock(r.data.data || []));
  }, []);

  const filtered = filter === 'all' ? stock : stock.filter(p => p.status === filter || (filter === 'low' && ['Critical', 'Low'].includes(p.status)));

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3>📊 Stock Level Monitoring ({stock.length} products)</h3>
        <div className="flex gap-2">
          {['all', 'Critical', 'Low', 'Adequate'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{f}</button>
          ))}
        </div>
      </div>
      <div className="grid-4 mb-4">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🚫</div>
          <div className="value" style={{ color: 'var(--danger)' }}>{stock.filter(p => p.status === 'Out of Stock').length}</div>
          <div className="label">Out of Stock</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⚠️</div>
          <div className="value" style={{ color: 'var(--warning)' }}>{stock.filter(p => p.status === 'Critical').length}</div>
          <div className="label">Critical (≤5)</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📉</div>
          <div className="value" style={{ color: 'var(--warning)' }}>{stock.filter(p => p.status === 'Low').length}</div>
          <div className="label">Low (≤15)</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>✅</div>
          <div className="value" style={{ color: 'var(--success)' }}>{stock.filter(p => p.status === 'Adequate').length}</div>
          <div className="label">Adequate</div>
        </div>
      </div>
      <div className="card p-3">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Seller ID</th><th>Stock</th><th>Sold</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.product_id}>
                  <td className="font-medium">{p.product_name}</td>
                  <td><span className="tag">{p.category}</span></td>
                  <td className="text-muted">#{p.seller_id}</td>
                  <td><strong>{p.stock_quantity}</strong></td>
                  <td>{p.sold}</td>
                  <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
