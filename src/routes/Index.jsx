import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login/login';
import Register from '../pages/Auth/Register/register';

// Dashboard imports (update these paths based on your actual dashboard structure)
// import AdminDashboard from '../pages/dashboard/admin';
// import CustomerDashboard from '../pages/dashboard/customer';
// import InspectorDashboard from '../pages/dashboard/inspector';

export const router = createBrowserRouter([
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
  // Add your dashboard routes here
  // {
  //   path: '/dashboard/admin',
  //   element: <AdminDashboard />,
  // },
  // {
  //   path: '/dashboard/customer',
  //   element: <CustomerDashboard />,
  // },
  // {
  //   path: '/dashboard/inspector',
  //   element: <InspectorDashboard />,
  // },
]);

export default router;
