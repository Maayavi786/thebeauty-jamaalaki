import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const { t } = useTranslation("home");
  const { isRtl } = useLanguage();

  return (
    <section data-aos="fade-up" className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between bg-muted/30 dark:bg-neutral-800/50 rounded-xl p-8 border border-border">
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            <h3 className={`font-bold text-3xl mb-4 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
              {t("readyForLuxury")}
            </h3>
            
            <p className={`text-muted-foreground mb-6 ${isRtl ? 'font-tajawal' : ''}`}>
              {t("downloadAppDesc")}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-background hover:bg-background/90 text-foreground font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaApple className="text-2xl" />
                <div className={`text-left ${isRtl ? 'font-tajawal' : ''}`}>
                  <div className="text-xs opacity-70">{t("downloadOn")}</div>
                  <div className="font-medium">{t("appStore")}</div>
                </div>
              </Button>
              
              <Button 
                className="bg-background hover:bg-background/90 text-foreground font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaGooglePlay className="text-2xl" />
                <div className={`text-left ${isRtl ? 'font-tajawal' : ''}`}>
                  <div className="text-xs opacity-70">{t("getItOn")}</div>
                  <div className="font-medium">{t("googlePlay")}</div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <img 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80" 
              alt="Salon application on smartphone" 
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
