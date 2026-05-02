import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Star, Heart, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const categories = ['All', 'Smartphones', 'Laptops', 'Accessories', 'Tablets', 'Smart Watches', 'Headphones', 'Other'];
const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [maxPrice, setMaxPrice] = useState(400000);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [wishlist, setWishlist] = useState([]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (activeCategory !== 'All') params.category = activeCategory;
    if (maxPrice < 400000) params.max_price = maxPrice;

    api.get('/products', { params }).then(r => {
      setProducts(r.data.data);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [search, sort, activeCategory, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const formatPrice = (p) => `Rs. ${p.toLocaleString()}`;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="page-header" style={{ paddingTop: 0 }}>
        <h1>All Products</h1>
        <p className="text-muted mt-1">{products.length} products found</p>
      </div>

      <div className="layout-sidebar">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <h3 className="mb-3"><SlidersHorizontal size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Filters</h3>
          <div className="form-group mb-3">
            <label>Category</label>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="sidebar-link" style={{ marginBottom: 2 }}
                data-active={activeCategory === cat}>
                <span className={activeCategory === cat ? 'text-accent font-semi' : ''}>{cat}</span>
              </button>
            ))}
          </div>
          <div className="form-group mb-3">
            <label>Max Price: {formatPrice(maxPrice)}</label>
            <input type="range" min={5000} max={400000} step={5000} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} />
            <div className="flex justify-between text-xs text-muted">
              <span>Rs. 5,000</span><span>Rs. 4,00,000</span>
            </div>
          </div>
          <div className="form-group">
            <label>Sort By</label>
            <select className="select w-full" value={sort} onChange={e => setSort(e.target.value)}>
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary w-full mt-2" onClick={() => { setActiveCategory('All'); setSearch(''); setSort(''); setMaxPrice(400000); }}>
            Clear Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div>
          <div className="flex gap-2 mb-3">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="input" style={{ paddingLeft: 38 }} placeholder="Search gadgets..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="pill-row">
            {categories.map(cat => (
              <button key={cat} className={`pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid-auto">
              {products.map(p => (
                <div key={p.product_id} className="card product-card" onClick={() => navigate(`/products/${p.product_id}`)}>
                  <div className="img-wrap">
                    <img src={p.image} alt={p.product_name} />
                    <button className={`wishlist-btn ${wishlist.includes(p.product_id) ? 'active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleWishlist(p.product_id); }}>
                      <Heart size={14} />
                    </button>
                    <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }} className="badge badge-accent">{p.category}</span>
                    {p.stock_quantity <= 5 && <span style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 2 }} className="badge badge-danger">Low Stock</span>}
                  </div>
                  <div className="card-body">
                    <h4 className="truncate mb-1" style={{ fontSize: '0.95rem' }}>{p.product_name}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="star-rating">{'★'.repeat(Math.floor(p.rating || 0))}</span>
                      <span className="text-xs text-muted">({p.rating}) · {p.sold} sold</span>
                    </div>
                    <p className="text-xs text-muted mb-2" style={{ lineHeight: 1.5 }}>
                      {p.description?.substring(0, 60)}...
                    </p>
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
        </div>
      </div>
    </div>
  );
}
