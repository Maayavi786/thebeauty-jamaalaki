import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getIslamicPatternSvg, formatPrice, getTimeSlots } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Service } from "@shared/schema";
import { config } from "@/lib/config";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BookingSkeleton } from "@/components/Skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BookingPage = () => {
  const { isLtr, isRtl } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const [_, params] = useRoute<{ salonId: string, serviceId: string }>("/booking/:salonId/:serviceId");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get time slots
  const timeSlots = getTimeSlots(9, 21, 30);
  
  // Add state and memo for search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTimeSlots = useMemo(() => {
    if (!searchTerm.trim()) return timeSlots;
    const term = searchTerm.trim();
    return timeSlots.filter(slot => slot.includes(term));
  }, [timeSlots, searchTerm]);
  
  // Use default query client for salons and services
  const { data: salon, isLoading: isSalonLoading } = useQuery({
    queryKey: [`salon-${params?.salonId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', config.api.endpoints.salons + `/${params?.salonId}`);
        const result = await response.json();
        return result.data;
      } catch (error) {
        console.error('Failed to fetch salon:', error);
        throw error;
      }
    },
  });

  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: [`service-${params?.serviceId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', config.api.endpoints.services + `/${params?.serviceId}`);
        const result = await response.json();
        return result.data;
      } catch (error) {
        console.error('Failed to fetch service:', error);
        throw error;
      }
    },
  });
  
  // Create booking form schema
  const formSchema = z.object({
    notes: z.string().optional(),
  });
  
  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });
  
  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (formData: any) => {
      try {
        const response = await apiRequest('POST', config.api.endpoints.bookings, formData);
        const result = await response.json();
        console.log('Booking creation response:', result);
        return result;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [config.api.endpoints.bookings] });
      setShowConfirmation(true);
      
      // After a short delay, redirect to profile page
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Booking creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : isLtr 
            ? "Failed to book appointment. Please try again." 
            : "فشل في حجز الموعد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      toast({
        title: isLtr ? "Authentication Required" : "مطلوب تسجيل الدخول",
        description: isLtr 
          ? "Please log in to book an appointment." 
          : "يرجى تسجيل الدخول لحجز موعد.",
        variant: "default",
      });
      // Store the current location to redirect back after login
      sessionStorage.setItem('bookingRedirect', location);
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate, toast, isLtr, user, location]);
  
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
  
  // Handle booking submission
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (!user || !salon || !service || !selectedDate || !selectedTime) {
      toast({
        title: isLtr ? "Missing Information" : "معلومات ناقصة",
        description: isLtr 
          ? "Please fill in all required fields." 
          : "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      });
      return;
    }

    // Create datetime from selected date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // Log the structure of salon and service to debug
    console.log('Salon data structure:', salon);
    console.log('Service data structure:', service);
    
    // Extract IDs correctly based on the response structure
    // Direct access if salon/service has an id property, otherwise try to access it through data property
    const salonId = salon?.id || (salon as any)?.data?.id || Number(params?.salonId);
    const serviceId = service?.id || (service as any)?.data?.id || Number(params?.serviceId);
    
    console.log('Using salonId:', salonId, 'serviceId:', serviceId);
    
    // Make sure we have valid IDs before proceeding
    if (!salonId || !serviceId) {
      toast({
        title: isLtr ? "Missing Information" : "معلومات ناقصة",
        description: isLtr 
          ? "Could not determine salon or service information. Please try again." 
          : "تعذر تحديد معلومات الصالون أو الخدمة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      userId: user.id,
      salonId: salonId,
      serviceId: serviceId,
      datetime: bookingDate.toISOString(),
      status: "pending",
      notes: formData.notes,
    };
    
    try {
      await createBooking.mutateAsync(bookingData);
      setShowConfirmation(true); // Show confirmation overlay
    } catch (error) {
      console.error("Booking error:", error);
    }
  };
  
  if (isSalonLoading || isServiceLoading) {
    return <BookingSkeleton />;
  }
  
  if (!salon || !service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
          {isLtr ? "Service not found" : "لم يتم العثور على الخدمة"}
        </h2>
        <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
          {isLtr 
            ? "The service you are trying to book does not exist or has been removed." 
            : "الخدمة التي تحاولين حجزها غير موجودة أو تمت إزالتها."
          }
        </p>
    </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900">
      <ErrorBoundary>
        <div className="container mx-auto py-12 px-4">
          <Helmet>
            <title>{isLtr ? "Booking" : "الحجز"} | Jamaalaki</title>
            <meta name="description" content={isLtr ? 'Book your luxury salon appointment' : 'احجزي موعد صالون فاخر'} />
          </Helmet>
          <div className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 rounded-xl overflow-hidden mb-20">
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(getIslamicPatternSvg('#ffffff'))}")`, 
                backgroundSize: '300px' 
              }}
            ></div>
            <div className="relative z-10">
              <h1 className={`text-3xl font-bold mb-6 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                {isLtr ? "Book Appointment" : "حجز موعد"}
              </h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Booking Details" : "تفاصيل الحجز"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          {/* Salon Image - Full Width */}
                          <div className="w-full overflow-hidden rounded-xl shadow-lg mt-8 mb-6">
                            <div 
                              className="w-full h-48 bg-center bg-cover"
                              style={{
                                backgroundImage: `url(${salon?.imageUrl || salon?.image_url || '/default-salon.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            ></div>
                          </div>
                          
                          {/* Service Information */}
                          <div className="bg-muted/30 p-4 rounded-lg mb-6">
                            <h3 className={`font-medium text-lg mb-3 ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? "Service Details" : "تفاصيل الخدمة"}
                            </h3>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                                  {isLtr ? (service as Service).nameEn : (service as Service).nameAr}
                                </p>
                                <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                                  {isLtr ? "Duration" : "المدة"}: {(service as Service).duration} {isLtr ? "minutes" : "دقيقة"}
                                </p>
                              </div>
                              <p className="text-primary font-medium">
                                {formatPrice((service as Service).price)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Date Selection */}
                          <div>
                            <h3 className={`font-medium text-lg mb-3 ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? "Select Appointment Date" : "اختر تاريخ الموعد"}
                            </h3>
                            <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md bg-background"
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Time Selection */}
                          <div>
                            <h3 className={`font-medium text-lg mb-3 ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? "Select Appointment Time" : "اختر وقت الموعد"}
                            </h3>
                            <div className="mb-6 max-w-xs">
                              <Input
                                placeholder={isLtr ? "Search time slots..." : "ابحثي عن وقت..."}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full"
                                aria-label={isLtr ? "Search time slots" : "ابحثي عن وقت"}
                              />
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {filteredTimeSlots.length === 0 ? (
                                <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                                  {isLtr ? "No time slots match your search." : "لا يوجد أوقات تطابق بحثك."}
                                </p>
                              ) : (
                                filteredTimeSlots.map((time: string) => (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant={selectedTime === time ? "default" : "outline"}
                                    className={`text-sm ${selectedTime === time ? "bg-primary text-white" : ""}`}
                                    onClick={() => setSelectedTime(time)}
                                  >
                                    {time}
                                  </Button>
                                ))
                              )}
                            </div>
                          </div>
                          
                          {/* Notes */}
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                                  {isLtr ? "Additional Notes" : "ملاحظات إضافية"}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={isLtr 
                                      ? "Any special requests or information" 
                                      : "أي طلبات خاصة أو معلومات"
                                    }
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Booking Summary */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Booking Summary" : "ملخص الحجز"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="mb-8 flex gap-6 items-center">
                        {/* Salon Image */}
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={salon?.imageUrl || salon?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon?.nameEn || salon?.nameAr || 'Unknown Salon' : salon?.nameAr || salon?.nameEn || 'Unknown Salon')}&background=D4AF37&color=fff&size=256`}
                            alt={isLtr ? salon?.nameEn : salon?.nameAr}
                            className="w-full h-full object-cover rounded-xl border border-muted bg-white"
                            onError={e => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon?.nameEn || '' : salon?.nameAr || '')}&background=D4AF37&color=fff&size=256`;
                            }}
                          />
                        </div>
                        <div>
                          <p className={`font-medium text-lg ${isRtl ? 'font-tajawal' : ''}`}>
                            {salon ? (isLtr ? salon.nameEn : salon.nameAr) : (isLtr ? 'Unknown Salon' : 'صالون غير معروف')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {salon && typeof salon.city === 'string' && salon.city.includes(' | ')
                              ? (isLtr
                                  ? salon.city.split(' | ')[0]
                                  : `${salon.city.split(' | ')[0]} | ${salon.city.split(' | ')[1]}`)
                              : (salon && salon.city ? salon.city : '')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-3 border-b">
                        <div className={`${isRtl ? 'font-tajawal' : ''}`}>
                          <p className="font-medium">{service ? (isLtr ? (service as Service).nameEn : (service as Service).nameAr) : (isLtr ? 'Unknown Service' : 'خدمة غير معروفة')}</p>
                          <p className="text-sm text-muted-foreground">
                            {(service as Service).duration} {isLtr ? "minutes" : "دقيقة"}
                          </p>
                        </div>
                        <p className="text-primary font-medium">
                          {formatPrice((service as Service).price)}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pb-3 border-b">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className={`${isRtl ? 'font-tajawal' : ''}`}>
                            {isLtr ? "Date" : "التاريخ"}
                          </p>
                        </div>
                        <p className={`${isRtl ? 'font-tajawal' : ''}`}>
                          {selectedDate ? selectedDate.toLocaleDateString(isLtr ? 'en-US' : 'ar-SA') : ""}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pb-3 border-b">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className={`${isRtl ? 'font-tajawal' : ''}`}>
                            {isLtr ? "Time" : "الوقت"}
                          </p>
                        </div>
                        <p className={`${isRtl ? 'font-tajawal' : ''}`}>{selectedTime || ""}</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 text-lg font-bold">
                        <p className={`${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? "Total Amount" : "المبلغ الإجمالي"}
                        </p>
                        <p className="text-primary">{formatPrice((service as Service).price)}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${isRtl ? 'font-tajawal' : ''}`}
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={createBooking.isLoading || !selectedDate || !selectedTime}
                      >
                        {createBooking.isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {isLtr ? "Confirm Booking" : "تأكيد الحجز"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="flex flex-col items-center mb-4">
              <svg className="w-16 h-16 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">{isLtr ? "Your booking is confirmed!" : "تم تأكيد الحجز!"}</h2>
              <p className="text-gray-600 mb-4">{isLtr ? "Thank you for booking. Payment will be handled soon." : "شكرًا لحجزك. سيتم معالجة الدفع قريبًا."}</p>
            </div>
            <div className="text-left mb-4">
              <div className="mb-2"><span className="font-semibold">{isLtr ? "Salon:" : "الصالون:"}</span> {isLtr ? salon?.nameEn : salon?.nameAr}</div>
              <div className="mb-2"><span className="font-semibold">{isLtr ? "Service:" : "الخدمة:"}</span> {isLtr ? service?.nameEn : service?.nameAr}</div>
              <div className="mb-2"><span className="font-semibold">{isLtr ? "Date:" : "التاريخ:"}</span> {selectedDate?.toLocaleDateString(isLtr ? 'en-US' : 'ar-SA')}</div>
              <div className="mb-2"><span className="font-semibold">{isLtr ? "Time:" : "الوقت:"}</span> {selectedTime}</div>
              <div className="mb-2"><span className="font-semibold">{isLtr ? "Total:" : "الإجمالي:"}</span> {formatPrice(service?.price)}</div>
            </div>
            <Button className="w-full mt-2" onClick={() => setShowConfirmation(false)}>
              {isLtr ? "Close" : "إغلاق"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
