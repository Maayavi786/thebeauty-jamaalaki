import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  dir: 'ltr' | 'rtl';
  toggleLanguage: () => void;
  isLtr: boolean;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  initialIsRtl?: boolean;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialIsRtl = false 
}: LanguageProviderProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isLtr = dir === 'ltr';
  const isRtl = dir === 'rtl';

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, dir, toggleLanguage, isLtr, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};
