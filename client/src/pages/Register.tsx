import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { getIslamicPatternSvg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const Register = () => {
  const { isLtr, isRtl } = useLanguage();
  const { register, isAuthenticated, loading } = useAuth();
  const [_, navigate] = useLocation();
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/profile');
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Create pattern SVG background
  useEffect(() => {
    const patternSvg = getIslamicPatternSvg();
    const patternBg = document.createElement('div');
    patternBg.className = 'pattern-bg';
    patternBg.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}')`;
    
    document.body.appendChild(patternBg);
    
    return () => {
      document.body.removeChild(patternBg);
    };
  }, []);
  
  // Form schema with validation
  const formSchema = z.object({
    username: z.string().min(3, {
      message: isLtr 
        ? "Username must be at least 3 characters." 
        : "يجب أن يكون اسم المستخدم 3 أحرف على الأقل."
    }),
    email: z.string().email({
      message: isLtr 
        ? "Please enter a valid email address." 
        : "يرجى إدخال عنوان بريد إلكتروني صالح."
    }),
    password: z.string().min(6, {
      message: isLtr 
        ? "Password must be at least 6 characters." 
        : "يجب أن تكون كلمة المرور 6 أحرف على الأقل."
    }),
    confirmPassword: z.string(),
    fullName: z.string().min(2, {
      message: isLtr 
        ? "Full name must be at least 2 characters." 
        : "يجب أن يكون الاسم الكامل حرفين على الأقل."
    }),
    phone: z.string().optional(),
    role: z.enum(["customer", "salon_owner"]).default("customer"),
    preferredLanguage: z.string().default(isLtr ? "en" : "ar"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: isLtr 
      ? "Passwords don't match" 
      : "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      role: "customer",
      preferredLanguage: isLtr ? "en" : "ar",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...userData } = values;
    
    const success = await register(userData);
    if (success) {
      navigate('/profile');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 flex items-center justify-center">
      <div
        className="container mx-auto px-4 py-16 flex justify-center"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <Helmet>
          <title>{isLtr ? 'Register' : 'تسجيل حساب'} | Jamaalaki</title>
          <meta name="description" content={isLtr ? 'Create your Jamaalaki account' : 'إنشاء حسابك في جمالكي'} />
        </Helmet>
        <Card className="w-full max-w-md bg-white dark:bg-neutral-900">
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
              {isLtr ? "Create an Account" : "إنشاء حساب"}
            </CardTitle>
            <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr 
                ? "Join our community of beauty enthusiasts"
                : "انضمي إلى مجتمع عشاق الجمال"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Full Name" : "الاسم الكامل"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-fullname"
                          name="fullName"
                          placeholder={isLtr ? "Enter your full name" : "أدخل اسمك الكامل"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Username" : "اسم المستخدم"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-username"
                          name="username"
                          placeholder={isLtr ? "Choose a username" : "اختر اسم مستخدم"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Email" : "البريد الإلكتروني"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-email"
                          name="email"
                          type="email" 
                          placeholder={isLtr ? "Enter your email" : "أدخل بريدك الإلكتروني"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Phone" : "رقم الهاتف"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-phone"
                          name="phone"
                          placeholder={isLtr ? "Enter your phone number" : "أدخل رقم هاتفك"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Password" : "كلمة المرور"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-password"
                          name="password"
                          type="password" 
                          placeholder={isLtr ? "Create a password" : "أنشئ كلمة مرور"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Confirm Password" : "تأكيد كلمة المرور"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="register-confirm-password"
                          name="confirmPassword"
                          type="password" 
                          placeholder={isLtr ? "Confirm your password" : "أكد كلمة المرور"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Account Type" : "نوع الحساب"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLtr ? "Select account type" : "اختر نوع الحساب"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">{isLtr ? "Customer" : "عميل"}</SelectItem>
                          <SelectItem value="salon_owner">{isLtr ? "Salon Owner" : "مالك صالون"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className={`w-full ${isRtl ? 'font-tajawal' : ''}`}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLtr ? "Register" : "تسجيل"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr ? "Already have an account?" : "هل لديك حساب بالفعل؟"}{" "}
              <Link href="/login">
                <Button 
                  variant="link" 
                  className={`p-0 h-auto ${isRtl ? 'font-tajawal' : ''}`}
                >
                  {isLtr ? "Login" : "تسجيل الدخول"}
                </Button>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
