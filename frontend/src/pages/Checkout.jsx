import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Banknote, CheckCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const paymentMethods = [
  { value: 'Card', label: 'Credit/Debit Card', icon: <CreditCard size={20} /> },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: <Building2 size={20} /> },
  { value: 'Cash on Delivery', label: 'Cash on Delivery', icon: <Banknote size={20} /> },
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('Card');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const fmt = (p) => `Rs. ${p.toLocaleString()}`;

  const handlePlace = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return; }
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        customer_id: user.id,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method: method,
      });
      const orderId = orderRes.data.data.order_id;

      // process payment
      const payRes = await api.post('/payments/process', {
        order_id: orderId, payment_method: method, customer_id: user.id,
      });
      clearCart();
      setSuccess({ order_id: orderId, message: payRes.data.message });
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="container" style={{ padding: '80px 24px', maxWidth: 600, margin: '0 auto' }}>
      <div className="card p-4 text-center">
        <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
        <h2 className="mb-2">Order Placed! 🎉</h2>
        <p className="text-muted mb-2">{success.message}</p>
        <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '8px 20px', margin: '16px auto' }}>
          Order #{success.order_id}
        </div>
        <div className="flex gap-2 mt-3" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="mb-4">Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        <div>
          <div className="card p-3 mb-3">
            <h3 className="mb-3">Delivery Address</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" defaultValue={user?.name} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="form-group mt-2">
              <label>Delivery Address *</label>
              <textarea className="input" rows={3} placeholder="Enter your full address..."
                value={address} onChange={e => setAddress(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div className="card p-3">
            <h3 className="mb-3">Payment Method</h3>
            {paymentMethods.map(m => (
              <label key={m.value} className="flex items-center gap-3 p-3 mb-2"
                style={{ borderRadius: 10, border: `1px solid ${method === m.value ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', background: method === m.value ? 'rgba(108,99,255,0.08)' : 'transparent' }}>
                <input type="radio" name="payment" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ color: method === m.value ? 'var(--accent)' : 'var(--muted)' }}>{m.icon}</span>
                <span className={method === m.value ? 'font-semi' : ''}>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-3" style={{ position: 'sticky', top: 80 }}>
          <h3 className="mb-3">Order Summary</h3>
          {cart.map(i => (
            <div key={i.product_id} className="flex justify-between text-sm mb-2">
              <span className="text-muted truncate" style={{ maxWidth: 180 }}>{i.product_name} ×{i.quantity}</span>
              <span>{fmt(i.price * i.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-accent">{fmt(total)}</span>
            </div>
          </div>
          <button className="btn btn-primary w-full btn-lg mt-3" onClick={handlePlace} disabled={loading}>
            {loading ? 'Processing...' : <><ArrowRight size={18} /> Place Order</>}
          </button>
          <p className="text-center text-xs text-muted mt-2">Secured by SSL encryption 🔒</p>
        </div>
      </div>
    </div>
  );
}
