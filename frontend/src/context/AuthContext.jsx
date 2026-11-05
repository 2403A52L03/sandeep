import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smart_agri_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('smart_agri_token');
      const storedUser = localStorage.getItem('smart_agri_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh profile in background
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('smart_agri_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('smart_agri_token', jwtToken);
      localStorage.setItem('smart_agri_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { user: newUser, token: jwtToken } = res.data.data;
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('smart_agri_token', jwtToken);
      localStorage.setItem('smart_agri_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_agri_token');
    localStorage.removeItem('smart_agri_user');
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
