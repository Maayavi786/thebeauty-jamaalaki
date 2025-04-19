import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { config } from "@/lib/config";

export default function ResetPassword() {
  const { isLtr } = useLanguage();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location] = useLocation();

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        title: isLtr ? "Missing Fields" : "حقول ناقصة",
        description: isLtr
          ? "Please fill in all fields."
          : "يرجى ملء جميع الحقول.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: isLtr ? "Passwords do not match" : "كلمتا المرور غير متطابقتين",
        description: isLtr
          ? "Please make sure both passwords are the same."
          : "يرجى التأكد من تطابق كلمتي المرور.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest("POST", config.api.endpoints.auth + "/reset-password", { password, token });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        toast({
          title: isLtr ? "Password Reset" : "تمت إعادة التعيين",
          description: isLtr
            ? "Your password has been updated."
            : "تم تحديث كلمة مرورك.",
        });
      } else {
        toast({
          title: isLtr ? "Error" : "خطأ",
          description: data.message || (isLtr ? "Unable to reset password." : "تعذر إعادة تعيين كلمة المرور."),
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
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900 pattern-bg"
      dir={isLtr ? 'ltr' : 'rtl'}
    >
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Helmet>
          <title>{isLtr ? "Reset Password | The Beauty" : "إعادة تعيين كلمة المرور | جمالكِ"}</title>
        </Helmet>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 space-y-6"
          dir={isLtr ? "ltr" : "rtl"}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            {isLtr ? "Reset Password" : "إعادة تعيين كلمة المرور"}
          </h2>
          <Input
            type="password"
            placeholder={isLtr ? "New password" : "كلمة المرور الجديدة"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mb-4"
            aria-label={isLtr ? "New password" : "كلمة المرور الجديدة"}
          />
          <Input
            type="password"
            placeholder={isLtr ? "Confirm password" : "تأكيد كلمة المرور"}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="mb-4"
            aria-label={isLtr ? "Confirm password" : "تأكيد كلمة المرور"}
          />
          <Button type="submit" className="w-full" disabled={loading || success}>
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5 inline" />
            ) : null}
            {success
              ? isLtr
                ? "Password Reset"
                : "تمت إعادة التعيين"
              : isLtr
              ? "Reset Password"
              : "إعادة تعيين كلمة المرور"}
          </Button>
        </form>
      </div>
    </div>
  );
}
