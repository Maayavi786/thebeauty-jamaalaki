import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, Clock, XCircle, CalendarX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Booking {
  id: string | number;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface RecentBookingsProps {
  bookings: Booking[];
  isLoading: boolean;
  isRtl: boolean;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ 
  bookings = [], 
  isLoading,
  isRtl
}) => {
  // If no real bookings provided, use sample data
  const displayBookings = bookings.length > 0 ? bookings : [
    {
      id: 1,
      customerName: 'Sara Ahmed',
      serviceName: isRtl ? 'قص الشعر والتصفيف' : 'Haircut & Styling',
      date: '2025-04-28',
      time: '14:30',
      status: 'confirmed' as const,
    },
    {
      id: 2,
      customerName: 'Lina Mohammed',
      serviceName: isRtl ? 'صبغة شعر كاملة' : 'Full Hair Coloring',
      date: '2025-04-28',
      time: '16:00',
      status: 'pending' as const,
    },
    {
      id: 3,
      customerName: 'Nora Al-Saud',
      serviceName: isRtl ? 'مكياج كامل' : 'Full Makeup',
      date: '2025-04-29',
      time: '10:15',
      status: 'confirmed' as const,
    },
    {
      id: 4,
      customerName: 'Amal Hassan',
      serviceName: isRtl ? 'علاج بالكيراتين' : 'Keratin Treatment',
      date: '2025-04-27',
      time: '13:45',
      status: 'completed' as const,
    },
    {
      id: 5,
      customerName: 'Layla Abdulaziz',
      serviceName: isRtl ? 'مانيكير وباديكير' : 'Manicure & Pedicure',
      date: '2025-04-27',
      time: '09:30',
      status: 'cancelled' as const,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isRtl
      ? date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
              {isRtl ? 'العميل' : 'Customer'}
            </TableHead>
            <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
              {isRtl ? 'الخدمة' : 'Service'}
            </TableHead>
            <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
              {isRtl ? 'التاريخ والوقت' : 'Date & Time'}
            </TableHead>
            <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
              {isRtl ? 'الحالة' : 'Status'}
            </TableHead>
            <TableHead className={isRtl ? 'font-tajawal text-right' : ''}>
              {isRtl ? 'الإجراءات' : 'Actions'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                {booking.customerName}
              </TableCell>
              <TableCell className={isRtl ? 'font-tajawal' : ''}>
                {booking.serviceName}
              </TableCell>
              <TableCell className={isRtl ? 'font-tajawal' : ''}>
                {formatDate(booking.date)} <span className="text-muted-foreground">{booking.time}</span>
              </TableCell>
              <TableCell>
                {getStatusBadge(booking.status)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  {booking.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className={isRtl ? 'font-tajawal' : ''}>
                        {isRtl ? 'تأكيد' : 'Confirm'}
                      </Button>
                      <Button variant="outline" size="sm" className={`text-destructive ${isRtl ? 'font-tajawal' : ''}`}>
                        {isRtl ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button variant="outline" size="sm" className={isRtl ? 'font-tajawal' : ''}>
                      {isRtl ? 'تفاصيل' : 'Details'}
                    </Button>
                  )}
                  {booking.status === 'completed' && (
                    <Button variant="outline" size="sm" className={isRtl ? 'font-tajawal' : ''}>
                      {isRtl ? 'عرض السجل' : 'View Record'}
                    </Button>
                  )}
                  {booking.status === 'cancelled' && (
                    <Button variant="outline" size="sm" className={isRtl ? 'font-tajawal' : ''}>
                      {isRtl ? 'إعادة جدولة' : 'Reschedule'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentBookings;
