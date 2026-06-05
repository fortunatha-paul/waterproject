import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/Auth/Login/login';
import Register from '../pages/Auth/Register/register';
import UserDashboard from '../pages/dashboard/User/Userdashboard';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Dashboard imports (update these paths based on your actual dashboard structure)
import CustomerDashboard from '../pages/dashboard/Custome Service/Customerservicedashboard';
import InspectorDashboard from '../pages/dashboard/inspector/InspectorDashboard';
import Finance from '../pages/dashboard/finance/Finance';
import HODSanitation from '../pages/dashboard/water and sanitation/HODSanitation';
import HodDashboard from '../pages/dashboard/hod/HodDashboard';

const AuthLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/dashboard/user',
        element: (
          <ProtectedRoute requiredRole="customer">
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/customer-service',
        element: (
          <ProtectedRoute requiredRole="customer_service">
            <CustomerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/customer',
        element: (
          <ProtectedRoute requiredRole="customer_service">
            <CustomerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/inspector',
        element: (
          <ProtectedRoute requiredRole="inspector">
            <InspectorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/finance',
        element: (
          <ProtectedRoute requiredRole="finance">
            <Finance />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/hod',
        element: (
          <ProtectedRoute requiredRole="hod_sanitation">
            <HodDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/hod-sanitation',
        element: (
          <ProtectedRoute requiredRole="hod_sanitation">
            <HODSanitation />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
