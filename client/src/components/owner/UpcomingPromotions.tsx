import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Clock, Edit, Trash } from 'lucide-react';

interface UpcomingPromotionsProps {
  isRtl: boolean;
}

const UpcomingPromotions: React.FC<UpcomingPromotionsProps> = ({ isRtl }) => {
  // Sample data - in a real app, this would come from API
  const promotions = [
    {
      id: 1,
      title: isRtl ? 'عرض رمضان الخاص' : 'Ramadan Special Offer',
      description: isRtl
        ? 'خصم 25% على جميع خدمات العناية بالبشرة خلال شهر رمضان المبارك'
        : '25% discount on all skincare services during the holy month of Ramadan',
      startDate: '2025-02-25',
      endDate: '2025-03-25',
      discountPercentage: 25,
      isActive: true,
      services: [
        isRtl ? 'تنظيف البشرة العميق' : 'Deep Facial Cleansing',
        isRtl ? 'تقشير الوجه' : 'Face Peeling',
        isRtl ? 'قناع الترطيب' : 'Hydration Mask',
      ],
    },
    {
      id: 2,
      title: isRtl ? 'باقة زفاف مميزة' : 'Premium Wedding Package',
      description: isRtl
        ? 'باقة شاملة للعرائس تتضمن المكياج، تصفيف الشعر، والمانيكير والباديكير'
        : 'Comprehensive bridal package including makeup, hairstyling, and mani-pedi',
      startDate: '2025-04-01',
      endDate: '2025-06-30',
      discountPercentage: 15,
      isActive: true,
      services: [
        isRtl ? 'مكياج عروس كامل' : 'Full Bridal Makeup',
        isRtl ? 'تصفيف شعر العروس' : 'Bridal Hairstyling',
        isRtl ? 'مانيكير وباديكير' : 'Manicure & Pedicure',
      ],
    },
    {
      id: 3,
      title: isRtl ? 'عرض اليوم الوطني' : 'National Day Promotion',
      description: isRtl
        ? 'احتفالاً باليوم الوطني السعودي، استمتعي بخصم 20% على جميع الخدمات'
        : 'Celebrating Saudi National Day with 20% off on all services',
      startDate: '2025-09-15',
      endDate: '2025-09-25',
      discountPercentage: 20,
      isActive: false,
      services: [
        isRtl ? 'جميع الخدمات' : 'All Services',
      ],
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isRtl
      ? date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {promotions.map((promo) => (
        <Card key={promo.id} className={`overflow-hidden ${promo.isActive ? 'border-primary/30' : 'border-muted'}`}>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Colored sidebar indicating active status */}
              <div 
                className={`w-full md:w-1 h-2 md:h-auto ${promo.isActive ? 'bg-primary' : 'bg-muted'}`}
              ></div>
              
              <div className="p-4 md:p-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    {/* Title and status */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-lg ${isRtl ? 'font-tajawal' : ''}`}>
                        {promo.title}
                      </h3>
                      <Badge 
                        variant={promo.isActive ? "default" : "outline"}
                        className={promo.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                      >
                        {promo.isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'قادم' : 'Upcoming')}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {`-${promo.discountPercentage}%`}
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className={`text-muted-foreground text-sm mb-3 ${isRtl ? 'font-tajawal' : ''}`}>
                      {promo.description}
                    </p>
                    
                    {/* Dates */}
                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                      </span>
                    </div>
                    
                    {/* Services included */}
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isRtl ? 'الخدمات المشمولة:' : 'Services Included:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {promo.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="bg-background">
                            <Tag className="h-3 w-3 mr-1" />
                            <span className={isRtl ? 'font-tajawal' : ''}>{service}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-row md:flex-col gap-2 self-start mt-4 md:mt-0">
                    <Button variant="outline" size="sm" className="text-primary">
                      <Edit className="h-4 w-4 mr-1" />
                      <span className={isRtl ? 'font-tajawal' : ''}>
                        {isRtl ? 'تعديل' : 'Edit'}
                      </span>
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
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
      ))}
      
      {/* Add New Promotion Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          className="border-dashed border-2 w-full py-6"
        >
          <span className={`${isRtl ? 'font-tajawal' : ''}`}>
            {isRtl ? '+ إضافة عرض جديد' : '+ Add New Promotion'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default UpcomingPromotions;
