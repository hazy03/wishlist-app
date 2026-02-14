import React from 'react';
import { useLanguageStore } from '../../store/languageStore';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  // Используем CDN для флагов стран
  const RU_FLAG_URL = 'https://flagcdn.com/w20/ru.png';
  const US_FLAG_URL = 'https://flagcdn.com/w20/us.png';

  return (
    <div className="relative group">
      <button
        className="px-3 py-2 rounded-lg bg-softGray dark:bg-darkSurface hover:bg-warmGray dark:hover:bg-darkCard transition-colors duration-200 text-sm font-medium text-charcoal dark:text-darkText flex items-center space-x-2"
        aria-label="Toggle language"
      >
        <img
          src={language === 'ru' ? RU_FLAG_URL : US_FLAG_URL}
          alt={language === 'ru' ? 'Russia flag' : 'USA flag'}
          className="w-5 h-4 object-cover rounded-sm"
        />
        <span>{language === 'ru' ? 'RU' : 'EN'}</span>
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-darkCard rounded-lg shadow-lg border border-warmGray dark:border-darkSurface opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button
          onClick={() => setLanguage('ru')}
          className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-softGray dark:hover:bg-darkSurface rounded-t-lg transition-colors duration-200 ${
            language === 'ru' ? 'bg-sage/10 dark:bg-forest/20' : ''
          }`}
        >
          <img
            src={RU_FLAG_URL}
            alt="Russia flag"
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span className="text-sm font-medium text-charcoal dark:text-darkText">Русский</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-softGray dark:hover:bg-darkSurface rounded-b-lg transition-colors duration-200 ${
            language === 'en' ? 'bg-sage/10 dark:bg-forest/20' : ''
          }`}
        >
          <img
            src={US_FLAG_URL}
            alt="USA flag"
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span className="text-sm font-medium text-charcoal dark:text-darkText">English (USA)</span>
        </button>
      </div>
    </div>
  );
};

