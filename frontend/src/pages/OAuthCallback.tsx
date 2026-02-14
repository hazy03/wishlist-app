import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // Save token and fetch user
      localStorage.setItem('access_token', token);
      fetchUser()
        .then(() => {
          navigate('/dashboard');
        })
        .catch(() => {
          navigate('/login?error=oauth_failed');
        });
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, fetchUser]);

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-6 animate-gentle-bounce">⏳</div>
        <p className="text-charcoal dark:text-darkText text-lg">
          {t('completingLogin') || 'Completing login...'}
        </p>
      </div>
    </div>
  );
};

