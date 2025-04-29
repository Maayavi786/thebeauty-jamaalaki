import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/lib/config';

const MapSalon = () => {
  const { isLtr } = useLanguage();
  const { user } = useAuth();
  const [salonId, setSalonId] = useState('2'); // Default to salon ID 2
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMapSalon = async () => {
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
      console.log('Sending request to map salon:', {
        username: user.username,
        salonId: parseInt(salonId)
      });
      
      // Simplified fetch and response handling
      const response = await fetch('/.netlify/functions/mapSalon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          salonId: parseInt(salonId)
        }),
      });

      let responseData: any = {};
      
      // Simple response handling with try/catch
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        
        if (text && text.trim()) {
          responseData = JSON.parse(text);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
      
      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to map salon';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        // Success case
        const successMessage = responseData.message || 'Salon mapped successfully';
        setResult(responseData);
        toast({
          title: "Success",
          description: successMessage,
        });
      }
    } catch (error) {
      console.error('Error mapping salon:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
            <div className="space-y-2">
              <Label htmlFor="username">Your Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={user?.username || ''}
                disabled
                className="bg-muted"
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

            {result && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900/30">
                <h3 className="font-medium text-green-900 dark:text-green-400 mb-2">Success!</h3>
                <p className="text-sm">{result.message}</p>
                <p className="text-sm mt-1">{result.serviceMessage}</p>
                <p className="text-sm mt-3">
                  <strong>Next step:</strong> Go to the <a href="/owner/dashboard" className="underline text-primary">Owner Dashboard</a> to manage your salon.
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleMapSalon} 
              disabled={loading || !user?.username}
              className="w-full"
              type="button"
              aria-label="Map salon to my account"
            >
              {loading ? 'Processing...' : 'Map Salon to My Account'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MapSalon;
