// API service for fetching live market data
import { Principal } from '@dfinity/principal';

// Types for API responses
export interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: {
    user: {
      username: string;
    };
    profile_img_url: string;
    address: string;
  };
  safelist_request_status: string;
  is_subject_to_whitelist: boolean;
  primary_asset_contracts: any[];
  traits: any[];
  stats: {
    one_day_volume: number;
    one_day_change: number;
    one_day_sales: number;
    one_day_average_price: number;
    seven_day_volume: number;
    seven_day_change: number;
    seven_day_sales: number;
    seven_day_average_price: number;
    thirty_day_volume: number;
    thirty_day_change: number;
    thirty_day_sales: number;
    thirty_day_average_price: number;
    total_volume: number;
    total_sales: number;
    total_supply: number;
    count: number;
    num_owners: number;
    average_price: number;
    num_reports: number;
    market_cap: number;
    floor_price: number;
  };
}

export interface EthGasStationResponse {
  fast: number;
  standard: number;
  safe: number;
  baseFee: number;
  blockTime: number;
  blockNumber: number;
}

export interface GasNowResponse {
  code: number;
  data: {
    rapid: number;
    fast: number;
    standard: number;
    slow: number;
    timestamp: number;
  };
}

// API service class
export class MarketDataAPI {
  private static instance: MarketDataAPI;
  private baseUrls = {
    coinGecko: 'https://api.coingecko.com/api/v3',
    openSea: 'https://api.opensea.io/api/v1',
    ethGasStation: 'https://ethgasstation.info/api',
    gasNow: 'https://www.gasnow.org/api/v3/gas/price',
    polygonGasStation: 'https://gasstation-mainnet.matic.network/v2',
  };

  private constructor() {}

  public static getInstance(): MarketDataAPI {
    if (!MarketDataAPI.instance) {
      MarketDataAPI.instance = new MarketDataAPI();
    }
    return MarketDataAPI.instance;
  }

