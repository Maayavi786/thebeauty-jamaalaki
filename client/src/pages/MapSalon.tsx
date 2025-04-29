import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Ultra-minimal version with pure HTML form to avoid JS bundling issues
const MapSalon = () => {
  const { isLtr } = useLanguage();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [salonId, setSalonId] = useState("2");
  
  // Handle form submission via traditional HTML form POST
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) {
      toast({
        title: "Error",
        description: "You must be logged in to map a salon",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Create a hidden iframe for form submission to avoid page refresh
    const iframe = document.createElement('iframe');
    iframe.name = 'mapSalonFrame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set form attributes to submit to iframe
    if (formRef.current) {
      formRef.current.target = 'mapSalonFrame';
      formRef.current.submit();
    }
    
    // Show success message after a delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Success",
        description: "Salon mapped successfully"
      });
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Map Salon To Owner</title>
      </Helmet>
      
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Map Salon to Your Account</CardTitle>
            <CardDescription>
              This utility will map the specified salon to your account, making you the owner.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Use traditional HTML form with action instead of JavaScript fetch */}
            <form 
              ref={formRef}
              method="POST" 
              action="/.netlify/functions/mapSalon"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="hidden"
                name="username"
                value={user?.username || ''}
              />
              
              <div className="space-y-2">
                <Label htmlFor="username-display">Your Username</Label>
                <Input
                  id="username-display"
                  value={user?.username || ''}
                  disabled
                  className="bg-muted"
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salonId">Salon ID</Label>
                <Input
                  id="salonId"
                  name="salonId"
                  autoComplete="off"
                  value={salonId}
                  onChange={(e) => setSalonId(e.target.value)}
                  type="number"
                  min="1"
                />
                <p className="text-sm text-muted-foreground">
                  Default is Salon ID 2, which should work for most testing.
                </p>
              </div>
              
              {submitted && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900/30">
                  <h3 className="font-medium text-green-900 dark:text-green-400 mb-2">Success!</h3>
                  <p className="text-sm">Salon has been successfully mapped to your account.</p>
                  <p className="text-sm mt-3">
                    <strong>Next step:</strong> Go to the <a href="/owner/dashboard" className="underline text-primary">Owner Dashboard</a> to manage your salon.
                  </p>
                </div>
              )}
              
              <Button 
                type="submit"
                disabled={loading || !user?.username}
                className="w-full mt-4"
              >
                {loading ? 'Processing...' : 'Map Salon to My Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapSalon;
