import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <RegisterForm />
    </div>
  );
};

