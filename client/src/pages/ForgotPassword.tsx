import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { config } from "@/lib/config";

export default function ForgotPassword() {
  const { isLtr } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: isLtr ? "Invalid Email" : "بريد إلكتروني غير صالح",
        description: isLtr
          ? "Please enter a valid email address."
          : "يرجى إدخال بريد إلكتروني صالح.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest("POST", config.api.endpoints.auth + "/forgot-password", { email });
      const data = await response.json();
      if (data.success) {
        setSent(true);
        toast({
          title: isLtr ? "Email Sent" : "تم إرسال البريد",
          description: isLtr
            ? "A password reset link has been sent to your email."
            : "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
        });
      } else {
        toast({
          title: isLtr ? "Error" : "خطأ",
          description: data.message || (isLtr ? "Unable to send reset email." : "تعذر إرسال بريد إعادة التعيين."),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: isLtr ? "Error" : "خطأ",
        description: isLtr
          ? "Something went wrong. Please try again."
          : "حدث خطأ ما. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 space-y-6" dir={isLtr ? "ltr" : "rtl"}>
          <Helmet>
            <title>{isLtr ? "Forgot Password | The Beauty" : "نسيت كلمة المرور | جمالكِ"}</title>
          </Helmet>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {isLtr ? "Forgot Password" : "نسيت كلمة المرور"}
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            {isLtr
              ? "Enter your email and we'll send you a reset link."
              : "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder={isLtr ? "Email address" : "البريد الإلكتروني"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mb-4"
              aria-label={isLtr ? "Email address" : "البريد الإلكتروني"}
            />
            <Button type="submit" className="w-full" disabled={loading || sent}>
              {loading ? (
                <Loader2 className="animate-spin mr-2 h-5 w-5 inline" />
              ) : null}
              {sent
                ? isLtr
                  ? "Email Sent"
                  : "تم إرسال البريد"
                : isLtr
                ? "Send Reset Link"
                : "إرسال رابط إعادة التعيين"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
