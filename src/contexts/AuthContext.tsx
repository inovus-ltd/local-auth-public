import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initializeAuth = () => {
      console.log('AuthContext: Initializing authentication...');
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          console.log('AuthContext: Found existing authentication:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('AuthContext: No existing authentication found');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth initialization error:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('AuthContext: Starting login process...');
      setIsLoading(true);
      
      await authService.login(email, password);
      console.log('AuthContext: Login successful, updating state...');
      
      // Get the user data that was stored by the auth service
      const userData = authService.getUser();
      console.log('AuthContext: Retrieved user data:', userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      console.log('AuthContext: Login process complete, user state updated');
      
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    console.log('AuthContext: Logging out user...');
    setUser(null);
    setIsAuthenticated(false);
    authService.logout();
    // Force redirect to login page
    window.location.href = '/login';
  };

  console.log('AuthContext: Current state:', { 
    user: user?.email, 
    fullName: user?.fullName,
    isAuthenticated, 
    isLoading 
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
