import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, token } = useAuth();

  console.log('🔍 ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('🔍 ProtectedRoute: user =', user);
  console.log('🔍 ProtectedRoute: token exists =', !!token);
  
  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute: Redirecting to login - not authenticated');
  } else {
    console.log('🔍 ProtectedRoute: User is authenticated, showing children');
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;