  // Fetch cryptocurrency prices from CoinGecko
  async fetchCryptoPrices(coinIds: string[]): Promise<CoinGeckoPrice[]> {
    try {
      const idsParam = coinIds.join(',');
      const response = await fetch(
        `${this.baseUrls.coinGecko}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return [];
    }
  }

  // Fetch NFT collection stats from OpenSea
  async fetchNFTCollectionStats(collectionSlug: string): Promise<OpenSeaCollection | null> {
    try {
      const response = await fetch(
        `${this.baseUrls.openSea}/collection/${collectionSlug}`,
        {
          headers: {
            'X-API-KEY': process.env.OPENSEA_API_KEY || '', // Add your OpenSea API key
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.collection;
    } catch (error) {
      console.error('Error fetching NFT collection stats:', error);
      return null;
    }
  }

  // Fetch Ethereum gas prices
  async fetchEthereumGasPrices(): Promise<{ fast: number; standard: number; slow: number } | null> {
    try {
      // Try multiple gas APIs for reliability
      const gasPromises = [
        this.fetchFromEthGasStation(),
        this.fetchFromGasNow(),
      ];

      const results = await Promise.allSettled(gasPromises);
      
      // Return the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }

      // Fallback to estimated values if all APIs fail
      return {
        fast: 40,
        standard: 25,
        slow: 15,
      };
    } catch (error) {
      console.error('Error fetching Ethereum gas prices:', error);
      return null;
    }
  }

  private async fetchFromEthGasStation(): Promise<{ fast: number; standard: number; slow: number } | null> {
    try {
      const response = await fetch(`${this.baseUrls.ethGasStation}/ethgasAPI.json`);
      if (!response.ok) throw new Error('ETH Gas Station API failed');
      
      const data: EthGasStationResponse = await response.json();
      return {
        fast: Math.round(data.fast / 10), // Convert from decisecond to gwei
        standard: Math.round(data.standard / 10),
        slow: Math.round(data.safe / 10),
      };
    } catch (error) {
      console.error('ETH Gas Station error:', error);
      return null;
    }
  }

  private async fetchFromGasNow(): Promise<{ fast: number; standard: number; slow: number } | null> {
    try {
      const response = await fetch(this.baseUrls.gasNow);
      if (!response.ok) throw new Error('GasNow API failed');
      
      const data: GasNowResponse = await response.json();
      if (data.code !== 200) throw new Error('GasNow API error');
      
      return {
        fast: Math.round(data.data.fast / 1e9), // Convert from wei to gwei
        standard: Math.round(data.data.standard / 1e9),
        slow: Math.round(data.data.slow / 1e9),
      };
    } catch (error) {
      console.error('GasNow error:', error);
      return null;
    }
  }

  // Fetch Polygon gas prices
  async fetchPolygonGasPrices(): Promise<{ fast: number; standard: number; slow: number } | null> {
    try {
      const response = await fetch(`${this.baseUrls.polygonGasStation}`);
      if (!response.ok) throw new Error('Polygon Gas Station API failed');
      
      const data = await response.json();
      return {
        fast: Math.round(data.fast.maxFee),
        standard: Math.round(data.standard.maxFee),
        slow: Math.round(data.safeLow.maxFee),
      };
    } catch (error) {
      console.error('Error fetching Polygon gas prices:', error);
      // Fallback values for Polygon
      return {
        fast: 50,
        standard: 35,
        slow: 25,
      };
    }
  }

  // Fetch BNB Chain gas prices (estimated)
  async fetchBNBGasPrices(): Promise<{ fast: number; standard: number; slow: number }> {
    // BNB Chain typically has low and stable gas prices
    return {
      fast: 5,
      standard: 3,
      slow: 1,
    };
  }

  // Fetch Solana transaction fees (typically very low)
  async fetchSolanaFees(): Promise<{ fast: number; standard: number; slow: number }> {
    // Solana fees are typically very low and stable
    return {
      fast: 0.001,
      standard: 0.000025,
      slow: 0.000005,
    };
  }

  // Fetch wallet NFTs (mock implementation for now)
  async fetchWalletNFTs(walletAddress: string): Promise<any[]> {
    try {
      // This would normally call OpenSea or other NFT APIs
      // For now, return mock data to demonstrate functionality
      console.log(`Fetching NFTs for wallet: ${walletAddress}`);
      
      // In production, you'd use:
      // const response = await fetch(`${this.baseUrls.openSea}/assets?owner=${walletAddress}&limit=50`);
      
      return []; // Return empty array for now
    } catch (error) {
      console.error('Error fetching wallet NFTs:', error);
      return [];
    }
  }

  // Calculate USD cost for gas
  calculateGasCostUSD(gasPrice: number, gasLimit: number, ethPriceUSD: number): number {
    const gasCostETH = (gasPrice * gasLimit) / 1e9; // Convert gwei to ETH
    return gasCostETH * ethPriceUSD;
  }

  // Get popular NFT collections for monitoring
  getPopularNFTCollections(): Array<{ slug: string; name: string }> {
    return [
      { slug: 'boredapeyachtclub', name: 'Bored Ape Yacht Club' },
      { slug: 'mutant-ape-yacht-club', name: 'Mutant Ape Yacht Club' },
      { slug: 'azuki', name: 'Azuki' },
      { slug: 'cryptopunks', name: 'CryptoPunks' },
      { slug: 'otherdeed', name: 'Otherdeeds for Otherside' },
      { slug: 'doodles-official', name: 'Doodles' },
      { slug: 'clonex', name: 'CLONE X' },
      { slug: 'moonbirds', name: 'Moonbirds' },
      { slug: 'coolcats', name: 'Cool Cats NFT' },
      { slug: 'world-of-women-nft', name: 'World of Women' },
    ];
  }

  // Get popular cryptocurrencies for monitoring
  getPopularCryptos(): Array<{ id: string; symbol: string; name: string }> {
    return [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
      { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
      { id: 'solana', symbol: 'SOL', name: 'Solana' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
      { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
      { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
    ];
  }
}

// Export singleton instance
export const marketDataAPI = MarketDataAPI.getInstance();
