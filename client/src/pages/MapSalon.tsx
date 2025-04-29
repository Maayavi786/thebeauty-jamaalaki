import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const MapSalon = () => {
  const { isLtr } = useLanguage();
  const { user } = useAuth();
  const [salonId, setSalonId] = useState('2'); // Default to salon ID 2
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [serviceMessage, setServiceMessage] = useState('');

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
    setMessage('');
    setServiceMessage('');

    // Use regular fetch API with minimal processing
    fetch('/.netlify/functions/mapSalon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user.username,
        salonId: parseInt(salonId)
      }),
    })
    .then(response => {
      // Convert response to text first
      return response.text().then(text => {
        // Log the raw response
        console.log('Raw response:', text);
        
        // Only try to parse as JSON if there's content
        if (text && text.trim()) {
          try {
            return {
              ok: response.ok,
              data: JSON.parse(text)
            };
          } catch (e) {
            console.error('JSON parse error:', e);
            return {
              ok: false,
              data: { error: 'Invalid response format' }
            };
          }
        } else {
          return {
            ok: false,
            data: { error: 'Empty response' }
          };
        }
      });
    })
    .then(result => {
      setLoading(false);
      
      if (result.ok) {
        // Handle success
        setSuccess(true);
        setMessage(result.data.message || 'Salon mapped successfully');
        setServiceMessage(result.data.serviceMessage || '');
        
        toast({
          title: "Success",
          description: result.data.message || 'Salon mapped successfully'
        });
      } else {
        // Handle error
        toast({
          title: "Error",
          description: result.data.error || 'Failed to map salon',
          variant: "destructive"
        });
      }
    })
    .catch(error => {
      // Handle network/fetch errors
      console.error('Fetch error:', error);
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
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium text-green-900 dark:text-green-400">Success!</h3>
                </div>
                <p className="text-sm">{message}</p>
                {serviceMessage && <p className="text-sm mt-1">{serviceMessage}</p>}
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
