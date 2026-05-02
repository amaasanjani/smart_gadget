import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, ArrowRight, Zap, Shield, Truck, Headphones, Smartphone, Monitor, Watch } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?sort=best_selling').then(r => {
      setFeatured(r.data.data.slice(0, 8));
    }).catch(() => {
      // fallback
      setFeatured([]);
    }).finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Smartphones', icon: '📱', desc: '20+ products', color: '#6c63ff' },
    { name: 'Laptops', icon: '💻', desc: '12+ products', color: '#ff6584' },
    { name: 'Smart Watches', icon: '⌚', desc: '15+ products', color: '#43e97b' },
    { name: 'Headphones', icon: '🎧', desc: '10+ products', color: '#ffd166' },
    { name: 'Accessories', icon: '🔌', desc: '25+ products', color: '#38bdf8' },
  ];

  const formatPrice = (p) => `Rs. ${p.toLocaleString()}`;

  return (
    <div>
      {/* hero section */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div className="fade-up">
              <div className="badge badge-accent mb-2" style={{ marginBottom: 20 }}>
                <Zap size={12} style={{ marginRight: 4 }} /> #1 Gadget Marketplace in Sri Lanka
              </div>
              <h1 className="hero-title">
                Find Your Next <span>Premium Gadget</span> Here
              </h1>
              <p className="hero-subtitle">
                Explore thousands of smartphones, laptops, smartwatches, and accessories from verified sellers at unbeatable prices.
              </p>
              <div className="flex gap-2">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">Sell with Us</Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><h3>20K+</h3><p>Products Listed</p></div>
                <div className="hero-stat"><h3>5K+</h3><p>Happy Customers</p></div>
                <div className="hero-stat"><h3>500+</h3><p>Verified Sellers</p></div>
                <div className="hero-stat"><h3>99%</h3><p>Satisfaction</p></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'].map((src, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden', borderRadius: 16 }}>
                  <img src={src} alt="gadget" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="grid-4">
            {[
              { icon: <Shield size={24} />, title: 'Verified Sellers', desc: 'All sellers are vetted' },
              { icon: <Truck size={24} />, title: 'Fast Delivery', desc: 'Island-wide shipping' },
              { icon: <Headphones size={24} />, title: '24/7 Support', desc: 'Always here for you' },
              { icon: <Zap size={24} />, title: 'Best Prices', desc: 'Guaranteed deals' },
            ].map((f, i) => (
              <div key={i} className="card p-3 flex items-center gap-2">
                <div style={{ color: 'var(--accent)', background: 'rgba(108,99,255,0.1)', padding: 12, borderRadius: 12 }}>{f.icon}</div>
                <div>
                  <div className="font-semi">{f.title}</div>
                  <div className="text-sm text-muted">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by <span className="gradient-text">Category</span></h2>
            <p>Browse our curated collection of premium gadgets</p>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((cat, i) => (
              <Link key={i} to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="card cat-card" style={{ textDecoration: 'none', minWidth: 160 }}>
                <span className="cat-icon">{cat.icon}</span>
                <h4>{cat.name}</h4>
                <p>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* featured */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>🔥 Best <span className="gradient-text">Sellers</span></h2>
            <p>Most popular gadgets loved by our customers</p>
          </div>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : (
            <div className="grid-auto">
              {featured.map((p) => (
                <div key={p.product_id} className="card product-card" onClick={() => navigate(`/products/${p.product_id}`)}>
                  <div className="img-wrap">
                    <img src={p.image} alt={p.product_name} />
                    <button className="wishlist-btn" onClick={e => e.stopPropagation()}><Heart size={14} /></button>
                    <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }} className="badge badge-accent">{p.category}</span>
                  </div>
                  <div className="card-body">
                    <h4 className="truncate mb-1" style={{ fontSize: '0.95rem' }}>{p.product_name}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="star-rating">{'★'.repeat(Math.floor(p.rating))}</span>
                      <span className="text-xs text-muted">({p.rating}) · {p.sold} sold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="product-price">{formatPrice(p.price)}</span>
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); addToCart(p); }}>
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/products" className="btn btn-secondary btn-lg">View All Products <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* cta section */}
      <section className="section">
        <div className="container">
          <div className="card p-4" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))', textAlign: 'center', border: '1px solid rgba(108,99,255,0.3)' }}>
            <h2 style={{ marginBottom: 12 }}>Ready to Start Selling? 🚀</h2>
            <p className="text-muted" style={{ marginBottom: 28, fontSize: '1rem' }}>Join 500+ verified sellers and reach thousands of gadget lovers.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Register as a Seller</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
