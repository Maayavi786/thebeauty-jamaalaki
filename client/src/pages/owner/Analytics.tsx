import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subMonths, isValid, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  Loader2,
  CalendarIcon,
  TrendingUp,
  Users,
  Clock,
  Download,
  Scissors,
  DollarSign,
} from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart,
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from 'recharts';

const Analytics = () => {
  const { isLtr, isRtl } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  const [timeRange, setTimeRange] = React.useState('last6Months');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // Redirect if not authenticated or not a salon owner
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Get date range based on selected timeRange
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'last30Days':
        startDate = subMonths(endDate, 1);
        break;
      case 'last3Months':
        startDate = subMonths(endDate, 3);
        break;
      case 'last6Months':
        startDate = subMonths(endDate, 6);
        break;
      case 'lastYear':
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 6);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const dateRange = getDateRange();

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading
  } = useQuery({
    queryKey: ['salon-analytics', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          'GET', 
          `${config.api.endpoints.salons}/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Sample data for new development
  const sampleRevenueData = [
    { month: '1', revenue: 3200, bookings: 12 },
    { month: '2', revenue: 4500, bookings: 18 },
    { month: '3', revenue: 5200, bookings: 22 },
    { month: '4', revenue: 4800, bookings: 19 },
    { month: '5', revenue: 6100, bookings: 25 },
    { month: '6', revenue: 8000, bookings: 33 },
  ];

  const samplePopularServicesData = [
    { name: isRtl ? 'قص الشعر' : 'Haircut', value: 35 },
    { name: isRtl ? 'صبغ الشعر' : 'Hair Color', value: 25 },
    { name: isRtl ? 'تصفيف الشعر' : 'Hair Styling', value: 20 },
    { name: isRtl ? 'العناية بالوجه' : 'Facial', value: 15 },
    { name: isRtl ? 'المانيكير والباديكير' : 'Manicure & Pedicure', value: 5 },
  ];

  const sampleBookingTimeData = [
    { time: '9-11', bookings: 15 },
    { time: '11-13', bookings: 22 },
    { time: '13-15', bookings: 28 },
    { time: '15-17', bookings: 32 },
    { time: '17-19', bookings: 26 },
    { time: '19-21', bookings: 18 },
  ];

  const sampleCustomerRetentionData = [
    { name: isRtl ? 'عملاء جدد' : 'New Customers', value: 35 },
    { name: isRtl ? 'عملاء عائدون (2-5 زيارات)' : 'Returning (2-5 visits)', value: 40 },
    { name: isRtl ? 'عملاء منتظمون (6+ زيارات)' : 'Regular (6+ visits)', value: 25 },
  ];

  const samplePromotionPerformanceData = [
    { name: isRtl ? 'عرض رمضان' : 'Ramadan Special', revenue: 8500, bookings: 45 },
    { name: isRtl ? 'باقة العروس' : 'Bridal Package', revenue: 12000, bookings: 18 },
    { name: isRtl ? 'اليوم الوطني' : 'National Day', revenue: 6200, bookings: 28 },
    { name: isRtl ? 'خصم نهاية الأسبوع' : 'Weekend Discount', revenue: 4800, bookings: 32 },
  ];

  // Use sample data if no analytics data is available yet
  const revenueData = analyticsData?.revenueData || sampleRevenueData;
  const popularServicesData = analyticsData?.popularServicesData || samplePopularServicesData;
  const bookingTimeData = analyticsData?.bookingTimeData || sampleBookingTimeData;
  const customerRetentionData = analyticsData?.customerRetentionData || sampleCustomerRetentionData;
  const promotionPerformanceData = analyticsData?.promotionPerformanceData || samplePromotionPerformanceData;

  // Custom colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  const revenueChartColor = '#8884d8';
  const bookingsChartColor = '#82ca9d';

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Analytics' : 'التحليلات'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="analytics" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                  {isLtr ? 'Analytics & Insights' : 'التحليلات والرؤى'}
                </h1>
                <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                  {isLtr 
                    ? 'Monitor your salon performance and make data-driven decisions' 
                    : 'راقب أداء صالونك واتخذ قرارات مبنية على البيانات'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={isLtr ? "Select time range" : "اختر نطاق زمني"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last30Days">
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Last 30 Days' : 'آخر 30 يوم'}
                      </span>
                    </SelectItem>
                    <SelectItem value="last3Months">
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Last 3 Months' : 'آخر 3 أشهر'}
                      </span>
                    </SelectItem>
                    <SelectItem value="last6Months">
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Last 6 Months' : 'آخر 6 أشهر'}
                      </span>
                    </SelectItem>
                    <SelectItem value="lastYear">
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Last Year' : 'العام الماضي'}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-[240px] justify-start text-left font-normal ${isRtl ? 'font-tajawal' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: isRtl ? ar : enUS })
                      ) : (
                        <span>{isLtr ? "Pick a date" : "اختر تاريخًا"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  <span className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Export Report' : 'تصدير التقرير'}
                  </span>
                </Button>
              </div>
            </header>

            {isAnalyticsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Revenue & Bookings Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? 'Revenue & Bookings Trends' : 'اتجاهات الإيرادات والحجوزات'}
                    </CardTitle>
                    <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr 
                        ? 'Monthly revenue and booking count over time' 
                        : 'الإيرادات الشهرية وعدد الحجوزات على مدار الوقت'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            reversed={isRtl}
                          />
                          <YAxis yAxisId="left" orientation={isRtl ? "right" : "left"} />
                          <YAxis yAxisId="right" orientation={isRtl ? "left" : "right"} />
                          <Tooltip />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name={isLtr ? "Revenue (SAR)" : "الإيرادات (ر.س)"}
                            stroke={revenueChartColor}
                            fill={revenueChartColor}
                            fillOpacity={0.3}
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="bookings"
                            name={isLtr ? "Bookings" : "الحجوزات"}
                            stroke={bookingsChartColor}
                            fill={bookingsChartColor}
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top row of insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Popular Services */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        <div className="flex items-center">
                          <Scissors className="mr-2 h-5 w-5" />
                          {isLtr ? 'Popular Services' : 'الخدمات الشائعة'}
                        </div>
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Most booked services by percentage' 
                          : 'الخدمات الأكثر حجزًا حسب النسبة المئوية'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center justify-center">
                        <div className="w-64 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={popularServicesData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {popularServicesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number) => [`${value}%`, isLtr ? 'Percentage' : 'النسبة']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4">
                          <ul className="space-y-2">
                            {popularServicesData.map((entry, index) => (
                              <li key={index} className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className={`text-sm ${isRtl ? 'font-tajawal' : ''}`}>
                                  {entry.name}: {entry.value}%
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Retention */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        <div className="flex items-center">
                          <Users className="mr-2 h-5 w-5" />
                          {isLtr ? 'Customer Retention' : 'الاحتفاظ بالعملاء'}
                        </div>
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Customer visit frequency analysis' 
                          : 'تحليل تكرار زيارات العملاء'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center justify-center">
                        <div className="w-64 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={customerRetentionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {customerRetentionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number) => [`${value}%`, isLtr ? 'Percentage' : 'النسبة']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4">
                          <ul className="space-y-2">
                            {customerRetentionData.map((entry, index) => (
                              <li key={index} className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className={`text-sm ${isRtl ? 'font-tajawal' : ''}`}>
                                  {entry.name}: {entry.value}%
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom row of insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Time Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-5 w-5" />
                          {isLtr ? 'Booking Time Distribution' : 'توزيع أوقات الحجز'}
                        </div>
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Most popular times of day for bookings' 
                          : 'أكثر أوقات اليوم شيوعًا للحجوزات'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={bookingTimeData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="time" 
                              reversed={isRtl}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [value, isLtr ? 'Bookings' : 'الحجوزات']}
                              labelFormatter={(value) => isLtr ? `Time: ${value}` : `الوقت: ${value}`}
                            />
                            <Bar 
                              dataKey="bookings" 
                              name={isLtr ? "Bookings" : "الحجوزات"} 
                              fill="#8884d8" 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promotion Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-5 w-5" />
                          {isLtr ? 'Promotion Performance' : 'أداء العروض الترويجية'}
                        </div>
                      </CardTitle>
                      <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr 
                          ? 'Revenue generated by promotions' 
                          : 'الإيرادات الناتجة عن العروض الترويجية'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={promotionPerformanceData}
                            layout="vertical"
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={100}
                              reversed={isRtl}
                            />
                            <Tooltip 
                              formatter={(value: number, name: string) => {
                                if (name === 'revenue') {
                                  return [`${value} SAR`, isLtr ? 'Revenue' : 'الإيرادات'];
                                }
                                return [value, isLtr ? 'Bookings' : 'الحجوزات'];
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="revenue" 
                              name={isLtr ? "Revenue (SAR)" : "الإيرادات (ر.س)"} 
                              fill="#8884d8" 
                            />
                            <Bar 
                              dataKey="bookings" 
                              name={isLtr ? "Bookings" : "الحجوزات"} 
                              fill="#82ca9d" 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
