import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Scissors, Bath, Paintbrush, Wand2 } from "lucide-react";

const ServicesSection = () => {
  const { t } = useTranslation(["serviceTypes", "home", "common"]);
  const { isLtr, isRtl } = useLanguage();
  
  const services = [
    {
      id: "spa",
      icon: <Bath className="text-xl" />,
      bgColor: "bg-accent",
      title: t("spaAndMassage", { ns: "serviceTypes" }),
      description: t("spaAndMassageDesc", { ns: "serviceTypes" })
    },
    {
      id: "haircuts",
      icon: <Scissors className="text-xl" />,
      bgColor: "bg-primary",
      title: t("hairStyling", { ns: "serviceTypes" }),
      description: t("hairStylingDesc", { ns: "serviceTypes" })
    },
    {
      id: "nails",
      icon: <Paintbrush className="text-xl" />,
      bgColor: "bg-secondary",
      title: t("nailArt", { ns: "serviceTypes" }),
      description: t("nailArtDesc", { ns: "serviceTypes" })
    },
    {
      id: "makeup",
      icon: <Wand2 className="text-xl" />,
      bgColor: "bg-accent/70",
      title: t("makeup", { ns: "serviceTypes" }),
      description: t("makeupDesc", { ns: "serviceTypes" })
    }
  ];
  
  return (
    <section className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-primary uppercase tracking-wider text-sm font-medium">
            {t("premiumServices", { ns: "home" })}
          </h4>
          <h3 className={`font-bold text-3xl mt-2 mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
            {t("premiumServices", { ns: "home" })}
          </h3>
          
          <p className={`text-muted-foreground max-w-xl mx-auto ${isRtl ? 'font-tajawal' : ''}`}>
            {t("servicesDescription", { ns: "home" })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(service => (
            <div 
              key={service.id}
              className="bg-muted/30 dark:bg-neutral-800/20 rounded-xl p-6 text-center shadow-md transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-2 hover:shadow-xl"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${service.bgColor} text-white mb-4`}>
                {service.icon}
              </div>
              <h4 className={`font-bold text-xl mb-3 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                {service.title}
              </h4>
              
              <p className={`text-muted-foreground text-sm ${isRtl ? 'font-tajawal' : ''}`}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/services">
            <Button 
              className={`bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all ${isRtl ? 'font-tajawal' : ''}`}
              size="lg"
            >
              {t("exploreAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
