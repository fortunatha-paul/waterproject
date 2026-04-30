import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/Auth/Login/login';
import Register from '../pages/Auth/Register/register';
import UserDashboard from '../pages/Dashboard/User/Userdashboard';
import { AuthProvider } from '../contexts/AuthContext';

// Dashboard imports (update these paths based on your actual dashboard structure)
import CustomerDashboard from '../pages/Dashboard/Custome Service/Customerservicedashboard';
import InspectorDashboard from '../pages/Dashboard/inspector/Inspectordashboard';

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
        element: <UserDashboard />,
      },
      {
        path: '/dashboard/customer',
        element: <CustomerDashboard />,
      },
      {
        path: '/dashboard/inspector',
        element: <InspectorDashboard />,
      },
    ],
  },
]);

export default router;
