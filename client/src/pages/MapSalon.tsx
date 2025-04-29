import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MapSalon = () => {
  const { isLtr } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [salonId, setSalonId] = useState("2");
  
  // Handle form submission with JSON fetch
  const handleSubmit = async (e: React.FormEvent) => {
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
    
    try {
      // Prepare the request payload as JSON
      const payload = {
        username: user.username,
        salonId: parseInt(salonId, 10) || 2
      };
      
      // Make a proper fetch request with application/json content-type
      const response = await fetch('/.netlify/functions/mapSalon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Success",
          description: data.message || "Salon mapped successfully"
        });
      } else {
        throw new Error(data.error || 'Failed to map salon');
      }
    } catch (error) {
      console.error('Error mapping salon:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to map salon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <form 
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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
