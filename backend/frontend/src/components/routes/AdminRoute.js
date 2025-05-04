// frontend/src/components/routes/AdminRoute.js
import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user, loading } = useContext(AuthContext);

  useEffect(() => {
    // Debug logging
    console.log('AdminRoute - Auth State:', { isAuthenticated, isAdmin, user, loading });
  }, [isAuthenticated, isAdmin, user, loading]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast.error('You need administrator privileges to access this page');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;