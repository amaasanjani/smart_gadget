import React, { useState } from 'react';
import { User, Phone, MapPin, Save, Edit2, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    zipcode: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 1, label: 'Home', street: '12 Main St', city: 'Colombo', zipcode: '00100', default: true },
  ]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/auth/customers/${user.id}`, form);
      // Update local storage with new name
      const stored = JSON.parse(localStorage.getItem('sg_user') || '{}');
      stored.name = form.name;
      localStorage.setItem('sg_user', JSON.stringify(stored));
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const newAddr = {
      id: savedAddresses.length + 1,
      label: addressForm.street,
      ...addressForm,
      default: savedAddresses.length === 0,
    };
    setSavedAddresses(prev => [...prev, newAddr]);
    setAddressForm({ street: '', city: '', zipcode: '' });
    setShowAddressForm(false);
    toast.success('Address saved!');
  };

  const handleSetDefault = (id) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })));
    toast.success('Default address updated');
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto' }}>
      <h1 className="mb-4">👤 My Profile</h1>

      {/* Profile Card */}
      <div className="card p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', color: '#fff', fontWeight: 'bold'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ marginBottom: 4 }}>{user?.name}</h2>
              <p className="text-muted text-sm">{user?.email}</p>
              <span className="badge badge-accent" style={{ marginTop: 4 }}>Customer</span>
            </div>
          </div>
          {!editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile}>
            <div className="grid-2 mb-3" style={{ gap: 16 }}>
              <div className="form-group">
                <label><User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Full Name *</label>
                <input className="input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label><Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Phone Number</label>
                <input className="input" value={form.phone} placeholder="e.g. 0771234567"
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group mb-4">
              <label><MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Default Address</label>
              <textarea className="input" rows={2} value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Your full address..." style={{ resize: 'vertical' }} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid-2" style={{ gap: 16 }}>
            <div>
              <div className="text-xs text-muted mb-1">Full Name</div>
              <div className="font-medium">{user?.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Email</div>
              <div className="font-medium">{user?.email || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Phone</div>
              <div className="font-medium">{form.phone || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Address</div>
              <div className="font-medium">{form.address || '—'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Addresses */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <h3><Home size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Delivery Addresses</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}>
            {showAddressForm ? 'Cancel' : '+ Add New Address'}
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="card p-3 mb-3" style={{ background: 'var(--bg3)' }}>
            <div className="grid-2 mb-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label>Street / Full Address *</label>
                <input className="input" value={addressForm.street}
                  onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                  placeholder="123 Main Street" required />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input className="input" value={addressForm.city}
                  onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Colombo" required />
              </div>
            </div>
            <div className="form-group mb-3">
              <label>Postal Code</label>
              <input className="input" value={addressForm.zipcode}
                onChange={e => setAddressForm(f => ({ ...f, zipcode: e.target.value }))}
                placeholder="00100" />
            </div>
            <button className="btn btn-primary btn-sm" type="submit">Save Address</button>
          </form>
        )}

        <div>
          {savedAddresses.map(addr => (
            <div key={addr.id} className="flex items-start gap-3 p-3 mb-2"
              style={{ background: 'var(--bg3)', borderRadius: 10, border: addr.default ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
              <MapPin size={20} style={{ color: addr.default ? 'var(--accent)' : 'var(--muted)', marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="font-medium">{addr.street}</div>
                <div className="text-sm text-muted">{addr.city}{addr.zipcode ? `, ${addr.zipcode}` : ''}</div>
                {addr.default && <span className="badge badge-accent" style={{ marginTop: 4 }}>Default</span>}
              </div>
              <div className="flex gap-1">
                {!addr.default && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSetDefault(addr.id)}>
                    Set Default
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(addr.id)}>✕</button>
              </div>
            </div>
          ))}
          {savedAddresses.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="icon">🏠</div>
              <p>No delivery addresses saved yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
