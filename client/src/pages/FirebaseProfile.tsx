import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useLocation } from "wouter";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/firebase/storage";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Camera } from "lucide-react";
import { useFirestoreQuery } from "@/hooks/useFirestore";
import { COLLECTIONS, BookingData } from "@/lib/firestore/schema";

const FirebaseProfile = () => {
  const { isLtr, isRtl } = useLanguage();
  const { user, logout, userLoading, updateUserProfile } = useFirebaseAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  // Get user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useFirestoreQuery<BookingData>(
    COLLECTIONS.BOOKINGS,
    user ? [{ field: 'user_id', operator: '==', value: user.uid }] : [],
    'date',
    'desc',
    undefined,
    { enabled: !!user }
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/firebase-login');
    }
  }, [user, userLoading, navigate]);

  // Set initial form values
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setProfileImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      let photoURL = user.photoURL;
      
      // Upload new profile image if selected
      if (profileImage) {
        photoURL = await uploadImage(profileImage, 'profile', `user_${user.uid}`);
      }
      
      // Update profile in Firebase Auth and Firestore
      await updateUserProfile({
        fullName,
        phone,
        photoURL
      });
      
      toast({
        title: isLtr ? "Profile Updated" : "تم تحديث الملف الشخصي",
        description: isLtr 
          ? "Your profile has been updated successfully" 
          : "تم تحديث ملفك الشخصي بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: isLtr ? "Update Failed" : "فشل التحديث",
        description: isLtr 
          ? "An error occurred while updating your profile" 
          : "حدث خطأ أثناء تحديث ملفك الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/firebase-login');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 min-h-[80vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{isLtr ? 'My Profile' : 'ملفي الشخصي'} | Jamaalaki</title>
      </Helmet>

      <h1 className={`text-3xl font-bold mb-8 ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
        {isLtr ? 'My Profile' : 'ملفي الشخصي'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - User info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4 relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profileImagePreview || user.photoURL || undefined} 
                    alt={user.fullName} 
                  />
                  <AvatarFallback>{user.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-1/3 bg-primary rounded-full p-1 cursor-pointer">
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                  </Label>
                  <Input 
                    id="profile-image" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <CardTitle className={`${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                {user.fullName || isLtr ? 'No name set' : 'لم يتم تعيين اسم'}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'Full Name' : 'الاسم الكامل'}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isLtr ? 'Enter your full name' : 'أدخل اسمك الكامل'}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'Phone Number' : 'رقم الهاتف'}
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isLtr ? 'Enter your phone number' : 'أدخل رقم هاتفك'}
                  />
                </div>
                <div>
                  <Label className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'Email' : 'البريد الإلكتروني'}
                  </Label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <Label className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'Account Type' : 'نوع الحساب'}
                  </Label>
                  <Input 
                    value={user.role === 'salon_owner' 
                      ? (isLtr ? 'Salon Owner' : 'صاحب صالون') 
                      : (isLtr ? 'Customer' : 'عميل')
                    } 
                    disabled 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                onClick={handleUpdateProfile} 
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLtr ? 'Update Profile' : 'تحديث الملف الشخصي'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLtr ? 'Logout' : 'تسجيل الخروج'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column - Tabs for bookings, salons, etc. */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="bookings">
            <TabsList className="w-full">
              <TabsTrigger value="bookings" className={`${isRtl ? 'font-tajawal' : ''} w-full`}>
                {isLtr ? 'My Bookings' : 'حجوزاتي'}
              </TabsTrigger>
              {user.role === 'salon_owner' && (
                <TabsTrigger value="salon" className={`${isRtl ? 'font-tajawal' : ''} w-full`}>
                  {isLtr ? 'My Salon' : 'صالوني'}
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className={`${isRtl ? 'font-tajawal' : ''} w-full`}>
                {isLtr ? 'Settings' : 'الإعدادات'}
              </TabsTrigger>
            </TabsList>
            
            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle className={`${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                    {isLtr ? 'My Bookings' : 'حجوزاتي'}
                  </CardTitle>
                  <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'View and manage your salon bookings' : 'عرض وإدارة حجوزات الصالون الخاصة بك'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <div className="font-semibold">{booking.date}</div>
                                <div className="text-sm text-muted-foreground">{booking.time}</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                  : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </div>
                            </div>
                            <div className="text-sm">
                              {isLtr ? 'Service ID:' : 'معرف الخدمة:'} {booking.service_id}
                            </div>
                            <div className="text-sm">
                              {isLtr ? 'Salon ID:' : 'معرف الصالون:'} {booking.salon_id}
                            </div>
                            {booking.notes && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <div className="font-medium">{isLtr ? 'Notes:' : 'ملاحظات:'}</div>
                                <div>{booking.notes}</div>
                              </div>
                            )}
                          </div>
                          <div className="bg-muted p-3 flex justify-between">
                            <div className="text-sm">
                              {isLtr ? 'Booked on:' : 'تم الحجز في:'} {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                            {booking.status === 'pending' && (
                              <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                                {isLtr ? 'Cancel' : 'إلغاء'}
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "You don't have any bookings yet" : "ليس لديك أي حجوزات حتى الآن"}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/salons')}
                      >
                        {isLtr ? 'Browse Salons' : 'تصفح الصالونات'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Salon Tab (for salon owners) */}
            {user.role === 'salon_owner' && (
              <TabsContent value="salon">
                <Card>
                  <CardHeader>
                    <CardTitle className={`${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                      {isLtr ? 'My Salon' : 'صالوني'}
                    </CardTitle>
                    <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
                      {isLtr ? 'Manage your salon information' : 'إدارة معلومات الصالون الخاص بك'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button onClick={() => navigate('/owner/salon-profile')}>
                        {isLtr ? 'Go to Salon Dashboard' : 'الذهاب إلى لوحة تحكم الصالون'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className={`${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
                    {isLtr ? 'Account Settings' : 'إعدادات الحساب'}
                  </CardTitle>
                  <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
                    {isLtr ? 'Manage your account settings and preferences' : 'إدارة إعدادات وتفضيلات حسابك'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Password' : 'كلمة المرور'}
                      </Label>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Input type="password" value="************" disabled />
                        <Button variant="outline">
                          {isLtr ? 'Change' : 'تغيير'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? 'Preferred Language' : 'اللغة المفضلة'}
                      </Label>
                      <div className="flex space-x-2 rtl:space-x-reverse mt-1">
                        <Button variant={isLtr ? "default" : "outline"} className="flex-1">
                          English
                        </Button>
                        <Button variant={isRtl ? "default" : "outline"} className="flex-1">
                          العربية
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="destructive" className="w-full">
                        {isLtr ? 'Delete Account' : 'حذف الحساب'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FirebaseProfile;
