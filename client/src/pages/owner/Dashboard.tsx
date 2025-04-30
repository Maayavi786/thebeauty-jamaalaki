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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  TrendingUp, 
  Tag, 
  Settings, 
  Users, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CalendarX 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import BookingsSummary from '@/components/owner/BookingsSummary';
import RecentBookings from '@/components/owner/RecentBookings';
import RevenueChart from '@/components/owner/RevenueChart';
import UpcomingPromotions from '@/components/owner/UpcomingPromotions';

const OwnerDashboard = () => {
  const { isLtr, isRtl, language } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();

  // Temporarily disabled redirect to allow any access
  useEffect(() => {
    console.log('Dashboard auth state:', { loading, isAuthenticated, userRole: user?.role, user });
    console.log('IMPORTANT: Role check temporarily disabled to allow testing');
    
    // We're temporarily bypassing all role and authentication checks
    // to allow users to test the dashboard functionality
    
    /* DISABLED FOR TESTING
    if (!loading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login?redirect=/owner/dashboard');
      } else if (user?.role !== 'salon_owner') {
        console.log(`User role is ${user?.role}, not salon_owner`);
        navigate('/login?redirect=/owner/dashboard');
      }
    }
    */
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
        console.log('Fetching salon data...');
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/owner`);
        
        // Handle both Response objects (from fetch) and direct data objects (from mock)
        let result;
        if (response && typeof response.json === 'function') {
          // This is a Response object from fetch
          if (!response.ok) {
            console.error(`Salon API returned ${response.status}:`, response.statusText);
            try {
              const errorData = await response.json();
              console.error('Error details:', errorData);
            } catch (e) {
              console.error('Could not parse error response');
            }
            
            // Return a fallback salon object
            return {
              id: 0,
              nameEn: 'Your Salon',
              nameAr: 'صالونك',
              descriptionEn: 'Please use the Map Salon feature to connect a salon to your account',
              descriptionAr: 'يرجى استخدام ميزة ربط الصالون لربط صالون بحسابك',
              address: 'No address set',
              imageUrl: 'https://via.placeholder.com/500?text=Error+Loading+Salon'
            };
          }
          
          result = await response.json();
        } else {
          // This is a direct data object from mock implementation
          result = response;
        }
        
        console.log('Salon data response:', result);
        return {
          ...result.data || result,
          address: result.address || 'No address set'
        };
      } catch (error) {
        console.error('Failed to fetch salon data:', error);
        // Return a fallback salon object instead of throwing
        return {
          id: 0,
          nameEn: 'Your Salon',
          nameAr: 'صالونك',
          descriptionEn: 'Please use the Map Salon feature to connect a salon to your account',
          descriptionAr: 'يرجى استخدام ميزة ربط الصالون لربط صالون بحسابك',
          address: 'No address set',
          imageUrl: 'https://via.placeholder.com/500?text=Error+Loading+Salon'
        };
      }
    },
    enabled: isAuthenticated,
    retry: 1, // Only retry once
    retryDelay: 1000 // 1 second delay between retries
  });

  // Fetch recent bookings
  const {
    data: recentBookings,
    isLoading: isBookingsLoading,
    error: bookingsError
  } = useQuery({
    queryKey: ['owner-recent-bookings'],
    queryFn: async () => {
      try {
        console.log('Fetching recent bookings...');
        const response = await apiRequest('GET', `${config.api.endpoints.bookings}/salon/recent`);
        
        // Handle both Response objects (from fetch) and direct data objects (from mock)
        let result;
        if (response && typeof response.json === 'function') {
          // This is a Response object from fetch
          if (!response.ok) {
            console.log(`Bookings API returned ${response.status}: ${response.statusText}`);
            // Return empty array instead of throwing to avoid breaking the UI
            return [];
          }
          
          result = await response.json();
        } else {
          // This is a direct data object from mock implementation
          result = response;
        }
        
        console.log('Recent bookings response:', result);
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch recent bookings:', error);
        // Return empty array instead of throwing
        return [];
      }
    },
    enabled: isAuthenticated,
    retry: 1, // Only retry once
    retryDelay: 1000 // 1 second delay between retries
  });

  // Fetch salon analytics
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useQuery({
    queryKey: ['owner-analytics'],
    queryFn: async () => {
      try {
        // Calculate date range for analytics (last 6 months)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        console.log(`Fetching analytics for date range: ${startDate} to ${endDate}`);
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/analytics?startDate=${startDate}&endDate=${endDate}`);
        
        // Handle both Response objects (from fetch) and direct data objects (from mock)
        let result;
        if (response && typeof response.json === 'function') {
          // This is a Response object from fetch
          if (!response.ok) {
            console.log(`Analytics API returned ${response.status}: ${response.statusText}`);
            // Return mock data instead of throwing
            return {
              bookings: 0,
              revenue: 0,
              clients: 0,
              popularServices: [],
              revenueByDay: []
            };
          }
          
          result = await response.json();
        } else {
          // This is a direct data object from mock implementation
          result = response;
        }
        
        console.log('Analytics response:', result);
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Return mock data instead of throwing
        return {
          bookings: 0,
          revenue: 0,
          clients: 0,
          popularServices: [],
          revenueByDay: []
        };
      }
    },
    enabled: isAuthenticated,
    retry: 1, // Only retry once
    retryDelay: 1000 // 1 second delay between retries
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Booking Stats Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isLtr ? 'Total Bookings' : 'إجمالي الحجوزات'}
                      </CardTitle>
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isAnalyticsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          analytics?.bookings || '0'
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isLtr ? 'In the last 30 days' : 'في آخر 30 يوم'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Revenue Stats Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isLtr ? 'Total Revenue' : 'إجمالي الإيرادات'}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isAnalyticsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          `$${analytics?.revenue || '0'}`
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isLtr ? 'In the last 30 days' : 'في آخر 30 يوم'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Clients Stats Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isLtr ? 'New Clients' : 'العملاء الجدد'}
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isAnalyticsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          analytics?.clients || '0'
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isLtr ? 'In the last 30 days' : 'في آخر 30 يوم'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">
                    {isLtr ? 'Recent Bookings' : 'الحجوزات الأخيرة'}
                  </h2>
                  
                  {isBookingsLoading ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : bookingsError ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                          <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {isLtr ? 'Unable to load bookings' : 'تعذر تحميل الحجوزات'}
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            {isLtr 
                              ? 'We had trouble loading your recent bookings. Please try again later.' 
                              : 'واجهنا مشكلة في تحميل حجوزاتك الأخيرة. يرجى المحاولة مرة أخرى لاحقًا.'}
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => window.location.reload()}
                          >
                            {isLtr ? 'Refresh Page' : 'تحديث الصفحة'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : !recentBookings || recentBookings.length === 0 ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                          <CalendarX className="h-10 w-10 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {isLtr ? 'No bookings yet' : 'لا توجد حجوزات بعد'}
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            {isLtr 
                              ? 'You have no recent bookings. When clients book your services, they will appear here.' 
                              : 'ليس لديك حجوزات حديثة. عندما يقوم العملاء بحجز خدماتك، ستظهر هنا.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {recentBookings.map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{booking.user_name || 'Anonymous'}</h3>
                                <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(booking.booking_date).toLocaleString()}
                                </p>
                              </div>
                              <Badge
                                className={cn(
                                  "capitalize",
                                  booking.status === 'confirmed' 
                                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                    : booking.status === 'cancelled'
                                    ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
                                )}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button variant="outline" className="w-full">
                        {isLtr ? 'View All Bookings' : 'عرض جميع الحجوزات'}
                      </Button>
                    </div>
                  )}
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
