import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, CalendarCheck, Clock, CheckCircle } from "lucide-react";

const BookingSteps = () => {
  const { t } = useTranslation("booking");
  const { isLtr, isRtl } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: <Search className="text-xl" />,
      title: t("step1"),
      description: t("step1Desc")
    },
    {
      number: 2,
      icon: <CalendarCheck className="text-xl" />,
      title: t("step2"),
      description: t("step2Desc")
    },
    {
      number: 3,
      icon: <Clock className="text-xl" />,
      title: t("step3"),
      description: t("step3Desc")
    },
    {
      number: 4,
      icon: <CheckCircle className="text-xl" />,
      title: t("step4"),
      description: t("step4Desc")
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-primary uppercase tracking-wider text-sm font-medium">
            {t("howItWorks", { ns: "home" })}
          </h4>
          <h3 className={`font-bold text-3xl mt-2 mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
            {t("bookingProcess", { ns: "home" })}
          </h3>
          
          <p className={`text-muted-foreground max-w-xl mx-auto ${isRtl ? 'font-tajawal' : ''}`}>
            {t("bookingProcessDescription", { ns: "home" })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-background/80 dark:bg-neutral-800/20 rounded-xl p-6 relative">
              <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                {step.number}
              </div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted dark:bg-neutral-800/40 text-primary mb-4">
                  {step.icon}
                </div>
                <h4 className={`font-bold text-xl mb-2 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                  {step.title}
                </h4>
              </div>
              <p className={`text-muted-foreground text-sm text-center ${isRtl ? 'font-tajawal' : ''}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookingSteps;
