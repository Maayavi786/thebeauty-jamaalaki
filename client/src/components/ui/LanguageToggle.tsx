import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={`text-primary font-medium ${language === 'ar' ? 'font-tajawal' : ''} border border-transparent hover:border-ring rounded-full p-2 transition-colors`}
    >
      {language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageToggle;
