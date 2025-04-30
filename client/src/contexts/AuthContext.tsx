import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { config } from "@/lib/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSession = async () => {
    try {
      try {
        const response = await apiRequest('GET', config.api.endpoints.auth + '/session');
        if (response.ok) {
          const data = await response.json();
          console.log('Session check response:', data);
          if (data.user) {
            console.log('User authenticated with role:', data.user.role);
            setUser(data.user);
          } else {
            console.log('No user data in session response');
            setUser(null);
          }
        } else {
          // Just treat any failure as not logged in
          console.log('Session check failed with status:', response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    
    // Set up periodic session check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', config.api.endpoints.auth + '/login', { username, password });
      
      // Handle both Response objects (from fetch) and direct data objects (from mock)
      let data;
      if (response && typeof response.json === 'function') {
        // This is a Response object from fetch
        data = await response.json();
        
        // The API returns 200 status code with a 'message' field for successful login
        if (response.ok) {
          // Set the user data from the response
          setUser(data.user);
          toast({
            title: "Success",
            description: "You have been logged in successfully",
          });
          return true;
        } else {
          // Handle unsuccessful login
          throw new Error(data.message || 'Login failed');
        }
      } else {
        // This is a direct data object from mock implementation
        data = response;
        // Set the user data directly
        setUser(data.user);
        toast({
          title: "Success",
          description: "You have been logged in successfully",
        });
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', config.api.endpoints.auth + '/register', userData);
      
      // Handle both Response objects (from fetch) and direct data objects (from mock)
      let data;
      if (response && typeof response.json === 'function') {
        // This is a Response object from fetch
        data = await response.json();
        console.log('Registration response:', data);
        
        // Check for user data in the correct structure (data.user)
        if (response.ok && data && data.user) {
          setUser(data.user);
          toast({
            title: "Success",
            description: "Your account has been created successfully",
          });
          return true;
        } else if (response.ok) {
          // If we got a success response but no proper user data
          console.error('Registration response missing user data:', data);
          toast({
            title: "Warning",
            description: "Account created but login may be required",
            variant: "warning"
          });
          return true;
        } else {
          // Handle unsuccessful registration
          throw new Error(data.message || 'Registration failed');
        }
      } else {
        // This is a direct data object from mock implementation
        data = response;
        console.log('Registration response (mock):', data);
        
        // Check for user data in the mock response
        if (data && data.user) {
          setUser(data.user);
          toast({
            title: "Success",
            description: "Your account has been created successfully",
          });
          return true;
        } else {
          // If we got a success response but no proper user data
          console.error('Registration response missing user data:', data);
          toast({
            title: "Warning",
            description: "Account created but login may be required",
            variant: "warning"
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Provide a more specific error message for debugging
      const errorMessage = error instanceof Error 
        ? `${error.message}` 
        : "Registration failed - server error";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', config.api.endpoints.auth + '/logout');
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
      toast({
        title: "Success",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
