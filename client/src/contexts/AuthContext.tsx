import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

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

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/session');
        const data = await response.json();
        
        if (!data.success) {
          console.error('Session check failed:', data.error || data.message);
          localStorage.removeItem('user');
          return;
        }
        
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Failed to check session:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message);
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back to Jamaalaki!',
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      if (!data.success) {
        if (data.errors) {
          // Handle field-specific errors
          const errorMessage = Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(errorMessage);
        }
        throw new Error(data.error || data.message);
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'Registration Successful',
        description: 'Welcome to Jamaalaki!',
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
