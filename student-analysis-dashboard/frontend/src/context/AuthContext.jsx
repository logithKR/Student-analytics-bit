import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bit_auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage and verify with backend
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('bit_auth_token');
      const storedUser = localStorage.getItem('bit_auth_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with server in background
          const res = await getCurrentUser();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('bit_auth_user', JSON.stringify(res.user));
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('bit_auth_token');
          localStorage.removeItem('bit_auth_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      if (res && res.token && res.user) {
        localStorage.setItem('bit_auth_token', res.token);
        localStorage.setItem('bit_auth_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Authentication returned an invalid response format.');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res && res.token && res.user) {
        localStorage.setItem('bit_auth_token', res.token);
        localStorage.setItem('bit_auth_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Registration returned an invalid response format.');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Registration failed.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('bit_auth_token');
    localStorage.removeItem('bit_auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      register,
      logout
    }}>
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

