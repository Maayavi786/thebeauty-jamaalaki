import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  salonId: number;
}

const ServiceCard = ({ service, salonId }: ServiceCardProps) => {
  const { t } = useTranslation("common");
  const { isLtr, isRtl } = useLanguage();
  
  const durationMap: Record<string, string> = {
    "15min": "15 min",
    "30min": "30 min",
    "45min": "45 min",
    "60min": "1 hour",
    "90min": "1.5 hours",
    "120min": "2 hours"
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-2 ${isRtl ? 'font-tajawal' : ''}`}>
          {isLtr ? service.nameEn : service.nameAr}
        </h3>
        
        <p className={`text-muted-foreground text-sm mb-4 line-clamp-2 h-10 ${isRtl ? 'font-tajawal' : ''}`}>
          {isLtr ? service.descriptionEn : service.descriptionAr}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{durationMap[service.duration] || service.duration}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-bold text-lg">{formatPrice(service.price, "SAR")}</span>
          </div>
        </div>
        
        <Link href={`/booking/${salonId}/${service.id}`}>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            {t("bookNow")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;