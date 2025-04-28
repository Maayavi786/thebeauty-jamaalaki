import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  User,
  Settings as SettingsIcon,
  Languages,
  Mail,
  Phone,
  LogOut,
  CreditCard,
  Clock,
  Lock,
} from 'lucide-react';
import OwnerNavigation from '@/components/owner/OwnerNavigation';
import BusinessHoursSettings from '@/components/owner/BusinessHoursSettings';

const Settings = () => {
  const { isLtr, isRtl, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if not authenticated or not a salon owner
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'salon_owner')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(true);
  const [newBookingNotifications, setNewBookingNotifications] = React.useState(true);
  const [cancellationNotifications, setCancellationNotifications] = React.useState(true);
  const [reportNotifications, setReportNotifications] = React.useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLtr ? 'Settings' : 'الإعدادات'} | Jamaalaki</title>
      </Helmet>

      <div className="flex flex-col md:flex-row">
        {/* Side Navigation */}
        <OwnerNavigation activePage="settings" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-tajawal' : 'font-playfair'}`}>
                {isLtr ? 'Settings' : 'الإعدادات'}
              </h1>
              <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                {isLtr 
                  ? 'Manage your salon settings and preferences' 
                  : 'إدارة إعدادات وتفضيلات صالونك'}
              </p>
            </header>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account" className={isRtl ? 'font-tajawal' : ''}>
                  <User className="h-4 w-4 mr-2" />
                  {isLtr ? 'Account' : 'الحساب'}
                </TabsTrigger>
                <TabsTrigger value="notifications" className={isRtl ? 'font-tajawal' : ''}>
                  <Bell className="h-4 w-4 mr-2" />
                  {isLtr ? 'Notifications' : 'الإشعارات'}
                </TabsTrigger>
                <TabsTrigger value="business" className={isRtl ? 'font-tajawal' : ''}>
                  <Clock className="h-4 w-4 mr-2" />
                  {isLtr ? 'Business Hours' : 'ساعات العمل'}
                </TabsTrigger>
                <TabsTrigger value="payment" className={isRtl ? 'font-tajawal' : ''}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLtr ? 'Payment' : 'الدفع'}
                </TabsTrigger>
              </TabsList>
              
              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                      <User className="h-5 w-5 mr-2 inline-block" />
                      {isLtr ? 'Profile Information' : 'معلومات الملف الشخصي'}
                    </CardTitle>
                    <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr 
                        ? 'Update your personal information and account settings' 
                        : 'تحديث معلوماتك الشخصية وإعدادات حسابك'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Full Name' : 'الاسم الكامل'}
                        </Label>
                        <Input 
                          id="name" 
                          defaultValue={user?.name || ''} 
                          className={isRtl ? 'font-tajawal text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Email Address' : 'البريد الإلكتروني'}
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user?.email || ''} 
                          className={isRtl ? 'font-tajawal text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Phone Number' : 'رقم الهاتف'}
                        </Label>
                        <Input 
                          id="phone" 
                          defaultValue={user?.phone || ''} 
                          className={isRtl ? 'font-tajawal text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language" className={isRtl ? 'font-tajawal' : ''}>
                          {isLtr ? 'Preferred Language' : 'اللغة المفضلة'}
                        </Label>
                        <select 
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Password' : 'كلمة المرور'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Current Password' : 'كلمة المرور الحالية'}
                          </Label>
                          <Input 
                            id="current-password" 
                            type="password" 
                            className={isRtl ? 'font-tajawal text-right' : ''}
                          />
                        </div>
                        <div></div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'New Password' : 'كلمة المرور الجديدة'}
                          </Label>
                          <Input 
                            id="new-password" 
                            type="password" 
                            className={isRtl ? 'font-tajawal text-right' : ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
                          </Label>
                          <Input 
                            id="confirm-password" 
                            type="password" 
                            className={isRtl ? 'font-tajawal text-right' : ''}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Save Changes' : 'حفظ التغييرات'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                      <Bell className="h-5 w-5 mr-2 inline-block" />
                      {isLtr ? 'Notification Preferences' : 'تفضيلات الإشعارات'}
                    </CardTitle>
                    <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr 
                        ? 'Choose how and when you want to be notified' 
                        : 'اختر كيف ومتى تريد أن يتم إشعارك'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Notification Channels' : 'قنوات الإشعارات'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <Label htmlFor="email-notifications" className={isRtl ? 'font-tajawal' : ''}>
                              {isLtr ? 'Email Notifications' : 'إشعارات البريد الإلكتروني'}
                            </Label>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <Label htmlFor="sms-notifications" className={isRtl ? 'font-tajawal' : ''}>
                              {isLtr ? 'SMS Notifications' : 'إشعارات الرسائل النصية'}
                            </Label>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={smsNotifications}
                            onCheckedChange={setSmsNotifications}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Notification Types' : 'أنواع الإشعارات'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? 'New Bookings' : 'الحجوزات الجديدة'}
                            </p>
                            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr 
                                ? 'Receive notifications when a new booking is made' 
                                : 'تلقي إشعارات عند إجراء حجز جديد'}
                            </p>
                          </div>
                          <Switch
                            checked={newBookingNotifications}
                            onCheckedChange={setNewBookingNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? 'Cancellations' : 'الإلغاءات'}
                            </p>
                            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr 
                                ? 'Receive notifications when a booking is cancelled' 
                                : 'تلقي إشعارات عند إلغاء حجز'}
                            </p>
                          </div>
                          <Switch
                            checked={cancellationNotifications}
                            onCheckedChange={setCancellationNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? 'Daily/Weekly Reports' : 'التقارير اليومية/الأسبوعية'}
                            </p>
                            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr 
                                ? 'Receive summary reports of salon activities' 
                                : 'تلقي تقارير ملخصة عن أنشطة الصالون'}
                            </p>
                          </div>
                          <Switch
                            checked={reportNotifications}
                            onCheckedChange={setReportNotifications}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Save Preferences' : 'حفظ التفضيلات'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Business Hours Settings */}
              <TabsContent value="business" className="space-y-6 mt-6">
                <BusinessHoursSettings />
              </TabsContent>
              
              {/* Payment Settings */}
              <TabsContent value="payment" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={isRtl ? 'font-tajawal' : ''}>
                      <CreditCard className="h-5 w-5 mr-2 inline-block" />
                      {isLtr ? 'Payment Settings' : 'إعدادات الدفع'}
                    </CardTitle>
                    <CardDescription className={isRtl ? 'font-tajawal' : ''}>
                      {isLtr 
                        ? 'Configure payment methods and requirements' 
                        : 'تكوين طرق ومتطلبات الدفع'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Payment Methods Accepted' : 'طرق الدفع المقبولة'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="credit-card" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Credit/Debit Cards' : 'بطاقات الائتمان/الخصم'}
                          </Label>
                          <Switch id="credit-card" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cash" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Cash Payment' : 'الدفع النقدي'}
                          </Label>
                          <Switch id="cash" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="digital-wallets" className={isRtl ? 'font-tajawal' : ''}>
                            {isLtr ? 'Digital Wallets (Apple Pay, Google Pay)' : 'المحافظ الرقمية (آبل باي، جوجل باي)'}
                          </Label>
                          <Switch id="digital-wallets" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Booking Requirements' : 'متطلبات الحجز'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr ? 'Require Deposit' : 'طلب عربون'}
                            </p>
                            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                              {isLtr 
                                ? 'Require customers to pay a deposit when booking' 
                                : 'مطالبة العملاء بدفع عربون عند الحجز'}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="deposit-percentage" className={isRtl ? 'font-tajawal' : ''}>
                              {isLtr ? 'Deposit Percentage (%)' : 'نسبة العربون (٪)'}
                            </Label>
                            <Input 
                              id="deposit-percentage" 
                              type="number" 
                              defaultValue="20" 
                              min="0" 
                              max="100"
                              className={isRtl ? 'font-tajawal text-right' : ''}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="minimum-deposit" className={isRtl ? 'font-tajawal' : ''}>
                              {isLtr ? 'Minimum Deposit (SAR)' : 'الحد الأدنى للعربون (ر.س)'}
                            </Label>
                            <Input 
                              id="minimum-deposit" 
                              type="number" 
                              defaultValue="50" 
                              min="0"
                              className={isRtl ? 'font-tajawal text-right' : ''}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button className={isRtl ? 'font-tajawal' : ''}>
                        {isLtr ? 'Save Payment Settings' : 'حفظ إعدادات الدفع'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
