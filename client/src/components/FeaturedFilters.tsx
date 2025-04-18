import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

const FeaturedFilters = () => {
  const { t } = useTranslation("common");
  const { isRtl } = useLanguage();
  const [_, navigate] = useLocation();
  
  const filters = [
    { id: "ladiesOnly", color: "#D4AF37", label: t("ladiesOnly"), param: "isLadiesOnly" },
    { id: "privateRoom", color: "#FFB6C1", label: t("privateRoom"), param: "hasPrivateRooms" },
    { id: "hijabFriendly", color: "#E6E6FA", label: t("hijabFriendly"), param: "isHijabFriendly" },
    { id: "topRated", color: "#4CAF50", label: t("topRated"), param: "topRated" },
    { id: "newArrivals", color: "#FF9800", label: t("newArrivals"), param: "newArrivals" }
  ];
  
  const handleFilterClick = (filter: { id: string, param: string }) => {
    const params = new URLSearchParams();
    params.append(filter.param, "true");
    navigate(`/salons?${params.toString()}`);
  };
  
  return (
    <section className="py-10 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto px-4">
        <div className={`flex flex-wrap justify-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {filters.map(filter => (
            <div 
              key={filter.id}
              className="flex items-center gap-2 bg-muted dark:bg-neutral-800/30 px-5 py-3 rounded-full cursor-pointer hover:bg-opacity-90 transition-colors"
              onClick={() => handleFilterClick(filter)}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: filter.color }}
              ></span>
              <span className={`text-sm font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                {filter.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedFilters;
