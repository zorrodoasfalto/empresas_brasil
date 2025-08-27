import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  console.log('🔍 ProtectedRoute: isAuthenticated =', isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;