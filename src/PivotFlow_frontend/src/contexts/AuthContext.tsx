import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../lib/auth';
import { canisterClient } from '../lib/canister';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: string | null;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const authState = await authService.getAuthState();
      setIsAuthenticated(authState.isAuthenticated);
      setPrincipal(authState.principal);
      
      // Initialize canister client with identity if authenticated
      if (authState.isAuthenticated && authState.identity) {
        try {
          await canisterClient.init(authState.identity);
          console.log('Canister client initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize canister client:', error);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await authService.login();
      
      if (success) {
        const authState = await authService.getAuthState();
        setIsAuthenticated(true);
        setPrincipal(authState.principal);
        
        // Initialize canister client with the new identity
        if (authState.identity) {
          try {
            await canisterClient.init(authState.identity);
            console.log('Canister client initialized after login');
          } catch (error) {
            console.warn('Failed to initialize canister client after login:', error);
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, principal, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};