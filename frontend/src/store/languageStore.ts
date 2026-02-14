import { create } from 'zustand';

export type Language = 'ru' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  initLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => {
  // Initialize from localStorage
  const savedLang = localStorage.getItem('language-storage');
  const initialLang = savedLang ? (JSON.parse(savedLang).state?.language || 'ru') : 'ru';
  
  return {
    language: initialLang,
    setLanguage: (lang: Language) => {
      set({ language: lang });
      localStorage.setItem('language-storage', JSON.stringify({ state: { language: lang } }));
    },
    toggleLanguage: () => {
      const newLang = get().language === 'ru' ? 'en' : 'ru';
      set({ language: newLang });
      localStorage.setItem('language-storage', JSON.stringify({ state: { language: newLang } }));
    },
    initLanguage: () => {
      const savedLang = localStorage.getItem('language-storage');
      const lang = savedLang ? (JSON.parse(savedLang).state?.language || 'ru') : 'ru';
      set({ language: lang });
    },
  };
});

