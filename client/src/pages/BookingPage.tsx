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
import { Salon, Service } from "@shared/schema";
import { API_BASE_URL } from '../lib/config';
import ErrorBoundary from "@/components/ErrorBoundary";
import { BookingSkeleton } from "@/components/Skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  
  // Fetch salon data with retry logic
  const { data: salon, isLoading: isSalonLoading, error: salonError } = useQuery<Salon>({
    queryKey: ['salon', params?.salonId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/salons/${params?.salonId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch salon');
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!params?.salonId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
  
  // Fetch service data with retry logic
  const { data: service, isLoading: isServiceLoading, error: serviceError } = useQuery<Service>({
    queryKey: ['service', params?.serviceId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/services/${params?.serviceId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch service');
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!params?.serviceId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/bookings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isLtr ? "Booking Confirmed" : "تم تأكيد الحجز",
        description: isLtr 
          ? "Your appointment has been successfully booked." 
          : "تم حجز موعدك بنجاح.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/bookings/user/${user?.id}`] });
      navigate("/profile");
    },
    onError: (error) => {
      toast({
        title: isLtr ? "Booking Failed" : "فشل الحجز",
        description: error instanceof Error 
          ? error.message 
          : isLtr 
            ? "Failed to book appointment. Please try again." 
            : "فشل في حجز الموعد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast({
        title: isLtr ? "Authentication Required" : "مطلوب تسجيل الدخول",
        description: isLtr 
          ? "Please log in to book an appointment." 
          : "يرجى تسجيل الدخول لحجز موعد.",
        variant: "default",
      });
      const redirectPath = encodeURIComponent(location);
      navigate(`/login?redirect=${redirectPath}`);
    }
  }, [isAuthenticated, loading, location, navigate, toast, isLtr]);
  
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

    // Verify session is still valid
    try {
      const sessionResponse = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const sessionData = await sessionResponse.json();
      if (!sessionData.success) {
        toast({
          title: isLtr ? "Session Expired" : "انتهت الجلسة",
          description: isLtr 
            ? "Your session has expired. Please log in again." 
            : "انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      toast({
        title: isLtr ? "Session Error" : "خطأ في الجلسة",
        description: isLtr 
          ? "Failed to verify your session. Please try again." 
          : "فشل التحقق من جلسة العمل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    
    // Create datetime from selected date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    const bookingData = {
      userId: user.id,
      salonId: (salon as Salon).id,
      serviceId: (service as Service).id,
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
  
  if (salonError || serviceError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isLtr ? "Error Loading Data" : "خطأ في تحميل البيانات"}
          </AlertTitle>
          <AlertDescription>
            {isLtr 
              ? "Failed to load booking information. Please try again later."
              : "فشل في تحميل معلومات الحجز. يرجى المحاولة مرة أخرى لاحقًا."
            }
          </AlertDescription>
        </Alert>
      </div>
    );
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
    <ErrorBoundary>
      <Helmet>
        <title>
          {isLtr ? "Book Appointment | The Beauty" : "حجز موعد | جمالكِ"}
        </title>
        <meta name="description" content={isLtr 
          ? `Book your appointment for ${(service as Service).nameEn} at ${(salon as Salon).nameEn}`
          : `احجزي موعدك لخدمة ${(service as Service).nameAr} في ${(salon as Salon).nameAr}`
        } />
      </Helmet>
      
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
            <button
              className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              onClick={() => {
                setShowConfirmation(false);
                navigate("/");
              }}
            >
              {isLtr ? "Return Home" : "العودة للرئيسية"}
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
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
                          src={salon?.imageUrl && salon.imageUrl.trim() !== '' ? salon.imageUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(isLtr ? salon?.nameEn || '' : salon?.nameAr || '')}&background=D4AF37&color=fff&size=256`}
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
                          {isLtr ? salon.nameEn : salon.nameAr}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isLtr ? salon.city.split(' | ')[0] : `${salon.city.split(' | ')[0]} | ${salon.city.split(' | ')[1]}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className={`${isRtl ? 'font-tajawal' : ''}`}>
                        <p className="font-medium">{isLtr ? (service as Service).nameEn : (service as Service).nameAr}</p>
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
                      disabled={createBooking.isPending || !selectedDate || !selectedTime}
                    >
                      {createBooking.isPending ? (
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
  );
};

export default BookingPage;
