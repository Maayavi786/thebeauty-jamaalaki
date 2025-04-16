import { useState, useEffect } from "react";
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
import { Salon, Service } from "@shared/schema";

const BookingPage = () => {
  const { isLtr, isRtl } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const [_, params] = useRoute<{ salonId: string, serviceId: string }>("/booking/:salonId/:serviceId");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Get time slots
  const timeSlots = getTimeSlots(9, 21, 30);
  
  // Fetch salon data
  const { data: salon, isLoading: isSalonLoading } = useQuery<Salon>({
    queryKey: [`/api/salons/${params?.salonId}`],
    enabled: !!params?.salonId
  });
  
  // Fetch service data
  const { data: service, isLoading: isServiceLoading } = useQuery<Service>({
    queryKey: [`/api/services/${params?.serviceId}`],
    enabled: !!params?.serviceId
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
      const response = await apiRequest('POST', '/api/bookings', data);
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
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${user?.id}`] });
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
      const sessionResponse = await fetch(`${API_BASE_URL}/api/auth/session`, {
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
      salonId: salon.id,
      serviceId: service.id,
      datetime: bookingDate.toISOString(),
      status: "pending",
      notes: formData.notes,
    };
    
    try {
      await createBooking.mutateAsync(bookingData);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };
  
  if (isSalonLoading || isServiceLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
    <>
      <Helmet>
        <title>
          {isLtr ? "Book Appointment | The Beauty" : "حجز موعد | جمالكِ"}
        </title>
        <meta name="description" content={isLtr 
          ? `Book your appointment for ${service.nameEn} at ${salon.nameEn}`
          : `احجزي موعدك لخدمة ${service.nameAr} في ${salon.nameAr}`
        } />
      </Helmet>
      
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
                                {isLtr ? service.nameEn : service.nameAr}
                              </p>
                              <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                                {isLtr ? "Duration" : "المدة"}: {service.duration} {isLtr ? "minutes" : "دقيقة"}
                              </p>
                            </div>
                            <p className="text-primary font-medium">
                              {formatPrice(service.price)}
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
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedTime === time ? "default" : "outline"}
                                className={`text-sm ${selectedTime === time ? "bg-primary text-white" : ""}`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
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
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div>
                        <p className={`${isRtl ? 'font-tajawal' : ''}`}>
                          <span className="font-medium">{isLtr ? salon.nameEn : salon.nameAr}</span>
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {isLtr ? salon.city.split(' | ')[0] : `${salon.city.split(' | ')[0]} | ${salon.city.split(' | ')[1]}`}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className={`${isRtl ? 'font-tajawal' : ''}`}>
                        <p className="font-medium">{isLtr ? service.nameEn : service.nameAr}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} {isLtr ? "minutes" : "دقيقة"}
                        </p>
                      </div>
                      <p className="text-primary font-medium">
                        {formatPrice(service.price)}
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
                      <p className="text-primary">{formatPrice(service.price)}</p>
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
    </>
  );
};

export default BookingPage;
