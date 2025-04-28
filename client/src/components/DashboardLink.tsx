import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardLink = () => {
  const { isLtr } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();

  // Don't show for unauthenticated users or non-salon owners
  if (!isAuthenticated || user?.role !== 'salon_owner') {
    return null;
  }

  return (
    <Button
      variant="primary"
      className="fixed bottom-8 right-8 flex items-center gap-2 shadow-lg z-50"
      onClick={() => navigate('/owner/dashboard')}
    >
      <LayoutDashboard className="h-5 w-5" />
      <span>{isLtr ? 'Dashboard' : 'لوحة التحكم'}</span>
    </Button>
  );
};

export default DashboardLink;
