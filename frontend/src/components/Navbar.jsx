import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} style={{ color: 'var(--accent)' }} />
          Smart<span>Gadget</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={active('/')}>Home</Link>
          <Link to="/products" className={active('/products')}>Products</Link>
          {user?.role === 'admin' && <Link to="/admin" className={active('/admin')}>Admin</Link>}
          {user?.role === 'admin' && <Link to="/admin/categories" className={active('/admin/categories')}>Categories</Link>}
          {user?.role === 'seller' && <Link to="/seller" className={active('/seller')}>Seller</Link>}
          {user && user.role === 'customer' && <Link to="/orders" className={active('/orders')}>My Orders</Link>}
          {user && user.role === 'customer' && <Link to="/profile" className={active('/profile')}>Profile</Link>}
        </div>

        <div className="flex items-center gap-1">
          <Link to="/cart" className="btn btn-secondary btn-sm nav-cart">
            <ShoppingCart size={16} />
            Cart
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted" style={{ padding: '0 8px' }}>
                {user.role === 'admin' ? '' : user.role === 'seller' ? '' : ''} {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Link to="/login" className="btn btn-secondary btn-sm"><User size={14} /> Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
