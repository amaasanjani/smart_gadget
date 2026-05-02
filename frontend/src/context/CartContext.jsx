import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.product_id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock_quantity) {
          toast.error(`Only ${product.stock_quantity} in stock`);
          return prev;
        }
        toast.success('Cart updated!');
        return prev.map(i => i.product_id === product.product_id ? { ...i, quantity: newQty } : i);
      }
      toast.success('Added to cart!');
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (product_id) => {
    setCart(prev => prev.filter(i => i.product_id !== product_id));
    toast('Removed from cart', { icon: '🗑️' });
  };

  const updateQty = (product_id, qty) => {
    if (qty <= 0) { removeFromCart(product_id); return; }
    setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
