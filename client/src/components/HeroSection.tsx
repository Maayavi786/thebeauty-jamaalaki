import { useTranslation, Trans } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroSection = () => {
  const { t } = useTranslation(["home", "common"]);
  const { isLtr, isRtl } = useLanguage();

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 rtl:lg:pr-0 rtl:lg:pl-12 text-center lg:text-left rtl:lg:text-right">
            <h2 className={`font-bold text-4xl lg:text-5xl mb-6 leading-tight ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
              <Trans i18nKey="heroTitle" ns="home">
                Luxury Salon Booking <span className="text-primary">Simplified</span>
              </Trans>
            </h2>
            
            <p className={`text-lg mb-8 text-muted-foreground max-w-md mx-auto lg:mx-0 rtl:lg:mr-0 rtl:lg:ml-auto ${isRtl ? 'font-tajawal' : ''}`}>
              {t("heroDescription", { ns: "home" })}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start rtl:lg:justify-end gap-4">
              <Link href="/salons">
                <Button 
                  className={`bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${isRtl ? 'font-tajawal' : ''}`}
                  size="lg"
                >
                  {t("bookNow", { ns: "common" })}
                </Button>
              </Link>
              
              <Link href="/salons">
                <Button 
                  variant="outline"
                  className={`border-primary text-primary hover:bg-primary/10 font-medium py-3 px-8 rounded-full transition-colors ${isRtl ? 'font-tajawal' : ''}`}
                  size="lg"
                >
                  {t("exploreSalons", { ns: "common" })}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-background dark:border-neutral-800">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80" 
                alt="Luxury salon interior" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className={`text-2xl ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                  {isLtr ? "Trending: Spa & Beauty" : "الرائج: السبا والجمال"}
                </p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary rounded-full opacity-20 z-0"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent rounded-full opacity-20 z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
