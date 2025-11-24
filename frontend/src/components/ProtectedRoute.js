import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // <-- FIX 1: Corrected path

/**
 * @param {{ children: React.ReactNode }} props
 */
const ProtectedRoute = ({ children }) => { // <-- FIX 2: Type hint added
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;