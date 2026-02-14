import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-darkCard border-b border-warmGray dark:border-darkSurface transition-colors duration-300 shadow-soft">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-display text-charcoal dark:text-darkText hover:opacity-80 transition-opacity duration-300 font-medium">
            Wishlist
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/friends"
                  className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
                >
                  {t('friends')}
                </Link>
                <Link
                  to="/profile"
                  className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
                >
                  {t('profile')}
                </Link>
                <span className="text-gray dark:text-darkMuted text-sm px-4 flex items-center">
                  {user?.full_name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center">
                  <Button variant="outline" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register" className="flex items-center">
                  <Button variant="primary" size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

