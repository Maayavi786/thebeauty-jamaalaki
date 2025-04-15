import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import i18n from '@/lib/i18n';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders component that wraps all the providers in the correct order
 * to ensure context is available throughout the application
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ 
  children 
}: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};