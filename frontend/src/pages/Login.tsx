import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <LoginForm />
    </div>
  );
};

