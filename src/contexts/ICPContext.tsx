import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, ActorSubclass, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// Assuming these are correctly exported from your placeholder or generated files
import { idlFactory, createActor as createBackendActor } from '../declarations/zero_fee_bot_backend';
import type { _SERVICE as ZeroFeeBotBackendService } from '../declarations/zero_fee_bot_backend/zero_fee_bot_backend.did'; // Adjust if path/type name differs

// --- Types ---
interface ICPContextType {
  authClient: AuthClient | null;
  principal: Principal | null;
  actor: ActorSubclass<ZeroFeeBotBackendService> | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  // Potentially add a toast function here if not using a global one from shadcn
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
  const [actor, setActor] = useState<ActorSubclass<ZeroFeeBotBackendService> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const canisterId = process.env.ZERO_FEE_BOT_BACKEND_CANISTER_ID ||
                     import.meta.env.VITE_ZERO_FEE_BOT_BACKEND_CANISTER_ID ||
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
          const backendActor = createBackendActor(identity, undefined); // undefined for host, will use default
          setActor(backendActor);

          // Check admin status
          if (backendActor.getAdmin) { // Check if function exists
            const adminPrincipal = await backendActor.getAdmin();
            if (adminPrincipal && userPrincipal.equals(adminPrincipal)) {
              setIsAdmin(true);
            } else {
              // Fallback check if getAdmin is not the one returning the admin principal but rather isAdmin() is the check
              if (backendActor.isAdmin) {
                 const adminStatus = await backendActor.isAdmin();
                 setIsAdmin(adminStatus);
              } else {
                setIsAdmin(false);
              }
            }
          } else if (backendActor.isAdmin) { // If only isAdmin exists
            const adminStatus = await backendActor.isAdmin();
            setIsAdmin(adminStatus);
          }

        } else {
          // Create a default actor instance even if not authenticated for public calls
          const anonymousActor = createBackendActor(undefined, undefined); // No identity, default host
          setActor(anonymousActor);
        }
      } catch (error) {
        console.error("Error during AuthClient initialization or actor creation:", error);
        // Potentially set an error state or show a toast
        // For now, create a default actor for public calls if auth fails
        const anonymousActor = createBackendActor(undefined, undefined);
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

          const backendActor = createBackendActor(identity, undefined);
          setActor(backendActor);

          if (backendActor.getAdmin) {
            const adminPrincipal = await backendActor.getAdmin();
             if (adminPrincipal && userPrincipal.equals(adminPrincipal)) {
              setIsAdmin(true);
            } else {
               if (backendActor.isAdmin) {
                 const adminStatus = await backendActor.isAdmin();
                 setIsAdmin(adminStatus);
              } else {
                setIsAdmin(false);
              }
            }
          } else if (backendActor.isAdmin) {
             const adminStatus = await backendActor.isAdmin();
             setIsAdmin(adminStatus);
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
      const anonymousActor = createBackendActor(undefined, undefined);
      setActor(anonymousActor);
      // Add user feedback: e.g. toast.info("Successfully logged out.")
    } catch (error) {
      console.error("Logout failed:", error);
      // Add user feedback: e.g. toast.error(`Logout failed: ${error}`)
    } finally {
      setIsConnecting(false);
    }
  };

  // Firebase stub was requested in App.tsx, keeping it there for now as per plan step.
  // If it needs to be tied to ICPContext state, it could be moved or called from here.

  return (
    <ICPContext.Provider value={{ authClient, principal, actor, isAuthenticated, isConnecting, isAdmin, login, logout }}>
      {children}
    </ICPContext.Provider>
  );
};
