import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  salonId: number;
  salon?: any; // Accept optional salon object for image fallback
}

const ServiceCard = ({ service, salonId, salon }: ServiceCardProps) => {
  const { t } = useTranslation("common");
  const { isLtr, isRtl } = useLanguage();
  const [_, navigate] = useLocation();
  
  const durationMap: Record<string, string> = {
    "15min": "15 min",
    "30min": "30 min",
    "45min": "45 min",
    "60min": "1 hour",
    "90min": "1.5 hours",
    "120min": "2 hours"
  };

  // Service images based on category (if service doesn't have an image)
  const getCategoryImage = (category: string) => {
    const categoryImages: Record<string, string> = {
      'haircuts': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=600&auto=format&fit=crop',
      'coloring': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=600&auto=format&fit=crop',
      'styling': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=600&auto=format&fit=crop',
      'makeup': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
      'nails': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
      'massage': 'https://images.unsplash.com/photo-1620733723572-11c53fc809a9?q=80&w=600&auto=format&fit=crop',
      'default': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=600&auto=format&fit=crop'
    };
    
    return categoryImages[category] || categoryImages.default;
  };

  // Prefer service.imageUrl, then salon.imageUrl, then category image
  const serviceImage = service.imageUrl || (salon?.imageUrl ?? getCategoryImage(service.category || 'default'));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
      {/* Service image - full width */}
      <div 
        className="w-full h-40 bg-center bg-cover"
        style={{
          backgroundImage: `url(${serviceImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
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
        
        <div
          onClick={() => {
            // Store salon in sessionStorage for retrieval in BookingPage
            if (salon && typeof window !== 'undefined') {
              sessionStorage.setItem('salon-' + salonId, JSON.stringify(salon));
            }
            // Use Wouter's navigate for smooth SPA routing
            navigate(`/booking/${salonId}/${service.id}`);
          }}
        >
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            {t("bookNow")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;