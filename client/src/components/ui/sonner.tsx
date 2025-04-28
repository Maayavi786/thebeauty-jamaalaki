import { Toaster as SonnerToaster } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export function Toaster() {
  const { isRtl } = useLanguage();
  
  return (
    <SonnerToaster 
      position="top-right" 
      toastOptions={{
        style: { 
          direction: isRtl ? 'rtl' : 'ltr',
          fontFamily: isRtl ? 'Tajawal, sans-serif' : 'inherit',
        }
      }}
    />
  );
}
