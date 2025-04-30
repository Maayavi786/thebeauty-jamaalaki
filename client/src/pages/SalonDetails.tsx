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
        
        // Handle both Response objects (from fetch) and direct data objects (from mock)
        let result;
        if (response && typeof response.json === 'function') {
          // This is a Response object from fetch
          result = await response.json();
        } else {
          // This is a direct data object from mock implementation
          result = response;
        }
        
        console.log('Salon details response:', result);
        return result;
      } catch (error) {
        console.error('Failed to fetch salon details:', error);
        throw error;
      }
    },
    retry: false
  });
  
  // Separate query just for reviews to ensure we get them
  const { 
    data: reviewsData, 
    isLoading: isReviewsLoading,
    error: reviewsError 
  } = useQuery({
    queryKey: [`salon-${salonId}-reviews`],
    queryFn: async () => {
      try {
        // This endpoint might need to be adjusted based on your API structure
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/${salonId}/reviews`);
        
        // Handle both Response objects (from fetch) and direct data objects (from mock)
        let result;
        if (response && typeof response.json === 'function') {
          // This is a Response object from fetch
          result = await response.json();
        } else {
          // This is a direct data object from mock implementation
          result = response;
        }
        
        console.log('Reviews direct API response:', result);
        return result;
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return { data: [] }; // Return empty array as fallback
      }
    },
    retry: 1,
    enabled: !!salonId && !isSalonLoading
  });

  let salon: Salon | null = null;
  let services: Service[] | null = null;
  let reviews: Review[] | null = null;
  if (salonResponse) {
    // Unwrap .data if present, else fallback
    const base = (salonResponse as any).data || salonResponse;
    // Process salon data to ensure all required fields
    salon = {
      ...base,
      // Ensure these required fields exist for salon
      nameEn: base.nameEn || base.name_en || 'Unnamed Salon',
      nameAr: base.nameAr || base.name_ar || 'صالون غير مسمى',
      descriptionEn: base.descriptionEn || base.description_en || 'No description available',
      descriptionAr: base.descriptionAr || base.description_ar || 'لا يوجد وصف متاح',
      imageUrl: base.imageUrl || base.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(base.nameEn || base.name_en || '')}&background=D4AF37&color=fff&size=256`,
      rating: typeof base.rating === 'number' ? base.rating : 5,
      address: base.address || 'No address provided',
      phone: base.phone || 'No phone provided',
      email: base.email || 'No email provided'
    };
    
    // Process services to ensure they have all required fields
    if (base.services && Array.isArray(base.services)) {
      services = base.services.map((service: any) => ({
        ...service,
        // Ensure these required fields exist
        nameEn: service.nameEn || service.name_en || 'Unnamed Service',
        nameAr: service.nameAr || service.name_ar || 'خدمة غير مسماة',
        descriptionEn: service.descriptionEn || service.description_en || 'No description available',
        descriptionAr: service.descriptionAr || service.description_ar || 'لا يوجد وصف متاح'
      }));
    } else {
      services = [];
    }
    
    // Process reviews to ensure they have all required fields
    // First try to get reviews from direct reviews query
    if (reviewsData && (reviewsData.data || Array.isArray(reviewsData))) {
      const rawReviews = Array.isArray(reviewsData) ? reviewsData : 
                        Array.isArray(reviewsData.data) ? reviewsData.data : [];
      
      console.log(`[Salon ${salonId}] Reviews from direct API call:`, rawReviews);
      console.log(`[Salon ${salonId}] Number of reviews from direct API call:`, rawReviews.length);
      
      reviews = rawReviews.map((review: any) => ({
        ...review,
        id: review.id || Math.random().toString(36).substring(2, 9),
        rating: typeof review.rating === 'number' ? review.rating : 5,
        comment: review.comment || '',
        createdAt: review.createdAt || review.created_at || new Date().toISOString()
      }));
    } 
    // Fallback to reviews from salon data if direct query failed
    else if (base.reviews && Array.isArray(base.reviews)) {
      console.log(`[Salon ${salonId}] Falling back to reviews from salon data:`, base.reviews);
      console.log(`[Salon ${salonId}] Number of reviews from salon data:`, base.reviews.length);
      reviews = base.reviews.map((review: any) => ({
        ...review,
        id: review.id || Math.random().toString(36).substring(2, 9),
        rating: typeof review.rating === 'number' ? review.rating : 5,
        comment: review.comment || '',
        createdAt: review.createdAt || review.created_at || new Date().toISOString()
      }));
    } else {
      console.log(`[Salon ${salonId}] No reviews found in any API response`);
      // For testing, generate a mock review
      reviews = [{
        id: '1',
        rating: 5,
        comment: 'This salon is amazing! Highly recommended.',
        createdAt: new Date().toISOString()
      }];
      // Uncomment line below and remove mock data when going to production
      // reviews = [];
    }
    
    console.log('Final processed reviews:', reviews);
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
  // Add validation for the salonId parameter and provide a default if invalid
  const salonIdParam = pathParts[pathParts.length - 1];
  const salonId = !isNaN(parseInt(salonIdParam, 10)) ? parseInt(salonIdParam, 10) : 1;
  
  // Use a ref to track if we've already shown an error toast to prevent infinite loops
  const errorShownRef = useRef(false);
  
  const { salon, services, reviews, isLoading, errors } = useSalonData(salonId);
  
  // Only show error toast once per error to prevent infinite update loops
  useEffect(() => {
    const handleError = (error: unknown, defaultMessage: string) => {
      if (error && !errorShownRef.current) {
        errorShownRef.current = true;
        const message = error instanceof Error ? error.message : defaultMessage;
        toast({
          title: isLtr ? "Error" : "خطأ",
          description: isLtr ? message : defaultMessage,
          variant: "destructive"
        });
      }
    };

    if (errors.salonError) {
      handleError(errors.salonError, "Failed to load salon details");
    }
  }, [errors.salonError, toast, isLtr]);

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
                      salon={salon}
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
                {console.log('Rendering reviews:', reviews)}
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <Card key={review.id || Math.random()} className="bg-background dark:bg-[#23232B] rounded-xl shadow-md p-6 border-t-4 border-primary hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <RatingDisplay 
                            rating={review.rating} 
                            isLtr={isLtr}
                            ariaLabel={isLtr ? `Review rating: ${review.rating} stars` : `تقييم المراجعة: ${review.rating} نجوم`}
                          />
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(review.createdAt || review.created_at || new Date()))}
                          </span>
                        </div>
                        <p className={`${isLtr ? 'text-left' : 'text-right'}`}>
                          {review.comment || (isLtr ? 'No comment provided.' : 'لا يوجد تعليق.')}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {isLtr ? "No reviews yet. Be the first to review!" : "لا توجد تقييمات بعد. كن أول من يقيم!"}
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
