import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleMap = {
      'customer_service': '/dashboard/customer-service',
      'customer service': '/dashboard/customer-service',
      'support': '/dashboard/customer-service',
      'inspector': '/dashboard/inspector',
      'user': '/dashboard/user',
      'customer': '/dashboard/user'
    };
    
    const redirectPath = roleMap[user.role?.toLowerCase()] || '/dashboard/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
