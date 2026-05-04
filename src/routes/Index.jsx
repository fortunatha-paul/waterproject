import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/Auth/Login/login';
import Register from '../pages/Auth/Register/register';
import UserDashboard from '../pages/Dashboard/User/Userdashboard';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Dashboard imports (update these paths based on your actual dashboard structure)
import CustomerDashboard from '../pages/Dashboard/Custome Service/Customerservicedashboard';
import InspectorDashboard from '../pages/Dashboard/inspector/InspectorDashboard';

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
    ],
  },
]);

export default router;
