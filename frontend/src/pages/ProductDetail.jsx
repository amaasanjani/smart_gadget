import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Package, Truck, Shield, Heart, Store } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p) => `Rs. ${p?.toLocaleString()}`;

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!product) return <div className="container mt-4"><div className="alert alert-danger">Product not found.</div></div>;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.product_name}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 32, alignItems: 'start' }}>
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <img src={product.image} alt={product.product_name} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
          </div>
        </div>
        <div>
          <span className="badge badge-accent mb-2">{product.category}</span>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 12, marginTop: 8 }}>{product.product_name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <span className="star-rating" style={{ fontSize: '1.1rem' }}>{'★'.repeat(Math.floor(product.rating || 0))}</span>
            <span className="text-muted">({product.rating}) · {product.sold} units sold</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 20 }}>
            {formatPrice(product.price)}
          </div>
          <p className="text-muted" style={{ lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>

          <div className="card p-3 mb-3" style={{ background: 'rgba(67,233,123,0.05)', borderColor: 'rgba(67,233,123,0.2)' }}>
            <div className="flex items-center gap-2">
              <Package size={16} style={{ color: 'var(--success)' }} />
              <span className="text-sm">
                {product.stock_quantity > 5 ? (
                  <span className="text-success">In Stock ({product.stock_quantity} available)</span>
                ) : product.stock_quantity > 0 ? (
                  <span className="text-warning">Only {product.stock_quantity} left!</span>
                ) : (
                  <span className="text-danger">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <label className="font-semi">Quantity:</label>
            <div className="flex items-center gap-1">
              <button className="btn btn-secondary btn-sm" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={{ padding: '0 16px', fontWeight: 600 }}>{qty}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}>+</button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
              onClick={() => addToCart(product, qty)} disabled={product.stock_quantity === 0}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => { addToCart(product, qty); navigate('/checkout'); }}>
              Buy Now
            </button>
          </div>

          <div className="grid-3" style={{ gap: 12 }}>
            {[
              { icon: <Truck size={16} />, text: 'Free delivery on orders over Rs. 10,000' },
              { icon: <Shield size={16} />, text: '1-year warranty included' },
              { icon: <Package size={16} />, text: 'Easy 30-day returns' },
            ].map((f, i) => (
              <div key={i} className="card p-2 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--accent)' }}>{f.icon}</span>
                <span className="text-muted">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
