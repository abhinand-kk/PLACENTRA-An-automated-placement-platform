import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(localStorage.getItem('user_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/v1/auth/me/');
          setUser(res.data);
          setRole(res.data.role);
          localStorage.setItem('user_role', res.data.role);
          localStorage.setItem('user_data', JSON.stringify(res.data));
        } catch (err) {
          console.error("Failed to fetch current user:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/v1/auth/login/', {
      email: email,
      email_or_username: email,
      password: password,
    });

    const { access, refresh, role: userRole, user: userData } = res.data;

    // Store tokens, user object, and role in localStorage
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (userRole) localStorage.setItem('user_role', userRole);
    if (userData) localStorage.setItem('user_data', JSON.stringify(userData));

    setToken(access);
    setRole(userRole);
    setUser(userData);

    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/api/v1/auth/logout/', { refresh: refreshToken });
      } catch (e) {
        // Ignore logout network errors
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
