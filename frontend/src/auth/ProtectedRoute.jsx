import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import AccessDenied from '../components/AccessDenied.jsx';

export default function ProtectedRoute({ allowedRoles = null }) {
  const { token, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  
  // If allowedRoles is specified, check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }
  
  return <Outlet />;
}
