
import React, { createContext, useContext, useState, useCallback } from 'react';
import { languages, translations, Language } from '@/config/languages';

type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  const setLanguage = useCallback((code: string) => {
    const newLanguage = languages.find(lang => lang.code === code);
    if (newLanguage) {
      setCurrentLanguage(newLanguage);
      localStorage.setItem('preferredLanguage', code);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let translation: any = translations[currentLanguage.code];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    return translation || key;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
