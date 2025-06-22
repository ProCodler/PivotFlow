import React, { useState, useEffect, FormEvent } from 'react';
import { useICP } from '../contexts/ICPContext';
import { useToast } from '../components/ui/Toaster';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { AlertDialog, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/AlertDialog';
import { Skeleton, AstronautSkeleton } from '../components/ui/Skeleton';
import { Wallet, PlusCircle, Trash2, ImageOff, ExternalLink, RefreshCw } from 'lucide-react';

// Placeholder Types
interface MonitoredWallet {
  address: string;
  userId: string; // Principal.toText()
  // chain?: string; // Consider adding chain if supporting multiple non-ICP wallet types
}

interface PortfolioNft {
  id: string; // Unique ID for the NFT (e.g., contractAddress_tokenId)
  collectionName: string;
  collectionSlug?: string; // Optional, if available
  imageUrl?: string;
  currentFloorPrice?: number;
  floorCurrency?: string;
  ownerAddress: string; // Wallet address this NFT belongs to
  marketplaceLink?: string;
  // name?: string; // Specific name of the NFT item if available
  // tokenId?: string; // Token ID within the collection
}

const PortfolioPage: React.FC = () => {
  const { actor, principal, isAuthenticated } = useICP();
  const { toast } = useToast();

  const [wallets, setWallets] = useState<MonitoredWallet[]>([]);
  const [nfts, setNfts] = useState<PortfolioNft[]>([]);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);

  const fetchWallets = async () => {
    if (!actor || !isAuthenticated) return;
    setIsLoadingWallets(true);
    try {
      // @ts-ignore
      const fetchedWallets = await actor.getMonitoredWallets();
      // @ts-ignore
      setWallets(fetchedWallets as MonitoredWallet[]);
      if (fetchedWallets && fetchedWallets.length > 0) {
         // @ts-ignore
        fetchNfts(fetchedWallets.map(w => w.address));
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      toast.error("Could not load monitored wallets.", "Fetch Error");
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const fetchNfts = async (walletAddresses?: string[]) => {
    if (!actor || !isAuthenticated) return;
    const addressesToFetch = walletAddresses || wallets.map(w => w.address);
    if (addressesToFetch.length === 0) {
      setNfts([]);
      setIsLoadingNfts(false);
      return;
    }

    setIsLoadingNfts(true);
    try {
      // @ts-ignore
      const result = await actor.getPortfolioNfts(addressesToFetch);
      // @ts-ignore
      if (result && result.Ok) {
        // @ts-ignore
        setNfts(result.Ok as PortfolioNft[]);
      } else {
        // @ts-ignore
        throw new Error(result?.Err || "Failed to fetch NFTs from backend");
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      toast.error(`Error fetching NFTs: ${error instanceof Error ? error.message : String(error)}`);
      setNfts([]); // Clear NFTs on error
    } finally {
      setIsLoadingNfts(false);
    }
  };

  useEffect(() => {
    if (actor && isAuthenticated) {
      fetchWallets();
    } else {
      setIsLoadingWallets(false);
      setIsLoadingNfts(false);
    }
  }, [actor, isAuthenticated]);

  const handleAddWallet = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !principal || !newWalletAddress.trim()) return;

    // Basic address validation (very simple, enhance as needed)
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress.trim())) {
        toast.error("Invalid EVM wallet address format.");
        return;
    }
    if (wallets.find(w => w.address.toLowerCase() === newWalletAddress.trim().toLowerCase())) {
        toast.warning("This wallet address is already being monitored.");
        return;
    }

    setIsSubmittingWallet(true);
    try {
      // @ts-ignore
      const result = await actor.addMonitoredWallet(newWalletAddress.trim());
      // @ts-ignore
      if (result.Ok) {
        toast.success(`Wallet ${newWalletAddress.trim()} added successfully! Fetching NFTs...`);
        setNewWalletAddress('');
        // @ts-ignore
        const newWallet = result.Ok as MonitoredWallet;
        const updatedWallets = [...wallets, newWallet];
        setWallets(updatedWallets);
        fetchNfts(updatedWallets.map(w => w.address)); // Fetch NFTs for all, including the new one
      } else {
        // @ts-ignore
        throw new Error(result.Err || "Backend error adding wallet");
      }
    } catch (error) {
      console.error("Failed to add wallet:", error);
      toast.error(`Error adding wallet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmittingWallet(false);
    }
  };

  const handleRemoveWallet = async (address: string) => {
    if (!actor || !principal) return;
    setIsSubmittingWallet(true); // Use same loading state for simplicity
    try {
      // @ts-ignore
      const result = await actor.removeMonitoredWallet(address);
      // @ts-ignore
      if (result.Ok) {
        toast.success(`Wallet ${address} removed successfully.`);
        const updatedWallets = wallets.filter(w => w.address !== address);
        setWallets(updatedWallets);
        if (updatedWallets.length > 0) {
            fetchNfts(updatedWallets.map(w => w.address)); // Re-fetch NFTs for remaining wallets
        } else {
            setNfts([]); // No wallets left, clear NFTs
        }
      } else {
        // @ts-ignore
        throw new Error(result.Err || "Backend error removing wallet");
      }
    } catch (error) {
      console.error("Failed to remove wallet:", error);
      toast.error(`Error removing wallet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmittingWallet(false);
    }
  };

  const handleRefreshNfts = () => {
    if (wallets.length > 0) {
        fetchNfts(wallets.map(w => w.address));
    } else {
        toast.info("No wallets to refresh NFTs from. Please add a wallet first.");
    }
  };


  if (!isAuthenticated && !isLoadingWallets) {
     return (
        <Card className="text-center p-8">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>Please connect your Internet Identity to manage your NFT portfolio.</CardDescription>
            </CardHeader>
        </Card>
     )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Wallet className="mr-2 h-6 w-6 text-cyan-400"/>Manage Monitored Wallets</CardTitle>
          <CardDescription>Add public EVM wallet addresses to track your NFT collections. Data is fetched via backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddWallet} className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
            <Input
              type="text"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              placeholder="Enter EVM public wallet address (e.g., 0x...)"
              className="flex-grow text-sm sm:text-base"
              disabled={isSubmittingWallet}
            />
            <Button type="submit" variant="morphic" className="w-full sm:w-auto" disabled={isSubmittingWallet || !newWalletAddress.trim()}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {isSubmittingWallet ? 'Adding...' : 'Add Wallet'}
            </Button>
          </form>

          {isLoadingWallets ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : wallets.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Monitored Wallets:</h3>
              {wallets.map(wallet => (
                <div key={wallet.address} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:bg-slate-700/40 transition-colors">
                  <span className="text-sm text-purple-300 truncate font-mono" title={wallet.address}>
                    {wallet.address.substring(0,10)}...{wallet.address.substring(wallet.address.length - 8)}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8" title="Remove Wallet" disabled={isSubmittingWallet}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to stop monitoring the wallet <strong className="text-cyan-400 break-all">{wallet.address}</strong>? Its NFTs will be removed from your portfolio view.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmittingWallet}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveWallet(wallet.address)} className="bg-red-600 hover:bg-red-700" disabled={isSubmittingWallet}>
                          {isSubmittingWallet ? 'Removing...' : 'Yes, Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No wallets are currently being monitored. Add one above to see your NFTs.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="text-2xl">My NFTs</CardTitle>
                <CardDescription>NFTs from your monitored wallets. Click an NFT for more details (simulated).</CardDescription>
            </div>
            <Button
                variant="outline"
                onClick={handleRefreshNfts}
                disabled={isLoadingNfts || wallets.length === 0}
                className="mt-3 sm:mt-0 text-cyan-300 border-cyan-500/70 hover:bg-cyan-500/20"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingNfts ? 'animate-spin-slow' : ''}`} />
                {isLoadingNfts ? 'Refreshing...' : 'Refresh NFTs'}
            </Button>
        </CardHeader>
        <CardContent>
          {isLoadingNfts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : nfts.length === 0 ? (
             <div className="text-center py-10">
                <AstronautSkeleton className="opacity-60 scale-90" />
                <p className="mt-4 text-lg text-gray-400">
                    {wallets.length === 0 ? "Add a wallet to see your NFTs." : "No NFTs found in the monitored wallets."}
                </p>
                {wallets.length > 0 && <p className="text-sm text-gray-500">Try refreshing, or ensure the backend has access to NFT data sources.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {nfts.map((nft) => (
                <Card key={nft.id} className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-600/70 flex flex-col">
                  <div className="aspect-square w-full overflow-hidden bg-slate-800">
                    {nft.imageUrl ? (
                      <img src={nft.imageUrl} alt={nft.collectionName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-700"> <ImageOff className="w-16 h-16 text-slate-500" /> </div>
                    )}
                     {/* Fallback for broken image links handled by onError, this is for when URL is missing */}
                    {!nft.imageUrl && <div className="w-full h-full flex items-center justify-center bg-slate-700"> <ImageOff className="w-16 h-16 text-slate-500" /> </div>}
                  </div>
                  <CardContent className="p-3 space-y-1 flex-grow flex flex-col justify-between">
                    <div>
                        <h4 className="text-md font-semibold text-purple-300 truncate group-hover:text-purple-200" title={nft.collectionName}>{nft.collectionName}</h4>
                        <p className="text-xs text-gray-400 truncate" title={`ID: ${nft.id}`}>ID: {nft.id.length > 20 ? `${nft.id.substring(0,20)}...` : nft.id}</p>
                    </div>
                    <div className="mt-1">
                        {nft.currentFloorPrice !== undefined && nft.floorCurrency && (
                            <p className="text-sm font-medium text-cyan-300">{nft.currentFloorPrice.toFixed(2)} {nft.floorCurrency} <span className="text-xs text-gray-500">(Floor)</span></p>
                        )}
                         <p className="text-xs text-gray-500 truncate" title={`Owner: ${nft.ownerAddress}`}>Owner: {nft.ownerAddress.substring(0,6)}...{nft.ownerAddress.substring(nft.ownerAddress.length - 4)}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        {nft.marketplaceLink ? (
                             <a href={nft.marketplaceLink} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 hover:underline inline-flex items-center">
                                View on Market <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        ) : <span className="text-xs text-gray-600">No market link</span>}
                        {/* Placeholder buttons */}
                        {/* <Button variant="link" size="sm" className="text-xs p-0 h-auto text-green-400 hover:text-green-300">List</Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioPage;
