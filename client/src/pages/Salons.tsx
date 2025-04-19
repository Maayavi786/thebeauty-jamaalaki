import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import SearchBar from "@/components/SearchBar";
import SalonCard from "@/components/SalonCard";
import FilterChips from "@/components/FilterChips";
import { Badge } from "@/components/ui/badge";
import { Salon } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getIslamicPatternSvg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest

const Salons = () => {
  const { t } = useTranslation(["common", "home"]);
  const { isLtr, isRtl } = useLanguage();
  const [location] = useLocation();
  const { toast } = useToast();
  
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Parse URL query parameters on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, any> = {};
    
    // Basic search
    if (searchParams.has('q')) {
      params.q = searchParams.get('q');
    }
    
    // Service filter
    if (searchParams.has('service')) {
      params.service = searchParams.get('service');
    }
    
    // Boolean filters
    const booleanFilters = [];
    if (searchParams.has('isLadiesOnly') && searchParams.get('isLadiesOnly') === 'true') {
      params.isLadiesOnly = true;
      booleanFilters.push('ladiesOnly');
    }
    
    if (searchParams.has('hasPrivateRooms') && searchParams.get('hasPrivateRooms') === 'true') {
      params.hasPrivateRooms = true;
      booleanFilters.push('privateRoom');
    }
    
    if (searchParams.has('isHijabFriendly') && searchParams.get('isHijabFriendly') === 'true') {
      params.isHijabFriendly = true;
      booleanFilters.push('hijabFriendly');
    }
    
    setQueryParams(params);
    setSelectedFilters(booleanFilters);
  }, [location]);
  
  // Use default query client for salons
  const { data: salonsResponse = { success: false, data: [] }, isLoading, error } = useQuery({
    queryKey: [config.api.endpoints.salons],
    queryFn: async () => {
      // Always use apiRequest to ensure correct URL and credentials
      const response = await apiRequest('GET', config.api.endpoints.salons);
      return response.json();
    },
  });
  
  // Handle errors
  useEffect(() => {
    if (error instanceof Error) {
      console.error('Error fetching salons:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Create pattern SVG background
  useEffect(() => {
    const patternSvg = getIslamicPatternSvg();
    const patternBg = document.createElement('div');
    patternBg.className = 'pattern-bg';
    patternBg.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}')`;
    
    document.body.appendChild(patternBg);
    
    return () => {
      document.body.removeChild(patternBg);
    };
  }, []);
  
  // Filter options for the filter chips
  const filterOptions = [
    { id: "ladiesOnly", color: "#D4AF37", label: t("ladiesOnly") },
    { id: "privateRoom", color: "#FFB6C1", label: t("privateRoom") },
    { id: "hijabFriendly", color: "#E6E6FA", label: t("hijabFriendly") },
    { id: "topRated", color: "#4CAF50", label: t("topRated") },
    { id: "newArrivals", color: "#FF9800", label: t("newArrivals") },
    { id: "openNow", label: t("openNow") },
    { id: "verified", label: t("verified") },
  ];
  
  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
    
    // Get the upcoming state of the filters
    const isCurrentlySelected = selectedFilters.includes(id);
    
    // Update query params
    const newParams = { ...queryParams };
    
    if (id === 'ladiesOnly') {
      newParams.isLadiesOnly = !isCurrentlySelected;
    } else if (id === 'privateRoom') {
      newParams.hasPrivateRooms = !isCurrentlySelected;
    } else if (id === 'hijabFriendly') {
      newParams.isHijabFriendly = !isCurrentlySelected;
    }
    
    setQueryParams(newParams);
  };
  
  const handleSearch = (searchParams: any) => {
    const newParams: Record<string, any> = {};
    
    if (searchParams.searchTerm) {
      newParams.q = searchParams.searchTerm;
    }
    
    if (searchParams.serviceType && searchParams.serviceType !== 'all') {
      newParams.service = searchParams.serviceType;
    }
    
    const filtersList = [];
    
    if (searchParams.ladiesOnly) {
      newParams.isLadiesOnly = true;
      filtersList.push('ladiesOnly');
    }
    
    if (searchParams.privateRoom) {
      newParams.hasPrivateRooms = true;
      filtersList.push('privateRoom');
    }
    
    if (searchParams.hijabFriendly) {
      newParams.isHijabFriendly = true;
      filtersList.push('hijabFriendly');
    }
    
    setQueryParams(newParams);
    setSelectedFilters(filtersList);
  };
  
  // Filter salons based on search term and service type
  const filteredSalons = salonsResponse?.data ? salonsResponse.data.filter((salon: Salon) => {
    let matchesSearch = true;
    let matchesService = true;
    
    // Search term filter
    if (queryParams.q) {
      const searchTerm = queryParams.q.toLowerCase();
      const nameEn = salon.nameEn.toLowerCase();
      const nameAr = salon.nameAr.toLowerCase();
      const city = salon.city.toLowerCase();
      
      matchesSearch = nameEn.includes(searchTerm) || 
                      nameAr.includes(searchTerm) || 
                      city.includes(searchTerm);
    }
    
    // TODO: Implement service type filtering when service data is available
    
    return matchesSearch && matchesService;
  }) : [];
  
  const filteredSalonsBySearchTerm = useMemo(() => {
    if (!salonsResponse?.data) return [];
    if (!searchTerm.trim()) return filteredSalons;
    const term = searchTerm.trim().toLowerCase();
    return filteredSalons.filter((salon: any) =>
      (salon.nameEn && salon.nameEn.toLowerCase().includes(term)) ||
      (salon.nameAr && salon.nameAr.toLowerCase().includes(term)) ||
      (salon.city && salon.city.toLowerCase().includes(term)) ||
      (salon.descriptionEn && salon.descriptionEn.toLowerCase().includes(term)) ||
      (salon.descriptionAr && salon.descriptionAr.toLowerCase().includes(term))
    );
  }, [salonsResponse, searchTerm, filteredSalons]);
  
  return (
    <>
      <Helmet>
        <title>{isLtr ? t("salons", { ns: 'home' }) : t("salons", { ns: 'home' })}</title>
        <meta name="description" content={t('salonsDescription', { ns: 'home' })} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
          {t("salons", { ns: 'home' })}
        </h1>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl mb-20">
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(getIslamicPatternSvg('#ffffff'))}")`, 
              backgroundSize: '300px' 
            }}
          ></div>
          <div className="relative z-10 py-20 px-6 text-center max-w-3xl mx-auto">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
              {t('findYourPerfectSalon', { ns: 'common' })}
            </h1>
            <p className={`text-lg mb-8 text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {t('salonsDescription', { ns: 'home' })}
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-12 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-6">
          <div className="mb-8 overflow-x-auto">
            <FilterChips
              options={[
                { id: 'ladiesOnly', label: t('ladiesOnly') },
                { id: 'privateRoom', label: t('privateRoom') },
                { id: 'hijabFriendly', label: t('hijabFriendly') },
                { id: 'topRated', label: t('topRated') },
                { id: 'newArrivals', label: t('newArrivals') },
                { id: 'openNow', label: t('openNow') },
                { id: 'verified', label: t('verified') },
              ]}
              selectedFilters={selectedFilters}
              toggleFilter={toggleFilter}
            />
          </div>
        </div>
        
        {/* Active filters */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedFilters.map(filter => {
              const option = filterOptions.find(opt => opt.id === filter);
              if (!option) return null;
              
              return (
                <Badge 
                  key={filter} 
                  className="bg-primary text-white flex items-center gap-1"
                  onClick={() => toggleFilter(filter)}
                >
                  {option.label}
                  <span className="ml-1 cursor-pointer">&times;</span>
                </Badge>
              );
            })}
          </div>
        )}
        
        {/* Search bar */}
        <div className="mb-6 max-w-xs">
          <Input
            placeholder={isLtr ? "Search salons..." : "ابحثي عن صالون..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
            aria-label={isLtr ? "Search salons" : "ابحثي عن صالون"}
          />
        </div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
            {t('salonsFound', { count: filteredSalonsBySearchTerm.length, ns: 'home' })}
          </p>
        </div>
        
        {/* Salons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{t('errorLoadingSalons')}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                {t('refresh')}
              </Button>
            </div>
          ) : filteredSalonsBySearchTerm.length > 0 ? (
            filteredSalonsBySearchTerm.map((salon: any) => (
              <SalonCard key={salon.id} salon={salon} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                {t('noSalonsFound', { ns: 'home' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Salons;
