import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { config } from '@/config';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
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
import { Loader2, Calendar } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

// Define promotion form schema
const promotionFormSchema = z.object({
  titleEn: z.string().min(2, {
    message: "Promotion title must be at least 2 characters.",
  }),
  titleAr: z.string().min(2, {
    message: "Promotion title in Arabic must be at least 2 characters.",
  }),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  startDate: z.string().min(1, {
    message: "Start date is required.",
  }),
  endDate: z.string().min(1, {
    message: "End date is required.",
  }),
  discountPercentage: z.coerce.number().min(1).max(100, {
    message: "Discount percentage must be between 1 and 100.",
  }),
  serviceIds: z.array(z.number()).min(1, {
    message: "At least one service must be selected.",
  }),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

interface PromotionFormProps {
  initialData: any;
  onSuccess: () => void;
  isRtl: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({ 
  initialData, 
  onSuccess,
  isRtl 
}) => {
  const { language } = useLanguage();
  
  // Fetch salon services for selection
  const {
    data: services,
    isLoading: isServicesLoading,
  } = useQuery({
    queryKey: ['owner-services-for-promotion'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.services}/salon`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch salon services:', error);
        throw error;
      }
    }
  });

  // Initialize form with initial data if available
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: initialData ? {
      titleEn: initialData.titleEn || "",
      titleAr: initialData.titleAr || "",
      descriptionEn: initialData.descriptionEn || "",
      descriptionAr: initialData.descriptionAr || "",
      startDate: initialData.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: initialData.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      discountPercentage: initialData.discountPercentage || 10,
      serviceIds: initialData.serviceIds || [],
    } : {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      discountPercentage: 10,
      serviceIds: [],
    },
  });

  // Mutation for creating or updating a promotion
  const saveMutation = useMutation({
    mutationFn: async (data: PromotionFormValues) => {
      // Create or update the promotion
      const endpoint = initialData
        ? `${config.api.endpoints.promotions}/${initialData.id}`
        : `${config.api.endpoints.promotions}`;
      
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast.success(initialData
        ? (isRtl ? 'تم تحديث العرض بنجاح' : 'Promotion updated successfully')
        : (isRtl ? 'تمت إضافة العرض بنجاح' : 'Promotion added successfully')
      );
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving promotion:', error);
      toast.error(isRtl
        ? 'حدث خطأ أثناء حفظ العرض. يرجى المحاولة مرة أخرى.'
        : 'An error occurred while saving the promotion. Please try again.'
      );
    },
  });

  // Form submission handler
  const onSubmit = (values: PromotionFormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Promotion Information with Language Tabs */}
        <Tabs defaultValue="english" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="arabic" className="font-tajawal">العربية</TabsTrigger>
          </TabsList>
          
          {/* English Content */}
          <TabsContent value="english" className="space-y-4">
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Title (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter promotion title in English" {...field} />
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
                  <FormLabel>Promotion Description (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the promotion in English"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what's included in the promotion and any terms or conditions.
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
              name="titleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-tajawal">عنوان العرض (العربية)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل عنوان العرض بالعربية" 
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
                  <FormLabel className="font-tajawal">وصف العرض (العربية)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="صف العرض باللغة العربية"
                      className="min-h-20 font-tajawal text-right"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="font-tajawal text-right">
                    قدم تفاصيل حول ما يتضمنه العرض وأي شروط أو أحكام.
                  </FormDescription>
                  <FormMessage className="font-tajawal text-right" />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Promotion Details */}
        <div className="space-y-4">
          <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
            {isRtl ? 'تفاصيل العرض' : 'Promotion Details'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                    {isRtl ? 'تاريخ البدء' : 'Start Date'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-9"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                    {isRtl ? 'تاريخ الانتهاء' : 'End Date'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-9"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Discount Percentage */}
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isRtl ? 'font-tajawal' : ''}>
                    {isRtl ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      max="100"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Service Selection */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="serviceIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                    {isRtl ? 'الخدمات المشمولة' : 'Included Services'}
                  </FormLabel>
                  <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                    {isRtl 
                      ? 'حدد الخدمات التي سيتم تطبيق العرض عليها.'
                      : 'Select the services that this promotion will apply to.'}
                  </FormDescription>
                </div>
                {isServicesLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services && services.length > 0 ? (
                      [
                        // Option for 'All Services'
                        <FormField
                          key="all-services"
                          control={form.control}
                          name="serviceIds"
                          render={({ field }) => {
                            // Check if serviceIds includes 0 (indicating 'All Services')
                            const allSelected = field.value.includes(0);
                            
                            return (
                              <FormItem
                                key="all-services"
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        // If 'All Services' is selected, clear other selections and set to [0]
                                        field.onChange([0]);
                                      } else {
                                        // If unchecked, remove 0 from serviceIds
                                        field.onChange(field.value.filter((id: number) => id !== 0));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isRtl ? 'جميع الخدمات' : 'All Services'}
                                  </FormLabel>
                                  <FormDescription className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl
                                      ? 'تطبيق العرض على جميع الخدمات في صالونك.'
                                      : 'Apply the promotion to all services in your salon.'}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />,
                        // Individual service options
                        ...(services as any[]).map((service: any) => (
                          <FormField
                            key={service.id}
                            control={form.control}
                            name="serviceIds"
                            render={({ field }) => {
                              // Check if 'All Services' is selected or if this specific service is selected
                              const allSelected = field.value.includes(0);
                              const selected = allSelected || field.value.includes(service.id);
                              
                              return (
                                <FormItem
                                  key={service.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={selected}
                                      disabled={allSelected} // Disable individual checkboxes if 'All Services' is selected
                                      onCheckedChange={(checked) => {
                                        if (allSelected) return; // Do nothing if 'All Services' is selected
                                        
                                        if (checked) {
                                          // Add this service id to the array
                                          field.onChange([...field.value, service.id]);
                                        } else {
                                          // Remove this service id from the array
                                          field.onChange(
                                            field.value.filter((id: number) => id !== service.id)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={`text-base ${isRtl ? 'font-tajawal' : ''}`}>
                                      {isRtl ? service.nameAr : service.nameEn}
                                    </FormLabel>
                                    <FormDescription className={`text-xs ${isRtl ? 'font-tajawal' : ''}`}>
                                      {isRtl
                                        ? `${service.price} ر.س - ${service.duration} دقيقة`
                                        : `SAR ${service.price} - ${service.duration} minutes`}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      ]
                    ) : (
                      <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isRtl
                          ? 'لم يتم العثور على خدمات. يرجى إضافة خدمات إلى صالونك أولاً.'
                          : 'No services found. Please add services to your salon first.'}
                      </p>
                    )}
                  </div>
                )}
                <FormMessage className="mt-4" />
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
              ? (isRtl ? 'تحديث العرض' : 'Update Promotion')
              : (isRtl ? 'إضافة العرض' : 'Add Promotion')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PromotionForm;
