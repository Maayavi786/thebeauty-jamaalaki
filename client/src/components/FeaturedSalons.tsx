import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Salon } from "@shared/schema";
import SalonCard from "@/components/SalonCard";
import { Loader2 } from "lucide-react";
import { config } from "@/lib/config"; // Assuming config is imported from here

const FeaturedSalons = () => {
  const { t } = useTranslation("common");
  const { isLtr, isRtl } = useLanguage();
  
  // Use default query client for featured salons
  const { data: salons, isLoading } = useQuery({
    queryKey: [config.api.endpoints.salons],
  });
  
  // State for featured salons
  const [featuredSalons, setFeaturedSalons] = useState<Salon[]>([]);
  
  // Select the top 3 rated salons as featured
  useEffect(() => {
    if (salons && salons.length > 0) {
      const sortedSalons = [...salons].sort((a, b) => {
        // Sort by rating (descending)
        if (a.rating !== b.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        // If ratings are equal, use ID as fallback
        return a.id - b.id;
      });
      
      // Take the top 3 or all if less than 3
      setFeaturedSalons(sortedSalons.slice(0, 3));
    }
  }, [salons]);
  
  return (
    <section className="py-16 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h4 className="text-primary uppercase tracking-wider text-sm font-medium">
              {t("featuredSalons")}
            </h4>
            <h3 className={`font-bold text-3xl ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
              {t("trendingSalons")}
            </h3>
          </div>
          
          <Link href="/salons">
            <span className="text-primary flex items-center gap-2 hover:underline cursor-pointer">
              <span className={isRtl ? 'font-tajawal' : ''}>{t("viewAll")}</span>
              <span>{isLtr ? '→' : '←'}</span>
            </span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : featuredSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSalons.map(salon => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr 
                ? "No featured salons available at the moment." 
                : "لا توجد صالونات مميزة متاحة في الوقت الحالي."
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSalons;
