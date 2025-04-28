import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/apiRequest';
import { config } from '@/config';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Upload, Camera } from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';

// Form schema with validation
const salonFormSchema = z.object({
  nameEn: z.string().min(2, {
    message: "Salon name must be at least 2 characters.",
  }),
  nameAr: z.string().min(2, {
    message: "Salon name in Arabic must be at least 2 characters.",
  }),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  phone: z.string().min(5, {
    message: "Phone must be at least 5 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  imageUrl: z.string().optional(),
  isLadiesOnly: z.boolean().default(true),
  hasPrivateRooms: z.boolean().default(false),
  isHijabFriendly: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  priceRange: z.string().optional(),
});

type SalonFormValues = z.infer<typeof salonFormSchema>;

const SalonProfile = () => {
  const { isLtr, isRtl, language } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Redirect if not authenticated or not a salon owner
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Fetch salon data for the owner
  const {
    data: salonData,
    isLoading: isSalonLoading,
    error: salonError
  } = useQuery({
    queryKey: ['owner-salon-profile'],
    queryFn: async () => {
      try {
        // Assuming an endpoint to get salons for the logged-in owner
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/owner`);
        const result = await response.json();
        const salon = result.data || result;
        
        // If salon has an image, set the preview
        if (salon.imageUrl) {
          setImagePreview(salon.imageUrl);
        }
        
        return salon;
      } catch (error) {
        console.error('Failed to fetch owner salon data:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize the form with salon data when it's loaded
  const form = useForm<SalonFormValues>({
    resolver: zodResolver(salonFormSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      imageUrl: "",
      isLadiesOnly: true,
      hasPrivateRooms: false,
      isHijabFriendly: false,
      isVerified: false,
      priceRange: "",
    },
  });

  // Populate form when salon data is loaded
  useEffect(() => {
    if (salonData) {
      form.reset({
        nameEn: salonData.nameEn || salonData.name_en || "",
        nameAr: salonData.nameAr || salonData.name_ar || "",
        descriptionEn: salonData.descriptionEn || salonData.description_en || "",
        descriptionAr: salonData.descriptionAr || salonData.description_ar || "",
        address: salonData.address || "",
        city: salonData.city || "",
        phone: salonData.phone || "",
        email: salonData.email || "",
        imageUrl: salonData.imageUrl || salonData.image_url || "",
        isLadiesOnly: salonData.isLadiesOnly || salonData.is_ladies_only || true,
        hasPrivateRooms: salonData.hasPrivateRooms || salonData.has_private_rooms || false,
        isHijabFriendly: salonData.isHijabFriendly || salonData.is_hijab_friendly || false,
        isVerified: salonData.isVerified || salonData.is_verified || false,
        priceRange: salonData.priceRange || salonData.price_range || "",
      });
    }
  }, [salonData, form]);

  // Mutation to update salon info
  const updateMutation = useMutation({
    mutationFn: async (data: SalonFormValues) => {
      // First, handle the image upload if there's a new image
      let imageUrl = data.imageUrl;
      
      if (imageFile) {
        // Create a FormData object to upload the image
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Upload the image
        const uploadResponse = await apiRequest(
          'POST',
          `${config.api.endpoints.upload}`,
          formData,
          { 'Content-Type': 'multipart/form-data' }
        );
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
        }
      }
      
      // Then update the salon with all the data including the new image URL
      const response = await apiRequest(
        'PUT',
        `${config.api.endpoints.salons}/owner`,
        { ...data, imageUrl }
      );
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch salon data
      queryClient.invalidateQueries({ queryKey: ['owner-salon-profile'] });
      toast.success(isLtr ? "Salon profile updated successfully!" : "تم تحديث ملف الصالون بنجاح!");
    },
    onError: (error) => {
      console.error('Failed to update salon:', error);
      toast.error(
        isLtr 
          ? "Failed to update salon profile. Please try again." 
          : "فشل في تحديث ملف الصالون. يرجى المحاولة مرة أخرى."
      );
    }
  });

  // Form submission handler
  const onSubmit = (values: SalonFormValues) => {
    updateMutation.mutate(values);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Salon Profile' : 'ملف الصالون'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="salon" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                {isLtr ? 'Salon Profile' : 'ملف الصالون'}
              </h1>
              <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                {isLtr 
                  ? 'Manage your salon information in both Arabic and English' 
                  : 'إدارة معلومات صالونك باللغتين العربية والإنجليزية'}
              </p>
            </header>

            {isSalonLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : salonError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Error Loading Data' : 'خطأ في تحميل البيانات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'There was a problem loading your salon data. Please try again later.' 
                      : 'حدثت مشكلة أثناء تحميل بيانات الصالون الخاص بك. يرجى المحاولة مرة أخرى لاحقًا.'}
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-salon-profile'] })}
                  >
                    {isLtr ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Salon Image */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Salon Image' : 'صورة الصالون'}
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Upload a high-quality image of your salon to attract customers' 
                          : 'قم بتحميل صورة عالية الجودة لصالونك لجذب العملاء'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative h-52 w-52 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Salon preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                              <p className={`mt-2 text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                                {isLtr ? 'No image uploaded' : 'لم يتم تحميل صورة'}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-4">
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem className="hidden">
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div>
                            <p className={`text-sm font-medium mb-2 ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? 'Upload a new image' : 'تحميل صورة جديدة'}
                            </p>
                            <div className="flex gap-2">
                              <label 
                                htmlFor="salon-image" 
                                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                <span className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'Choose Image' : 'اختر صورة'}
                                </span>
                                <input
                                  id="salon-image"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </label>
                              {imagePreview && (
                                <Button 
                                  variant="outline" 
                                  type="button" 
                                  onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    form.setValue('imageUrl', '');
                                  }}
                                >
                                  {isLtr ? 'Remove' : 'إزالة'}
                                </Button>
                              )}
                            </div>
                            <p className={`text-xs text-muted-foreground mt-2 ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr 
                                ? 'Recommended size: 1200 x 800 pixels. Max file size: 5MB.' 
                                : 'الحجم الموصى به: 1200 × 800 بكسل. الحد الأقصى لحجم الملف: 5 ميجابايت.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Language Tabs for Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Basic Information' : 'المعلومات الأساسية'}
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Provide your salon details in both English and Arabic' 
                          : 'قدم تفاصيل صالونك باللغتين الإنجليزية والعربية'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="english" className="w-full">
                        <TabsList className="mb-4">
                          <TabsTrigger value="english">English</TabsTrigger>
                          <TabsTrigger value="arabic" className="font-tajawal">العربية</TabsTrigger>
                        </TabsList>
                        
                        {/* English Content */}
                        <TabsContent value="english" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="nameEn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salon Name (English)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter salon name in English" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This will be displayed to English-speaking customers.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="descriptionEn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salon Description (English)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your salon, services, and unique features in English"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide a compelling description that highlights your salon's unique offerings.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        
                        {/* Arabic Content */}
                        <TabsContent value="arabic" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="nameAr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-tajawal">اسم الصالون (العربية)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="أدخل اسم الصالون بالعربية" 
                                    {...field} 
                                    dir="rtl"
                                    className="font-tajawal text-right"
                                  />
                                </FormControl>
                                <FormDescription className="font-tajawal text-right">
                                  سيتم عرض هذا للعملاء الناطقين باللغة العربية.
                                </FormDescription>
                                <FormMessage className="font-tajawal text-right" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="descriptionAr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-tajawal">وصف الصالون (العربية)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="صف صالونك وخدماته وميزاته الفريدة باللغة العربية"
                                    className="min-h-32 font-tajawal text-right"
                                    dir="rtl"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="font-tajawal text-right">
                                  قدم وصفًا جذابًا يسلط الضوء على العروض الفريدة لصالونك.
                                </FormDescription>
                                <FormMessage className="font-tajawal text-right" />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>

                      <Separator className="my-6" />

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? 'Contact Information' : 'معلومات الاتصال'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'Address' : 'العنوان'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={isLtr ? "Enter salon address" : "أدخل عنوان الصالون"} 
                                    {...field} 
                                    className={isRtl ? 'font-tajawal' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'City' : 'المدينة'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={isLtr ? "Enter city" : "أدخل المدينة"} 
                                    {...field} 
                                    className={isRtl ? 'font-tajawal' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'Phone' : 'الهاتف'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={isLtr ? "Enter phone number" : "أدخل رقم الهاتف"} 
                                    {...field} 
                                    className={isRtl ? 'font-tajawal' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'Email' : 'البريد الإلكتروني'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={isLtr ? "Enter email address" : "أدخل عنوان البريد الإلكتروني"} 
                                    type="email"
                                    {...field} 
                                    className={isRtl ? 'font-tajawal' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="priceRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr ? 'Price Range' : 'نطاق السعر'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={isLtr ? "e.g., $$ or SAR 100-500" : "مثال: $$ أو 100-500 ر.س"} 
                                    {...field} 
                                    className={isRtl ? 'font-tajawal' : ''}
                                  />
                                </FormControl>
                                <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                                  {isLtr 
                                    ? "Indicate the general price range of your services" 
                                    : "حدد النطاق السعري العام لخدماتك"}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Salon Features */}
                      <div className="space-y-4">
                        <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? 'Salon Features' : 'ميزات الصالون'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="isLadiesOnly"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isLtr ? 'Ladies Only' : 'للسيدات فقط'}
                                  </FormLabel>
                                  <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                                    {isLtr 
                                      ? "Is your salon exclusively for female customers?" 
                                      : "هل صالونك مخصص للعملاء من الإناث فقط؟"}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasPrivateRooms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isLtr ? 'Private Rooms' : 'غرف خاصة'}
                                  </FormLabel>
                                  <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                                    {isLtr 
                                      ? "Do you offer private rooms for your services?" 
                                      : "هل تقدم غرف خاصة لخدماتك؟"}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="isHijabFriendly"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isLtr ? 'Hijab Friendly' : 'مناسب للمحجبات'}
                                  </FormLabel>
                                  <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                                    {isLtr 
                                      ? "Is your salon accommodating for hijabi customers?" 
                                      : "هل صالونك مناسب للعملاء المحجبات؟"}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={updateMutation.isPending}
                      className={isRtl ? 'font-tajawal' : ''}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isLtr ? 'Save Changes' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalonProfile;
