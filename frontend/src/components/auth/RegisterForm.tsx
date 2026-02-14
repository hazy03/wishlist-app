import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OnboardingTour } from '../onboarding/OnboardingTour';
import { OAuthButton } from './OAuthButton';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { register } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, fullName);
      setShowOnboarding(true);
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-lg w-full mx-auto mt-4 sm:mt-8 md:mt-12 p-6 sm:p-8 md:p-12 cozy-card animate-fade-in-slow">
      <div className="text-center mb-10">
        <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
          {t('registerTitle')}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-soft-4xl font-display text-charcoal dark:text-darkText mb-4 font-medium whitespace-nowrap">
          {t('joinUs')}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-soft text-red-600 dark:text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Input
          type="text"
          label={t('fullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />

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
          autoComplete="new-password"
          minLength={6}
          showPasswordToggle
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          {t('register')}
        </Button>
      </form>

      <div className="divider my-8"></div>

      <div className="mb-6">
        <OAuthButton />
      </div>

      <p className="text-center text-sm text-gray dark:text-darkMuted">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-sage dark:text-forest hover:opacity-80 font-medium transition-opacity">
          {t('login')}
        </Link>
      </p>

      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

