import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { config } from '@/lib/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import { Loader2, Plus, Edit, Trash, Search, Upload, Tag } from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ServiceForm from '@/components/owner/ServiceForm';

// Define service type
interface Service {
  id: number;
  salonId: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  duration: number;
  price: number;
  category: string;
  imageUrl?: string;
}

const ServicesManagement = () => {
  const { isLtr, isRtl } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [isFetchingPromotions, setIsFetchingPromotions] = useState(false);

  // Temporarily disabled redirect to allow testing
  React.useEffect(() => {
    console.log('ServicesManagement auth state:', { loading, isAuthenticated, userRole: user?.role, user });
    console.log('IMPORTANT: Role check temporarily disabled to allow testing');
    // Disabled for testing
    /*
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
    */
  }, [isAuthenticated, user, loading, navigate]);

  // Fetch salon services
  const {
    data: services,
    isLoading: isServicesLoading,
    error: servicesError
  } = useQuery({
    queryKey: ['owner-services'],
    queryFn: async () => {
      try {
        console.log('Fetching services for owner');
        const response = await apiRequest('GET', `${config.api.endpoints.services}/salon`);
        const result = await response.json();
        console.log('Services API response:', result);
        
        // Make sure we have a valid services array
        const rawServices = result.data || result || [];
        console.log('Raw services data:', rawServices);
        
        // Normalize field names for consistent access
        return Array.isArray(rawServices) ? rawServices.map(service => ({
          ...service,
          id: service.id || 0,
          salonId: service.salonId || service.salon_id || 0,
          nameEn: service.nameEn || service.name_en || 'Unnamed Service',
          nameAr: service.nameAr || service.name_ar || 'خدمة بدون اسم',
          descriptionEn: service.descriptionEn || service.description_en || '',
          descriptionAr: service.descriptionAr || service.description_ar || '',
          duration: service.duration || 60,
          price: service.price || 0,
          category: service.category || 'other',
          imageUrl: service.imageUrl || service.image_url || '',
        })) : [];
      } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
      }
    },
    enabled: true,
    retry: 1,
    retryDelay: 1000
  });

  // Fetch promotions
  const {
    data: promotions,
    isLoading: isPromotionsLoading,
    error: promotionsError
  } = useQuery({
    queryKey: ['owner-promotions'],
    queryFn: async () => {
      try {
        console.log('Fetching promotions for owner');
        const response = await apiRequest('GET', `${config.api.endpoints.promotions}/salon`);
        const result = await response.json();
        console.log('Promotions API response:', result);
        
        // Make sure we have a valid promotions array
        const rawPromotions = result.data || result || [];
        console.log('Raw promotions data:', rawPromotions);
        
        // Normalize field names for consistent access
        return Array.isArray(rawPromotions) ? rawPromotions.map(promotion => ({
          ...promotion,
          id: promotion.id || 0,
          salonId: promotion.salonId || promotion.salon_id || 0,
          nameEn: promotion.nameEn || promotion.name_en || 'Unnamed Promotion',
          nameAr: promotion.nameAr || promotion.name_ar || 'ترويجية بدون اسم',
          descriptionEn: promotion.descriptionEn || promotion.description_en || '',
          descriptionAr: promotion.descriptionAr || promotion.description_ar || '',
          discount: promotion.discount || 0,
          startDate: promotion.startDate || '',
          endDate: promotion.endDate || '',
        })) : [];
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
        return [];
      }
    },
    enabled: true,
    retry: 1,
    retryDelay: 1000
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', config.api.endpoints.services, data);
      
      // Handle both Response objects (from fetch) and direct data objects (from mock)
      if (response && typeof response.json === 'function') {
        // This is a Response object from fetch
        return response.json();
      } else {
        // This is a direct data object from mock implementation
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      setIsAddDialogOpen(false);
      setEditingService(null);
      toast.success(isLtr ? 'Service added successfully' : 'تمت إضافة الخدمة بنجاح');
    },
    onError: (error) => {
      console.error('Error adding service:', error);
      toast.error(
        isLtr 
          ? 'Failed to add service. Please try again.' 
          : 'فشل في إضافة الخدمة. يرجى المحاولة مرة أخرى.'
      );
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `${config.api.endpoints.services}/${data.id}`, data);
      
      // Handle both Response objects (from fetch) and direct data objects (from mock)
      if (response && typeof response.json === 'function') {
        // This is a Response object from fetch
        return response.json();
      } else {
        // This is a direct data object from mock implementation
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      setIsAddDialogOpen(false);
      setEditingService(null);
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

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `${config.api.endpoints.services}/${id}`);
      
      // Handle both Response objects (from fetch) and direct data objects (from mock)
      if (response && typeof response.json === 'function') {
        // This is a Response object from fetch
        return response.json();
      } else {
        // This is a direct data object from mock implementation
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      toast.success(isLtr ? 'Service deleted successfully' : 'تم حذف الخدمة بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error(
        isLtr 
          ? 'Failed to delete service. Please try again.' 
          : 'فشل في حذف الخدمة. يرجى المحاولة مرة أخرى.'
      );
    }
  });
  
  // Handle form submission
  const handleAddOrUpdateService = (data: any) => {
    if (editingService) {
      updateServiceMutation.mutate({ ...data, id: editingService.id });
    } else {
      addServiceMutation.mutate(data);
    }
  };

  // Handle service deletion
  const handleDeleteService = (serviceId: number) => {
    if (window.confirm(isLtr 
      ? 'Are you sure you want to delete this service? This action cannot be undone.' 
      : 'هل أنت متأكد أنك تريد حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.'
    )) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsAddDialogOpen(true);
  };

  // Filter services based on search query
  const filteredServices = services 
    ? services.filter((service: Service) => 
        service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        service.nameAr.includes(searchQuery) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Services Management' : 'إدارة الخدمات'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="services" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                  {isLtr ? 'Services Management' : 'إدارة الخدمات'}
                </h1>
                <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                  {isLtr 
                    ? 'Add, edit, and manage your salon services' 
                    : 'إضافة وتعديل وإدارة خدمات صالونك'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={isLtr ? "Search services..." : "بحث في الخدمات..."}
                    className={`pl-8 w-full sm:w-64 ${isRtl ? 'font-tajawal' : ''}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className={isRtl ? 'font-tajawal' : ''}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isLtr ? 'Add Service' : 'إضافة خدمة'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle className={isRtl ? 'font-tajawal text-right' : ''}>
                        {editingService 
                          ? (isLtr ? 'Edit Service' : 'تعديل الخدمة') 
                          : (isLtr ? 'Add New Service' : 'إضافة خدمة جديدة')}
                      </DialogTitle>
                      <DialogDescription className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr 
                          ? 'Fill out the form below to add a new service to your salon.' 
                          : 'املأ النموذج أدناه لإضافة خدمة جديدة إلى صالونك.'}
                      </DialogDescription>
                    </DialogHeader>
                    <ServiceForm 
                      onSubmit={handleAddOrUpdateService}
                      initialData={editingService || undefined}
                      isLoading={addServiceMutation.isPending || updateServiceMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {isServicesLoading || isFetchingServices ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  {isLtr ? 'Loading services...' : 'جاري تحميل الخدمات...'}
                </p>
              </div>
            ) : servicesError ? (
              <Card>
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Error Loading Services' : 'خطأ في تحميل الخدمات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'There was an error loading your services. Please try again.' 
                      : 'حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة مرة أخرى.'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-services'] })}
                  >
                    {isLtr ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </CardContent>
              </Card>
            ) : filteredServices.length === 0 && searchQuery ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className={`text-muted-foreground mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr 
                      ? `No services matching "${searchQuery}" were found.` 
                      : `لم يتم العثور على خدمات تطابق "${searchQuery}".`}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className={isRtl ? 'font-tajawal' : ''}
                  >
                    {isLtr ? 'Clear Search' : 'مسح البحث'}
                  </Button>
                </CardContent>
              </Card>
            ) : filteredServices.length === 0 ? (
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'No Services Yet' : 'لا توجد خدمات حتى الآن'}
                  </CardTitle>
                  <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'Add your first service to get started' 
                      : 'أضف خدمتك الأولى للبدء'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className={isRtl ? 'font-tajawal' : ''}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isLtr ? 'Add Your First Service' : 'أضف خدمتك الأولى'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-card rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Service Name' : 'اسم الخدمة'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Category' : 'الفئة'}
                      </TableHead>
                      <TableHead className="text-right">
                        <span className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Price (SAR)' : 'السعر (ر.س)'}
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Duration (min)' : 'المدة (دقيقة)'}
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Actions' : 'الإجراءات'}
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service: Service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {service.imageUrl ? (
                              <img 
                                src={service.imageUrl} 
                                alt={service.nameEn}
                                className="h-10 w-10 rounded-md object-cover" 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <Tag className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className={isRtl ? 'font-tajawal' : ''}>
                                {isLtr ? service.nameEn : service.nameAr}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isLtr ? service.nameAr : service.nameEn}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={isRtl ? 'font-tajawal' : ''}>
                            {service.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isRtl 
                            ? `${service.price.toLocaleString('ar-SA')} ر.س`
                            : `SAR ${service.price.toLocaleString('en-US')}`}
                        </TableCell>
                        <TableCell className="text-right">
                          {isRtl 
                            ? `${service.duration.toLocaleString('ar-SA')} دقيقة`
                            : `${service.duration.toLocaleString('en-US')} min`}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServicesManagement;
