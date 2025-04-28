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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { 
  Loader2, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  Trash, 
  Edit,
  Clock,
  CheckCircle
} from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import PromotionForm from '@/components/owner/PromotionForm';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isFuture, isPast, isWithinInterval } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Define promotion type
interface Promotion {
  id: number;
  salonId: number;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  serviceIds: number[];
  isActive: boolean;
  services?: {
    id: number;
    nameEn: string;
    nameAr: string;
  }[];
}

const PromotionsManagement = () => {
  const { isLtr, isRtl } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Redirect if not authenticated or not a salon owner
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Fetch salon promotions
  const {
    data: promotions,
    isLoading: isPromotionsLoading,
    error: promotionsError
  } = useQuery({
    queryKey: ['owner-promotions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.promotions}/salon`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch salon promotions:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: async (promotionId: number) => {
      const response = await apiRequest('DELETE', `${config.api.endpoints.promotions}/${promotionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-promotions'] });
      toast.success(isLtr ? 'Promotion deleted successfully' : 'تم حذف العرض بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting promotion:', error);
      toast.error(
        isLtr 
          ? 'Failed to delete promotion. Please try again.' 
          : 'فشل في حذف العرض. يرجى المحاولة مرة أخرى.'
      );
    }
  });

  // Handle promotion deletion
  const handleDeletePromotion = (promotionId: number) => {
    if (window.confirm(isLtr 
      ? 'Are you sure you want to delete this promotion? This action cannot be undone.' 
      : 'هل أنت متأكد أنك تريد حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.'
    )) {
      deletePromotionMutation.mutate(promotionId);
    }
  };

  // Handle edit promotion
  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsAddDialogOpen(true);
  };

  // Filter promotions based on search query and tab
  const filteredPromotions = promotions 
    ? (promotions as Promotion[]).filter((promotion: Promotion) => {
        // Apply search filter
        const searchMatch = 
          searchQuery === '' ||
          promotion.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promotion.titleAr.includes(searchQuery) ||
          (promotion.descriptionEn && promotion.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (promotion.descriptionAr && promotion.descriptionAr.includes(searchQuery));
        
        // Apply tab filter
        let tabMatch = true;
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        if (activeTab === 'active') {
          tabMatch = isWithinInterval(now, { start: startDate, end: endDate });
        } else if (activeTab === 'upcoming') {
          tabMatch = isFuture(startDate);
        } else if (activeTab === 'expired') {
          tabMatch = isPast(endDate);
        }
        
        return searchMatch && tabMatch;
      })
    : [];

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', {
      locale: isRtl ? ar : enUS,
    });
  };

  // Get promotion status
  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (isPast(endDate)) {
      return {
        label: isRtl ? 'منتهي' : 'Expired',
        variant: 'outline',
        color: 'text-gray-500'
      };
    } else if (isFuture(startDate)) {
      return {
        label: isRtl ? 'قادم' : 'Upcoming',
        variant: 'outline',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else {
      return {
        label: isRtl ? 'نشط' : 'Active',
        variant: 'default',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      };
    }
  };

  // Sample data for new promotions (in a real app, this would come from a form)
  const samplePromotions: Promotion[] = [
    {
      id: 1,
      salonId: 1,
      titleEn: 'Ramadan Special Offer',
      titleAr: 'عرض رمضان الخاص',
      descriptionEn: '25% discount on all skincare services during the holy month of Ramadan',
      descriptionAr: 'خصم 25% على جميع خدمات العناية بالبشرة خلال شهر رمضان المبارك',
      startDate: '2025-02-25',
      endDate: '2025-03-25',
      discountPercentage: 25,
      isActive: true,
      serviceIds: [1, 2, 3],
      services: [
        { id: 1, nameEn: 'Deep Facial Cleansing', nameAr: 'تنظيف البشرة العميق' },
        { id: 2, nameEn: 'Face Peeling', nameAr: 'تقشير الوجه' },
        { id: 3, nameEn: 'Hydration Mask', nameAr: 'قناع الترطيب' },
      ],
    },
    {
      id: 2,
      salonId: 1,
      titleEn: 'Premium Wedding Package',
      titleAr: 'باقة زفاف مميزة',
      descriptionEn: 'Comprehensive bridal package including makeup, hairstyling, and mani-pedi',
      descriptionAr: 'باقة شاملة للعرائس تتضمن المكياج، تصفيف الشعر، والمانيكير والباديكير',
      startDate: '2025-04-01',
      endDate: '2025-06-30',
      discountPercentage: 15,
      isActive: true,
      serviceIds: [4, 5, 6],
      services: [
        { id: 4, nameEn: 'Full Bridal Makeup', nameAr: 'مكياج عروس كامل' },
        { id: 5, nameEn: 'Bridal Hairstyling', nameAr: 'تصفيف شعر العروس' },
        { id: 6, nameEn: 'Manicure & Pedicure', nameAr: 'مانيكير وباديكير' },
      ],
    },
    {
      id: 3,
      salonId: 1,
      titleEn: 'National Day Promotion',
      titleAr: 'عرض اليوم الوطني',
      descriptionEn: 'Celebrating Saudi National Day with 20% off on all services',
      descriptionAr: 'احتفالاً باليوم الوطني السعودي، استمتعي بخصم 20% على جميع الخدمات',
      startDate: '2025-09-15',
      endDate: '2025-09-25',
      discountPercentage: 20,
      isActive: false,
      serviceIds: [],
      services: [
        { id: 0, nameEn: 'All Services', nameAr: 'جميع الخدمات' },
      ],
    },
  ];

  // Use sample data if no promotions are available yet
  const displayPromotions = promotions ? filteredPromotions : samplePromotions;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Promotions Management' : 'إدارة العروض'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="promotions" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                  {isLtr ? 'Promotions Management' : 'إدارة العروض'}
                </h1>
                <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                  {isLtr 
                    ? 'Create and manage special offers for your salon' 
                    : 'إنشاء وإدارة العروض الخاصة لصالونك'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={isLtr ? "Search promotions..." : "بحث في العروض..."}
                    className={`pl-8 w-full sm:w-64 ${isRtl ? 'font-tajawal' : ''}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className={isRtl ? 'font-tajawal' : ''}
                      onClick={() => setEditingPromotion(null)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isLtr ? 'Add New Promotion' : 'إضافة عرض جديد'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle className={isRtl ? 'font-tajawal' : ''}>
                        {editingPromotion 
                          ? (isLtr ? 'Edit Promotion' : 'تعديل العرض') 
                          : (isLtr ? 'Add New Promotion' : 'إضافة عرض جديد')}
                      </DialogTitle>
                      <DialogDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Fill in the details to create a special offer for your customers.' 
                          : 'املأ التفاصيل لإنشاء عرض خاص لعملائك.'}
                      </DialogDescription>
                    </DialogHeader>
                    <PromotionForm 
                      initialData={editingPromotion}
                      onSuccess={() => {
                        setIsAddDialogOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['owner-promotions'] });
                        setEditingPromotion(null);
                      }}
                      isRtl={isRtl}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Tabs to filter promotions */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className={isRtl ? 'font-tajawal' : ''}>
                  {isLtr ? 'All Promotions' : 'جميع العروض'}
                </TabsTrigger>
                <TabsTrigger value="active" className={isRtl ? 'font-tajawal' : ''}>
                  {isLtr ? 'Active' : 'نشطة'}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className={isRtl ? 'font-tajawal' : ''}>
                  {isLtr ? 'Upcoming' : 'قادمة'}
                </TabsTrigger>
                <TabsTrigger value="expired" className={isRtl ? 'font-tajawal' : ''}>
                  {isLtr ? 'Expired' : 'منتهية'}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isPromotionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : promotionsError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Error Loading Promotions' : 'خطأ في تحميل العروض'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'There was a problem loading your promotions. Please try again later.' 
                      : 'حدثت مشكلة أثناء تحميل العروض. يرجى المحاولة مرة أخرى لاحقًا.'}
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-promotions'] })}
                  >
                    {isLtr ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </CardContent>
              </Card>
            ) : displayPromotions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'No Promotions Found' : 'لم يتم العثور على عروض'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground mb-6 ${isRtl ? 'font-tajawal' : ''}`}>
                    {searchQuery
                      ? (isLtr 
                          ? 'No promotions match your search criteria. Try adjusting your search terms.' 
                          : 'لا توجد عروض تطابق معايير البحث. حاول تعديل مصطلحات البحث.')
                      : (isLtr 
                          ? 'You haven\'t created any promotions yet. Start by adding a special offer for your customers.' 
                          : 'لم تقم بإنشاء أي عروض حتى الآن. ابدأ بإضافة عرض خاص لعملائك.')}
                  </p>
                  
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className={isRtl ? 'font-tajawal' : ''}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isLtr ? 'Create Your First Promotion' : 'إنشاء أول عرض لك'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayPromotions.map((promotion: Promotion) => {
                  const status = getPromotionStatus(promotion);
                  
                  return (
                    <Card key={promotion.id} className={`overflow-hidden`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Colored sidebar indicating active status */}
                          <div 
                            className={`w-full md:w-1 h-2 md:h-auto ${status.label === (isRtl ? 'نشط' : 'Active') ? 'bg-primary' : 'bg-muted'}`}
                          ></div>
                          
                          <div className="p-4 md:p-6 flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                {/* Title and status */}
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={`font-semibold text-lg ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isLtr ? promotion.titleEn : promotion.titleAr}
                                  </h3>
                                  <Badge 
                                    variant={status.label === (isRtl ? 'نشط' : 'Active') ? "default" : "outline"}
                                    className={status.color}
                                  >
                                    {status.label}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className="bg-primary/10 text-primary border-primary/20"
                                  >
                                    {`-${promotion.discountPercentage}%`}
                                  </Badge>
                                </div>
                                
                                {/* Description */}
                                <p className={`text-muted-foreground text-sm mb-3 ${isRtl ? 'font-tajawal' : ''}`}>
                                  {isLtr ? promotion.descriptionEn : promotion.descriptionAr}
                                </p>
                                
                                {/* Dates */}
                                <div className="flex items-center text-xs text-muted-foreground mb-3">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                                  </span>
                                </div>
                                
                                {/* Services included */}
                                <div className="space-y-1">
                                  <p className={`text-xs font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                                    {isLtr ? 'Services Included:' : 'الخدمات المشمولة:'}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {promotion.services?.map((service) => (
                                      <Badge key={service.id} variant="outline" className="bg-background">
                                        <Tag className="h-3 w-3 mr-1" />
                                        <span className={isRtl ? 'font-tajawal' : ''}>
                                          {isLtr ? service.nameEn : service.nameAr}
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex flex-row md:flex-col gap-2 self-start mt-4 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-primary"
                                  onClick={() => handleEditPromotion(promotion)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'تعديل' : 'Edit'}
                                  </span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-destructive"
                                  onClick={() => handleDeletePromotion(promotion.id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'حذف' : 'Delete'}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Add New Promotion Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="border-dashed border-2 w-full py-6"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <span className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isRtl ? '+ إضافة عرض جديد' : '+ Add New Promotion'}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PromotionsManagement;
