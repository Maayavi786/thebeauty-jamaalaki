import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Extremely simplified version with minimal dependencies
const MapSalon = () => {
  const { isLtr } = useLanguage();
  const { user } = useAuth();
  const [salonId, setSalonId] = useState('2'); // Default to salon ID 2
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleMapSalon = () => {
    if (!user?.username) {
      toast({
        title: "Error",
        description: "You must be logged in to map a salon",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSuccess(false);
    setSuccessMessage('');

    // Basic vanilla JS fetch with minimal processing
    window.fetch('/.netlify/functions/mapSalon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user.username,
        salonId: parseInt(salonId)
      }),
    })
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      console.log('Raw response:', text);
      setLoading(false);
      
      try {
        // Only attempt to parse if we have a response
        if (text && text.trim()) {
          const data = JSON.parse(text);
          
          if (data.success) {
            setSuccess(true);
            setSuccessMessage(data.message || 'Salon mapped successfully');
            
            toast({
              title: "Success",
              description: data.message || 'Salon mapped successfully'
            });
          } else {
            toast({
              title: "Error",
              description: data.error || 'Failed to map salon',
              variant: "destructive"
            });
          }
        }
      } catch (e) {
        console.error('Error processing response:', e);
        toast({
          title: "Error",
          description: "Invalid response format",
          variant: "destructive"
        });
      }
    })
    .catch(function(error) {
      console.error('Network error:', error);
      setLoading(false);
      
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    });
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

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900/30">
                <h3 className="font-medium text-green-900 dark:text-green-400 mb-2">Success!</h3>
                <p className="text-sm">{successMessage}</p>
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
