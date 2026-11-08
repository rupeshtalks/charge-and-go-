import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en/translation.json';
import teTranslations from '../locales/te/translation.json';
import hiTranslations from '../locales/hi/translation.json';

export type SupportedLanguage = 'en' | 'te' | 'hi';
export type SupportedTheme = 'light' | 'dark' | 'system';

interface AppPreferencesContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  theme: SupportedTheme;
  setTheme: (theme: SupportedTheme) => void;
  resolvedTheme: 'light' | 'dark';
  t: (keyPath: string) => string;
}

const translations: Record<SupportedLanguage, any> = {
  en: enTranslations,
  te: teTranslations,
  hi: hiTranslations,
};

const AppPreferencesContext = createContext<AppPreferencesContextType | undefined>(undefined);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('cng_pref_lang') as SupportedLanguage) || 'en';
  });

  const [theme, setThemeState] = useState<SupportedTheme>(() => {
    return (localStorage.getItem('cng_pref_theme') as SupportedTheme) || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // Eagerly resolve on first render to prevent white flash
    const stored = localStorage.getItem('cng_pref_theme') as SupportedTheme || 'dark';
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    }
    return stored;
  });

  // Sync theme changes to html dataset and storage
  useEffect(() => {
    localStorage.setItem('cng_pref_theme', theme);

    const updateResolvedTheme = () => {
      let finalTheme: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        finalTheme = theme;
      }
      setResolvedTheme(finalTheme);
      document.documentElement.setAttribute('data-theme', finalTheme);
    };

    updateResolvedTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync language changes
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('cng_pref_lang', lang);
  };

  const setTheme = (thm: SupportedTheme) => {
    setThemeState(thm);
  };

  // Translation helper function traversing nested paths e.g. "hero.headlinePrefix"
  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fb of keys) {
          if (fallback && typeof fallback === 'object' && fb in fallback) {
            fallback = fallback[fb];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <AppPreferencesContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        resolvedTheme,
        t,
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }
  return context;
};
