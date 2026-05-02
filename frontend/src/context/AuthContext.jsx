import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sg_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'customer') => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('sg_token', res.data.token);
    localStorage.setItem('sg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', { user_id: user?.id, username: user?.name });
    } catch {}
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const register = async (data, role = 'customer') => {
    const endpoint = role === 'seller' ? '/auth/register/seller' : '/auth/register/customer';
    const res = await api.post(endpoint, data);
    localStorage.setItem('sg_token', res.data.token);
    localStorage.setItem('sg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
