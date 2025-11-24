// src/context/AuthContext.js

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    if (localStorage.getItem('token')) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        setPermissions(data.permissions);
      } catch (error) {
        console.error('Failed to fetch user data', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/login', { username, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      await fetchUserData();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      throw new Error(error.response?.data?.error || 'Login Failed');
    }
  };

  // Helper function to easily check permissions
  // 1. RENAMED this function to 'checkPermission'
  const checkPermission = (entity_name, action) => {
    // Admin role always has permission
    if (user?.role === 'Admin') {
      return true;
    }

    const perm = permissions.find((p) => p.entity_name === entity_name);
    if (perm && perm[action]) {
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        loading,
        login,
        logout,
        // 2. RENAMED this key to 'checkPermission'
        checkPermission, 
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;