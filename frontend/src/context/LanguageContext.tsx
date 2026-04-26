import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('bizdom_inbox_language');
    if (stored === 'es' || stored === 'en') return stored;
    return 'en';
  });

  const setLanguage = useCallback((next: Language) => {
    localStorage.setItem('bizdom_inbox_language', next);
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'es' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const entry = String(translations[language][key] ?? key);
      if (!vars) return entry;

      return Object.entries(vars).reduce(
        (current, [varKey, value]) => current.split(`{${varKey}}`).join(String(value)),
        entry,
      );
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, setLanguage, toggleLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }

  return context;
}
