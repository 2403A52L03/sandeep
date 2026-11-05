import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 except when checking login route
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('smart_agri_token');
        localStorage.removeItem('smart_agri_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
