import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white dark:bg-darkCard border-t border-warmGray dark:border-darkSurface mt-auto transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center">
          <p className="text-sm text-gray dark:text-darkMuted font-light">
            © {new Date().getFullYear()} {t('appName')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

