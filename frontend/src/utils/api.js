import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global auth error handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sg_token');
      localStorage.removeItem('sg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
