import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OAuthButton } from './OAuthButton';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-12 cozy-card animate-fade-in-slow">
      <div className="text-center mb-10">
        <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
          {t('loginTitle')}
        </span>
        <h2 className="text-soft-4xl font-display text-charcoal dark:text-darkText mb-4 font-medium">
          Welcome Back
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-soft text-red-600 dark:text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Input
          type="email"
          label={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          type="password"
          label={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          {t('login')}
        </Button>
      </form>

      <div className="divider my-8"></div>

      <div className="mb-6">
        <OAuthButton />
      </div>

      <p className="text-center text-sm text-gray dark:text-darkMuted">
        {t('noAccount')}{' '}
        <Link to="/register" className="text-sage dark:text-forest hover:opacity-80 font-medium transition-opacity">
          {t('register')}
        </Link>
      </p>
    </div>
  );
};

