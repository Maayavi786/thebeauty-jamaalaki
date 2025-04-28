import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Service } from '@shared/schema';
import FilterChips from '@/components/FilterChips';
import ServiceCard from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getIslamicPatternSvg } from '@/lib/utils';
import { config } from '@/lib/config';
import { apiRequest } from '@/lib/queryClient';
import Helmet from 'react-helmet';

interface ServicesResponse {
  success: boolean;
  data: Service[];
}

const Services = () => {
  const { t } = useTranslation(['services', 'common']);
  const { isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use query client with explicit fetch function for services
  const { data: servicesData = [], isLoading, error } = useQuery({
    queryKey: ['services-list'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', config.api.endpoints.services);
        const result = await response.json();
        console.log('Services API response:', result);
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.data)) return result.data;
        if (result && result.success && Array.isArray(result.data)) return result.data;
        return [];
      } catch (err) {
        console.error('Failed to fetch services:', err);
        throw err;
      }
    },
  });

  // Filter options
  const categories = [
    { id: 'all', label: t('services:all') },
    { id: 'haircuts', label: t('services:haircuts') },
    { id: 'coloring', label: t('services:coloring') },
    { id: 'styling', label: t('services:styling') },
    { id: 'facial', label: t('services:facial') },
    { id: 'makeup', label: t('services:makeup') },
    { id: 'nails', label: t('services:nails') },
    { id: 'massage', label: t('services:massage') },
  ];

  // Use memo to filter services based on category and search query
  // This avoids the useEffect + setState pattern that can cause infinite loops
  const filteredServices = useMemo(() => {
    // Robustly handle null/undefined/empty
    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return [];
    }

    console.log('Filtering services from data:', servicesData);
    let filtered = [...servicesData];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.nameEn?.toLowerCase().includes(query) ||
        service.nameAr?.toLowerCase().includes(query) ||
        service.descriptionEn?.toLowerCase().includes(query) ||
        service.descriptionAr?.toLowerCase().includes(query)
      );
    }

    console.log('Filtered services result:', filtered);
    return filtered;
  }, [servicesData, selectedCategory, searchQuery]);

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Helmet>
        <title>{isRtl ? 'الخدمات' : 'Services'} | Jamaalaki</title>
        <meta name="description" content={isRtl ? 'تصفحي واحجزي خدمات التجميل الفاخرة' : 'Browse and book luxury beauty services'} />
      </Helmet>
      <div className={`container mx-auto py-12 px-4 ${isRtl ? 'font-tajawal' : ''}`}>
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
              {t('services:ourServices')}
            </h1>
            <p className={`text-lg mb-8 text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {isRtl 
                ? 'استكشفي مجموعة واسعة من خدمات التجميل المتميزة المصممة خصيصًا لك'
                : 'Explore our wide range of premium beauty services tailored just for you'}
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('common:searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border-muted-foreground/20 text-foreground placeholder-muted-foreground/70 focus:ring-primary/50 ${isRtl ? 'font-tajawal' : ''}`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="py-12 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl mb-20">
          <div className="mb-8 overflow-x-auto">
            <FilterChips
              options={categories}
              selectedFilters={[selectedCategory]}
              toggleFilter={handleCategoryChange}
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error loading services. Please try again later.</p>
              <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} salonId={service.salonId} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-4">{t('services:noServicesFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;