import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, ActorSubclass, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// Import from the correct PivotFlow backend declarations
import { idlFactory, createActor as createBackendActor } from '../declarations/PivotFlow_backend';
import type { _SERVICE as PivotFlowBackendService } from '../declarations/PivotFlow_backend/PivotFlow_backend.did';
import { dataService } from '../lib/dataService';

// --- Types ---
interface ICPContextType {
  authClient: AuthClient | null;
  principal: Principal | null;
  actor: ActorSubclass<PivotFlowBackendService> | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  // Add method to refresh actor
  refreshActor: () => Promise<void>;
  // Add data service methods
  updateLiveData: () => Promise<void>;
  getDashboardData: () => Promise<any>;
}

const ICPContext = createContext<ICPContextType | undefined>(undefined);

export const useICP = (): ICPContextType => {
  const context = useContext(ICPContext);
  if (!context) {
    throw new Error('useICP must be used within an ICPProvider');
  }
  return context;
};

interface ICPProviderProps {
  children: ReactNode;
}

export const ICPProvider: React.FC<ICPProviderProps> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [actor, setActor] = useState<ActorSubclass<PivotFlowBackendService> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const canisterId = process.env.PIVOTFLOW_BACKEND_CANISTER_ID ||
                     import.meta.env.VITE_PIVOTFLOW_BACKEND_CANISTER_ID ||
                     "bkyz2-fmaaa-aaaaa-qaaaq-cai"; // Fallback

  useEffect(() => {
    const initAuth = async () => {
      setIsConnecting(true);
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        const authenticated = await client.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const identity = client.getIdentity();
          const userPrincipal = identity.getPrincipal();
          setPrincipal(userPrincipal);

          // Use the createBackendActor function from your declarations
          const backendActor = createBackendActor(canisterId, { 
            agentOptions: { 
              identity,
              host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' 
            } 
          });
          setActor(backendActor);
          
          // Set actor in data service
          dataService.setActor(backendActor as any);

          // Check admin status - Updated for PivotFlow backend
          if (backendActor.getUser) { // First get user to check isOperator field
            try {
              const user = await backendActor.getUser();
              if (user && typeof user === 'object' && 'isOperator' in user) {
                setIsAdmin(Boolean((user as any).isOperator));
              }
            } catch (error) {
              console.warn("Could not check admin status:", error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }

        } else {
          // Create a default actor instance even if not authenticated for public calls
          const anonymousActor = createBackendActor(canisterId, { agentOptions: { host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' } });
          setActor(anonymousActor);
        }
      } catch (error) {
        console.error("Error during AuthClient initialization or actor creation:", error);
        // Potentially set an error state or show a toast
        // For now, create a default actor for public calls if auth fails
        const anonymousActor = createBackendActor(canisterId, { agentOptions: { host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' } });
        setActor(anonymousActor);
      } finally {
        setIsConnecting(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) {
      console.error("AuthClient not initialized");
      // Add user feedback: e.g. toast.error("Authentication service not ready. Please try again.")
      return;
    }
    setIsConnecting(true);
    try {
      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`, // Replace with your local II canister ID if different
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const userPrincipal = identity.getPrincipal();
          setIsAuthenticated(true);
          setPrincipal(userPrincipal);

          const backendActor = createBackendActor(canisterId, { 
            agentOptions: { 
              identity,
              host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' 
            } 
          });
          setActor(backendActor);
          
          // Set actor in data service
          dataService.setActor(backendActor as any);

          // Check admin status for authenticated user
          try {
            const user = await backendActor.getUser();
            if (user && typeof user === 'object' && 'isOperator' in user) {
              setIsAdmin(Boolean((user as any).isOperator));
            }
          } catch (error) {
            console.warn("Could not check admin status during login:", error);
            setIsAdmin(false);
          }
          // Add user feedback: e.g. toast.success("Successfully logged in!")
        },
        onError: (error) => {
          console.error("Login failed:", error);
          setIsAuthenticated(false);
          // Add user feedback: e.g. toast.error(`Login failed: ${error}`)
        },
      });
    } catch (error) {
      console.error("Error during login process:", error);
      // Add user feedback: e.g. toast.error("An unexpected error occurred during login.")
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = async () => {
    if (!authClient) {
      console.error("AuthClient not initialized");
      // Add user feedback: e.g. toast.error("Authentication service not ready.")
      return;
    }
    setIsConnecting(true);
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      setIsAdmin(false);
      // Re-create actor with anonymous identity for public calls
      const anonymousActor = createBackendActor(canisterId, { agentOptions: { host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' } });
      setActor(anonymousActor);
      // Add user feedback: e.g. toast.info("Successfully logged out.")
    } catch (error) {
      console.error("Logout failed:", error);
      // Add user feedback: e.g. toast.error(`Logout failed: ${error}`)
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshActor = async () => {
    if (!authClient) return;
    
    try {
      const isAuth = await authClient.isAuthenticated();
      if (isAuth) {
        const identity = authClient.getIdentity();
        const backendActor = createBackendActor(canisterId, { 
          agentOptions: { 
            identity,
            host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' 
          } 
        });
        setActor(backendActor);
      } else {
        const anonymousActor = createBackendActor(canisterId, { 
          agentOptions: { 
            host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943' 
          } 
        });
        setActor(anonymousActor);
      }
    } catch (error) {
      console.error("Error refreshing actor:", error);
    }
  };
  
  // Data service methods
  const updateLiveData = async () => {
    try {
      await dataService.updateLiveData();
    } catch (error) {
      console.error('Error updating live data:', error);
    }
  };
  
  const getDashboardData = async () => {
    try {
      return await dataService.getDashboardData();
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  };

  // Firebase stub was requested in App.tsx, keeping it there for now as per plan step.
  // If it needs to be tied to ICPContext state, it could be moved or called from here.

  return (
    <ICPContext.Provider value={{ 
      authClient, 
      principal, 
      actor, 
      isAuthenticated, 
      isConnecting, 
      isAdmin, 
      login, 
      logout, 
      refreshActor,
      updateLiveData,
      getDashboardData
    }}>
      {children}
    </ICPContext.Provider>
  );
};
