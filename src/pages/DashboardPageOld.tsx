import React, { useEffect, useState } from 'react';
import { useICP } from '../contexts/ICPContext';
import { useToast } from '../components/ui/Toaster'; // Placeholder for shadcn/ui toast
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'; // Placeholder
import { Skeleton, AstronautSkeleton } from '../components/ui/Skeleton'; // Placeholder
import { Button } from '../components/ui/Button'; // Placeholder
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../components/ui/AlertDialog'; // Placeholder
import { dataService } from '../lib/dataService';

import { Bell, Flame, Gem, BarChart2, AlertTriangle, DatabaseZap, CircleDollarSign, Layers3, Bitcoin, BrainCircuit, RefreshCw } from 'lucide-react';

// Assuming types are defined in a central types file or directly from backend declarations if available
// These are placeholder types based on the .did.js stub
interface NftAlert { id: string; collectionSlug: string; targetPrice: number; isActive: boolean; }
interface GasAlert { id: string; blockchain: string; maxGwei: number; isActive: boolean; }
interface MonitoredToken { id: string; name: string; symbol: string; isActive: boolean; }
interface CachedNftCollection { slug: string; name: string; floorPrice: number; currency: string; }
interface CachedGasPrice { chain: string; fast: { gwei: number, usd?: number }; standard: { gwei: number, usd?: number }; slow: { gwei: number, usd?: number }; }
interface CachedTokenPrice { id: string; symbol: string; name: string; priceUsd: number; }
interface CanisterMetrics { cyclesBalance: bigint; /* other fields */ } // bigint for cycles
interface RecentAlertLog { id: string, message: string, timestamp: Date }


