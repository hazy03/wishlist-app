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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-32">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-slow mb-12 sm:mb-16 md:mb-20">
          <div className="mb-8 sm:mb-12">
            <span className="text-sm text-sage dark:text-forest font-medium mb-4 sm:mb-6 block uppercase tracking-wider">
              {t('welcome')}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display mb-4 sm:mb-6 text-charcoal dark:text-darkText font-light tracking-tight">
              {t('appName')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray dark:text-darkMuted font-light max-w-3xl mx-auto leading-relaxed px-4">
              {t('welcomeDescription')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8 sm:mt-12 px-4">
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
        <div className="mt-16 sm:mt-20 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            <div className="cozy-card p-6 sm:p-8 animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🎁</div>
              <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 text-charcoal dark:text-darkText font-medium">
                {t('createWishlist')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted text-sm sm:text-base">
                {t('createWishlistDescription')}
              </p>
            </div>
            
            <div className="cozy-card p-6 sm:p-8 animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '0.15s' }}>
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">👥</div>
              <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 text-charcoal dark:text-darkText font-medium">
                {t('shareCollaborate')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted text-sm sm:text-base">
                {t('shareCollaborateDescription')}
              </p>
            </div>
            
            <div className="cozy-card p-6 sm:p-8 animate-fade-in text-center hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">💰</div>
              <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 text-charcoal dark:text-darkText font-medium">
                {t('groupGift')}
              </h3>
              <p className="cozy-text text-gray dark:text-darkMuted text-sm sm:text-base">
                {t('groupGiftDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

