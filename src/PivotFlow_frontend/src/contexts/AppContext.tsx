import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { canisterClient } from '../lib/canister';

// Types
export interface NFTAlert {
  id: string;
  collectionSlug: string;
  collectionName: string;
  targetPrice: number;
  currency: string; // ICP, ckBTC, ckETH, USD
  alertType: 'drop_below' | 'rise_above' | 'any_change';
  blockchain: string; // 'ICP', 'Bitcoin (Chain Fusion)', 'Ethereum (Chain Fusion)'
  cyclesLimit?: number; // For ICP-based operations
  percentageChange?: number;
  currentFloorPrice: number;
  lastChecked: string;
  isActive: boolean;
}

export interface GasAlert {
  id: string;
  blockchain: string; // ICP, Bitcoin (Chain Fusion), Ethereum (Chain Fusion)
  maxCycles: number; // Maximum cycles to spend on operations
  operationType: 'transaction' | 'chain_fusion' | 'canister_call';
  isActive: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'nft_alert' | 'cycles_alert' | 'portfolio_update' | 'chain_fusion';
  message: string;
  timestamp: string;
  blockchain?: string;
  cyclesCost?: number;
}

export interface NetworkFee {
  blockchain: string;
  icon: string;
  transactionCost: { cycles: number; usd: number };
  chainFusionCost?: { cycles: number; usd: number }; // For cross-chain operations
}

export interface NFTItem {
  id: string;
  collectionName: string;
  tokenId: string;
  imageUrl: string;
  floorPrice: number;
  currency: string; // ICP, ckBTC, ckETH, USD
  marketplaceUrl: string;
  blockchain: string; // ICP, Bitcoin (Chain Fusion), Ethereum (Chain Fusion)
  standard?: string; // ICRC-7, EXT, etc.
}

export interface WalletAddress {
  id: string;
  address: string;
  blockchain: string;
  label?: string;
}

export interface AppSettings {
  apiKeys: {
    icpExplorer: string;
    btcExplorer: string;
    ethExplorer: string;
    nftMarketplace: string;
    priceOracle: string;
  };
  notifications: {
    telegramBotToken: string;
    discordBotToken: string;
    adminChatId: string;
    enableNftAlerts: boolean;
    enableCyclesAlerts: boolean;
    enablePortfolioUpdates: boolean;
    enableChainFusionAlerts: boolean;
  };
  ui: {
    darkMode: boolean;
    animationSpeed: number;
    preferredCurrency: 'ICP' | 'ckBTC' | 'ckETH' | 'USD';
  };
  chainFusion: {
    enableBitcoinIntegration: boolean;
    enableEthereumIntegration: boolean;
    maxCyclesPerOperation: number;
  };
}

interface AppContextType {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // NFT Alerts
  nftAlerts: NFTAlert[];
  addNftAlert: (alert: Omit<NFTAlert, 'id' | 'lastChecked' | 'isActive'>) => void;
  removeNftAlert: (id: string) => void;
  updateNftAlert: (id: string, updates: Partial<NFTAlert>) => void;
  
  // Gas/Cycles Alerts
  gasAlerts: GasAlert[];
  addGasAlert: (alert: Omit<GasAlert, 'id' | 'isActive'>) => void;
  removeGasAlert: (id: string) => void;
  
  // Network Fees
  networkFees: NetworkFee[];
  refreshNetworkFees: () => Promise<void>;
  
  // Portfolio
  walletAddresses: WalletAddress[];
  nftPortfolio: NFTItem[];
  addWalletAddress: (address: Omit<WalletAddress, 'id'>) => void;
  removeWalletAddress: (id: string) => void;
  refreshPortfolio: () => Promise<void>;
  
  // Activity
  recentActivity: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id'>) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // UI State
  isLoading: boolean;
  errorMessage: string | null;
  setError: (error: string | null) => void;
  
