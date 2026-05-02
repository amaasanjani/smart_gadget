import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', shop_name: '', owner_name: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = role === 'seller'
        ? { shop_name: form.shop_name, owner_name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password }
        : { name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password };
      const user = await register(data, role);
      toast.success(`Welcome to SmartGadget, ${user.name}! 🎉`);
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="text-center mb-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={28} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.5rem' }}>SmartGadget</span>
          </div>
          <h2>Create Account</h2>
          <p className="text-muted text-sm mt-1">Join thousands of gadget lovers</p>
        </div>

        <div className="card p-4">
          <div className="tabs mb-3">
            <button type="button" className={`tab ${role === 'customer' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setRole('customer')}>
              <User size={14} /> Customer
            </button>
            <button type="button" className={`tab ${role === 'seller' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setRole('seller')}>
              <Store size={14} /> Seller
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {role === 'seller' && (
              <div className="form-group mb-3">
                <label>Shop Name *</label>
                <input className="input" placeholder="TechZone LK" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} required />
              </div>
            )}
            <div className="form-group mb-3">
              <label>{role === 'seller' ? 'Owner Name' : 'Full Name'} *</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group mb-3">
              <label>Email *</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Phone</label>
                <input className="input" placeholder="077XXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input className="input" type="password" placeholder="min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
            </div>
            <div className="form-group mb-4">
              <label>Address</label>
              <input className="input" placeholder="City, Province" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : `Create ${role === 'seller' ? 'Seller' : 'Customer'} Account`}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-3">
            Already registered? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
