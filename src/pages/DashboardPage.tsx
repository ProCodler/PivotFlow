import React, { useEffect, useState } from 'react';
import { useICP } from '../contexts/ICPContext';
import { useToast } from '../components/ui/Toaster';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../components/ui/AlertDialog';
import { dataService } from '../lib/dataService';

import { Bell, Flame, Gem, BarChart2, AlertTriangle, DatabaseZap, CircleDollarSign, Layers3, Bitcoin, BrainCircuit, RefreshCw } from 'lucide-react';

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
    if (actor) {
      fetchData();
      const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds
      return () => clearInterval(intervalId);
    } else if (!isConnecting) {
      setIsLoading(false);
    }
  }, [actor, isConnecting]);

  const formatCycles = (cycles: bigint | number | undefined): string => {
    if (cycles === undefined) return "N/A";
    return dataService.formatLargeNumber(cycles);
  };

  const cyclesThreshold = BigInt(500_000_000_000); // 500 Billion

  if (isLoading && !dashboardData) {
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
            <br />Live market data is available below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mt-2">
            Currently viewing public market data. Some features require login.
          </p>
        </CardContent>
      </Card>
    );
  }

  const nftAlerts = dashboardData?.nftAlerts || [];
  const gasAlerts = dashboardData?.gasAlerts || [];
  const tokenPrices = dashboardData?.tokenPrices || [];
  const networkFees = dashboardData?.networkFees || [];
  const nftCollections = dashboardData?.nftCollections || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const canisterMetrics = dashboardData?.canisterMetrics;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Live Data Update Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <Button
          onClick={handleUpdateLiveData}
          disabled={isUpdatingData}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingData ? 'animate-spin' : ''}`} />
          {isUpdatingData ? 'Updating...' : 'Update Live Data'}
        </Button>
      </div>

      {/* Admin Canister Metrics */}
      {isAdmin && canisterMetrics && (
        <Card className={`shadow-lg ${canisterMetrics.cyclesBalance < cyclesThreshold ? 'border-red-500/70 shadow-red-500/30' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-cyan-300 flex items-center">
              <DatabaseZap className="w-5 h-5 mr-2" />
              Operator Zone: Canister Stats
            </CardTitle>
            {canisterMetrics.cyclesBalance < cyclesThreshold && (
              <AlertTriangle className="w-6 h-6 text-red-400 animate-ping" />
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
            <div className="text-2xl font-bold text-white">{nftAlerts.length}</div>
            <p className="text-xs text-gray-500">Monitoring NFT floor prices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-gray-300">Active Gas Alerts</CardTitle>
            <Flame className="w-5 h-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{gasAlerts.length}</div>
            <p className="text-xs text-gray-500">Tracking blockchain gas fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-gray-300">Cached Data Points</CardTitle>
            <Gem className="w-5 h-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tokenPrices.length + nftCollections.length}</div>
            <p className="text-xs text-gray-500">Live market data cached</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Market Snapshot & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Market Snapshot Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-green-400"/>
                Live Market Data
              </CardTitle>
              <CardDescription>Real-time prices from external APIs cached in backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {/* Gas Prices */}
              {networkFees.map((gas: any) => (
                <div key={gas.blockchain} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-md text-sky-300 flex items-center">
                      <Flame className="w-4 h-4 mr-1.5 text-orange-400"/> {gas.blockchain} Gas
                    </h4>
                    {gas.blockchain.toLowerCase() === 'internet computer' || gas.blockchain.toLowerCase() === 'icp' ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-medium">Zero User Fees</span>
                    ) : (
                      <span className="text-xs text-gray-400">Fast: {gas.fast?.gwei?.toFixed(1)} Gwei</span>
                    )}
                  </div>
                  {gas.blockchain.toLowerCase() !== 'internet computer' && (
                    <div className="text-xs text-gray-400 grid grid-cols-3 gap-1">
                      <span>Std: {gas.standard?.gwei?.toFixed(1)} Gwei</span>
                      <span>Slow: {gas.slow?.gwei?.toFixed(1)} Gwei</span>
                      <span className="text-right">Fast USD: ${gas.fast?.usd?.toFixed(3) || 'N/A'}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Token Prices */}
              {tokenPrices.filter((t: any) => ['bitcoin', 'ethereum', 'internet-computer'].includes(t.id)).map((token: any) => (
                <div key={token.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md text-purple-300 flex items-center">
                      {token.id === 'bitcoin' && <Bitcoin className="w-4 h-4 mr-1.5 text-yellow-500"/>}
                      {token.id === 'ethereum' && <Layers3 className="w-4 h-4 mr-1.5 text-sky-500"/>}
                      {token.id === 'internet-computer' && <CircleDollarSign className="w-4 h-4 mr-1.5 text-green-400"/>}
                      {token.symbol} - {token.name}
                    </h4>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">${token.priceUsd?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* NFT Collections */}
              {nftCollections.slice(0, 3).map((collection: any) => (
                <div key={collection.slug} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:shadow-md hover:border-slate-600 transition-all">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md text-indigo-300 flex items-center">
                      <Gem className="w-4 h-4 mr-1.5 text-pink-400"/>
                      {collection.name}
                    </h4>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {collection.floorPrice ? `${collection.floorPrice} ${collection.currency}` : 'No data'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-300">Recent Activity</CardTitle>
            <CardDescription>Latest alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any) => (
                <div key={activity.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <p className="text-sm text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp instanceof Date ? activity.timestamp.toLocaleTimeString() : 'Recent'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs">Set up alerts to see updates here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
