import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fmt = (p) => `Rs. ${p.toLocaleString()}`;

  if (cart.length === 0) return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="empty-state">
        <div className="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our amazing gadgets and add them to your cart!</p>
        <Link to="/products" className="btn btn-primary btn-lg mt-3">Shop Now</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="mb-4">Shopping Cart <span className="text-muted" style={{ fontSize: '1rem' }}>({cart.length} items)</span></h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <div>
          {cart.map(item => (
            <div key={item.product_id} className="card p-3 mb-2 flex items-center gap-3">
              <img src={item.image} alt={item.product_name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{item.product_name}</h4>
                <span className="badge badge-accent">{item.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.product_id, item.quantity - 1)}><Minus size={12} /></button>
                <span style={{ padding: '0 12px', fontWeight: 600 }}>{item.quantity}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.product_id, item.quantity + 1)}><Plus size={12} /></button>
              </div>
              <div className="text-right" style={{ minWidth: 100 }}>
                <div className="product-price">{fmt(item.price * item.quantity)}</div>
                <div className="text-xs text-muted">{fmt(item.price)} each</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.product_id)}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm mt-2" onClick={clearCart}><Trash2 size={14} /> Clear Cart</button>
        </div>

        {/* Summary */}
        <div className="card p-3" style={{ position: 'sticky', top: 80 }}>
          <h3 className="mb-3">Order Summary</h3>
          {cart.map(i => (
            <div key={i.product_id} className="flex justify-between text-sm mb-2">
              <span className="text-muted truncate" style={{ maxWidth: 180 }}>{i.product_name} × {i.quantity}</span>
              <span>{fmt(i.price * i.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            <div className="flex justify-between mb-1"><span className="text-muted">Subtotal</span><span>{fmt(total)}</span></div>
            <div className="flex justify-between mb-1"><span className="text-muted">Shipping</span><span className="text-success">Free</span></div>
            <div className="flex justify-between font-bold text-lg mt-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <span>Total</span><span className="text-accent">{fmt(total)}</span>
            </div>
          </div>
          {user ? (
            <button className="btn btn-primary w-full mt-3 btn-lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          ) : (
            <div>
              <Link to="/login" className="btn btn-primary w-full mt-3" style={{ justifyContent: 'center' }}>Login to Checkout</Link>
              <p className="text-center text-xs text-muted mt-2">or <Link to="/register" style={{ color: 'var(--accent)' }}>create an account</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
