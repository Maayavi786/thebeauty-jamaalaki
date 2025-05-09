import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Booking, Salon, Service } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getIslamicPatternSvg, formatDate, formatTime, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  Calendar, 
  Award, 
  MoreVertical,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { config } from "@/lib/config";

const Profile = () => {
  const { t } = useTranslation(["profile", "common"]);
  const { isLtr, isRtl } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // States for managing booking data
  const [salonsMap, setSalonsMap] = useState<Record<string, Salon>>({});
  const [servicesMap, setServicesMap] = useState<Record<string, Service>>({});
  
  // Use default query client for user bookings
  const { data: bookingsResponse, isLoading: isBookingsLoading } = useQuery({
    queryKey: [`${config.api.endpoints.bookings}/user/${user?.id}`],
    enabled: !!user,
  });
  
  // Handle both Response objects and direct data objects for bookings
  const bookings = React.useMemo(() => {
    if (!bookingsResponse) return [];
    
    // Check if it's a direct data array (from mock) or needs json parsing
    if (Array.isArray(bookingsResponse)) {
      return bookingsResponse;
    }
    
    // Check if it has data property (API response structure)
    if (bookingsResponse.data) {
      return Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
    }
    
    return [];
  }, [bookingsResponse]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: isLtr ? "Authentication Required" : "مطلوب تسجيل الدخول",
        description: isLtr 
          ? "Please log in to access your profile." 
          : "يرجى تسجيل الدخول للوصول إلى ملفك الشخصي.",
        variant: "default",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast, isLtr]);
  
  // Create pattern SVG background
  useEffect(() => {
    const patternSvg = getIslamicPatternSvg();
    const patternBg = document.createElement('div');
    patternBg.className = 'pattern-bg';
    patternBg.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}')`;    
    document.body.appendChild(patternBg);
    
    return () => {
      // Check if the element is still in the document before removing
      if (document.body.contains(patternBg)) {
        document.body.removeChild(patternBg);
      }
    };
  }, []);
  
  // Fetch salon and service details for bookings
  useEffect(() => {
    // Prevent infinite updates by checking if we already have all the data
    if (!bookings || bookings.length === 0) return;
    
    // Create a tracking variable to avoid state updates if no new data
    let hasNewData = false;
    
    const fetchSalonDetails = async () => {
      const salonIds = [...new Set(bookings.map(booking => booking.salonId))];
      // Check if we already have all the salon data we need
      const needsToFetch = salonIds.some(id => !(id in salonsMap));
      if (!needsToFetch) return;
      
      hasNewData = true;
      const newSalonsMap: Record<number, Salon> = {};

      for (const salonId of salonIds) {
        try {
          if (!(salonId in salonsMap)) {
            // Use default query client for fetching salon details
            const response = await apiRequest('GET', `${config.api.endpoints.salons}/${salonId}`);
            
            // Handle both Response objects (from fetch) and direct data objects (from mock)
            let result;
            if (response && typeof response.json === 'function') {
              // This is a Response object from fetch
              if (response.ok) {
                result = await response.json();
              } else {
                throw new Error(`Failed to fetch salon ${salonId}: ${response.status}`);
              }
            } else {
              // This is a direct data object from mock implementation
              result = response;
            }
            
            const base = result.data || result;
            newSalonsMap[salonId] = base;
          }
        } catch (error) {
          console.error(`Error fetching salon ${salonId}:`, error);
        }
      }

      setSalonsMap(prev => ({ ...prev, ...newSalonsMap }));
    };
    
    const fetchServiceDetails = async () => {
      const serviceIds = [...new Set(bookings.map(booking => booking.serviceId))];
      // Check if we already have all the service data we need
      const needsToFetch = serviceIds.some(id => !(id in servicesMap));
      if (!needsToFetch) return;
      
      hasNewData = true;
      const newServicesMap: Record<number, Service> = {};

      for (const serviceId of serviceIds) {
        try {
          if (!(serviceId in servicesMap)) {
            // Use default query client for fetching service details
            const response = await apiRequest('GET', `${config.api.endpoints.services}/${serviceId}`);
            
            // Handle both Response objects (from fetch) and direct data objects (from mock)
            let result;
            if (response && typeof response.json === 'function') {
              // This is a Response object from fetch
              if (response.ok) {
                result = await response.json();
              } else {
                throw new Error(`Failed to fetch service ${serviceId}: ${response.status}`);
              }
            } else {
              // This is a direct data object from mock implementation
              result = response;
            }
            
            const base = result.data || result;
            newServicesMap[serviceId] = base;
          }
        } catch (error) {
          console.error(`Error fetching service ${serviceId}:`, error);
        }
      }

      // Only update state if we have new data
      if (Object.keys(newServicesMap).length > 0) {
        setServicesMap(prev => ({ ...prev, ...newServicesMap }));
      }
    };
    
    // Use an async IIFE to avoid useEffect warnings about using async directly
    (async () => {
      await fetchSalonDetails();
      await fetchServiceDetails();
    })();
    
    // Return early cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [bookings, salonsMap, servicesMap]); // Include salonsMap and servicesMap in dependencies
  
  // Handler for cancelling a booking
  const handleCancelBooking = async (bookingId: number) => {
    try {
      await apiRequest('PATCH', `${config.api.endpoints.bookings}/${bookingId}/status`, { status: 'cancelled' });
      queryClient.invalidateQueries({ queryKey: [`${config.api.endpoints.bookings}/user/${user?.id}`] });
      
      toast({
        title: isLtr ? "Booking Cancelled" : "تم إلغاء الحجز",
        description: isLtr 
          ? "Your booking has been cancelled successfully." 
          : "تم إلغاء حجزك بنجاح.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: isLtr ? "Cancellation Failed" : "فشل الإلغاء",
        description: isLtr 
          ? "Failed to cancel your booking. Please try again." 
          : "فشل إلغاء الحجز. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  // Add state and memo for search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    const term = searchTerm.trim().toLowerCase();
    return Array.isArray(bookings) ? bookings.filter((booking: any) => {
      const salon = salonsMap[booking.salonId];
      const service = servicesMap[booking.serviceId];
      return (
        (salon && ((salon.nameEn && salon.nameEn.toLowerCase().includes(term)) || (salon.nameAr && salon.nameAr.toLowerCase().includes(term)))) ||
        (service && ((service.nameEn && service.nameEn.toLowerCase().includes(term)) || (service.nameAr && service.nameAr.toLowerCase().includes(term)))) ||
        (booking.status && booking.status.toLowerCase().includes(term))
      );
    }) : [];
  }, [bookings, searchTerm, salonsMap, servicesMap, isLtr]);

  const upcomingBookings = Array.isArray(filteredBookings) ? filteredBookings.filter((booking: any) => {
    const now = new Date();
    return new Date(booking.datetime) > now && booking.status !== 'cancelled'
  }) : [];

  const pastBookings = Array.isArray(filteredBookings) ? filteredBookings.filter((booking: any) => {
    const now = new Date();
    return new Date(booking.datetime) <= now || booking.status === 'cancelled'
  }) : [];

  if (!user) {
    return null; // Will be redirected via the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <div className="container mx-auto py-12 px-4">
        <Helmet>
          <title>{isLtr ? 'Profile' : 'الملف الشخصي'} | Jamaalaki</title>
          <meta name="description" content={isLtr ? 'View and manage your profile and bookings' : 'عرض وإدارة ملفك الشخصي وحجوزاتك'} />
        </Helmet>
        <h1 className={`text-3xl font-bold mb-6 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
          {isLtr ? "My Profile" : "ملفي الشخصي"}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={`${isRtl ? 'font-tajawal' : ''}`}>
                  {isLtr ? "Personal Information" : "المعلومات الشخصية"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className={`text-xl font-bold ${isRtl ? 'font-tajawal' : ''}`}>
                    {user.fullName}
                  </h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className={`text-sm font-medium text-muted-foreground mb-1 ${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr ? "Email" : "البريد الإلكتروني"}
                    </h4>
                    <p>{user.email}</p>
                  </div>
                  
                  {user.phone && (
                    <div>
                      <h4 className={`text-sm font-medium text-muted-foreground mb-1 ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Phone" : "رقم الهاتف"}
                      </h4>
                      <p>{user.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className={`text-sm font-medium text-muted-foreground mb-1 ${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr ? "Loyalty Points" : "نقاط الولاء"}
                    </h4>
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-primary mr-2" />
                      <p className="font-medium">{user.loyaltyPoints} {isLtr ? "points" : "نقطة"}</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className={`w-full mt-6 ${isRtl ? 'font-tajawal' : ''}`}
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isLtr ? "Update Profile" : "تحديث الملف الشخصي"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Bookings Tabs */}
          <div className="lg:col-span-2">
            <div className="mb-6 max-w-xs">
              <Input
                placeholder={isLtr ? "Search bookings..." : "ابحثي عن حجز..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full"
                aria-label={isLtr ? "Search bookings" : "ابحثي عن حجز"}
              />
            </div>
            
            <Tabs defaultValue="upcoming">
              <TabsList className="w-full">
                <TabsTrigger 
                  value="upcoming" 
                  className={`flex-1 ${isRtl ? 'font-tajawal' : ''}`}
                >
                  {isLtr ? "Upcoming Bookings" : "الحجوزات القادمة"}
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className={`flex-1 ${isRtl ? 'font-tajawal' : ''}`}
                >
                  {isLtr ? "Past Bookings" : "الحجوزات السابقة"}
                </TabsTrigger>
              </TabsList>
              
              {/* Upcoming Bookings */}
              <TabsContent value="upcoming">
                <Card>
                  <CardHeader>
                    <CardTitle className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr ? "Upcoming Bookings" : "الحجوزات القادمة"}
                    </CardTitle>
                    <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr 
                        ? "Your upcoming salon appointments" 
                        : "مواعيد الصالون القادمة الخاصة بك"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBookingsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : upcomingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking: any) => {
                          const salon = salonsMap[booking.salonId];
                          const service = servicesMap[booking.serviceId];
                          
                          return (
                            <div 
                              key={booking.id} 
                              className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
                            >
                              <div className="mb-4 md:mb-0 flex items-center">
                                {salon && (
                                  <img
                                    src={salon.imageUrl && salon.imageUrl.trim() !== '' ? salon.imageUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon.nameEn || '' : salon.nameAr || '')}&background=D4AF37&color=fff&size=64`}
                                    alt={isLtr ? salon.nameEn : salon.nameAr}
                                    className="w-12 h-12 object-cover rounded-lg border mr-3"
                                    onError={e => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon.nameEn || '' : salon.nameAr || '')}&background=D4AF37&color=fff&size=64`;
                                    }}
                                  />
                                )}
                                <div>
                                  <h4 className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>{salon ? (isLtr ? salon.nameEn : salon.nameAr) : (isLtr ? 'Unknown Salon' : 'صالون غير معروف')}</h4>
                                  <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>{service ? (isLtr ? service.nameEn : service.nameAr) : (isLtr ? 'Unknown Service' : 'خدمة غير معروفة')}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Button 
                                  variant="outline" 
                                  className={`mr-2 ${isRtl ? 'font-tajawal' : ''}`}
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  {t("profile.cancelBooking")}
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className={`${isRtl ? 'font-tajawal' : ''}`}>
                                      {isLtr ? "View Details" : "عرض التفاصيل"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className={`${isRtl ? 'font-tajawal' : ''}`}>
                                      {isLtr ? "Reschedule" : "إعادة جدولة"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? "No bookings found" : "لا توجد حجوزات"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Past Bookings */}
              <TabsContent value="past">
                <Card>
                  <CardHeader>
                    <CardTitle className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr ? "Past Bookings" : "الحجوزات السابقة"}
                    </CardTitle>
                    <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr 
                        ? "Your past salon appointments" 
                        : "مواعيد الصالون السابقة الخاصة بك"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBookingsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : pastBookings.length > 0 ? (
                      <div className="space-y-4">
                        {pastBookings.map((booking: any) => {
                          const salon = salonsMap[booking.salonId];
                          const service = servicesMap[booking.serviceId];
                          
                          return (
                            <div 
                              key={booking.id} 
                              className="border border-border rounded-lg p-4"
                            >
                              <div className="flex items-center mb-2">
                                {salon && (
                                  <img
                                    src={salon.imageUrl && salon.imageUrl.trim() !== '' ? salon.imageUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon.nameEn || '' : salon.nameAr || '')}&background=D4AF37&color=fff&size=64`}
                                    alt={isLtr ? salon.nameEn : salon.nameAr}
                                    className="w-12 h-12 object-cover rounded-lg border mr-3"
                                    onError={e => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon.nameEn || '' : salon.nameAr || '')}&background=D4AF37&color=fff&size=64`;
                                    }}
                                  />
                                )}
                                <div>
                                  <Badge className={getStatusColor(booking.status)}>
                                    {booking.status}
                                  </Badge>
                                  <span className="mx-2">•</span>
                                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatDate(booking.datetime)} at {formatTime(booking.datetime)}
                                  </span>
                                  {booking.pointsEarned && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <Award className="w-4 h-4 mr-1 text-primary" />
                                      <span className="text-sm text-primary">
                                        +{booking.pointsEarned} {isLtr ? "points" : "نقطة"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>{salon ? (isLtr ? salon.nameEn : salon.nameAr) : (isLtr ? 'Unknown Salon' : 'صالون غير معروف')}</h4>
                              <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>{service ? (isLtr ? service.nameEn : service.nameAr) : (isLtr ? 'Unknown Service' : 'خدمة غير معروفة')}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? "No bookings found" : "لا توجد حجوزات"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
