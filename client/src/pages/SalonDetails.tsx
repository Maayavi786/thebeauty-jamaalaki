import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Salon, Service, Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users 
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";

// TypeScript Interfaces
interface InfoItemProps {
  icon: React.ElementType;
  text: string;
  isLtr: boolean;
  ariaLabel?: string;
}

interface RatingDisplayProps {
  rating: number;
  isLtr: boolean;
  ariaLabel?: string;
}

interface SalonData {
  salon: Salon | null;
  services: Service[] | null;
  reviews: Review[] | null;
  isLoading: boolean;
  errors: {
    salonError: unknown;
    servicesError: unknown;
    reviewsError: unknown;
  };
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">
            {this.props.children}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Reusable InfoItem component with TypeScript and accessibility
const InfoItem = ({ icon: Icon, text, isLtr, ariaLabel }: InfoItemProps) => (
  <div 
    className="flex items-center"
    role="listitem"
    aria-label={ariaLabel || `Information: ${text}`}
  >
    <Icon 
      className={`w-5 h-5 text-gray-500 ${isLtr ? 'mr-2' : 'ml-2'}`}
      aria-hidden="true"
    />
    <span>{text}</span>
  </div>
);

// Reusable RatingDisplay component with TypeScript and accessibility
const RatingDisplay = ({ rating, isLtr, ariaLabel }: RatingDisplayProps) => (
  <div 
    className="flex items-center"
    role="img"
    aria-label={ariaLabel || `Rating: ${rating} stars`}
  >
    <Star 
      className={`w-5 h-5 text-yellow-400 ${isLtr ? 'mr-1' : 'ml-1'}`}
      aria-hidden="true"
    />
    <span className="font-medium">{rating}</span>
  </div>
);

// Loading Skeleton Component
const LoadingSkeleton = ({ isLtr }: { isLtr: boolean }) => (
  <div className="space-y-4">
    <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const useSalonData = (salonId: number): SalonData => {
  const { 
    data: salonResponse, 
    isLoading: isSalonLoading, 
    error: salonError 
  } = useQuery({
    queryKey: [`salon-${salonId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/${salonId}`);
        const result = await response.json();
        console.log('Salon details response:', result);
        return result;
      } catch (error) {
        console.error('Failed to fetch salon details:', error);
        throw error;
      }
    },
    retry: false
  });

  let salon: Salon | null = null;
  let services: Service[] | null = null;
  let reviews: Review[] | null = null;
  if (salonResponse) {
    // Unwrap .data if present, else fallback
    const base = (salonResponse as any).data || salonResponse;
    salon = base;
    services = base.services || null;
    reviews = base.reviews || null;
  }

  return {
    salon,
    services,
    reviews,
    isLoading: isSalonLoading,
    errors: {
      salonError,
      servicesError: null,
      reviewsError: null
    }
  };
};

