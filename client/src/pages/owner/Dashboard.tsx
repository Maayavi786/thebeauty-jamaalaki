import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, TrendingUp, Tag, Settings, Users } from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import BookingsSummary from '@/components/owner/BookingsSummary';
import RecentBookings from '@/components/owner/RecentBookings';
import RevenueChart from '@/components/owner/RevenueChart';
import UpcomingPromotions from '@/components/owner/UpcomingPromotions';

const OwnerDashboard = () => {
  const { isLtr, isRtl, language } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();

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
    queryKey: ['owner-salon'],
    queryFn: async () => {
      try {
        // Assuming an endpoint to get salons for the logged-in owner
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/owner`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch owner salon data:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Fetch recent bookings
  const {
    data: recentBookings,
    isLoading: isBookingsLoading
  } = useQuery({
    queryKey: ['owner-recent-bookings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.bookings}/salon/recent`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch recent bookings:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  // Layout for salon owner dashboard
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Owner Dashboard' : 'لوحة تحكم المالك'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="dashboard" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                {isLtr ? 'Salon Dashboard' : 'لوحة تحكم الصالون'}
              </h1>
              <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                {isLtr 
                  ? 'View and manage your salon performance and operations' 
                  : 'عرض وإدارة أداء وعمليات صالونك'}
              </p>
            </header>

            {isSalonLoading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : salonError ? (
              // Error state
              <Card className="mb-8 border-destructive">
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
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Dashboard Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Bookings Card */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className={`text-sm font-medium text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Total Bookings' : 'إجمالي الحجوزات'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">182</p>
                          <p className="text-xs text-green-500 mt-1">
                            +24% {isLtr ? 'this month' : 'هذا الشهر'}
                          </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Revenue Card */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className={`text-sm font-medium text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Monthly Revenue' : 'الإيرادات الشهرية'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {isLtr ? 'SAR 12,580' : '١٢,٥٨٠ ر.س.'}
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            +15% {isLtr ? 'vs last month' : 'مقارنة بالشهر الماضي'}
                          </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Promotions Card */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className={`text-sm font-medium text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Active Promotions' : 'العروض النشطة'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">3</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isLtr ? 'Ends in 8 days' : 'تنتهي في ٨ أيام'}
                          </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Tag className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* New Customers Card */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className={`text-sm font-medium text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'New Customers' : 'العملاء الجدد'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">46</p>
                          <p className="text-xs text-green-500 mt-1">
                            +12% {isLtr ? 'this month' : 'هذا الشهر'}
                          </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Dashboard Content Tabs */}
                <Tabs defaultValue="overview" className="mb-8">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? 'Overview' : 'نظرة عامة'}
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? 'Bookings' : 'الحجوزات'}
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? 'Revenue' : 'الإيرادات'}
                    </TabsTrigger>
                    <TabsTrigger value="promotions" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? 'Promotions' : 'العروض'}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab Content */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Booking Summary Widget */}
                      <Card>
                        <CardHeader>
                          <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Bookings Summary' : 'ملخص الحجوزات'}
                          </CardTitle>
                          <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Last 7 days booking activity' : 'نشاط الحجز في آخر ٧ أيام'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <BookingsSummary isRtl={isRtl} />
                        </CardContent>
                      </Card>

                      {/* Revenue Chart Widget */}
                      <Card>
                        <CardHeader>
                          <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Revenue Trend' : 'اتجاه الإيرادات'}
                          </CardTitle>
                          <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Monthly revenue for 2025' : 'الإيرادات الشهرية لعام ٢٠٢٥'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <RevenueChart isRtl={isRtl} />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Bookings Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Recent Bookings' : 'الحجوزات الأخيرة'}
                        </CardTitle>
                        <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Latest booking activities for your salon' : 'أحدث أنشطة الحجز لصالونك'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RecentBookings 
                          bookings={recentBookings || []} 
                          isLoading={isBookingsLoading}
                          isRtl={isRtl}
                        />
                      </CardContent>
                    </Card>

                    {/* Upcoming Promotions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Current & Upcoming Promotions' : 'العروض الحالية والقادمة'}
                        </CardTitle>
                        <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Manage your active and scheduled promotions' : 'إدارة العروض النشطة والمجدولة'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <UpcomingPromotions isRtl={isRtl} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Placeholder for other tabs - we'll implement these in separate pages */}
                  <TabsContent value="bookings">
                    <Card>
                      <CardHeader>
                        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Detailed Bookings' : 'الحجوزات التفصيلية'}
                        </CardTitle>
                        <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr 
                            ? 'Visit the Bookings Management page for complete details and management options.' 
                            : 'قم بزيارة صفحة إدارة الحجوزات للحصول على تفاصيل كاملة وخيارات الإدارة.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <p className={`mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr 
                            ? 'For full booking management features, please go to the dedicated page.' 
                            : 'للحصول على ميزات إدارة الحجز الكاملة، يرجى الانتقال إلى الصفحة المخصصة.'}
                        </p>
                        <button 
                          onClick={() => navigate('/owner/bookings')}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                          {isLtr ? 'Go to Bookings Management' : 'الذهاب إلى إدارة الحجوزات'}
                        </button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Similar placeholders for other tabs */}
                  <TabsContent value="revenue" className="text-center py-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Financial Analytics' : 'التحليلات المالية'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <button 
                          onClick={() => navigate('/owner/analytics')}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                          {isLtr ? 'Go to Financial Analytics' : 'الذهاب إلى التحليلات المالية'}
                        </button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="promotions" className="text-center py-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Promotions & Offers' : 'العروض والتخفيضات'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <button 
                          onClick={() => navigate('/owner/promotions')}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                          {isLtr ? 'Go to Promotions Management' : 'الذهاب إلى إدارة العروض'}
                        </button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
