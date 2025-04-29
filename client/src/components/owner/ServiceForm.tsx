import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { config } from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Loader2, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define service form schema using zod
const serviceSchema = z.object({
  nameEn: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().min(2, 'Name must be at least 2 characters'),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  duration: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  salonId: z.coerce.number().optional(), // Will be filled from state
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  isOpen, 
  onClose, 
  initialData
}) => {
  const { isLtr, isRtl } = useLanguage();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with default values
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      nameEn: initialData?.nameEn || initialData?.name_en || '',
      nameAr: initialData?.nameAr || initialData?.name_ar || '',
      descriptionEn: initialData?.descriptionEn || initialData?.description_en || '',
      descriptionAr: initialData?.descriptionAr || initialData?.description_ar || '',
      duration: initialData?.duration || 60,
      price: initialData?.price || 0,
      category: initialData?.category || 'Hair',
      salonId: initialData?.salonId || initialData?.salon_id || undefined, // Will be filled later
    },
  });

  // Load initial data into the form when editing
  useEffect(() => {
    if (initialData) {
      // Handle both camelCase and snake_case field names
      form.reset({
        nameEn: initialData.nameEn || initialData.name_en || '',
        nameAr: initialData.nameAr || initialData.name_ar || '',
        descriptionEn: initialData.descriptionEn || initialData.description_en || '',
        descriptionAr: initialData.descriptionAr || initialData.description_ar || '',
        duration: initialData.duration || 60,
        price: initialData.price || 0,
        category: initialData.category || 'Hair',
        salonId: initialData.salonId || initialData.salon_id || undefined,
      });

      // Set image preview if available
      if (initialData.imageUrl || initialData.image_url) {
        setImagePreview(initialData.imageUrl || initialData.image_url);
      }
    }
  }, [initialData, form]);

  // Set up salon data fetching to get the salon ID
  useEffect(() => {
    const fetchSalonId = async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/owner`);
        const data = await response.json();
        
        if (data && data.id) {
          console.log('Setting salon ID in form:', data.id);
          form.setValue('salonId', data.id);
        } else {
          console.error('Failed to get salon ID from API response:', data);
        }
      } catch (error) {
        console.error('Error fetching salon ID:', error);
      }
    };

    fetchSalonId();
  }, [form]);

  // Handle image file changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      console.log('Creating service with data:', data);
      try {
        const response = await apiRequest('POST', `${config.api.endpoints.services}`, data);
        console.log('Service creation response status:', response.status);
        
        if (!response.ok) {
          console.error('Service creation failed:', response.status, response.statusText);
          // Try to get error details
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(errorData.message || 'Failed to create service');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Service creation exception:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      onClose();
      toast.success(isLtr ? 'Service created successfully' : 'تم إنشاء الخدمة بنجاح');
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast.error(
        isLtr 
          ? 'Failed to create service. Please try again.' 
          : 'فشل في إنشاء الخدمة. يرجى المحاولة مرة أخرى.'
      );
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      console.log('Updating service with data:', data);
      try {
        const response = await apiRequest('PUT', `${config.api.endpoints.services}/${initialData?.id}`, data);
        console.log('Service update response status:', response.status);
        
        if (!response.ok) {
          console.error('Service update failed:', response.status, response.statusText);
          // Try to get error details
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(errorData.message || 'Failed to update service');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Service update exception:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      onClose();
      toast.success(isLtr ? 'Service updated successfully' : 'تم تحديث الخدمة بنجاح');
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error(
        isLtr 
          ? 'Failed to update service. Please try again.' 
          : 'فشل في تحديث الخدمة. يرجى المحاولة مرة أخرى.'
      );
    }
  });

  // Function to handle form submission
  const onSubmit = async (data: ServiceFormValues) => {
    console.log('Form submitted with data:', data);
    
    try {
      // First, handle image upload if there's a new image
      let imageUrl = initialData?.imageUrl || initialData?.image_url || '';
      
      if (imageFile) {
        setIsUploading(true);
        // For now, using placeholder logic
        // In a real app, you would upload to a service and get back a URL
        imageUrl = URL.createObjectURL(imageFile); // This is just a temp URL
        setIsUploading(false);
      }
      
      // Create full data payload with image URL
      const serviceData = {
        ...data,
        imageUrl
      };
      
      // Submit using appropriate mutation
      if (initialData) {
        await updateServiceMutation.mutateAsync(serviceData);
      } else {
        await createServiceMutation.mutateAsync(serviceData);
      }
    } catch (error) {
      console.error('Service form submission error:', error);
    }
  };

  // Service categories options
  const categories = [
    'Hair', 'Nails', 'Skin', 'Massage', 'Makeup', 'Facial', 'Spa', 'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData 
              ? (isLtr ? 'Edit Service' : 'تعديل الخدمة')
              : (isLtr ? 'Add New Service' : 'إضافة خدمة جديدة')
            }
          </DialogTitle>
          <DialogDescription>
            {isLtr 
              ? 'Fill in the details to add a new service to your salon.'
              : 'املأ التفاصيل لإضافة خدمة جديدة إلى صالونك.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* English Name */}
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Name (English)' : 'الاسم (بالإنجليزية)'}</FormLabel>
                  <FormControl>
                    <Input placeholder="Service name in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arabic Name */}
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Name (Arabic)' : 'الاسم (بالعربية)'}</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الخدمة بالعربية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* English Description */}
            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Description (English)' : 'الوصف (بالإنجليزية)'}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service in English" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arabic Description */}
            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Description (Arabic)' : 'الوصف (بالعربية)'}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="صف الخدمة بالعربية" 
                      className={isRtl ? 'font-tajawal' : ''}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Duration (minutes)' : 'المدة (دقائق)'}</FormLabel>
                  <FormControl>
                    <Input type="number" min="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Price' : 'السعر'}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isLtr ? 'Category' : 'الفئة'}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLtr ? "Select category" : "اختر الفئة"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {isLtr ? category : getArabicCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>{isLtr ? 'Service Image' : 'صورة الخدمة'}</FormLabel>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('service-image')?.click()}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Upload size={16} />
                  <span>{isLtr ? 'Upload Image' : 'رفع صورة'}</span>
                </Button>
                <Input
                  id="service-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {isLtr ? 'Cancel' : 'إلغاء'}
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isUploading || createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {(form.formState.isSubmitting || isUploading || createServiceMutation.isPending || updateServiceMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialData 
                  ? (isLtr ? 'Update Service' : 'تحديث الخدمة')
                  : (isLtr ? 'Create Service' : 'إنشاء الخدمة')
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to translate category names to Arabic
function getArabicCategoryName(category: string): string {
  const arabicCategories: Record<string, string> = {
    'Hair': 'شعر',
    'Nails': 'أظافر',
    'Skin': 'بشرة',
    'Massage': 'مساج',
    'Makeup': 'مكياج',
    'Facial': 'عناية بالوجه',
    'Spa': 'سبا',
    'Other': 'أخرى'
  };
  
  return arabicCategories[category] || category;
}

export default ServiceForm;
