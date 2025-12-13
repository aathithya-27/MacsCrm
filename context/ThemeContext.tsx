import React, { createContext, useContext, useEffect, useState } from 'react';
import { logError } from '../utils/errorUtils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
    } catch (e) {
      logError(e, 'ThemeContext_Init');
    }
    return 'light';
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      logError(e, 'ThemeContext_Effect');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};