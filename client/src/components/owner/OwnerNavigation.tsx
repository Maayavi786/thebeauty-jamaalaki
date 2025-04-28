import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  CalendarDays,
  Home,
  Scissors,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OwnerNavigationProps {
  activePage: string;
}

const OwnerNavigation: React.FC<OwnerNavigationProps> = ({ activePage }) => {
  const { isLtr, isRtl } = useLanguage();
  const { user, logout } = useAuth();
  const [_, navigate] = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      name: isLtr ? 'Dashboard' : 'لوحة التحكم',
      icon: <Home className="h-5 w-5" />,
      path: '/owner/dashboard',
    },
    {
      id: 'salon',
      name: isLtr ? 'Salon Profile' : 'ملف الصالون',
      icon: <Store className="h-5 w-5" />,
      path: '/owner/salon',
    },
    {
      id: 'services',
      name: isLtr ? 'Services' : 'الخدمات',
      icon: <Scissors className="h-5 w-5" />,
      path: '/owner/services',
    },
    {
      id: 'bookings',
      name: isLtr ? 'Bookings' : 'الحجوزات',
      icon: <CalendarDays className="h-5 w-5" />,
      path: '/owner/bookings',
    },
    {
      id: 'promotions',
      name: isLtr ? 'Promotions' : 'العروض',
      icon: <Tag className="h-5 w-5" />,
      path: '/owner/promotions',
    },
    {
      id: 'customers',
      name: isLtr ? 'Customers' : 'العملاء',
      icon: <Users className="h-5 w-5" />,
      path: '/owner/customers',
    },
    {
      id: 'analytics',
      name: isLtr ? 'Analytics' : 'التحليلات',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/owner/analytics',
    },
    {
      id: 'inventory',
      name: isLtr ? 'Inventory' : 'المخزون',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/owner/inventory',
    },
    {
      id: 'settings',
      name: isLtr ? 'Settings' : 'الإعدادات',
      icon: <Settings className="h-5 w-5" />,
      path: '/owner/settings',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <h2 className={`text-2xl font-semibold text-primary ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
            {isLtr ? 'Jamaalaki' : 'جمالكي'}
          </h2>
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.fullName || 'Salon Owner'
              )}&background=D4AF37&color=fff&size=256`}
              alt={user?.fullName}
            />
            <AvatarFallback>
              {user?.fullName
                ? user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'SO'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className={`font-medium text-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {user?.fullName || (isLtr ? 'Salon Owner' : 'مالك الصالون')}
            </h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activePage === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${isRtl ? 'font-tajawal' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Button>
          ))}
        </nav>

        <Separator className="my-6" />

        {/* Logout Button */}
        <Button
          variant="outline"
          className={`w-full ${isRtl ? 'font-tajawal' : ''}`}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          {isLtr ? 'Logout' : 'تسجيل الخروج'}
        </Button>
      </div>
    </aside>
  );
};

export default OwnerNavigation;
