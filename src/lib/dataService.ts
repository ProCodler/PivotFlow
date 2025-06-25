// Data service that bridges backend canister and external APIs
import { ActorSubclass } from '@dfinity/agent';
import { marketDataAPI } from './api';

// Type imports - these should match your backend types
interface PivotFlowBackendService {
  getCachedNftCollections: () => Promise<any[]>;
  getCachedTokenPrices: () => Promise<any[]>;
  getCachedGasPrices: () => Promise<any[]>;
  updateCachedNftCollection: (slug: string, name: string, floorPrice: number[], currency: string) => Promise<any>;
  updateCachedTokenPrice: (id: string, symbol: string, name: string, priceUsd: number) => Promise<any>;
  runMonitoringCycle: () => Promise<any>;
  getUserNFTAlerts: () => Promise<any[]>;
  getUserGasAlerts: () => Promise<any[]>;
  getUserWallets: () => Promise<any[]>;
  getUserActivities: () => Promise<any[]>;
  getCanisterMetrics: () => Promise<any>;
}

export interface CachedData {
  nftCollections: any[];
  tokenPrices: any[];
  networkFees: any[];
  lastUpdated: Date;
}

export class DataService {
  private static instance: DataService;
  private actor: ActorSubclass<PivotFlowBackendService> | null = null;
  private cachedData: CachedData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 60000; // 1 minute

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public setActor(actor: ActorSubclass<PivotFlowBackendService> | null) {
    this.actor = actor;
    if (actor && !this.updateInterval) {
      this.startPeriodicUpdates();
    } else if (!actor && this.updateInterval) {
      this.stopPeriodicUpdates();
    }
  }

  private startPeriodicUpdates() {
    // Initial update
    this.updateLiveData();
    
    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.updateLiveData();
    }, this.UPDATE_INTERVAL);
  }

  private stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Update live data from external APIs and sync with backend
  public async updateLiveData(): Promise<void> {
    if (!this.actor) {
      console.warn('No actor available for data updates');
      return;
    }

    try {
      console.log('🔄 Updating live market data...');

      // Fetch live cryptocurrency prices
      const popularCryptos = marketDataAPI.getPopularCryptos();
      const cryptoIds = popularCryptos.map(c => c.id);
      const liveCryptoPrices = await marketDataAPI.fetchCryptoPrices(cryptoIds);

      // Update backend with live crypto prices
      for (const price of liveCryptoPrices) {
        try {
          await this.actor.updateCachedTokenPrice(
            price.id,
            price.symbol.toUpperCase(),
            price.name,
            price.current_price
          );
        } catch (error) {
          console.warn(`Failed to update ${price.symbol} price:`, error);
        }
      }

      // Fetch live gas prices
      const ethGasPrices = await marketDataAPI.fetchEthereumGasPrices();
      const polygonGasPrices = await marketDataAPI.fetchPolygonGasPrices();
      const bnbGasPrices = await marketDataAPI.fetchBNBGasPrices();
      const solanaFees = await marketDataAPI.fetchSolanaFees();

      // Update network fees (this would need to be implemented in the backend)
      // For now, we'll just log the data
      console.log('📊 Live Gas Prices:', {
        ethereum: ethGasPrices,
        polygon: polygonGasPrices,
        bnb: bnbGasPrices,
        solana: solanaFees,
      });

      // Fetch popular NFT collections
      const popularCollections = marketDataAPI.getPopularNFTCollections();
      for (const collection of popularCollections.slice(0, 5)) { // Limit to avoid rate limits
        try {
          const collectionData = await marketDataAPI.fetchNFTCollectionStats(collection.slug);
          if (collectionData && collectionData.stats) {
            await this.actor.updateCachedNftCollection(
              collection.slug,
              collection.name,
              collectionData.stats.floor_price ? [collectionData.stats.floor_price] : [],
              'ETH'
            );
          }
        } catch (error) {
          console.warn(`Failed to update ${collection.name} data:`, error);
        }
      }

      // Refresh cached data
      await this.refreshCachedData();

      console.log('✅ Live data update completed');
    } catch (error) {
      console.error('❌ Error updating live data:', error);
    }
  }

  // Get cached data from backend
  public async refreshCachedData(): Promise<CachedData | null> {
    if (!this.actor) return null;

    try {
      const [nftCollections, tokenPrices, networkFees] = await Promise.all([
        this.actor.getCachedNftCollections(),
        this.actor.getCachedTokenPrices(),
        this.actor.getCachedGasPrices(),
      ]);

      this.cachedData = {
        nftCollections,
        tokenPrices,
        networkFees,
        lastUpdated: new Date(),
      };

      return this.cachedData;
    } catch (error) {
      console.error('Error refreshing cached data:', error);
      return null;
    }
  }

  // Get current cached data
  public getCachedData(): CachedData | null {
    return this.cachedData;
  }

  // Get dashboard data with live updates
  public async getDashboardData(): Promise<{
    nftAlerts: any[];
    gasAlerts: any[];
    tokenPrices: any[];
    networkFees: any[];
    nftCollections: any[];
    recentActivity: any[];
    canisterMetrics?: any;
  } | null> {
    if (!this.actor) return null;

    try {
      // Refresh cached data first
      await this.refreshCachedData();

      const calls = [
        this.actor.getUserNFTAlerts(),
        this.actor.getUserGasAlerts(),
        this.actor.getUserActivities(),
      ];

      const [nftAlerts, gasAlerts, recentActivity] = await Promise.all(
        calls.map(p => p.catch(e => {
          console.warn('Dashboard API call failed:', e);
          return [];
        }))
      );

      // Try to get canister metrics (admin only)
      let canisterMetrics;
      try {
        canisterMetrics = await this.actor.getCanisterMetrics();
      } catch (error) {
        // Not admin or error occurred
        canisterMetrics = null;
      }

      return {
        nftAlerts,
        gasAlerts,
        tokenPrices: this.cachedData?.tokenPrices || [],
        networkFees: this.cachedData?.networkFees || [],
        nftCollections: this.cachedData?.nftCollections || [],
        recentActivity,
        canisterMetrics,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }

  // Run monitoring cycle (admin function)
  public async runMonitoringCycle(): Promise<any> {
    if (!this.actor) throw new Error('No actor available');
    
    try {
      const result = await this.actor.runMonitoringCycle();
      console.log('🔍 Monitoring cycle completed:', result);
      return result;
    } catch (error) {
      console.error('Error running monitoring cycle:', error);
      throw error;
    }
  }

  // Calculate transaction costs
  public calculateTransactionCost(
    gasPrice: number,
    gasLimit: number,
    ethPriceUSD: number
  ): { costETH: number; costUSD: number } {
    const costETH = (gasPrice * gasLimit) / 1e9;
    const costUSD = costETH * ethPriceUSD;
    
    return {
      costETH: Number(costETH.toFixed(6)),
      costUSD: Number(costUSD.toFixed(2)),
    };
  }

  // Format large numbers (for cycles, etc.)
  public formatLargeNumber(num: number | bigint): string {
    const n = typeof num === 'bigint' ? Number(num) : num;
    
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    
    return n.toString();
  }

  // Get price change indicator
  public getPriceChangeColor(change: number): string {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  }

  // Format percentage
  public formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  // Cleanup
  public destroy() {
    this.stopPeriodicUpdates();
    this.cachedData = null;
    this.actor = null;
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
