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
      // Use apiRequest instead of direct fetch for consistent handling
      const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth}/session`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Always include credentials for session cookies
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session check response:', data);
        if (data.user) {
          setUser(data.user);
        } else {
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
      
      const data = await response.json();
      
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
      
      // The server returns the user object directly on success with a 201 status code
      const data = await response.json();
      
      // Set the user from the response data
      if (data && data.id) {
        setUser(data);
        toast({
          title: "Success",
          description: "Your account has been created successfully",
        });
        return true;
      } else {
        // This case handles if we get a valid response but no user data
        throw new Error('Registration successful but no user data returned');
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