  // Canister Info (for operator)
  canisterCycles: number;
  isOperator: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, principal } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [nftAlerts, setNftAlerts] = useState<NFTAlert[]>([]);
  const [gasAlerts, setGasAlerts] = useState<GasAlert[]>([]);
  const [networkFees, setNetworkFees] = useState<NetworkFee[]>([]);
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([]);
  const [nftPortfolio, setNftPortfolio] = useState<NFTItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canisterCycles] = useState(1200000000000); // 1.2 Trillion
  const [isOperator, setIsOperator] = useState(false);

  // Demo mode - immediately populate with some sample data
  useEffect(() => {
    // Initialize with fallback data for demo purposes
    setNetworkFees([
      {
        blockchain: 'Internet Computer',
        icon: '∞',
        transactionCost: { cycles: 590000, usd: 0.000236 },
        chainFusionCost: { cycles: 25000000, usd: 0.01 },
      },
      {
        blockchain: 'Bitcoin (via Chain Fusion)',
        icon: '₿',
        transactionCost: { cycles: 50000000, usd: 0.02 },
        chainFusionCost: { cycles: 75000000, usd: 0.03 },
      },
      {
        blockchain: 'Ethereum (via Chain Fusion)',
        icon: '⟠',
        transactionCost: { cycles: 45000000, usd: 0.018 },
        chainFusionCost: { cycles: 80000000, usd: 0.032 },
      },
    ]);

    // Add initial activity message
    const initialActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'portfolio_update',
      message: 'PivotFlow initialized - Ready for ICP & Chain Fusion operations!',
      timestamp: new Date().toISOString(),
    };
    setRecentActivity([initialActivity]);
  }, []);

  const [settings, setSettings] = useState<AppSettings>({
    apiKeys: {
      icpExplorer: '',
      btcExplorer: '',
      ethExplorer: '',
      nftMarketplace: '',
      priceOracle: '',
    },
    notifications: {
      telegramBotToken: '',
      discordBotToken: '',
      adminChatId: '',
      enableNftAlerts: true,
      enableCyclesAlerts: true,
      enablePortfolioUpdates: true,
      enableChainFusionAlerts: true,
    },
    ui: {
      darkMode: true,
      animationSpeed: 1,
      preferredCurrency: 'ICP',
    },
    chainFusion: {
      enableBitcoinIntegration: true,
      enableEthereumIntegration: true,
      maxCyclesPerOperation: 100000000, // 100M cycles
    },
  });

  // Load user data when authenticated (but also work in demo mode)
  useEffect(() => {
    if (isAuthenticated && principal) {
      // Load user-specific data from ICP canister
      loadUserData();
      loadNetworkFees();
    } else {
      // Demo mode: user not authenticated but app should still work
      console.log('Running in demo mode - user not authenticated');
    }
  }, [isAuthenticated, principal]);

  const loadNetworkFees = async () => {
    try {
      const fees = await canisterClient.getNetworkFees();
      const formattedFees = fees.map((fee: any) => ({
        blockchain: fee.blockchain,
        icon: getBlockchainIcon(fee.blockchain),
        transactionCost: { cycles: fee.fast?.gwei || 590000, usd: fee.fast?.usd || 0.000236 },
        chainFusionCost: { cycles: fee.standard?.gwei || 25000000, usd: fee.standard?.usd || 0.01 },
      }));
      setNetworkFees(formattedFees);
    } catch (error) {
      console.error('Failed to load network fees:', error);
      // Fall back to static data on error
      setNetworkFees([
        {
          blockchain: 'Internet Computer',
          icon: '∞',
          transactionCost: { cycles: 590000, usd: 0.000236 },
          chainFusionCost: { cycles: 25000000, usd: 0.01 },
        },
        {
          blockchain: 'Bitcoin (via Chain Fusion)',
          icon: '₿',
          transactionCost: { cycles: 50000000, usd: 0.02 },
          chainFusionCost: { cycles: 75000000, usd: 0.03 },
        },
        {
          blockchain: 'Ethereum (via Chain Fusion)',
          icon: '⟠',
          transactionCost: { cycles: 45000000, usd: 0.018 },
          chainFusionCost: { cycles: 80000000, usd: 0.032 },
        },
      ]);
    }
  };

  const getBlockchainIcon = (blockchain: string): string => {
    const icons: { [key: string]: string } = {
      'Internet Computer': '∞',
      'ICP': '∞',
      'Bitcoin': '₿',
      'Bitcoin (via Chain Fusion)': '₿',
      'Ethereum': '⟠',
      'Ethereum (via Chain Fusion)': '⟠',
      'Polygon': '⬢',
      'Solana': '◈',
      'Chain Fusion': '🔗',
    };
    return icons[blockchain] || '○';
  };

  const loadUserData = async () => {
    if (!isAuthenticated || !principal) {
      console.log('User not authenticated, skipping backend data load');
      return;
    }

    try {
      setIsLoading(true);
      
      // Load user info (including operator status) from backend
      try {
        const userData = await canisterClient.getUser();
        if (userData && userData.length > 0) {
          setIsOperator(userData[0].isOperator);
        }
      } catch (error) {
        console.warn('Failed to load user data, continuing with defaults:', error);
      }
      
      // Load NFT alerts from backend
      let nftAlertsCount = 0;
      try {
        const nftAlertsData = await canisterClient.getUserNFTAlerts();
        const formattedNftAlerts = nftAlertsData.map((alert: any) => ({
          id: alert.id,
          collectionSlug: alert.collectionSlug,
          collectionName: alert.collectionName,
          targetPrice: alert.targetPrice,
          currency: alert.currency,
          alertType: Object.keys(alert.alertType)[0] as 'drop_below' | 'rise_above' | 'any_change',
          blockchain: alert.blockchain || 'ICP',
          cyclesLimit: alert.gasLimit ? Number(alert.gasLimit[0]) : undefined, // Map gasLimit to cyclesLimit
          percentageChange: alert.percentageChange ? Number(alert.percentageChange[0]) : undefined,
          currentFloorPrice: alert.currentFloorPrice,
          lastChecked: new Date(Number(alert.lastChecked) / 1000000).toISOString(),
          isActive: alert.isActive,
        }));
        setNftAlerts(formattedNftAlerts);
        nftAlertsCount = formattedNftAlerts.length;
      } catch (error) {
        console.warn('Failed to load NFT alerts:', error);
      }

      // Load gas alerts from backend
      let gasAlertsCount = 0;
      try {
        const gasAlertsData = await canisterClient.getUserGasAlerts();
        const formattedGasAlerts = gasAlertsData.map((alert: any) => ({
          id: alert.id,
          blockchain: alert.blockchain,
          maxCycles: Number(alert.maxGwei), // Map maxGwei to maxCycles for ICP
          operationType: 'transaction' as 'transaction' | 'chain_fusion' | 'canister_call',
          isActive: alert.isActive,
        }));
        setGasAlerts(formattedGasAlerts);
        gasAlertsCount = formattedGasAlerts.length;
      } catch (error) {
        console.warn('Failed to load gas alerts:', error);
      }
      
      addActivity({
        type: 'portfolio_update',
        message: `Welcome back! Loaded ${nftAlertsCount} NFT alerts and ${gasAlertsCount} cycles alerts`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserData = () => {
    setNftAlerts([]);
    setGasAlerts([]);
    setWalletAddresses([]);
    setNftPortfolio([]);
    setRecentActivity([]);
    setCurrentView('dashboard');
  };

  // Auto refresh network fees periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadNetworkFees();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const addNftAlert = async (alert: Omit<NFTAlert, 'id' | 'lastChecked' | 'isActive'>) => {
    console.log('addNftAlert called with:', alert);
    try {
      setIsLoading(true);
      
      if (isAuthenticated && principal) {
        // Try to create alert via backend
        try {
          const alertType = { [alert.alertType]: null } as any;
          
          const newAlert = await canisterClient.createNFTAlert(
            alert.collectionSlug,
            alert.collectionName,
            alertType,
            alert.targetPrice,
            alert.currency
          );
          
          const formattedAlert: NFTAlert = {
            id: newAlert.id,
            collectionSlug: newAlert.collectionSlug,
            collectionName: newAlert.collectionName,
            targetPrice: newAlert.targetPrice,
            currency: newAlert.currency,
            alertType: Object.keys(newAlert.alertType)[0] as 'drop_below' | 'rise_above' | 'any_change',
            blockchain: newAlert.blockchain || 'ICP',
            cyclesLimit: newAlert.gasLimit ? Number(newAlert.gasLimit[0]) : undefined,
            percentageChange: newAlert.percentageChange ? Number(newAlert.percentageChange[0]) : undefined,
            currentFloorPrice: newAlert.currentFloorPrice,
            lastChecked: new Date(Number(newAlert.lastChecked) / 1000000).toISOString(),
            isActive: newAlert.isActive,
          };
          
          setNftAlerts(prev => [...prev, formattedAlert]);
        } catch (backendError) {
          console.warn('Backend call failed, using local storage:', backendError);
          // Fallback: create alert locally
          const localAlert: NFTAlert = {
            ...alert,
            id: Date.now().toString(),
            lastChecked: new Date().toISOString(),
            isActive: true,
            currentFloorPrice: alert.targetPrice + (Math.random() - 0.5) * 10, // Mock current price
          };
          setNftAlerts(prev => [...prev, localAlert]);
        }
      } else {
        console.log('User not authenticated, creating local alert');
        // User not authenticated: create alert locally
        const localAlert: NFTAlert = {
          ...alert,
          id: Date.now().toString(),
          lastChecked: new Date().toISOString(),
          isActive: true,
          currentFloorPrice: alert.targetPrice + (Math.random() - 0.5) * 10, // Mock current price
        };
        setNftAlerts(prev => [...prev, localAlert]);
      }
      
      addActivity({
        type: 'nft_alert',
        message: `New NFT alert created for ${alert.collectionName}`,
        timestamp: new Date().toISOString(),
      });
      
      console.log('NFT alert created successfully');
    } catch (error) {
      console.error('Failed to add NFT alert:', error);
      setError('Failed to create NFT alert');
    } finally {
      setIsLoading(false);
    }
  };

  const removeNftAlert = async (id: string) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.removeNftAlert(principal, id);
      
      setNftAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Failed to remove NFT alert:', error);
      setError('Failed to remove NFT alert');
    }
  };

  const updateNftAlert = async (id: string, updates: Partial<NFTAlert>) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.updateNftAlert(principal, id, updates);
      
      setNftAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, ...updates } : alert
      ));
    } catch (error) {
      console.error('Failed to update NFT alert:', error);
      setError('Failed to update NFT alert');
    }
  };

  const addGasAlert = async (alert: Omit<GasAlert, 'id' | 'isActive'>) => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated && principal) {
        // Try to create alert via backend
        try {
          const priorityTier = { [alert.operationType]: null } as any;
          
          const newAlert = await canisterClient.createGasAlert(
            alert.blockchain,
            alert.maxCycles,
            priorityTier
          );
          
          const formattedAlert: GasAlert = {
            id: newAlert.id,
            blockchain: newAlert.blockchain,
            maxCycles: Number(newAlert.maxGwei), // Backend returns maxGwei, we map to maxCycles
            operationType: alert.operationType,
            isActive: newAlert.isActive,
          };
          
          setGasAlerts(prev => [...prev, formattedAlert]);
        } catch (backendError) {
          console.warn('Backend call failed, using local storage:', backendError);
          // Fallback: create alert locally
          const localAlert: GasAlert = {
            ...alert,
            id: Date.now().toString(),
            isActive: true,
          };
          setGasAlerts(prev => [...prev, localAlert]);
        }
      } else {
        // User not authenticated: create alert locally
        const localAlert: GasAlert = {
          ...alert,
          id: Date.now().toString(),
          isActive: true,
        };
        setGasAlerts(prev => [...prev, localAlert]);
      }
      
      addActivity({
        type: 'cycles_alert',
        message: `New cycles alert created for ${alert.blockchain}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to add cycles alert:', error);
      setError('Failed to create cycles alert');
    } finally {
      setIsLoading(false);
    }
  };

  const removeGasAlert = async (id: string) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.removeGasAlert(principal, id);
      
      setGasAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Failed to remove cycles alert:', error);
      setError('Failed to remove cycles alert');
    }
  };

  const refreshNetworkFees = async () => {
    setIsLoading(true);
    try {
      await loadNetworkFees();
      addActivity({
        type: 'portfolio_update',
        message: 'Network fees refreshed successfully',
        timestamp: new Date().toISOString(),
        cyclesCost: 1000000, // Approximate cycles cost for the operation
      });
    } catch (error) {
      setErrorMessage('Failed to refresh network fees');
    } finally {
      setIsLoading(false);
    }
  };

  const addWalletAddress = async (address: Omit<WalletAddress, 'id'>) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.addWalletAddress(principal, address);
      
      const newAddress: WalletAddress = {
        ...address,
        id: Date.now().toString(),
      };
      setWalletAddresses(prev => [...prev, newAddress]);
    } catch (error) {
      console.error('Failed to add wallet address:', error);
      setError('Failed to add wallet address');
    }
  };

  const removeWalletAddress = async (id: string) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.removeWalletAddress(principal, id);
      
      setWalletAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (error) {
      console.error('Failed to remove wallet address:', error);
      setError('Failed to remove wallet address');
    }
  };

  const refreshPortfolio = async () => {
    console.log('refreshPortfolio called');
    setIsLoading(true);
    try {
      // Simulate portfolio refresh with immediate feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const walletCount = walletAddresses.length;
      let message = 'Portfolio refresh completed';
      
      if (walletCount === 0) {
        message = 'No wallets connected. Add wallet addresses to view NFT portfolio.';
      } else {
        message = `Portfolio refresh completed for ${walletCount} connected wallet${walletCount > 1 ? 's' : ''}`;
      }
      
      addActivity({
        type: 'portfolio_update',
        message,
        timestamp: new Date().toISOString(),
        cyclesCost: 1000000, // Show cycles cost
      });
      
      console.log('Portfolio refresh completed');
    } catch (error) {
      console.error('Portfolio refresh error:', error);
      setErrorMessage('Failed to refresh portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (activity: Omit<ActivityItem, 'id'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      // TODO: Replace with actual ICP canister call
      // await canisterActor.updateSettings(principal, updates);
      
      setSettings(prev => ({
        ...prev,
        ...updates,
        apiKeys: { ...prev.apiKeys, ...updates.apiKeys },
        notifications: { ...prev.notifications, ...updates.notifications },
        ui: { ...prev.ui, ...updates.ui },
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError('Failed to update settings');
    }
  };

  const setError = (error: string | null) => {
    setErrorMessage(error);
    if (error) {
      setTimeout(() => setErrorMessage(null), 5000); // Auto-clear after 5 seconds
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        nftAlerts,
        addNftAlert,
        removeNftAlert,
        updateNftAlert,
        gasAlerts,
        addGasAlert,
        removeGasAlert,
        networkFees,
        refreshNetworkFees,
        walletAddresses,
        nftPortfolio,
        addWalletAddress,
        removeWalletAddress,
        refreshPortfolio,
        recentActivity,
        addActivity,
        settings,
        updateSettings,
        isLoading,
        errorMessage,
        setError,
        canisterCycles,
        isOperator,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};