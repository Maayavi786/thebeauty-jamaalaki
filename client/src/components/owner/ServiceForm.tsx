import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { config } from '@/config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Camera } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';

// Define service form schema
const serviceFormSchema = z.object({
  nameEn: z.string().min(2, {
    message: "Service name must be at least 2 characters.",
  }),
  nameAr: z.string().min(2, {
    message: "Service name in Arabic must be at least 2 characters.",
  }),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  duration: z.coerce.number().min(1, {
    message: "Duration must be at least 1 minute.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1 SAR.",
  }),
  category: z.string().min(1, {
    message: "Category is required.",
  }),
  imageUrl: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData: any;
  onSuccess: () => void;
  isRtl: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  initialData, 
  onSuccess,
  isRtl 
}) => {
  const { language } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Initialize form with initial data if available
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: initialData ? {
      nameEn: initialData.nameEn || initialData.name_en || "",
      nameAr: initialData.nameAr || initialData.name_ar || "",
      descriptionEn: initialData.descriptionEn || initialData.description_en || "",
      descriptionAr: initialData.descriptionAr || initialData.description_ar || "",
      duration: initialData.duration || 60,
      price: initialData.price || 100,
      category: initialData.category || "",
      imageUrl: initialData.imageUrl || initialData.image_url || "",
    } : {
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      duration: 60,
      price: 100,
      category: "",
      imageUrl: "",
    },
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

  // Mutation for creating or updating a service
  const saveMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
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
      
      // Then create or update the service
      const endpoint = initialData
        ? `${config.api.endpoints.services}/${initialData.id}`
        : `${config.api.endpoints.services}`;
      
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, endpoint, { ...data, imageUrl });
      return response.json();
    },
    onSuccess: () => {
      toast.success(initialData
        ? (isRtl ? 'تم تحديث الخدمة بنجاح' : 'Service updated successfully')
        : (isRtl ? 'تمت إضافة الخدمة بنجاح' : 'Service added successfully')
      );
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving service:', error);
      toast.error(isRtl
        ? 'حدث خطأ أثناء حفظ الخدمة. يرجى المحاولة مرة أخرى.'
        : 'An error occurred while saving the service. Please try again.'
      );
    },
  });

  // Form submission handler
  const onSubmit = (values: ServiceFormValues) => {
    saveMutation.mutate(values);
  };

  // Categories for the salon services
  const serviceCategories = [
    { value: 'hair', label: isRtl ? 'الشعر' : 'Hair' },
    { value: 'nails', label: isRtl ? 'الأظافر' : 'Nails' },
    { value: 'makeup', label: isRtl ? 'مكياج' : 'Makeup' },
    { value: 'facial', label: isRtl ? 'عناية بالوجه' : 'Facial' },
    { value: 'massage', label: isRtl ? 'مساج' : 'Massage' },
    { value: 'waxing', label: isRtl ? 'إزالة الشعر' : 'Waxing' },
    { value: 'eyebrows', label: isRtl ? 'حواجب' : 'Eyebrows' },
    { value: 'eyelashes', label: isRtl ? 'رموش' : 'Eyelashes' },
    { value: 'bridal', label: isRtl ? 'عروس' : 'Bridal' },
    { value: 'other', label: isRtl ? 'أخرى' : 'Other' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Image */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative h-40 w-40 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Service preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className={`mt-2 text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                  {isRtl ? 'لم يتم تحميل صورة' : 'No image uploaded'}
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
                {isRtl ? 'تحميل صورة الخدمة' : 'Upload service image'}
              </p>
              <div className="flex gap-2">
                <label 
                  htmlFor="service-image" 
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className={isRtl ? 'font-tajawal' : ''}>
                    {isRtl ? 'اختر صورة' : 'Choose Image'}
                  </span>
                  <input
                    id="service-image"
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
                    {isRtl ? 'إزالة' : 'Remove'}
                  </Button>
                )}
              </div>
              <p className={`text-xs text-muted-foreground mt-2 ${isRtl ? 'font-tajawal' : ''}`}>
                {isRtl 
                  ? 'الحجم الموصى به: 600 × 400 بكسل. الحد الأقصى لحجم الملف: 2 ميجابايت.' 
                  : 'Recommended size: 600 × 400 pixels. Max file size: 2MB.'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Basic Service Information with Language Tabs */}
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
                  <FormLabel>Service Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the service in English"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what the service includes, benefits, and any special techniques used.
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
                  <FormLabel className="font-tajawal">اسم الخدمة (العربية)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل اسم الخدمة بالعربية" 
                      {...field} 
                      dir="rtl"
                      className="font-tajawal text-right"
                    />
                  </FormControl>
                  <FormMessage className="font-tajawal text-right" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-tajawal">وصف الخدمة (العربية)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="صف الخدمة باللغة العربية"
                      className="min-h-20 font-tajawal text-right"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="font-tajawal text-right">
                    قدم تفاصيل حول ما تتضمنه الخدمة، والفوائد، وأي تقنيات خاصة مستخدمة.
                  </FormDescription>
                  <FormMessage className="font-tajawal text-right" />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                  {isRtl ? 'الفئة' : 'Category'}
                </FormLabel>
                <FormControl>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="" disabled>
                      {isRtl ? 'اختر فئة' : 'Select a category'}
                    </option>
                    {serviceCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                  {isRtl ? 'السعر (ر.س)' : 'Price (SAR)'}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder={isRtl ? "أدخل السعر" : "Enter price"} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                  {isRtl ? 'المدة (دقيقة)' : 'Duration (minutes)'}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder={isRtl ? "أدخل المدة" : "Enter duration"}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button 
            type="submit" 
            disabled={saveMutation.isPending}
            className={`w-full md:w-auto ${isRtl ? 'font-tajawal' : ''}`}
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData
              ? (isRtl ? 'تحديث الخدمة' : 'Update Service')
              : (isRtl ? 'إضافة الخدمة' : 'Add Service')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
