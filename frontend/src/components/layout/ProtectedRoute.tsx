import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading, hasCheckedAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading until initial auth check is complete
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-softGray dark:bg-darkBg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-darkText"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

