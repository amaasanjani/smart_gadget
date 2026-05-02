import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Tag, PackagePlus, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', image: '📦' };
const emojiOptions = ['📱', '💻', '🖱️', '📟', '⌚', '🎧', '🔌', '📷', '🖥️', '🎮', '📡', '🔋', '📦'];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [reports, setReports] = useState([]);
  const [showAssign, setShowAssign] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const fmt = n => `Rs. ${Number(n || 0).toLocaleString()}`;

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories' + (search ? `?search=${encodeURIComponent(search)}` : ''));
      setCategories(res.data.data || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, [search]);

  useEffect(() => {
    if (activeTab === 'reports') {
      api.get('/categories/reports/summary').then(r => setReports(r.data.data || []));
    }
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
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
      setShowForm(false); setForm(emptyForm); setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products will keep their category label.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.category_id !== id));
      toast.success('Category deleted');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/categories/${id}/toggle`);
      setCategories(prev => prev.map(c => c.category_id === id ? res.data.data : c));
      toast.success(res.data.message);
    } catch (err) { toast.error('Failed to toggle status'); }
  };

  const openAssign = async (cat) => {
    setShowAssign(cat);
    setSelectedProducts([]);
    const res = await api.get('/products');
    setAllProducts(res.data.data || []);
  };

  const handleAssign = async () => {
    if (!selectedProducts.length) { toast.error('Select at least one product'); return; }
    try {
      const res = await api.post(`/categories/${showAssign.category_id}/assign`, { product_ids: selectedProducts });
      toast.success(res.data.message);
      setShowAssign(null);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to assign'); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const tabs = ['list', 'reports'];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>🏷️ Category Management</h1>
          <p className="text-muted text-sm mt-1">Manage product categories for Smart Gadget Marketplace</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <div>
          {/* Search */}
          <div className="card p-3 mb-4" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Search size={18} style={{ color: 'var(--muted)' }} />
            <input className="input" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none' }}
              placeholder="Search categories by name or description..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>Clear</button>}
          </div>

          {/* Category Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <div key={cat.category_id} className="card p-3"
                style={{ borderLeft: `3px solid ${cat.active ? 'var(--accent)' : 'var(--border)'}`, opacity: cat.active ? 1 : 0.65 }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.8rem' }}>{cat.image}</span>
                    <div>
                      <div className="font-bold" style={{ fontSize: '1rem' }}>{cat.name}</div>
                      <div className="text-xs text-muted">{cat.product_count} products</div>
                    </div>
                  </div>
                  <span className={`badge ${cat.active ? 'badge-success' : 'badge-warning'}`}>
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-muted text-sm mb-3" style={{ minHeight: 36 }}>{cat.description || 'No description'}</p>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    setForm({ name: cat.name, description: cat.description, image: cat.image });
                    setEditId(cat.category_id); setShowForm(true);
                  }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(cat.category_id)}>
                    {cat.active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                    {cat.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openAssign(cat)}>
                    <PackagePlus size={12} /> Assign
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.category_id, cat.name)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="icon"><Tag size={40} /></div>
                <h3>No categories found</h3>
                <p>Try a different search or add a new category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div>
          <h2 className="mb-4">📊 Category Reports</h2>
          <div className="grid-4 mb-4">
            <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🏷️</div>
              <div className="value">{reports.length}</div>
              <div className="label">Total Categories</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>✅</div>
              <div className="value" style={{ color: 'var(--success)' }}>{reports.filter(r => r.active).length}</div>
              <div className="label">Active Categories</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--info)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📦</div>
              <div className="value" style={{ color: 'var(--info)' }}>{reports.reduce((s, r) => s + r.product_count, 0)}</div>
              <div className="label">Total Products</div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💰</div>
              <div className="value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>{fmt(reports.reduce((s, r) => s + r.total_revenue, 0))}</div>
              <div className="label">Total Revenue</div>
            </div>
          </div>
          <div className="card p-3">
            <h3 className="mb-3">Category Performance</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th><th>Status</th><th>Products</th><th>Total Sold</th>
                    <th>Revenue</th><th>Avg Price</th><th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.category_id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-accent" style={{ minWidth: 24, justifyContent: 'center' }}>#{i + 1}</span>
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${r.active ? 'badge-success' : 'badge-warning'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                      <td>{r.product_count}</td>
                      <td>{r.total_sold}</td>
                      <td className="text-success font-semi">{fmt(r.total_revenue)}</td>
                      <td className="text-accent">{fmt(r.avg_price)}</td>
                      <td><span className={`badge ${r.total_stock <= 10 ? 'badge-danger' : 'badge-success'}`}>{r.total_stock}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group mb-3">
                <label>Category Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required placeholder="e.g. Tablets" />
              </div>
              <div className="form-group mb-3">
                <label>Description</label>
                <textarea className="input" rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this category..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group mb-4">
                <label>Icon / Emoji</label>
                <div className="flex gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                  {emojiOptions.map(em => (
                    <button key={em} type="button"
                      onClick={() => setForm(f => ({ ...f, image: em }))}
                      style={{
                        fontSize: '1.4rem', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                        background: form.image === em ? 'var(--accent)' : 'var(--bg3)',
                        border: `2px solid ${form.image === em ? 'var(--accent)' : 'transparent'}`,
                      }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : editId ? 'Update Category' : 'Add Category'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Products Modal */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Products to — {showAssign.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(null)}>✕</button>
            </div>
            <p className="text-muted text-sm mb-3">Select products to move them into this category:</p>
            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
              {allProducts.filter(p => p.category !== showAssign.name).map(p => (
                <label key={p.product_id} className="flex items-center gap-3 p-2 mb-1"
                  style={{ borderRadius: 8, cursor: 'pointer', background: selectedProducts.includes(p.product_id) ? 'rgba(108,99,255,0.08)' : 'var(--bg3)' }}>
                  <input type="checkbox" checked={selectedProducts.includes(p.product_id)}
                    onChange={e => setSelectedProducts(prev =>
                      e.target.checked ? [...prev, p.product_id] : prev.filter(id => id !== p.product_id)
                    )} style={{ accentColor: 'var(--accent)' }} />
                  <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div className="text-sm font-medium">{p.product_name}</div>
                    <div className="text-xs text-muted">Currently: {p.category}</div>
                  </div>
                  <span className="text-accent text-sm">Rs. {p.price?.toLocaleString()}</span>
                </label>
              ))}
              {allProducts.filter(p => p.category !== showAssign.name).length === 0 && (
                <p className="text-muted text-center">All products are already in this category.</p>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAssign}
                disabled={!selectedProducts.length}>
                Assign {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''} Products
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAssign(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
