import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to initialize user from localStorage
const initializeUserFromStorage = () => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  if (token && userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initializeUserFromStorage);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const SESSION_TIMEOUT = useMemo(() => 2 * 60 * 1000, []); // 2 minutes in milliseconds

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Session timeout logic
  useEffect(() => {
    if (!user) return;

    let timeoutId;
    let lastActivity = Date.now();

    const resetTimer = () => {
      lastActivity = Date.now();
    };

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        console.log('Session timeout - logging out user');
        logout();
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Check for inactivity every 10 seconds
    timeoutId = setInterval(checkInactivity, 10000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(timeoutId);
    };
  }, [user, SESSION_TIMEOUT, logout]);

  const redirectToDashboard = useCallback((role) => {
    switch (role?.toLowerCase()) {
      case 'customer_service':
      case 'customer service':
      case 'support':
        navigate('/dashboard/customer-service');
        break;
      case 'inspector':
        navigate('/dashboard/inspector');
        break;
      case 'finance':
        navigate('/dashboard/finance');
        break;
      case 'hod_sanitation':
      case 'hod sanitation':
      case 'hod':
        navigate('/dashboard/hod');
        break;
      case 'user':
      case 'customer':
        navigate('/dashboard/user');
        break;
      default:
        navigate('/dashboard/user');
    }
  }, [navigate]);

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
