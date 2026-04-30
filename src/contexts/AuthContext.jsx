import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);

        // Redirect based on role
        redirectToDashboard(data.user.role);

        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const redirectToDashboard = (role) => {
    switch (role?.toLowerCase()) {
      case 'customer_service':
      case 'customer service':
      case 'support':
        navigate('/dashboard/customer-service');
        break;
      case 'inspector':
        navigate('/dashboard/inspector');
        break;
      case 'user':
      case 'customer':
        navigate('/dashboard/user');
        break;
      default:
        navigate('/dashboard/user');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    redirectToDashboard,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
