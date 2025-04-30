import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
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
import { Label } from "@/components/ui/label";
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
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";

const FirebaseLogin = () => {
  const { isLtr, isRtl } = useLanguage();
  const { login, loginWithGoogle, resetPassword, isAuthenticated, userLoading } = useFirebaseAuth();
  const [, navigate] = useLocation();
  
  // Parse redirect URL from query params
  const getRedirectPath = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('redirect') || '/profile';
  };
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !userLoading) {
      navigate(getRedirectPath());
    }
  }, [isAuthenticated, userLoading, navigate]);
  
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
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await login(values.email, values.password);
    if (success) {
      handleSuccessfulLogin();
    }
  };

  const handleGoogleSignIn = async () => {
    const success = await loginWithGoogle();
    if (success) {
      handleSuccessfulLogin();
    }
  };

  const handleSuccessfulLogin = () => {
    // Check for booking redirect in sessionStorage first
    const bookingRedirect = sessionStorage.getItem('bookingRedirect');
    if (bookingRedirect) {
      sessionStorage.removeItem('bookingRedirect');
      navigate(bookingRedirect);
    } else {
      navigate(getRedirectPath());
    }
  };
  
  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", {
        type: "manual",
        message: isLtr 
          ? "Please enter your email address to reset password" 
          : "يرجى إدخال بريدك الإلكتروني لإعادة تعيين كلمة المرور"
      });
      return;
    }
    
    await resetPassword(email);
  };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-premium/30 to-premium/30 dark:from-neutral-900 dark:to-neutral-900"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Email" : "البريد الإلكتروني"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="login-email"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${isRtl ? 'font-tajawal' : ''}`}>
                        {isLtr ? "Password" : "كلمة المرور"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="login-password"
                          name="password"
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
                  <Button 
                    type="button"
                    variant="link" 
                    className={`p-0 h-auto text-sm ${isRtl ? 'font-tajawal' : ''}`}
                    onClick={handlePasswordReset}
                  >
                    {isLtr ? "Forgot Password?" : "نسيت كلمة المرور؟"}
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className={`w-full ${isRtl ? 'font-tajawal' : ''}`}
                  disabled={userLoading}
                >
                  {userLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLtr ? "Login" : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-neutral-900 px-2 text-muted-foreground">
                    {isLtr ? "Or continue with" : "أو المتابعة باستخدام"}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={userLoading}
                >
                  <FcGoogle className="h-5 w-5" />
                  {isLtr ? "Continue with Google" : "المتابعة مع جوجل"}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className={`text-sm text-muted-foreground ${isRtl ? 'font-tajawal' : ''}`}>
              {isLtr ? "Don't have an account?" : "ليس لديك حساب؟"}{" "}
              <Link href="/firebase-register">
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

export default FirebaseLogin;
