import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, GitBranch, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Zap size={20} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>SmartGadget</span>
            </div>
            <p className="text-muted text-sm" style={{ lineHeight: 1.7, maxWidth: 280 }}>
              Your trusted marketplace for premium gadgets — smartphones, laptops, smartwatches & more.
            </p>
            <div className="flex gap-1 mt-2">
              <a href="#" className="btn btn-secondary btn-sm"><GitBranch size={14} /></a>
              <a href="#" className="btn btn-secondary btn-sm"><Globe size={14} /></a>
              <a href="#" className="btn btn-secondary btn-sm"><Mail size={14} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semi mb-2">Shop</h4>
            <div className="footer-links">
              <Link to="/products">All Products</Link>
              <Link to="/products?category=Smartphones">Smartphones</Link>
              <Link to="/products?category=Laptops">Laptops</Link>
              <Link to="/products?category=Smart Watches">Smart Watches</Link>
              <Link to="/products?category=Headphones">Headphones</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semi mb-2">Account</h4>
            <div className="footer-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">Cart</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semi mb-2">Info</h4>
            <div className="footer-links">
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center' }}>
          <p className="text-muted text-sm">© 2026 Smart Gadget Marketplace. Built with React + Node.js + Oracle + MongoDB.</p>
        </div>
      </div>
    </footer>
  );
}