const DashboardPage: React.FC = () => {
  const { actor, isAdmin, isAuthenticated, isConnecting, getDashboardData, updateLiveData } = useICP();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingData, setIsUpdatingData] = useState(false);

  const fetchData = async () => {
    if (!actor) {
      if (!isConnecting) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Could not load dashboard data.", "Fetch Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLiveData = async () => {
    setIsUpdatingData(true);
    try {
      await updateLiveData();
      await fetchData(); // Refresh dashboard after update
      toast.success("Live data updated successfully!", "Data Updated");
    } catch (error) {
      console.error("Failed to update live data:", error);
      toast.error("Failed to update live data.", "Update Error");
    } finally {
      setIsUpdatingData(false);
    }
  };

  useEffect(() => {
    if (actor) { // Only fetch if actor is available
        fetchData();
        const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(intervalId);
    } else if (!isConnecting) { // If not connecting and no actor, means it's likely an unauth state or error
        setIsLoading(false);
        // Potentially clear data or show a message
        setNftAlerts([]);
        setGasAlerts([]);
        // ... etc for other states
    }
  }, [actor, isAdmin, isConnecting]); // Add isConnecting to re-trigger when connection completes

  const formatCycles = (cycles: bigint | undefined): string => {
    if (cycles === undefined) return "N/A";
    const trillion = BigInt(1_000_000_000_000);
    if (cycles < trillion) {
        const billion = BigInt(1_000_000_000);
        if (cycles < billion) {
            const million = BigInt(1_000_000);
            return `${(Number(cycles) / Number(million)).toFixed(2)} Million`;
        }
        return `${(Number(cycles) / Number(billion)).toFixed(2)} Billion`;
    }
    return `${(Number(cycles) / Number(trillion)).toFixed(2)} Trillion`;
  };

  const cyclesThreshold = BigInt(500_000_000_000); // 500 Billion

  if (isLoading && !nftAlerts.length && !cachedCollections.length) { // Show skeleton only on initial full load
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    );
  }

  if (!actor && !isConnecting) {
    return (
         <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-purple-900/70 to-indigo-900/60 p-6 rounded-2xl shadow-xl text-center">
            <CardHeader>
                <div className="mx-auto p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full w-fit mb-3">
                    <BrainCircuit size={32} className="text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Welcome to PivotFlow!</CardTitle>
                <CardDescription className="text-gray-300">
                    Connect your Internet Identity to manage alerts and access personalized features.
                    <br />Public data like market prices will be displayed once available.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-gray-400 mt-2">
                    Currently viewing public market data. Some features require login.
                </p>
                 {/* Optionally, display some generic market data here if available without login */}
            </CardContent>
        </Card>
    )
  }


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Admin Canister Metrics */}
      {isAdmin && canisterMetrics && (
        <Card className={`col-span-1 md:col-span-2 lg:col-span-3 shadow-lg ${canisterMetrics.cyclesBalance < cyclesThreshold ? 'border-red-500/70 shadow-red-500/30 animate-pulse-border-red' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-cyan-300 flex items-center">
              <DatabaseZap className="w-5 h-5 mr-2" />
              Operator Zone: Canister Stats
            </CardTitle>
            {canisterMetrics.cyclesBalance < cyclesThreshold && (
              <AlertTriangle className="w-6 h-6 text-red-400 animate-ping-slow" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCycles(canisterMetrics.cyclesBalance)} Cycles</div>
            {canisterMetrics.cyclesBalance < cyclesThreshold && (
              <p className="text-sm text-red-400 font-semibold mt-1">
                LOW CYCLES - TOP UP REQUIRED!
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Regularly monitor and top up to ensure uninterrupted service.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-3 border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 hover:text-cyan-300">
                  Top Up Cycles Guide
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cycle Top-Up Instructions</AlertDialogTitle>
                  <AlertDialogDescription>
                    To top up your canister's cycles, you can use the DFINITY Canister SDK (dfx) or NNS frontend dApp.
                    <br /><br /><strong>Using dfx:</strong><br />
                    1. Ensure you have cycles in your wallet: `dfx wallet balance`<br />
                    2. If not, send XDR to your wallet's address.<br />
                    3. Top up the canister: `dfx canister deposit-cycles --canister YOUR_CANISTER_NAME_OR_ID AMOUNT_IN_TRILLIONS T` (e.g., 10T)
                    <br /><br /><strong>Using NNS dApp:</strong><br />
                    Navigate to your canister in the NNS dApp and use the 'Add Cycles' option.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-gray-300">Active NFT Alerts</CardTitle>
            <Bell className="w-5 h-5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            {isLoading && !nftAlerts.length ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-white">{nftAlerts.length}</div>}
            <p className="text-xs text-gray-500">Monitoring NFT floor prices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-gray-300">Active Gas Alerts</CardTitle>
            <Flame className="w-5 h-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            {isLoading && !gasAlerts.length ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-white">{gasAlerts.length}</div>}
            <p className="text-xs text-gray-500">Tracking blockchain gas fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-gray-300">Monitored Tokens</CardTitle>
            <Gem className="w-5 h-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            {isLoading && !monitoredTokens.length ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-white">{monitoredTokens.length}</div>}
            <p className="text-xs text-gray-500">Watching token/memecoin prices</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Market Snapshot & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Market Snapshot Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-green-400"/>Market Snapshot</CardTitle>
                <CardDescription>Real-time cached prices from the backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {isLoading && !cachedGasPrices.length && !cachedTokenPrices.length && !cachedCollections.length ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                <>
                  {/* Gas Prices */}
                  {cachedGasPrices.map(gas => (
                    <div key={gas.chain} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-md text-sky-300 flex items-center">
                            <Flame className="w-4 h-4 mr-1.5 text-orange-400"/> {gas.chain} Gas
                        </h4>
                        {gas.chain.toLowerCase() === 'internet computer' || gas.chain.toLowerCase() === 'icp' ? (
                             <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-medium">Zero User Fees</span>
                        ) : (
                             <span className="text-xs text-gray-400">Fast: {gas.fast.gwei} Gwei</span>
                        )}
                      </div>
                      {gas.chain.toLowerCase() !== 'internet computer' && gas.chain.toLowerCase() !== 'icp' && (
                        <div className="text-xs text-gray-400 grid grid-cols-3 gap-1">
                            <span>Std: {gas.standard.gwei} Gwei{gas.standard.usd ? ` (~$${gas.standard.usd.toFixed(2)})` : ''}</span>
                            <span>Slow: {gas.slow.gwei} Gwei{gas.slow.usd ? ` (~$${gas.slow.usd.toFixed(2)})` : ''}</span>
                             <span className="text-right">Fast USD: {gas.fast.usd ? `~$${gas.fast.usd.toFixed(2)}` : 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Token Prices (BTC, ETH, ICP + Monitored) */}
                  {cachedTokenPrices.filter(t => ['bitcoin', 'ethereum', 'internet-computer'].includes(t.id) || monitoredTokens.find(mt => mt.id === t.id)).map(token => (
                     <div key={token.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-md text-purple-300 flex items-center">
                            {token.id === 'bitcoin' && <Bitcoin className="w-4 h-4 mr-1.5 text-yellow-500"/>}
                            {token.id === 'ethereum' && <Layers3 className="w-4 h-4 mr-1.5 text-sky-500"/>}
                            {token.id === 'internet-computer' && <img src="https://cryptologos.cc/logos/internet-computer-icp-logo.svg?v=032" alt="ICP" className="w-4 h-4 mr-1.5"/>}
                            {!['bitcoin', 'ethereum', 'internet-computer'].includes(token.id) && <CircleDollarSign className="w-4 h-4 mr-1.5 text-green-400"/>}
                            {token.name} ({token.symbol.toUpperCase()})
                        </h4>
                        <span className="text-md font-semibold text-gray-200">${token.priceUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: token.priceUsd > 1 ? 2 : 6})}</span>
                      </div>
                    </div>
                  ))}
                  {/* Blue-chip NFTs */}
                  {cachedCollections.slice(0,3).map(nft => ( // Show top 3 or so
                    <div key={nft.slug} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-md text-pink-300 flex items-center">
                            <Gem className="w-4 h-4 mr-1.5 text-pink-400"/> {nft.name}
                        </h4>
                        <span className="text-md font-semibold text-gray-200">{nft.floorPrice.toFixed(2)} {nft.currency}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Bell className="w-5 h-5 mr-2 text-yellow-400"/>Recent Activity</CardTitle>
            <CardDescription>Latest triggered alerts from the system.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {isLoading && !recentActivity.length ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : recentActivity.length > 0 ? (
              recentActivity.map(log => (
                <div key={log.id} className="text-xs p-2.5 rounded-lg bg-purple-800/40 border border-purple-700/60 shadow-sm hover:bg-purple-700/50 transition-colors">
                  <p className="text-gray-200">{log.message}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{log.timestamp.toLocaleTimeString()} - {log.timestamp.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity to display.</p>
                <p className="text-xs text-gray-600">Alerts will appear here when triggered.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
