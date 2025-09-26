// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = authService.isAuthenticated();
  const hasValidDomain = authService.hasValidDomain();

  if (!isLoggedIn) {
    // User is not authenticated at all
    return <Navigate to="/" replace />;
  }

  if (!hasValidDomain) {
    // User is authenticated but with invalid domain
    // Logout user and redirect to login
    authService.logout();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;