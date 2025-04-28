import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

const OwnerTest = () => {
  const { isLtr } = useLanguage();
  const [_, navigate] = useLocation();

  const ownerPages = [
    { name: isLtr ? 'Dashboard' : 'لوحة التحكم', path: '/owner/dashboard' },
    { name: isLtr ? 'Salon Profile' : 'ملف الصالون', path: '/owner/salon-profile' },
    { name: isLtr ? 'Services' : 'الخدمات', path: '/owner/services' },
    { name: isLtr ? 'Bookings' : 'الحجوزات', path: '/owner/bookings' },
    { name: isLtr ? 'Promotions' : 'العروض', path: '/owner/promotions' },
    { name: isLtr ? 'Analytics' : 'التحليلات', path: '/owner/analytics' },
    { name: isLtr ? 'Settings' : 'الإعدادات', path: '/owner/settings' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Owner Portal Test Access</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">
          Salon Owner Portal Test Access
        </h1>
        
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Click on any button below to access owner pages:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerPages.map((page) => (
              <Button 
                key={page.path}
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => navigate(page.path)}
              >
                {page.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerTest;
