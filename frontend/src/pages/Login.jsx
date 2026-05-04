import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      toast.success(`Welcome back, ${user.name}! 👋`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'seller') navigate('/seller');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (email, pass, role) => {
    setForm({ email, password: pass, role });
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={28} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>SmartGadget</span>
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Quick demo logins */}
        <div className="card p-3 mb-3" style={{ background: 'rgba(108,99,255,0.05)' }}>
          <div className="flex gap-1" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('kasun@example.com', 'password123', 'customer')}>Customer</button>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('techzone@example.com', 'seller123', 'seller')}>Seller</button>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('admin@smartgadget.com', 'admin123', 'customer')}>Admin</button>
          </div>
        </div>

        <div className="card p-4">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Login as</label>
              <div className="tabs" style={{ marginBottom: 0 }}>
                {['customer', 'seller'].map(r => (
                <button key={r} type="button" className={`tab ${form.role === r ? 'active' : ''}`}
                  onClick={() => set('role', r)} style={{ flex: 1, textTransform: 'capitalize' }}>{r}</button>
              ))}
              </div>
            </div>
            <div className="form-group mb-3">
              <label>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group mb-4">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-3">
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
