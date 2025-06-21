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
import { Edit, Trash2, PlusCircle, ListFilter, X } from 'lucide-react';

// Placeholder Types (align with your .did.js or central types.ts)
interface NftAlert {
  id: string;
  collectionSlug: string;
  targetPrice: number;
  targetCurrency: 'ETH' | 'SOL' | 'ICP' | 'USD';
  alertType: 'DropBelow' | 'RiseAbove' | 'AnyChange' | 'PercentageChange';
  percentageChangeValue?: number;
  gasLimit?: number; // Gwei
  marketplace: 'OpenSea' | 'Blur' | 'MagicEden' | 'Entrepot';
  isActive: boolean;
  lastAlerted?: bigint; // or number if not a Nat64 timestamp
  userId: string; // Principal.toText()
}

interface CachedNftCollection {
  slug: string;
  name: string;
  floorPrice: number;
  currency: string;
}

const initialFormData: Omit<NftAlert, 'id' | 'lastAlerted' | 'userId'> = {
  collectionSlug: '',
  targetPrice: 0,
  targetCurrency: 'ETH',
  alertType: 'DropBelow',
  percentageChangeValue: undefined,
  gasLimit: undefined,
  marketplace: 'OpenSea',
  isActive: true,
};

const NftAlertsPage: React.FC = () => {
  const { actor, principal, isAuthenticated } = useICP();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<NftAlert[]>([]);
  const [cachedCollections, setCachedCollections] = useState<CachedNftCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<NftAlert | null>(null);
  const [formData, setFormData] = useState<Omit<NftAlert, 'id' | 'lastAlerted'| 'userId'>>(initialFormData);

  const [filterMarketplace, setFilterMarketplace] = useState<string>('');
  const [filterIsActive, setFilterIsActive] = useState<string>('all'); // 'all', 'active', 'inactive'


  const fetchAlerts = async () => {
    if (!actor || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [fetchedAlerts, fetchedCollections] = await Promise.all([
        actor.getNftAlerts ? actor.getNftAlerts() : Promise.resolve([]),
        actor.getCachedNftCollections ? actor.getCachedNftCollections() : Promise.resolve([])
      ]);
      // @ts-ignore TODO: Fix type from actor
      setAlerts(fetchedAlerts as NftAlert[]);
      // @ts-ignore TODO: Fix type from actor
      setCachedCollections(fetchedCollections as CachedNftCollection[]);
    } catch (error) {
      console.error("Failed to fetch NFT alerts:", error);
      toast.error("Could not load NFT alerts.", "Fetch Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (actor && isAuthenticated) {
      fetchAlerts();
    } else {
      setIsLoading(false); // Not authenticated, stop loading
    }
  }, [actor, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | undefined = value;
    if (type === 'number') {
        processedValue = value === '' ? undefined : parseFloat(value);
    }
     if (name === "gasLimit" && value !== '') {
        processedValue = parseInt(value, 10);
    }


    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !principal || !isAuthenticated) {
      toast.error("You must be logged in to manage alerts.");
      return;
    }
    setIsSubmitting(true);

    const alertPayload: NftAlert = {
      ...formData,
      id: editingAlert ? editingAlert.id : `temp-id-${Date.now()}`, // Backend should generate ID on add
      userId: principal.toText(),
      // Ensure optional fields are correctly undefined if empty
      percentageChangeValue: formData.alertType === 'PercentageChange' && formData.percentageChangeValue ? Number(formData.percentageChangeValue) : undefined,
      gasLimit: formData.gasLimit ? Number(formData.gasLimit) : undefined,
    };

    try {
      let result;
      if (editingAlert) {
        // @ts-ignore
        result = await actor.updateNftAlert(alertPayload);
      } else {
        // @ts-ignore
        result = await actor.addNftAlert(alertPayload);
      }

      // @ts-ignore
      if (result && result.Ok) {
        toast.success(`NFT Alert ${editingAlert ? 'updated' : 'created'} successfully!`);
        setShowForm(false);
        setEditingAlert(null);
        setFormData(initialFormData);
        fetchAlerts(); // Refresh list
      } else {
        // @ts-ignore
        throw new Error(result?.Err || "Unknown error from backend");
      }
    } catch (error) {
      console.error(`Failed to ${editingAlert ? 'update' : 'create'} NFT alert:`, error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (alert: NftAlert) => {
    if (!actor || !principal) return;
    const updatedAlert = { ...alert, isActive: !alert.isActive };
    try {
      // @ts-ignore
      const result = await actor.updateNftAlert(updatedAlert);
      // @ts-ignore
      if (result && result.Ok) {
        toast.success(`Alert for ${alert.collectionSlug} ${updatedAlert.isActive ? 'activated' : 'deactivated'}.`);
        fetchAlerts();
      } else {
        // @ts-ignore
        throw new Error(result?.Err || "Failed to update alert status");
      }
    } catch (error) {
      console.error("Failed to toggle alert status:", error);
      toast.error(`Error toggling status: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRemoveAlert = async (alertId: string) => {
    if (!actor || !principal) return;
    setIsSubmitting(true); // Use for delete operation as well
    try {
      // @ts-ignore
      const result = await actor.removeNftAlert(alertId);
      // @ts-ignore
      if (result && result.Ok) {
        toast.success("NFT Alert removed successfully!");
        fetchAlerts();
      } else {
        // @ts-ignore
        throw new Error(result?.Err || "Failed to remove alert");
      }
    } catch (error) {
      console.error("Failed to remove NFT alert:", error);
      toast.error(`Error removing alert: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (alert: NftAlert) => {
    setEditingAlert(alert);
    setFormData({
        collectionSlug: alert.collectionSlug,
        targetPrice: alert.targetPrice,
        targetCurrency: alert.targetCurrency,
        alertType: alert.alertType,
        percentageChangeValue: alert.percentageChangeValue,
        gasLimit: alert.gasLimit,
        marketplace: alert.marketplace,
        isActive: alert.isActive,
    });
    setShowForm(true);
  };

  const filteredAlerts = alerts.filter(alert => {
    const marketplaceMatch = filterMarketplace ? alert.marketplace === filterMarketplace : true;
    const activeMatch = filterIsActive === 'all' ? true : filterIsActive === 'active' ? alert.isActive : !alert.isActive;
    return marketplaceMatch && activeMatch;
  });

  const marketplaceOptions = ['OpenSea', 'Blur', 'MagicEden', 'Entrepot']; // Add more as needed
  const currencyOptions = ['ETH', 'SOL', 'ICP', 'USD'];
  const alertTypeOptions = ['DropBelow', 'RiseAbove', 'AnyChange', 'PercentageChange'];


  if (!isAuthenticated && !isLoading) {
     return (
        <Card className="text-center p-8">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>Please connect your Internet Identity to manage NFT alerts.</CardDescription>
            </CardHeader>
        </Card>
     )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-cyan-500/10">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">NFT Floor Price Alerts</CardTitle>
            <CardDescription>Monitor NFT collections and get notified of price changes.</CardDescription>
          </div>
          <Button
            variant="morphic"
            onClick={() => { setShowForm(!showForm); setEditingAlert(null); setFormData(initialFormData); }}
            className="mt-3 sm:mt-0 w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {showForm ? <X className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {showForm ? 'Cancel' : 'Add New NFT Alert'}
          </Button>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-cyan-300 border-b border-cyan-700/50 pb-2 mb-3">
                {editingAlert ? 'Edit NFT Alert' : 'Create New NFT Alert'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="collectionSlug" className="block text-sm font-medium text-gray-300 mb-1">Collection Slug</label>
                  <Input type="text" name="collectionSlug" id="collectionSlug" value={formData.collectionSlug} onChange={handleInputChange} placeholder="e.g., boredapeyachtclub" required />
                </div>
                <div>
                  <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-300 mb-1">Target Price</label>
                  <Input type="number" name="targetPrice" id="targetPrice" value={formData.targetPrice ?? ''} onChange={handleInputChange} placeholder="e.g., 25.5" step="any" required />
                </div>
                <div>
                  <label htmlFor="targetCurrency" className="block text-sm font-medium text-gray-300 mb-1">Target Currency</label>
                  <select name="targetCurrency" id="targetCurrency" value={formData.targetCurrency} onChange={handleInputChange} className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                    {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="alertType" className="block text-sm font-medium text-gray-300 mb-1">Alert Type</label>
                  <select name="alertType" id="alertType" value={formData.alertType} onChange={handleInputChange} className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                    {alertTypeOptions.map(at => <option key={at} value={at}>{at.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                  </select>
                </div>
                {formData.alertType === 'PercentageChange' && (
                  <div>
                    <label htmlFor="percentageChangeValue" className="block text-sm font-medium text-gray-300 mb-1">Percentage Change (%)</label>
                    <Input type="number" name="percentageChangeValue" id="percentageChangeValue" value={formData.percentageChangeValue ?? ''} onChange={handleInputChange} placeholder="e.g., 10 for 10%" step="any" />
                  </div>
                )}
                <div>
                  <label htmlFor="marketplace" className="block text-sm font-medium text-gray-300 mb-1">Marketplace</label>
                  <select name="marketplace" id="marketplace" value={formData.marketplace} onChange={handleInputChange} className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                    {marketplaceOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="gasLimit" className="block text-sm font-medium text-gray-300 mb-1">Gas Price Threshold (Gwei, Optional)</label>
                  <Input type="number" name="gasLimit" id="gasLimit" value={formData.gasLimit ?? ''} onChange={handleInputChange} placeholder="e.g., 30 (for EVM chains)" />
                  <p className="text-xs text-gray-500 mt-1">Alert only triggers if current gas is below this (EVM only).</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Enable this alert</label>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAlert(null); }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="morphic" disabled={isSubmitting}>
                  {isSubmitting ? (editingAlert ? 'Updating...' : 'Creating...') : (editingAlert ? 'Save Changes' : 'Create Alert')}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><ListFilter className="mr-2 h-5 w-5 text-purple-400"/>Active NFT Alerts</CardTitle>
          <CardDescription>Manage your existing floor price alerts.</CardDescription>
           <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <select value={filterMarketplace} onChange={(e) => setFilterMarketplace(e.target.value)} className="h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 sm:w-auto">
              <option value="">All Marketplaces</option>
              {marketplaceOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterIsActive} onChange={(e) => setFilterIsActive(e.target.value)} className="h-10 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 sm:w-auto">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-10">
              <AstronautSkeleton className="opacity-50 scale-75" />
              <p className="mt-4 text-gray-400">No NFT alerts found matching your criteria.</p>
              {!showForm && alerts.length === 0 && (
                <Button variant="link" onClick={() => setShowForm(true)} className="mt-2 text-cyan-400">
                  Create your first NFT alert
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="mt-4">A list of your configured NFT floor price alerts.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => {
                    const currentCollection = cachedCollections.find(c => c.slug === alert.collectionSlug);
                    return (
                      <TableRow key={alert.id} className={!alert.isActive ? 'opacity-60 bg-slate-800/20 hover:bg-slate-700/30' : ''}>
                        <TableCell className="font-medium text-gray-200">{alert.collectionSlug}</TableCell>
                        <TableCell>{alert.targetPrice} {alert.targetCurrency} {alert.alertType === 'PercentageChange' ? `(${alert.percentageChangeValue}%)` : ''}</TableCell>
                        <TableCell>
                          {currentCollection ? `${currentCollection.floorPrice.toFixed(2)} ${currentCollection.currency}` : 'N/A'}
                        </TableCell>
                        <TableCell>{alert.alertType.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                        <TableCell>{alert.marketplace}</TableCell>
                        <TableCell>
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => handleToggleActive(alert)}
                            aria-label={`Toggle alert for ${alert.collectionSlug}`}
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(alert)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/20" title="Remove">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the alert for <strong className="text-cyan-400">{alert.collectionSlug}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveAlert(alert.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                  {isSubmitting ? 'Removing...' : 'Yes, remove alert'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NftAlertsPage;
