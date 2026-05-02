import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a26', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' },
            success: { iconTheme: { primary: '#43e97b', secondary: '#000' } },
            error: { iconTheme: { primary: '#ff6584', secondary: '#fff' } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
