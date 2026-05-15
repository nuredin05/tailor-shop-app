import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
