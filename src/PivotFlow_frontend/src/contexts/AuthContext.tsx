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
  const authService = AuthService.getInstance();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    console.log('🔍 Checking authentication state...');
    try {
      const authState = await authService.getAuthState();
      console.log('📋 Auth state received:', {
        isAuthenticated: authState.isAuthenticated,
        principal: authState.principal,
        hasIdentity: !!authState.identity
      });

      setIsAuthenticated(authState.isAuthenticated);
      setPrincipal(authState.principal);

      // Initialize canister client with identity if authenticated
      if (authState.isAuthenticated && authState.identity) {
        try {
          await canisterClient.init(authState.identity);
          console.log('✅ Canister client initialized successfully');
        } catch (error) {
          console.warn('⚠️ Failed to initialize canister client:', error);
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setIsLoading(false);
      console.log('🏁 Auth check completed');
    }
  };

  const login = async (): Promise<boolean> => {
    console.log('🚀 Starting login process...');
    try {
      setIsLoading(true);
      const success = await authService.login();
      console.log('🔐 Login result:', success);

      if (success) {
        console.log('✅ Login successful, refreshing auth state...');
        // Add a small delay to ensure login state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 500));
        // Refresh the auth state after successful login
        await checkAuthState();
      } else {
        console.log('❌ Login failed');
      }

      return success;
    } catch (error) {
      console.error('💥 Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 Starting logout process...');
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  // Add effect to listen for changes in window focus (when user returns from II)
  useEffect(() => {
    const handleFocus = () => {
      console.log('👀 Window focused, rechecking auth state...');
      if (!isAuthenticated) {
        checkAuthState();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  console.log('🔄 AuthProvider render:', { isAuthenticated, principal, isLoading });

  return (
    <AuthContext.Provider value={{ isAuthenticated, principal, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};