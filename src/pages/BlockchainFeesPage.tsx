import React, { useState, useEffect, FormEvent } from 'react';
import { useICP } from '../contexts/ICPContext';
import { useToast } from '../components/ui/Toaster';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '../components/ui/Table';
import { Switch } from '../components/ui/Switch';
import { AlertDialog, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/AlertDialog';
import { Skeleton, AstronautSkeleton } from '../components/ui/Skeleton';
import { Edit, Trash2, PlusCircle, GasCan, Bitcoin, Layers3, CircleDollarSign, Link, Flame, Tag, Cpu, ListFilter, X } from 'lucide-react'; // Added Cpu for ICP

// Placeholder Types (align with your .did.js or central types.ts)
interface GasAlert {
  id: string;
  blockchain: 'Ethereum' | 'Polygon' | 'BNBChain'; // Add more as needed
  maxGwei: number;
  priorityTier: 'Fast' | 'Standard' | 'Slow';
  isActive: boolean;
  userId: string;
}

interface MonitoredToken {
  id: string; // e.g., "dogecoin"
  symbol: string; // e.g., "DOGE"
  name: string;
  chain: 'Ethereum' | 'Polygon' | 'ICP' | 'BNBChain' | 'Solana'; // Add more
  contractAddress?: string; // For EVM
  canisterId?: string; // For ICP
  targetPrice?: number;
  alertType?: 'DropBelow' | 'RiseAbove' | 'PercentageChange';
  percentageChangeValue?: number;
  isActive: boolean;
  userId: string;
}

interface CachedGasPrice {
  chain: string;
  fast: { gwei: number; usd?: number };
  standard: { gwei: number; usd?: number };
  slow: { gwei: number; usd?: number };
  timestamp: bigint; // or number
}

interface CachedTokenPrice {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  timestamp: bigint; // or number
}

const initialGasAlertData: Omit<GasAlert, 'id' | 'userId'> = {
  blockchain: 'Ethereum',
  maxGwei: 20,
  priorityTier: 'Standard',
  isActive: true,
};

const initialTokenAlertData: Omit<MonitoredToken, 'id' | 'userId'> = {
  symbol: '',
  name: '',
  chain: 'Ethereum',
  contractAddress: '',
  canisterId: '',
  targetPrice: undefined,
  alertType: 'RiseAbove',
  percentageChangeValue: undefined,
  isActive: true,
};

// Assumed gas limits for estimations (very rough, real dApps have varied costs)
const TX_GAS_LIMITS = {
  'Mint NFT': 200000,
  'Buy NFT': 250000,
  'List NFT': 150000,
  'Transfer NFT': 100000,
  'EVM Token Transfer': 65000,
  'ICP Transaction': 0, // User fees are zero
};
type TransactionType = keyof typeof TX_GAS_LIMITS;


const BlockchainFeesPage: React.FC = () => {
  const { actor, principal, isAuthenticated } = useICP();
  const { toast } = useToast();

  const [gasAlerts, setGasAlerts] = useState<GasAlert[]>([]);
  const [tokenAlerts, setTokenAlerts] = useState<MonitoredToken[]>([]);
  const [cachedGasPrices, setCachedGasPrices] = useState<CachedGasPrice[]>([]);
  const [cachedTokenPrices, setCachedTokenPrices] = useState<CachedTokenPrice[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingGas, setIsSubmittingGas] = useState(false);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  const [showGasForm, setShowGasForm] = useState(false);
  const [editingGasAlert, setEditingGasAlert] = useState<GasAlert | null>(null);
  const [gasFormData, setGasFormData] = useState<Omit<GasAlert, 'id' | 'userId'>>(initialGasAlertData);

  const [showTokenForm, setShowTokenForm] = useState(false);
  const [editingTokenAlert, setEditingTokenAlert] = useState<MonitoredToken | null>(null);
  const [tokenFormData, setTokenFormData] = useState<Omit<MonitoredToken, 'id'|'userId'>>(initialTokenAlertData);

  // For calculator
  const [selectedCalcBlockchain, setSelectedCalcBlockchain] = useState<string>('Ethereum');
  const [selectedCalcTxType, setSelectedCalcTxType] = useState<TransactionType>('Mint NFT');


  const fetchData = async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const calls = [
        actor.getCachedGasPrices ? actor.getCachedGasPrices() : Promise.resolve([]),
        actor.getCachedTokenPrices ? actor.getCachedTokenPrices() : Promise.resolve([]),
      ];
      if (isAuthenticated) {
        calls.push(actor.getGasAlerts ? actor.getGasAlerts() : Promise.resolve([]));
        calls.push(actor.getMonitoredTokens ? actor.getMonitoredTokens() : Promise.resolve([]));
      } else {
        calls.push(Promise.resolve([])); // Placeholder for gasAlerts
        calls.push(Promise.resolve([])); // Placeholder for tokenAlerts
      }

      const results = await Promise.all(calls.map(p => p.catch(e => {
        console.warn("A fetch call failed in BlockchainFeesPage:", e);
        return []; // Return empty array for failed calls to not break Promise.all
      })));

      // @ts-ignore
      setCachedGasPrices(results[0] as CachedGasPrice[]);
      // @ts-ignore
      setCachedTokenPrices(results[1] as CachedTokenPrice[]);
      if (isAuthenticated) {
        // @ts-ignore
        setGasAlerts(results[2] as GasAlert[]);
        // @ts-ignore
        setTokenAlerts(results[3] as MonitoredToken[]);
      }

    } catch (error) {
      console.error("Failed to fetch fees data:", error);
      toast.error("Could not load all fees data.", "Fetch Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (actor) {
      fetchData();
      const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds
      return () => clearInterval(intervalId);
    } else {
      setIsLoading(false);
    }
  }, [actor, isAuthenticated]);

  // --- Gas Alert Handlers ---
  const handleGasInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setGasFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleGasSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !principal || !isAuthenticated) { toast.error("Login required."); return; }
    setIsSubmittingGas(true);
    const payload: GasAlert = { ...gasFormData, id: editingGasAlert ? editingGasAlert.id : '', userId: principal.toText() };
    try {
      // @ts-ignore
      const result = editingGasAlert ? await actor.updateGasAlert(payload) : await actor.addGasAlert(payload);
      // @ts-ignore
      if (result.Ok) {
        toast.success(`Gas Alert ${editingGasAlert ? 'updated' : 'created'}!`);
        setShowGasForm(false); setEditingGasAlert(null); setGasFormData(initialGasAlertData); fetchData();
      } else { // @ts-ignore
        throw new Error(result.Err || "Backend error"); }
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setIsSubmittingGas(false); }
  };

  const handleToggleGasActive = async (alert: GasAlert) => {
    if (!actor || !principal) return;
    const updatedAlert = { ...alert, isActive: !alert.isActive };
    try { // @ts-ignore
      const result = await actor.updateGasAlert(updatedAlert); // @ts-ignore
      if (result.Ok) { toast.success(`Alert for ${alert.blockchain} ${updatedAlert.isActive ? 'activated' : 'deactivated'}.`); fetchData(); } // @ts-ignore
      else { throw new Error(result.Err || "Failed to update"); }
    } catch (err) { toast.error(`Toggle error: ${err instanceof Error ? err.message : String(err)}`);}
  };

  const handleRemoveGasAlert = async (alertId: string) => {
    if (!actor || !principal) return;
    setIsSubmittingGas(true);
    try { // @ts-ignore
      const result = await actor.removeGasAlert(alertId); // @ts-ignore
      if (result.Ok) { toast.success("Gas Alert removed!"); fetchData(); } // @ts-ignore
      else { throw new Error(result.Err || "Failed to remove"); }
    } catch (err) { toast.error(`Remove error: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setIsSubmittingGas(false); }
  };

  const openEditGasForm = (alert: GasAlert) => {
    setEditingGasAlert(alert); setGasFormData(alert); setShowGasForm(true);
  };

  // --- Token Alert Handlers ---
 const handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | undefined = value;
    if (type === 'number' && name !== 'percentageChangeValue' && name !== 'targetPrice') { // symbol, name, etc. are not numbers
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (name === 'percentageChangeValue' || name === 'targetPrice') {
      processedValue = value === '' ? undefined : parseFloat(value);
    }
    setTokenFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleTokenSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !principal || !isAuthenticated) { toast.error("Login required."); return; }
    setIsSubmittingToken(true);

    // Construct the ID for new tokens based on symbol and chain or use existing for updates
    const newId = editingTokenAlert ? editingTokenAlert.id : `${tokenFormData.symbol.toLowerCase()}-${tokenFormData.chain.toLowerCase()}`;

    const payload: MonitoredToken = {
        ...tokenFormData,
        id: newId,
        userId: principal.toText(),
        // Ensure optional fields are correctly undefined if empty
        targetPrice: tokenFormData.targetPrice ? Number(tokenFormData.targetPrice) : undefined,
        percentageChangeValue: tokenFormData.alertType === 'PercentageChange' && tokenFormData.percentageChangeValue ? Number(tokenFormData.percentageChangeValue) : undefined,
        contractAddress: tokenFormData.chain !== 'ICP' && tokenFormData.contractAddress ? tokenFormData.contractAddress : undefined,
        canisterId: tokenFormData.chain === 'ICP' && tokenFormData.canisterId ? tokenFormData.canisterId : undefined,
    };

    try {
      // @ts-ignore
      const result = editingTokenAlert ? await actor.updateMonitoredToken(payload) : await actor.addMonitoredToken(payload);
      // @ts-ignore
      if (result.Ok) {
        toast.success(`Token Alert for ${payload.symbol} ${editingTokenAlert ? 'updated' : 'created'}!`);
        setShowTokenForm(false); setEditingTokenAlert(null); setTokenFormData(initialTokenAlertData); fetchData();
      } else { // @ts-ignore
         throw new Error(result.Err || "Backend error"); }
    } catch (err) { toast.error(`Token Error: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setIsSubmittingToken(false); }
  };

  const handleToggleTokenActive = async (alert: MonitoredToken) => {
     if (!actor || !principal) return;
    const updatedAlert = { ...alert, isActive: !alert.isActive };
    try { // @ts-ignore
      const result = await actor.updateMonitoredToken(updatedAlert); // @ts-ignore
      if (result.Ok) { toast.success(`Alert for ${alert.symbol} ${updatedAlert.isActive ? 'activated' : 'deactivated'}.`); fetchData(); } // @ts-ignore
      else { throw new Error(result.Err || "Failed to update"); }
    } catch (err) { toast.error(`Toggle error: ${err instanceof Error ? err.message : String(err)}`);}
  };

  const handleRemoveTokenAlert = async (alertId: string) => {
    if (!actor || !principal) return;
    setIsSubmittingToken(true);
    try { // @ts-ignore
      const result = await actor.removeMonitoredToken(alertId); // @ts-ignore
      if (result.Ok) { toast.success("Token Alert removed!"); fetchData(); } // @ts-ignore
      else { throw new Error(result.Err || "Failed to remove"); }
    } catch (err) { toast.error(`Remove error: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setIsSubmittingToken(false); }
  };

  const openEditTokenForm = (alert: MonitoredToken) => {
    setEditingTokenAlert(alert);
    setTokenFormData({
        symbol: alert.symbol,
        name: alert.name,
        chain: alert.chain,
        contractAddress: alert.contractAddress,
        canisterId: alert.canisterId,
        targetPrice: alert.targetPrice,
        alertType: alert.alertType,
        percentageChangeValue: alert.percentageChangeValue,
        isActive: alert.isActive,
    });
    setShowTokenForm(true);
  };


  const blockchainOptions: GasAlert['blockchain'][] = ['Ethereum', 'Polygon', 'BNBChain'];
  const priorityTierOptions: GasAlert['priorityTier'][] = ['Fast', 'Standard', 'Slow'];
  const tokenChainOptions: MonitoredToken['chain'][] = ['Ethereum', 'Polygon', 'ICP', 'BNBChain', 'Solana'];
  const tokenAlertTypeOptions: NonNullable<MonitoredToken['alertType']>[] = ['DropBelow', 'RiseAbove', 'PercentageChange'];


  const calculateTxCost = () => {
    if (selectedCalcBlockchain === 'ICP') {
      return { costGwei: 0, costUsd: 0, message: "Zero User Fees (Canister Pays Cycles)" };
    }
    const gasData = cachedGasPrices.find(g => g.chain === selectedCalcBlockchain);
    const gasLimit = TX_GAS_LIMITS[selectedCalcTxType];
    if (!gasData || gasLimit === undefined) return { costGwei: 0, costUsd: 0, message: "Data not available" };

    const gweiPrice = gasData.standard.gwei; // Use standard for estimation
    const costGwei = (gweiPrice * gasLimit) / 1_000_000_000; // Gwei to ETH/Native

    // Find native token price (e.g. ETH for Ethereum)
    const nativeTokenSymbol = selectedCalcBlockchain === 'Ethereum' ? 'ETH' : selectedCalcBlockchain === 'Polygon' ? 'MATIC' : selectedCalcBlockchain === 'BNBChain' ? 'BNB' : 'N/A';
    const nativeToken = cachedTokenPrices.find(t => t.symbol.toUpperCase() === nativeTokenSymbol);
    const costUsd = nativeToken ? costGwei * nativeToken.priceUsd : undefined;

    return {
        costGwei: gweiPrice, // This is just the Gwei price per gas unit, not total cost in Gwei
        costEth: costGwei.toFixed(6), // Total cost in native token (ETH, MATIC, etc.)
        costUsd: costUsd?.toFixed(2),
        message: `~${costGwei.toFixed(6)} ${nativeTokenSymbol} ${costUsd ? `($${costUsd.toFixed(2)})` : ''} at ${gweiPrice} Gwei`
    };
  };
  const estimatedCost = calculateTxCost();


  return (
    <div className="space-y-6">
      {/* Current Network Fees & Token Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Flame className="mr-2 h-5 w-5 text-orange-400"/>Current Network Fees & Token Prices</CardTitle>
          <CardDescription>Real-time cached data from the backend.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && cachedGasPrices.length === 0 && cachedTokenPrices.length === 0 ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)
          ) : (
            <>
              {cachedGasPrices.map(gas => (
                <Card key={gas.chain} className="bg-slate-800/40 border-slate-700/60 hover:shadow-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-sky-300 flex items-center">
                      {gas.chain === 'Ethereum' && <Layers3 className="w-5 h-5 mr-2 text-sky-400"/>}
                      {gas.chain === 'Polygon' && <img src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=032" alt="MATIC" className="w-5 h-5 mr-2"/>}
                      {gas.chain === 'BNBChain' && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032" alt="BNB" className="w-5 h-5 mr-2"/>}
                      {gas.chain}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p>Fast: {gas.fast.gwei.toFixed(0)} Gwei {gas.fast.usd ? `(~$${gas.fast.usd.toFixed(2)})` : ''}</p>
                    <p>Standard: {gas.standard.gwei.toFixed(0)} Gwei {gas.standard.usd ? `(~$${gas.standard.usd.toFixed(2)})` : ''}</p>
                    <p>Slow: {gas.slow.gwei.toFixed(0)} Gwei {gas.slow.usd ? `(~$${gas.slow.usd.toFixed(2)})` : ''}</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-slate-800/40 border-slate-700/60 hover:shadow-green-500/20">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-300 flex items-center">
                        <Cpu className="w-5 h-5 mr-2 text-green-400"/> Internet Computer (ICP)
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-md font-semibold text-white">Zero User Transaction Fees</p>
                    <p className="text-xs text-gray-400">(Canister pays cycles for computation)</p>
                    {cachedTokenPrices.find(t=>t.id === 'internet-computer') && (
                        <p className="text-lg mt-2 font-bold text-green-200">
                            ${cachedTokenPrices.find(t=>t.id === 'internet-computer')?.priceUsd.toFixed(2)}
                            <span className="text-xs text-gray-400 ml-1"> (ICP/USD)</span>
                        </p>
                    )}
                 </CardContent>
              </Card>
              {/* Monitored Memecoins/Tokens (excluding ICP if already shown) */}
              {cachedTokenPrices.filter(token => tokenAlerts.some(alert => alert.id === token.id && alert.id !== 'internet-computer')).map(token => (
                <Card key={token.id} className="bg-slate-800/40 border-slate-700/60 hover:shadow-pink-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-pink-300 flex items-center">
                        {token.symbol.toLowerCase() === 'btc' && <Bitcoin className="w-5 h-5 mr-2 text-yellow-400"/>}
                        {token.symbol.toLowerCase() === 'eth' && <Layers3 className="w-5 h-5 mr-2 text-sky-400"/>}
                        {!['btc', 'eth'].includes(token.symbol.toLowerCase()) && <CircleDollarSign className="w-5 h-5 mr-2 text-pink-400"/>}
                        {token.name} ({token.symbol.toUpperCase()})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-white">${token.priceUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: token.priceUsd > 0.1 ? 2 : 6})}</p>
                    <p className="text-xs text-gray-500">Chain: {tokenAlerts.find(ta => ta.id === token.id)?.chain}</p>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Forms & Alerts Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gas Alerts Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center"><GasCan className="mr-2 h-5 w-5 text-amber-400"/>Set Gas Alert</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setShowGasForm(!showGasForm); setEditingGasAlert(null); setGasFormData(initialGasAlertData);}} className="text-amber-300 border-amber-500/70 hover:bg-amber-500/20">
                {showGasForm ? <X className="mr-1 h-4 w-4"/> : <PlusCircle className="mr-1 h-4 w-4"/>}
                {showGasForm ? 'Hide Form' : (editingGasAlert ? 'Edit Form' : 'Show Form')}
              </Button>
            </CardHeader>
            {showGasForm && (
              <CardContent>
                <form onSubmit={handleGasSubmit} className="space-y-3 p-3 rounded-md bg-slate-800/30 border border-slate-700/40">
                   <h4 className="text-md font-semibold text-amber-200 border-b border-amber-600/50 pb-1.5 mb-2.5">
                    {editingGasAlert ? 'Edit Gas Alert' : 'Create New Gas Alert'}
                  </h4>
                  <div>
                    <label htmlFor="gasBlockchain" className="block text-xs font-medium text-gray-300 mb-0.5">Blockchain</label>
                    <select name="blockchain" id="gasBlockchain" value={gasFormData.blockchain} onChange={handleGasInputChange} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1 text-sm text-gray-200 focus:ring-amber-500 focus:border-amber-500">
                      {blockchainOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="maxGwei" className="block text-xs font-medium text-gray-300 mb-0.5">Max Gwei</label>
                    <Input type="number" name="maxGwei" id="maxGwei" value={gasFormData.maxGwei} onChange={handleGasInputChange} placeholder="e.g., 20" required />
                  </div>
                  <div>
                    <label htmlFor="priorityTier" className="block text-xs font-medium text-gray-300 mb-0.5">Priority Tier</label>
                    <select name="priorityTier" id="priorityTier" value={gasFormData.priorityTier} onChange={handleGasInputChange} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1 text-sm text-gray-200 focus:ring-amber-500 focus:border-amber-500">
                      {priorityTierOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Switch id="gasIsActive" checked={gasFormData.isActive} onCheckedChange={(checked) => setGasFormData(prev => ({ ...prev, isActive: checked }))} />
                    <label htmlFor="gasIsActive" className="text-sm font-medium text-gray-300">Enable alert</label>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="morphic" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500" disabled={isSubmittingGas}>
                      {isSubmittingGas ? 'Saving...' : (editingGasAlert ? 'Update Alert' : 'Set Alert')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
          {isAuthenticated && (
            <Card>
              <CardHeader><CardTitle className="text-md">Active Gas Alerts</CardTitle></CardHeader>
              <CardContent>
                {isLoading && gasAlerts.length === 0 ? <Skeleton className="h-24 w-full"/> : gasAlerts.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No gas alerts set up.</p> : (
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow><TableHead>Chain</TableHead><TableHead>Max Gwei</TableHead><TableHead>Tier</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {gasAlerts.map(alert => (
                        <TableRow key={alert.id} className={!alert.isActive ? 'opacity-50' : ''}>
                          <TableCell>{alert.blockchain}</TableCell><TableCell>{alert.maxGwei}</TableCell><TableCell>{alert.priorityTier}</TableCell>
                          <TableCell><Switch checked={alert.isActive} onCheckedChange={() => handleToggleGasActive(alert)} /></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditGasForm(alert)} className="text-blue-400 hover:text-blue-300 h-7 w-7"><Edit className="h-3.5 w-3.5"/></Button>
                            <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 h-7 w-7"><Trash2 className="h-3.5 w-3.5"/></Button></AlertDialogTrigger>
                              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Delete gas alert for {alert.blockchain} at {alert.maxGwei} Gwei?</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveGasAlert(alert.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent></AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Token/Memecoin Alerts Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center"><Tag className="mr-2 h-5 w-5 text-teal-400"/>Add Token/Memecoin Alert</CardTitle>
               <Button variant="outline" size="sm" onClick={() => { setShowTokenForm(!showTokenForm); setEditingTokenAlert(null); setTokenFormData(initialTokenAlertData);}} className="text-teal-300 border-teal-500/70 hover:bg-teal-500/20">
                {showTokenForm ? <X className="mr-1 h-4 w-4"/> : <PlusCircle className="mr-1 h-4 w-4"/>}
                {showTokenForm ? 'Hide Form' : (editingTokenAlert ? 'Edit Form' : 'Show Form')}
              </Button>
            </CardHeader>
            {showTokenForm && (
              <CardContent>
                <form onSubmit={handleTokenSubmit} className="space-y-3 p-3 rounded-md bg-slate-800/30 border border-slate-700/40">
                  <h4 className="text-md font-semibold text-teal-200 border-b border-teal-600/50 pb-1.5 mb-2.5">
                    {editingTokenAlert ? `Edit Alert: ${editingTokenAlert.symbol}` : 'Add New Token Alert'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label htmlFor="tokenSymbol" className="text-xs text-gray-300 mb-0.5 block">Symbol</label><Input type="text" name="symbol" id="tokenSymbol" value={tokenFormData.symbol} onChange={handleTokenInputChange} placeholder="e.g., DOGE" required /></div>
                    <div><label htmlFor="tokenName" className="text-xs text-gray-300 mb-0.5 block">Name</label><Input type="text" name="name" id="tokenName" value={tokenFormData.name} onChange={handleTokenInputChange} placeholder="e.g., Dogecoin" required /></div>
                  </div>
                  <div>
                    <label htmlFor="tokenChain" className="text-xs text-gray-300 mb-0.5 block">Chain</label>
                    <select name="chain" id="tokenChain" value={tokenFormData.chain} onChange={handleTokenInputChange} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1 text-sm text-gray-200 focus:ring-teal-500 focus:border-teal-500">
                      {tokenChainOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {tokenFormData.chain !== 'ICP' && (
                    <div><label htmlFor="contractAddress" className="text-xs text-gray-300 mb-0.5 block">Contract Address (EVM)</label><Input type="text" name="contractAddress" id="contractAddress" value={tokenFormData.contractAddress ?? ''} onChange={handleTokenInputChange} placeholder="0x..." /></div>
                  )}
                  {tokenFormData.chain === 'ICP' && (
                    <div><label htmlFor="canisterId" className="text-xs text-gray-300 mb-0.5 block">Canister ID (ICP)</label><Input type="text" name="canisterId" id="canisterId" value={tokenFormData.canisterId ?? ''} onChange={handleTokenInputChange} placeholder="aaaaa-..." /></div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label htmlFor="targetPrice" className="text-xs text-gray-300 mb-0.5 block">Target Price (USD, Optional)</label><Input type="number" name="targetPrice" id="targetPrice" value={tokenFormData.targetPrice ?? ''} onChange={handleTokenInputChange} placeholder="e.g., 0.15" step="any" /></div>
                    <div>
                      <label htmlFor="tokenAlertType" className="text-xs text-gray-300 mb-0.5 block">Alert Type (Optional)</label>
                      <select name="alertType" id="tokenAlertType" value={tokenFormData.alertType ?? ''} onChange={handleTokenInputChange} disabled={!tokenFormData.targetPrice} className="w-full h-9 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1 text-sm text-gray-200 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50">
                        <option value="">Select if price set</option>
                        {tokenAlertTypeOptions.map(a => <option key={a} value={a}>{a.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                      </select>
                    </div>
                  </div>
                  {tokenFormData.alertType === 'PercentageChange' && tokenFormData.targetPrice && (
                     <div><label htmlFor="tokenPercentageChange" className="text-xs text-gray-300 mb-0.5 block">Percentage Change (%)</label><Input type="number" name="percentageChangeValue" id="tokenPercentageChange" value={tokenFormData.percentageChangeValue ?? ''} onChange={handleTokenInputChange} placeholder="e.g., 10 for 10%" step="any"/></div>
                  )}
                   <div className="flex items-center space-x-2 pt-1">
                    <Switch id="tokenIsActive" checked={tokenFormData.isActive} onCheckedChange={(checked) => setTokenFormData(prev => ({ ...prev, isActive: checked }))} />
                    <label htmlFor="tokenIsActive" className="text-sm font-medium text-gray-300">Enable alert</label>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="morphic" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500" disabled={isSubmittingToken}>
                      {isSubmittingToken ? 'Saving...' : (editingTokenAlert ? 'Update Token' : 'Add Token')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
          {isAuthenticated && (
            <Card>
              <CardHeader><CardTitle className="text-md">Monitored Tokens & Alerts</CardTitle></CardHeader>
              <CardContent>
                {isLoading && tokenAlerts.length === 0 ? <Skeleton className="h-24 w-full"/> : tokenAlerts.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No tokens being monitored.</p> : (
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow><TableHead>Symbol</TableHead><TableHead>Chain</TableHead><TableHead>Target Price</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenAlerts.map(alert => (
                        <TableRow key={alert.id} className={!alert.isActive ? 'opacity-50' : ''}>
                          <TableCell>{alert.symbol.toUpperCase()}</TableCell><TableCell>{alert.chain}</TableCell>
                          <TableCell>{alert.targetPrice ? `$${alert.targetPrice} (${alert.alertType?.replace(/([A-Z])/g, ' $1').trim() || ''} ${alert.alertType === 'PercentageChange' ? alert.percentageChangeValue + '%' : ''})` : 'Price Not Set'}</TableCell>
                          <TableCell><Switch checked={alert.isActive} onCheckedChange={() => handleToggleTokenActive(alert)} /></TableCell>
                           <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditTokenForm(alert)} className="text-blue-400 hover:text-blue-300 h-7 w-7"><Edit className="h-3.5 w-3.5"/></Button>
                            <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 h-7 w-7"><Trash2 className="h-3.5 w-3.5"/></Button></AlertDialogTrigger>
                              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Delete token alert for {alert.symbol} on {alert.chain}?</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveTokenAlert(alert.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent></AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Estimated Transaction Costs Calculator */}
      <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Link className="mr-2 h-5 w-5 text-purple-400"/>Estimated Transaction Costs</CardTitle>
            <CardDescription>Get a rough estimate of transaction costs on different networks.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label htmlFor="calcBlockchain" className="block text-sm font-medium text-gray-300 mb-1">Blockchain</label>
                <select id="calcBlockchain" value={selectedCalcBlockchain} onChange={e => setSelectedCalcBlockchain(e.target.value)} className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                    {/* Populate with available blockchains from cachedGasPrices, plus ICP */}
                    <option value="ICP">Internet Computer</option>
                    {cachedGasPrices.map(g => <option key={g.chain} value={g.chain}>{g.chain}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="calcTxType" className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
                <select id="calcTxType" value={selectedCalcTxType} onChange={e => setSelectedCalcTxType(e.target.value as TransactionType)} className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                    {Object.keys(TX_GAS_LIMITS).map(tx => <option key={tx} value={tx}>{tx}</option>)}
                </select>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-tr from-purple-800/50 to-indigo-800/50 border border-purple-700/60 text-center md:text-left">
                <p className="text-sm text-gray-300">Estimated Cost:</p>
                <p className="text-lg font-semibold text-white whitespace-nowrap overflow-x-auto no-scrollbar">
                    {isLoading ? <Skeleton className="h-6 w-3/4"/> : estimatedCost.message}
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainFeesPage;
