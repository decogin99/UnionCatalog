import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

const RequireRole = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/Login" replace />;
  if (role && user.role !== role) return <Navigate to="/Dashboard" replace />;
  return children;
};

export default RequireRole;