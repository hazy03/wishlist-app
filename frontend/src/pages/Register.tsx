import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuthStore } from '../store/authStore';

export const Register: React.FC = () => {
  const { isAuthenticated, checkAuth, isLoading, hasCheckedAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading until initial auth check is complete
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-cream dark:bg-darkBg flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-darkText"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <RegisterForm />
    </div>
  );
};

