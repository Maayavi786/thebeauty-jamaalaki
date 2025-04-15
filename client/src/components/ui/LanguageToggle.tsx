
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={`font-medium ${language === 'ar' ? 'font-tajawal' : ''}`}
    >
      {language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageToggle;
