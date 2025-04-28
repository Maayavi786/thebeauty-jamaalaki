import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/apiRequest';
import { config } from '@/config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2, 
  Search, 
  Check, 
  X, 
  CalendarX, 
  Calendar, 
  Filter, 
  CheckCircle,
  Clock,
  XCircle 
} from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Define booking type
interface Booking {
  id: number;
  userId: number;
  salonId: number;
  serviceId: number;
  datetime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  pointsEarned?: number;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    phone?: string;
    email: string;
  };
  service?: {
    id: number;
    nameEn: string;
    nameAr: string;
    duration: number;
    price: number;
  };
}

const BookingsManagement = () => {
  const { isLtr, isRtl } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Redirect if not authenticated or not a salon owner
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Fetch bookings
  const {
    data: bookings,
    isLoading: isBookingsLoading,
    error: bookingsError
  } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.bookings}/salon`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch salon bookings:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && user?.role === 'salon_owner'
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const response = await apiRequest('PATCH', `${config.api.endpoints.bookings}/${bookingId}`, {
        status
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      toast.success(isLtr ? 'Booking updated successfully' : 'تم تحديث الحجز بنجاح');
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
      toast.error(
        isLtr 
          ? 'Failed to update booking. Please try again.' 
          : 'فشل في تحديث الحجز. يرجى المحاولة مرة أخرى.'
      );
    }
  });

  // Handle booking status update
  const handleStatusUpdate = (bookingId: number, newStatus: string) => {
    updateBookingMutation.mutate({ bookingId, status: newStatus });
  };

  // Apply filters to bookings
  const filteredBookings = bookings 
    ? (bookings as Booking[]).filter((booking: Booking) => {
        // Apply search filter
        const searchMatch = 
          searchQuery === '' ||
          booking.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.service?.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.service?.nameAr.includes(searchQuery);
        
        // Apply status filter
        const statusMatch = 
          statusFilter === 'all' || 
          booking.status === statusFilter;
        
        // Apply date filter
        let dateMatch = true;
        const bookingDate = new Date(booking.datetime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        if (dateFilter === 'today') {
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);
          dateMatch = bookingDate >= today && bookingDate <= endOfDay;
        } else if (dateFilter === 'tomorrow') {
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          dateMatch = bookingDate >= tomorrow && bookingDate <= endOfTomorrow;
        } else if (dateFilter === 'week') {
          dateMatch = bookingDate >= today && bookingDate <= nextWeek;
        }
        
        return searchMatch && statusMatch && dateMatch;
      })
    : [];

  // Sort bookings by datetime
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
  });

  // Format date based on language
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPp', {
      locale: isRtl ? ar : enUS,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            {isRtl ? 'تم التأكيد' : 'Confirmed'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {isRtl ? 'قيد الانتظار' : 'Pending'}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-800">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            {isRtl ? 'تم الإلغاء' : 'Cancelled'}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            {isRtl ? 'مكتمل' : 'Completed'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Bookings Management' : 'إدارة الحجوزات'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="bookings" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                {isLtr ? 'Bookings Management' : 'إدارة الحجوزات'}
              </h1>
              <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                {isLtr 
                  ? 'View and manage your salon bookings and appointments' 
                  : 'عرض وإدارة حجوزات ومواعيد صالونك'}
              </p>
            </header>

            {/* Filters Row */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={isLtr ? "Search by customer or service..." : "بحث حسب العميل أو الخدمة..."}
                  className={`pl-8 w-full ${isRtl ? 'font-tajawal' : ''}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className={isRtl ? 'font-tajawal' : ''}>
                    <SelectValue placeholder={isLtr ? "Status" : "الحالة"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "All Statuses" : "جميع الحالات"}
                    </SelectItem>
                    <SelectItem value="pending" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Pending" : "قيد الانتظار"}
                    </SelectItem>
                    <SelectItem value="confirmed" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Confirmed" : "تم التأكيد"}
                    </SelectItem>
                    <SelectItem value="cancelled" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Cancelled" : "تم الإلغاء"}
                    </SelectItem>
                    <SelectItem value="completed" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Completed" : "مكتمل"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="w-full sm:w-40">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className={isRtl ? 'font-tajawal' : ''}>
                    <SelectValue placeholder={isLtr ? "Date" : "التاريخ"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "All Dates" : "جميع التواريخ"}
                    </SelectItem>
                    <SelectItem value="today" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Today" : "اليوم"}
                    </SelectItem>
                    <SelectItem value="tomorrow" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "Tomorrow" : "غدًا"}
                    </SelectItem>
                    <SelectItem value="week" className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr ? "This Week" : "هذا الأسبوع"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isBookingsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : bookingsError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'Error Loading Bookings' : 'خطأ في تحميل الحجوزات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr 
                      ? 'There was a problem loading your bookings. Please try again later.' 
                      : 'حدثت مشكلة أثناء تحميل الحجوزات. يرجى المحاولة مرة أخرى لاحقًا.'}
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-bookings'] })}
                  >
                    {isLtr ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </CardContent>
              </Card>
            ) : sortedBookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                    {isLtr ? 'No Bookings Found' : 'لم يتم العثور على حجوزات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                      ? (isLtr 
                          ? 'No bookings match your current filters. Try adjusting your search criteria.' 
                          : 'لا توجد حجوزات تطابق المرشحات الحالية. حاول ضبط معايير البحث.')
                      : (isLtr 
                          ? 'No bookings available for your salon yet.' 
                          : 'لا توجد حجوزات متاحة لصالونك حتى الآن.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-card rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Customer' : 'العميل'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Service' : 'الخدمة'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Date & Time' : 'التاريخ والوقت'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Status' : 'الحالة'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Price' : 'السعر'}
                      </TableHead>
                      <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
                        {isLtr ? 'Actions' : 'الإجراءات'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBookings.map((booking: Booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                          <div>
                            <p>{booking.user?.fullName || 'Unknown Customer'}</p>
                            {booking.user?.phone && (
                              <p className="text-xs text-muted-foreground">{booking.user.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr 
                            ? booking.service?.nameEn || 'Unknown Service'
                            : booking.service?.nameAr || 'خدمة غير معروفة'}
                          {booking.service?.duration && (
                            <p className="text-xs text-muted-foreground">
                              {isRtl 
                                ? `${booking.service.duration} دقيقة`
                                : `${booking.service.duration} min`}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className={isRtl ? 'font-tajawal' : ''}>
                          {formatDateTime(booking.datetime)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.service?.price
                            ? (isRtl 
                                ? `${booking.service.price.toLocaleString('ar-SA')} ر.س`
                                : `SAR ${booking.service.price.toLocaleString('en-US')}`)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'تأكيد' : 'Confirm'}
                                  </span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'إلغاء' : 'Cancel'}
                                  </span>
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                                  onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'إكمال' : 'Complete'}
                                  </span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  <span className={isRtl ? 'font-tajawal' : ''}>
                                    {isRtl ? 'إلغاء' : 'Cancel'}
                                  </span>
                                </Button>
                              </>
                            )}
                            {(booking.status === 'cancelled' || booking.status === 'completed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => alert(
                                  isLtr 
                                    ? 'View booking details feature coming soon.' 
                                    : 'ميزة عرض تفاصيل الحجز قادمة قريبًا.'
                                )}
                              >
                                <span className={isRtl ? 'font-tajawal' : ''}>
                                  {isRtl ? 'عرض' : 'View'}
                                </span>
                              </Button>
                            )}
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

export default BookingsManagement;
