import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

// Helper function to apply theme
const applyTheme = (theme: Theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme on load
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('theme-storage');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed.state?.theme || 'light';
    } catch {
      return 'light';
    }
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    applyTheme(newTheme);
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: newTheme } }));
  },
  setTheme: (theme: Theme) => {
    set({ theme });
    applyTheme(theme);
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme } }));
  },
  initTheme: () => {
    const theme = getInitialTheme();
    set({ theme });
    applyTheme(theme);
  },
}));

