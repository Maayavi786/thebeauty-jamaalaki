import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { config } from '@/config';
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

  // Redirect if not authenticated or not a salon owner
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
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
        const response = await apiRequest('GET', `${config.api.endpoints.services}/salon`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch salon services:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await apiRequest('DELETE', `${config.api.endpoints.services}/${serviceId}`);
      return response.json();
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
                      onClick={() => setEditingService(null)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isLtr ? 'Add New Service' : 'إضافة خدمة جديدة'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle className={isRtl ? 'font-tajawal' : ''}>
                        {editingService 
                          ? (isLtr ? 'Edit Service' : 'تعديل الخدمة') 
                          : (isLtr ? 'Add New Service' : 'إضافة خدمة جديدة')}
                      </DialogTitle>
                      <DialogDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Fill in the details to add a new service to your salon.' 
                          : 'املأ التفاصيل لإضافة خدمة جديدة إلى صالونك.'}
                      </DialogDescription>
                    </DialogHeader>
                    <ServiceForm 
                      initialData={editingService}
                      onSuccess={() => {
                        setIsAddDialogOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['owner-services'] });
                      }}
                      isRtl={isRtl}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {isServicesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : servicesError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Error Loading Services' : 'خطأ في تحميل الخدمات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'There was a problem loading your services. Please try again later.' 
                      : 'حدثت مشكلة أثناء تحميل خدماتك. يرجى المحاولة مرة أخرى لاحقًا.'}
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-services'] })}
                  >
                    {isLtr ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </CardContent>
              </Card>
            ) : filteredServices.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {searchQuery
                      ? (isLtr ? 'No matching services found' : 'لم يتم العثور على خدمات مطابقة')
                      : (isLtr ? 'No services available' : 'لا توجد خدمات متاحة')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground mb-6 ${isRtl ? 'font-tajawal' : ''}`}>
                    {searchQuery
                      ? (isLtr 
                          ? 'Try adjusting your search terms or add a new service.' 
                          : 'حاول تعديل مصطلحات البحث أو إضافة خدمة جديدة.')
                      : (isLtr 
                          ? 'Start by adding services to your salon.' 
                          : 'ابدأ بإضافة خدمات إلى صالونك.')}
                  </p>
                  
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
