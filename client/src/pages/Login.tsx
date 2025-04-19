import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { getIslamicPatternSvg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const Login = () => {
  const { isLtr, isRtl } = useLanguage();
  const { login, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Parse redirect URL from query params
  const getRedirectPath = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('redirect') || '/profile';
  };
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(getRedirectPath());
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
    password: z.string().min(6, {
      message: isLtr 
        ? "Password must be at least 6 characters." 
        : "يجب أن تكون كلمة المرور 6 أحرف على الأقل."
    }),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await login(values.username, values.password);
    if (success) {
      navigate(getRedirectPath());
    }
  };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-premium/30 to-premium/30 dark:from-premium/30 dark:to-premium/30"
      dir={isLtr ? 'ltr' : 'rtl'}
    >
      <Helmet>
        <title>{isLtr ? 'Login' : 'تسجيل الدخول'} | Jamaalaki</title>
        <meta name="description" content={isLtr ? 'Login to your Jamaalaki account' : 'تسجيل الدخول إلى حساب جمالكي'} />
      </Helmet>
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-neutral-900">
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl ${isLtr ? 'font-playfair' : 'font-tajawal'}`}>
              {isLtr ? "Welcome Back" : "مرحباً بعودتك"}
            </CardTitle>
            <CardDescription className={`${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr 
                ? "Sign in to your account to continue"
                : "سجلي دخولك إلى حسابك للمتابعة"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          placeholder={isLtr ? "Enter your username" : "أدخل اسم المستخدم"} 
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
                          type="password" 
                          placeholder={isLtr ? "Enter your password" : "أدخل كلمة المرور"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className={`${isRtl ? 'font-tajawal' : ''}`} />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <Button 
                      variant="link" 
                      className={`p-0 h-auto text-sm ${isRtl ? 'font-tajawal' : ''}`}
                    >
                      {isLtr ? "Forgot Password?" : "نسيت كلمة المرور؟"}
                    </Button>
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className={`w-full ${isRtl ? 'font-tajawal' : ''}`}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLtr ? "Login" : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr ? "Don't have an account?" : "ليس لديك حساب؟"}{" "}
              <Link href="/register">
                <Button 
                  variant="link" 
                  className={`p-0 h-auto ${isRtl ? 'font-tajawal' : ''}`}
                >
                  {isLtr ? "Register" : "تسجيل"}
                </Button>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
