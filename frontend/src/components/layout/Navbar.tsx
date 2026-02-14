import React, { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-darkCard border-b border-warmGray dark:border-darkSurface transition-colors duration-300 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="text-xl sm:text-2xl font-display text-charcoal dark:text-darkText hover:opacity-80 transition-opacity duration-300 font-medium">
            Wishlist
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
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
                <span className="text-gray dark:text-darkMuted text-sm px-4 flex items-center truncate max-w-[150px]">
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

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-warmGray dark:border-darkSurface">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    to="/friends"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300"
                  >
                    {t('friends')}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-charcoal dark:text-darkText hover:text-sage dark:hover:text-forest px-3 py-2 text-sm font-medium transition-colors duration-300"
                  >
                    {t('profile')}
                  </Link>
                  <span className="text-gray dark:text-darkMuted text-sm px-3 py-2 truncate">
                    {user?.full_name || user?.email}
                  </span>
                  <div className="px-3 pt-2">
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                      {t('logout')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2"
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      {t('register')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

