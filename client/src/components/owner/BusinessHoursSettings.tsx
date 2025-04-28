import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { config } from '@/config';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Clock, Save, Plus, Trash } from 'lucide-react';

interface TimeSlot {
  open: string;
  close: string;
}

interface BusinessHours {
  monday: { isOpen: boolean; timeSlots: TimeSlot[] };
  tuesday: { isOpen: boolean; timeSlots: TimeSlot[] };
  wednesday: { isOpen: boolean; timeSlots: TimeSlot[] };
  thursday: { isOpen: boolean; timeSlots: TimeSlot[] };
  friday: { isOpen: boolean; timeSlots: TimeSlot[] };
  saturday: { isOpen: boolean; timeSlots: TimeSlot[] };
  sunday: { isOpen: boolean; timeSlots: TimeSlot[] };
}

const DEFAULT_TIME_SLOT: TimeSlot = { open: '09:00', close: '18:00' };

const BusinessHoursSettings = () => {
  const { isLtr, isRtl } = useLanguage();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch business hours
  const {
    data: businessHours,
    isLoading,
    error
  } = useQuery({
    queryKey: ['business-hours'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `${config.api.endpoints.salons}/business-hours`);
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error('Failed to fetch business hours:', error);
        throw error;
      }
    },
  });

  // Initial business hours (fallback if API data is not available)
  const defaultBusinessHours: BusinessHours = {
    monday: { isOpen: true, timeSlots: [{ open: '09:00', close: '18:00' }] },
    tuesday: { isOpen: true, timeSlots: [{ open: '09:00', close: '18:00' }] },
    wednesday: { isOpen: true, timeSlots: [{ open: '09:00', close: '18:00' }] },
    thursday: { isOpen: true, timeSlots: [{ open: '09:00', close: '18:00' }] },
    friday: { isOpen: true, timeSlots: [{ open: '09:00', close: '18:00' }] },
    saturday: { isOpen: true, timeSlots: [{ open: '09:00', close: '17:00' }] },
    sunday: { isOpen: false, timeSlots: [{ open: '09:00', close: '17:00' }] },
  };

  // State for business hours
  const [hours, setHours] = useState<BusinessHours>(
    businessHours || defaultBusinessHours
  );

  // Update state when data is loaded
  React.useEffect(() => {
    if (businessHours) {
      setHours(businessHours);
    }
  }, [businessHours]);

  // Update business hours mutation
  const updateBusinessHoursMutation = useMutation({
    mutationFn: async (data: BusinessHours) => {
      setIsSaving(true);
      const response = await apiRequest('PUT', `${config.api.endpoints.salons}/business-hours`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-hours'] });
      toast.success(isLtr ? 'Business hours updated successfully' : 'تم تحديث ساعات العمل بنجاح');
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error updating business hours:', error);
      toast.error(
        isLtr 
          ? 'Failed to update business hours. Please try again.' 
          : 'فشل في تحديث ساعات العمل. يرجى المحاولة مرة أخرى.'
      );
      setIsSaving(false);
    }
  });

  // Handle day toggle
  const handleDayToggle = (day: keyof BusinessHours) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  // Handle time slot change
  const handleTimeSlotChange = (
    day: keyof BusinessHours,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setHours((prev) => {
      const updatedTimeSlots = [...prev[day].timeSlots];
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value,
      };
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: updatedTimeSlots,
        },
      };
    });
  };

  // Add time slot
  const addTimeSlot = (day: keyof BusinessHours) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, DEFAULT_TIME_SLOT],
      },
    }));
  };

  // Remove time slot
  const removeTimeSlot = (day: keyof BusinessHours, index: number) => {
    setHours((prev) => {
      const updatedTimeSlots = prev[day].timeSlots.filter((_, i) => i !== index);
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: updatedTimeSlots.length ? updatedTimeSlots : [DEFAULT_TIME_SLOT],
        },
      };
    });
  };

  // Apply same hours to all days
  const applyToAllDays = (sourceDay: keyof BusinessHours) => {
    const sourceDayData = hours[sourceDay];
    
    const days: (keyof BusinessHours)[] = [
      'monday', 'tuesday', 'wednesday', 'thursday', 
      'friday', 'saturday', 'sunday'
    ];
    
    const updatedHours = { ...hours };
    
    days.forEach((day) => {
      if (day !== sourceDay) {
        updatedHours[day] = { ...sourceDayData };
      }
    });
    
    setHours(updatedHours);
    
    toast.success(
      isLtr 
        ? `Applied ${sourceDay}'s hours to all days` 
        : `تم تطبيق ساعات ${getArabicDayName(sourceDay)} على جميع الأيام`
    );
  };

  // Handle save
  const handleSave = () => {
    updateBusinessHoursMutation.mutate(hours);
  };

  // Helper function to get day name in Arabic
  const getArabicDayName = (day: string): string => {
    const dayMap: Record<string, string> = {
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
    };
    
    return dayMap[day] || day;
  };

  // Helper function to get day name based on language
  const getDayName = (day: string): string => {
    if (isLtr) {
      return day.charAt(0).toUpperCase() + day.slice(1);
    } else {
      return getArabicDayName(day);
    }
  };

  // Days of the week
  const daysOfWeek: (keyof BusinessHours)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={isRtl ? 'font-tajawal' : ''}>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            {isLtr ? 'Business Hours' : 'ساعات العمل'}
          </div>
        </CardTitle>
        <CardDescription className={isRtl ? 'font-tajawal' : ''}>
          {isLtr 
            ? 'Set your salon operating hours for each day of the week'
            : 'حدد ساعات عمل صالونك لكل يوم من أيام الأسبوع'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className={`text-destructive mb-4 ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr 
                ? 'Failed to load business hours. Please try again.'
                : 'فشل في تحميل ساعات العمل. يرجى المحاولة مرة أخرى.'}
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['business-hours'] })}
              variant="outline"
            >
              {isLtr ? 'Retry' : 'إعادة المحاولة'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRtl ? 'font-tajawal text-right' : ''} style={{ width: '20%' }}>
                    {isLtr ? 'Day' : 'اليوم'}
                  </TableHead>
                  <TableHead className={isRtl ? 'font-tajawal text-right' : ''} style={{ width: '15%' }}>
                    {isLtr ? 'Open' : 'مفتوح'}
                  </TableHead>
                  <TableHead className={isRtl ? 'font-tajawal text-right' : ''} style={{ width: '55%' }}>
                    {isLtr ? 'Hours' : 'الساعات'}
                  </TableHead>
                  <TableHead className={isRtl ? 'font-tajawal text-right' : ''} style={{ width: '10%' }}>
                    {isLtr ? 'Actions' : 'الإجراءات'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daysOfWeek.map((day) => (
                  <TableRow key={day}>
                    <TableCell className={`font-medium ${isRtl ? 'font-tajawal text-right' : ''}`}>
                      {getDayName(day)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={hours[day].isOpen}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                    </TableCell>
                    <TableCell>
                      {hours[day].isOpen ? (
                        <div className="space-y-3">
                          {hours[day].timeSlots.map((timeSlot, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                                <div className="relative">
                                  <Input
                                    type="time"
                                    value={timeSlot.open}
                                    onChange={(e) => 
                                      handleTimeSlotChange(day, index, 'open', e.target.value)
                                    }
                                    className={isRtl ? 'text-right' : ''}
                                  />
                                </div>
                                <div className="relative">
                                  <Input
                                    type="time"
                                    value={timeSlot.close}
                                    onChange={(e) => 
                                      handleTimeSlotChange(day, index, 'close', e.target.value)
                                    }
                                    className={isRtl ? 'text-right' : ''}
                                  />
                                </div>
                              </div>
                              
                              {hours[day].timeSlots.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTimeSlot(day, index)}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(day)}
                            className={isRtl ? 'font-tajawal' : ''}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {isLtr ? 'Add Time Slot' : 'إضافة فترة زمنية'}
                          </Button>
                        </div>
                      ) : (
                        <span className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                          {isLtr ? 'Closed' : 'مغلق'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applyToAllDays(day)}
                        disabled={!hours[day].isOpen}
                        className={isRtl ? 'font-tajawal' : ''}
                      >
                        {isLtr ? 'Apply to All' : 'تطبيق على الكل'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className={isRtl ? 'font-tajawal' : ''}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {isLtr ? 'Save Changes' : 'حفظ التغييرات'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessHoursSettings;
