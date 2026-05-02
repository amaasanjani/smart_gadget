import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { product_name: '', category: 'Smartphones', price: '', stock_quantity: '', description: '', image: '' };
const categories = ['Smartphones', 'Laptops', 'Accessories', 'Tablets', 'Smart Watches', 'Headphones', 'Other'];

const statusColor = { Delivered: 'badge-success', Shipped: 'badge-info', Processing: 'badge-warning', Pending: 'badge-muted', Cancelled: 'badge-danger', Packed: 'badge-accent' };

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fmt = (p) => `Rs. ${Number(p || 0).toLocaleString()}`;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: res.data.url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const loadProducts = () =>
    api.get(`/products?seller_id=${user.id}`).then(r => setProducts(r.data.data))
      .catch(() => setProducts())
      .finally(() => setLoading(false));

  useEffect(() => { loadProducts(); }, [user.id]);

  useEffect(() => {
    if (activeTab === 'orders') {
      api.get('/orders').then(r => {
        const all = r.data.data || [];
        const myProductIds = products.map(p => p.product_id);
        const myOrders = all.filter(o => o.items?.some(i => myProductIds.includes(i.product_id)));
        setOrders(myOrders);
      }).catch(() => setOrders([]));
    }
    if (activeTab === 'reports') {
      api.get(`/orders/reports/seller-sales?seller_id=${user.id}`)
        .then(r => setSalesReport(r.data.data))
        .catch(() => setSalesReport(null));
    }
  }, [activeTab, products, user.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/products/${editId}`, { ...form, seller_id: user.id });
        setProducts(prev => prev.map(p => p.product_id === editId ? res.data.data : p));
        toast.success('Product updated!');
      } else {
        const res = await api.post('/products', { ...form, seller_id: user.id, seller_name: user.name });
        setProducts(prev => [...prev, res.data.data]);
        toast.success('Product added!');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`, { data: { seller_id: user.id } });
      setProducts(prev => prev.filter(p => p.product_id !== id));
      toast.success('Product deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleEdit = (p) => {
    setForm({ product_name: p.product_name, category: p.category, price: p.price, stock_quantity: p.stock_quantity, description: p.description, image: p.image || '' });
    setEditId(p.product_id); setShowForm(true);
  };

  const totalRevenue = products.reduce((s, p) => s + p.sold * p.price, 0);
  const totalSold = products.reduce((s, p) => s + p.sold, 0);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const tabs = ['products', 'orders', 'reports', 'profile'];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>🏪 Seller Dashboard</h1>
          <p className="text-muted text-sm mt-1">{user.name}{user.shop ? ` · ${user.shop}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={loadProducts}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🛍️</div>
          <div className="value">{products.length}</div>
          <div className="label">My Products</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💰</div>
          <div className="value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>{fmt(totalRevenue)}</div>
          <div className="label">Total Revenue</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--info)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📦</div>
          <div className="value" style={{ color: 'var(--info)' }}>{totalSold}</div>
          <div className="label">Units Sold</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⚠️</div>
          <div className="value" style={{ color: 'var(--warning)' }}>{products.filter(p => p.stock_quantity <= 5).length}</div>
          <div className="label">Low Stock Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* Add/Edit Modal */}
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
                <input className="input" value={form.product_name} onChange={e => set('product_name', e.target.value)} required placeholder="e.g. Samsung Galaxy S25" />
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
                  <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="e.g. 189900" />
                </div>
              </div>
              <div className="form-group mb-3">
                <label>Stock Quantity</label>
                <input className="input" type="number" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} placeholder="e.g. 25" />
              </div>
              <div className="form-group mb-3">
                <label>Product Image</label>
                {form.image && (
                  <div className="mb-2">
                    <img src={form.image} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="input" style={{ padding: '8px' }} />
                {uploading && <span className="text-sm text-accent mt-1 d-block">Uploading...</span>}
              </div>
              <div className="form-group mb-4">
                <label>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product details..." style={{ resize: 'vertical' }} />
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

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="card p-3">
          <h3 className="mb-3">My Products ({products.length})</h3>
          {products.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="icon">📦</div>
              <h3>No products yet</h3>
              <p>Add your first product to start selling!</p>
              <button className="btn btn-primary mt-2" onClick={() => setShowForm(true)}><Plus size={14} /> Add Product</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Revenue</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          <div>
                            <div className="font-medium" style={{ fontSize: '0.9rem' }}>{p.product_name}</div>
                            <div className="text-xs text-muted">⭐ {p.rating}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{p.category}</span></td>
                      <td className="text-accent font-semi">{fmt(p.price)}</td>
                      <td><span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : p.stock_quantity <= 15 ? 'badge-warning' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                      <td>{p.sold}</td>
                      <td className="text-success">{fmt(p.sold * p.price)}</td>
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
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="card p-3">
          <h3 className="mb-3">📦 Customer Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="icon">📦</div>
              <p>No customer orders containing your products yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Your Items</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const myItems = o.items?.filter(i => products.some(p => p.product_id === i.product_id)) || [];
                    return (
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
                        <td>
                          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                            {myItems.slice(0, 2).map(item => (
                              <span key={item.item_id} className="text-xs badge badge-accent">
                                {item.product?.product_name?.split(' ').slice(0, 2).join(' ')} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && salesReport && (
        <div>
          <h2 className="mb-4">📊 Sales Reports</h2>
          <div className="grid-4 mb-4">
            <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🛍️</div>
              <div className="value">{salesReport.totals?.total_products}</div>
              <div className="label">Products Listed</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💰</div>
              <div className="value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>{fmt(salesReport.totals?.total_revenue)}</div>
              <div className="label">Total Revenue</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--info)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📦</div>
              <div className="value" style={{ color: 'var(--info)' }}>{salesReport.totals?.total_sold}</div>
              <div className="label">Total Units Sold</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⚠️</div>
              <div className="value" style={{ color: 'var(--warning)' }}>{salesReport.products?.filter(p => p.stock_quantity <= 5).length}</div>
              <div className="label">Low Stock</div>
            </div>
          </div>
          <div className="card p-3">
            <h3 className="mb-3">Product Performance Report</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Units Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {salesReport.products?.map((p, i) => (
                    <tr key={p.product_id}>
                      <td><span className="badge badge-accent">#{i + 1}</span></td>
                      <td className="font-medium">{p.product_name}</td>
                      <td><span className="tag">{p.category}</span></td>
                      <td className="text-accent">{fmt(p.price)}</td>
                      <td><span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                      <td>{p.units_sold}</td>
                      <td className="text-success font-semi">{fmt(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && <SellerProfileTab user={user} />}
    </div>
  );
}

function SellerProfileTab({ user }) {
  const [form, setForm] = useState({ owner_name: user.name || '', shop_name: user.shop || '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/auth/sellers/${user.id}`, form);
      const stored = JSON.parse(localStorage.getItem('sg_user') || '{}');
      stored.name = form.owner_name;
      stored.shop = form.shop_name;
      localStorage.setItem('sg_user', JSON.stringify(stored));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="card p-4" style={{ maxWidth: 600 }}>
      <h3 className="mb-4">👤 Update Seller Profile</h3>
      <form onSubmit={handleSave}>
        <div className="grid-2 mb-3" style={{ gap: 16 }}>
          <div className="form-group">
            <label>Owner Name</label>
            <input className="input" value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Shop Name</label>
            <input className="input" value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} />
          </div>
        </div>
        <div className="grid-2 mb-3" style={{ gap: 16 }}>
          <div className="form-group">
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0112345678" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop address" />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
