import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 md:py-32">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-slow mb-20">
          <div className="mb-12">
            <span className="text-sm text-sage dark:text-forest font-medium mb-6 block uppercase tracking-wider">
              {t('welcome')}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display mb-6 text-charcoal dark:text-darkText font-light tracking-tight">
              {t('appName')}
            </h1>
            <p className="text-xl md:text-2xl text-gray dark:text-darkMuted font-light max-w-3xl mx-auto leading-relaxed">
              {t('welcomeDescription')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  {t('dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    {t('getStarted')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    {t('login')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="cozy-card animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300">
              <div className="text-6xl mb-6">🎁</div>
              <h3 className="text-2xl font-display mb-4 text-charcoal dark:text-darkText font-medium">
                {t('createWishlist')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted">
                {t('createWishlistDescription')}
              </p>
            </div>
            
            <div className="cozy-card animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '0.15s' }}>
              <div className="text-6xl mb-6">👥</div>
              <h3 className="text-2xl font-display mb-4 text-charcoal dark:text-darkText font-medium">
                {t('shareCollaborate')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted">
                {t('shareCollaborateDescription')}
              </p>
            </div>
            
            <div className="cozy-card animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="text-6xl mb-6">💰</div>
              <h3 className="text-2xl font-display mb-4 text-charcoal dark:text-darkText font-medium">
                {t('groupGift')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted">
                {t('groupGiftDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