const SalonDetails = () => {
  const { isLtr } = useLanguage();
  const [location] = useLocation();
  const { toast } = useToast();
  const { loading: authLoading } = useAuth();
  
  const pathParts = location.split('/');
  const salonId = parseInt(pathParts[pathParts.length - 1], 10);
  
  const { salon, services, reviews, isLoading, errors } = useSalonData(salonId);
  
  useEffect(() => {
    const handleError = (error: unknown, defaultMessage: string) => {
      if (error) {
        const message = error instanceof Error ? error.message : defaultMessage;
        toast({
          title: isLtr ? "Error" : "خطأ",
          description: isLtr ? message : defaultMessage,
          variant: "destructive"
        });
      }
    };

    handleError(errors.salonError, "Failed to load salon details");
  }, [errors, toast, isLtr]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin" aria-label={isLtr ? "Loading" : "جاري التحميل"} />
        <p className="text-muted-foreground">
          {isLtr ? "Loading..." : "جاري التحميل..."}
        </p>
      </div>
    );
  }

  if (!salonId) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">
            {isLtr ? "Invalid salon ID" : "معرف الصالون غير صالح"}
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin" aria-label={isLtr ? "Loading" : "جاري التحميل"} />
        <p className="text-muted-foreground">
          {isLtr ? "Loading salon details..." : "جاري تحميل تفاصيل الصالون..."}
        </p>
      </div>
    );
  }

  if (!salon) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">
            {isLtr ? "Salon not found" : "لم يتم العثور على الصالون"}
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto py-12 px-4">
        <Helmet>
          <title>{isLtr ? salon.nameEn : salon.nameAr} | {isLtr ? "Salon Details" : "تفاصيل الصالون"}</title>
        </Helmet>

        {/* Salon Header with Full-Width Image */}
        <div className="relative rounded-xl overflow-hidden mb-20">
          {/* Full-width background image */}
          {/* Ensure /default-salon.jpg exists in client/public/ for production */}
          <div className="w-full h-64 bg-center bg-cover relative">
            <img
              src={salon?.imageUrl || salon?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon?.nameEn || salon?.nameEn || '' : salon?.nameAr || salon?.nameAr || '')}&background=D4AF37&color=fff&size=256`}
              alt={isLtr ? salon?.nameEn : salon?.nameAr}
              className="w-full h-full object-cover absolute inset-0"
              style={{ zIndex: 0 }}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon?.nameEn || '' : salon?.nameAr || '')}&background=D4AF37&color=fff&size=256`;
              }}
            />
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-6">
            <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
              {isLtr ? salon.nameEn : salon.nameAr}
            </h1>
            <div className="flex items-center gap-4 text-white">
              <RatingDisplay 
                rating={salon.rating || 0} 
                isLtr={isLtr}
                ariaLabel={isLtr ? `Rating: ${salon.rating} stars` : `التقييم: ${salon.rating} نجوم`}
              />
              <InfoItem 
                icon={MapPin} 
                text={salon.address} 
                isLtr={isLtr}
                ariaLabel={isLtr ? `Address: ${salon.address}` : `العنوان: ${salon.address}`}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="w-full" dir={isLtr ? 'ltr' : 'rtl'}>
          <TabsList className="w-full" aria-label={isLtr ? "Salon information sections" : "أقسام معلومات الصالون"}>
            <TabsTrigger value="services" className="flex-1">
              {isLtr ? "Services" : "الخدمات"}
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1">
              {isLtr ? "About" : "عن الصالون"}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              {isLtr ? "Reviews" : "التقييمات"}
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            {isLoading ? (
              <LoadingSkeleton isLtr={isLtr} />
            ) : (
              <div className="py-12 bg-gradient-to-br from-secondary/20 to-accent/20 dark:from-[#23232B] dark:to-[#28283A] rounded-xl mb-20">
                <div className="mb-8 overflow-x-auto">
                  {/* Optionally, add category chips/filter here if salon services have categories */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl p-8">
                  {services?.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      salonId={salonId}
                    />
                  ))}
                  {services?.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      {isLtr ? "No services found." : "لم يتم العثور على خدمات."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className="bg-background dark:bg-[#23232B] rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <p className={`mb-4 ${isLtr ? 'text-left' : 'text-right'}`}>
                  {salon?.descriptionEn || salon?.descriptionAr || (isLtr ? 'No description available.' : 'لا يوجد وصف.')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem 
                    icon={Phone} 
                    text={salon?.phone || '-'} 
                    isLtr={isLtr}
                    ariaLabel={isLtr ? `Phone: ${salon?.phone}` : `الهاتف: ${salon?.phone}`}
                  />
                  <InfoItem 
                    icon={Mail} 
                    text={salon?.email || '-'} 
                    isLtr={isLtr}
                    ariaLabel={isLtr ? `Email: ${salon?.email}` : `البريد الإلكتروني: ${salon?.email}`}
                  />
                  <InfoItem 
                    icon={Calendar} 
                    text={isLtr ? "Open 24/7" : "مفتوح 24/7"} 
                    isLtr={isLtr}
                    ariaLabel={isLtr ? "Open 24/7" : "مفتوح 24/7"}
                  />
                  <InfoItem 
                    icon={Users} 
                    text={isLtr ? "Ladies Only" : "نساء فقط"} 
                    isLtr={isLtr}
                    ariaLabel={isLtr ? "Ladies Only" : "نساء فقط"}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {isLoading ? (
              <LoadingSkeleton isLtr={isLtr} />
            ) : (
              <div className="space-y-4">
                {Array.isArray(reviews) && reviews.length > 0 ? reviews.map((review: Review) => (
                  <Card key={review.id} className="bg-background dark:bg-[#23232B] rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <RatingDisplay 
                          rating={review.rating} 
                          isLtr={isLtr}
                          ariaLabel={isLtr ? `Review rating: ${review.rating} stars` : `تقييم المراجعة: ${review.rating} نجوم`}
                        />
                        <span className="text-sm text-gray-500">
                          {formatDate(new Date(review.createdAt))}
                        </span>
                      </div>
                      <p className={`${isLtr ? 'text-left' : 'text-right'}`}>
                        {review.comment || (isLtr ? 'No comment provided.' : 'لا يوجد تعليق.')}
                      </p>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    {isLtr ? "No reviews yet." : "لا توجد تقييمات بعد."}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalonDetails;
