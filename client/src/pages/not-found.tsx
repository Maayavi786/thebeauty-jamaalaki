import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-[#FAF6F2] dark:bg-[#18181A] flex items-center justify-center"
      style={{
        backgroundImage: `
          linear-gradient(180deg, #FAF6F2 0%, #FFF8F3 100%),
          url('/assets/luxury-motif-floral.svg'),
          linear-gradient(180deg, #201A23 0%, #18181A 100%)
        `,
        backgroundBlendMode: 'normal',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <div className="w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
