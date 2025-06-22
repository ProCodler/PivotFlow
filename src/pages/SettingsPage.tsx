import React, { useState, useEffect, FormEvent } from 'react';
import { useICP } from '../contexts/ICPContext';
import { useToast } from '../components/ui/Toaster';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { Skeleton } from '../components/ui/Skeleton';
import { KeyRound, BellDot, Palette, SlidersHorizontal, Save, Eye, EyeOff } from 'lucide-react';

// Placeholder Types
interface ApiKeys {
  openSea?: string;
  etherscan?: string;
  blur?: string;
  magicEden?: string;
  coinGecko?: string;
}

interface NotificationSettings {
  adminChatId?: string; // For Telegram/Discord bot DMs etc.
  enableNftDropAlerts?: boolean; // Example global toggle
  enableGasLowAlerts?: boolean; // Example global toggle
  // These would likely map to updating specific alert types' isActive flags in backend
  // or a global user preference record.
}

const initialApiKeys: ApiKeys = {
  openSea: '',
  etherscan: '',
  blur: '',
  magicEden: '',
  coinGecko: '',
};

const initialNotificationSettings: NotificationSettings = {
  adminChatId: '',
  enableNftDropAlerts: true,
  enableGasLowAlerts: true,
};


const SettingsPage: React.FC = () => {
  const { actor, principal, isAuthenticated, isAdmin } = useICP();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKeys>(initialApiKeys);
  const [showApiKeys, setShowApiKeys] = useState<Partial<Record<keyof ApiKeys, boolean>>>({});
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);

  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [isSubmittingApiKeys, setIsSubmittingApiKeys] = useState(false);

  const [isLoadingNotifSettings, setIsLoadingNotifSettings] = useState(false);
  const [isSubmittingNotifSettings, setIsSubmittingNotifSettings] = useState(false);

  // Client-side UI settings
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark
  const [animationIntensity, setAnimationIntensity] = useState(50); // Default 50%

  // Fetch API Keys (Admin only)
  useEffect(() => {
    const fetchKeys = async () => {
      if (!actor || !isAdmin || !isAuthenticated) return;
      setIsLoadingApiKeys(true);
      try {
        // @ts-ignore
        const fetchedKeys = await actor.getApiKeys();
        // @ts-ignore
        if (fetchedKeys && fetchedKeys.length > 0) { // Assuming it returns Opt(ApiKeys) so it might be an array with one element or null
             // @ts-ignore
            setApiKeys(fetchedKeys[0] || initialApiKeys);
        } else {
            setApiKeys(initialApiKeys); // Set to initial if null or empty
        }
      } catch (error) {
        console.error("Failed to fetch API keys:", error);
        toast.error("Could not load API keys.", "Fetch Error");
      } finally {
        setIsLoadingApiKeys(false);
      }
    };
    fetchKeys();
  }, [actor, isAdmin, isAuthenticated]);

  // Fetch Notification Settings (User specific)
  useEffect(() => {
    const fetchNotifSettings = async () => {
        if (!actor || !isAuthenticated) return;
        setIsLoadingNotifSettings(true);
        try {
            // @ts-ignore
            const settings = await actor.getNotificationSettings(); // Example method
            // @ts-ignore
            if (settings) { // Assuming it returns Opt(NotificationSettings)
                 // @ts-ignore
                setNotificationSettings(settings[0] || initialNotificationSettings);
            } else {
                setNotificationSettings(initialNotificationSettings);
            }
        } catch (error) {
            console.error("Failed to fetch notification settings:", error);
            // toast.error("Could not load notification settings."); // Might be too noisy
        } finally {
            setIsLoadingNotifSettings(false);
        }
    };
    fetchNotifSettings();
  }, [actor, isAuthenticated]);


  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleApiKeysSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !isAdmin) { toast.error("Admin privileges required."); return; }
    setIsSubmittingApiKeys(true);
    try {
      // @ts-ignore
      const result = await actor.setApiKeys(apiKeys);
      // @ts-ignore
      if (result.Ok) {
        toast.success("API Keys updated successfully!");
      } else { // @ts-ignore
        throw new Error(result.Err || "Backend error saving API keys");
      }
    } catch (error) {
      console.error("Failed to save API keys:", error);
      toast.error(`Error saving API keys: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmittingApiKeys(false);
    }
  };

  const toggleShowApiKey = (keyName: keyof ApiKeys) => {
    setShowApiKeys(prev => ({...prev, [keyName]: !prev[keyName]}));
  };


  const handleNotificationSettingChange = (name: keyof NotificationSettings, value: string | boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor || !isAuthenticated) { toast.error("Login required."); return; }
    setIsSubmittingNotifSettings(true);
    try {
        // This is a mock interaction. The actual backend call would depend on how user preferences are stored.
        // It might involve updating a user profile record or specific alert flags.
        // For now, we'll simulate a call to a generic settings update function.
        // @ts-ignore
        const result = await actor.setNotificationSettings(notificationSettings); // Example method
        // @ts-ignore
        if (result) { // Assuming it returns a boolean for success
             toast.success("Notification settings updated!");
        } else {
            throw new Error("Failed to save notification settings to backend");
        }
    } catch (error) {
        console.error("Failed to save notification settings:", error);
        toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsSubmittingNotifSettings(false);
    }
  };

  // Client-side UI settings persistence
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('pivotflow-darkMode');
    const savedAnimationIntensity = localStorage.getItem('pivotflow-animationIntensity');
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedAnimationIntensity) setAnimationIntensity(JSON.parse(savedAnimationIntensity));
  }, []);

  useEffect(() => {
    localStorage.setItem('pivotflow-darkMode', JSON.stringify(isDarkMode));
    // Apply dark mode class to body or html (if not handled by Tailwind config directly)
    if (isDarkMode) {
        document.documentElement.classList.add('dark'); // Requires Tailwind dark mode: 'class'
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('pivotflow-animationIntensity', JSON.stringify(animationIntensity));
    // Here you would adjust CSS variables or JS logic that controls animation speed/intensity
    // For example, document.documentElement.style.setProperty('--animation-speed-factor', `${animationIntensity / 100}`);
  }, [animationIntensity]);


  if (!isAuthenticated && !isLoadingApiKeys && !isLoadingNotifSettings) {
     return (
        <Card className="text-center p-8">
            <CardHeader><CardTitle>Access Denied</CardTitle><CardDescription>Please connect your Internet Identity to manage settings.</CardDescription></CardHeader>
        </Card>
     )
  }

  return (
    <div className="space-y-8">
      {/* API Key Management (Admin Only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5 text-yellow-400"/>API Key Management (Admin)</CardTitle>
            <CardDescription>Configure API keys for backend services. Keys are stored securely in the backend canister.</CardDescription>
            <p className="text-xs text-yellow-500 mt-2"><strong>Warning:</strong> Ensure API keys have read-only permissions where possible and no withdrawal rights.</p>
          </CardHeader>
          <CardContent>
            {isLoadingApiKeys ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <form onSubmit={handleApiKeysSubmit} className="space-y-4">
                {(Object.keys(initialApiKeys) as Array<keyof ApiKeys>).map((key) => (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()} API Key
                    </label>
                    <div className="flex items-center space-x-2">
                        <Input
                        type={showApiKeys[key] ? "text" : "password"}
                        id={key}
                        name={key}
                        value={apiKeys[key] || ''}
                        onChange={handleApiKeyChange}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim()} API Key`}
                        className="flex-grow"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => toggleShowApiKey(key)} className="text-gray-400 hover:text-gray-200">
                            {showApiKeys[key] ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                        </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="morphic" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500" disabled={isSubmittingApiKeys}>
                    <Save className="mr-2 h-4 w-4"/>
                    {isSubmittingApiKeys ? 'Saving Keys...' : 'Save API Keys'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BellDot className="mr-2 h-5 w-5 text-purple-400"/>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive alerts and notifications from PivotFlow.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingNotifSettings ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            <form onSubmit={handleNotificationSettingsSubmit} className="space-y-4">
                <div>
                    <label htmlFor="adminChatId" className="block text-sm font-medium text-gray-300 mb-1">Admin/User Chat ID (e.g., Telegram Chat ID)</label>
                    <Input
                        type="text"
                        id="adminChatId"
                        name="adminChatId"
                        value={notificationSettings.adminChatId || ''}
                        onChange={(e) => handleNotificationSettingChange('adminChatId', e.target.value)}
                        placeholder="Enter your Chat ID for direct notifications"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used by the backend to send direct messages if configured.</p>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <label htmlFor="enableNftDropAlerts" className="text-sm font-medium text-gray-200">Enable NFT Drop Alerts</label>
                        <Switch
                            id="enableNftDropAlerts"
                            checked={notificationSettings.enableNftDropAlerts || false}
                            onCheckedChange={(checked) => handleNotificationSettingChange('enableNftDropAlerts', checked)}
                        />
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <label htmlFor="enableGasLowAlerts" className="text-sm font-medium text-gray-200">Enable Low Gas Price Alerts</label>
                        <Switch
                            id="enableGasLowAlerts"
                            checked={notificationSettings.enableGasLowAlerts || false}
                            onCheckedChange={(checked) => handleNotificationSettingChange('enableGasLowAlerts', checked)}
                        />
                    </div>
                    {/* Add more specific toggles here. They would typically call actor.updateNftAlert(), updateGasAlert() etc. */}
                    {/* For this example, these are global toggles saved via a generic setNotificationSettings */}
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" variant="morphic" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500" disabled={isSubmittingNotifSettings}>
                    <Save className="mr-2 h-4 w-4"/>
                    {isSubmittingNotifSettings ? 'Saving Settings...' : 'Save Notification Settings'}
                  </Button>
                </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Theme/UI Customization (Client-Side Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Palette className="mr-2 h-5 w-5 text-cyan-400"/>Theme & UI Customization</CardTitle>
          <CardDescription>Personalize your PivotFlow experience. These settings are saved locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <label htmlFor="darkModeToggle" className="text-sm font-medium text-gray-200">
              Dark Mode
            </label>
            <Switch
              id="darkModeToggle"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>

          <div>
            <label htmlFor="animationIntensity" className="block text-sm font-medium text-gray-300 mb-2">
              Background Motion Speed: <span className="font-semibold text-cyan-300">{animationIntensity}%</span>
            </label>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                <input
                type="range"
                id="animationIntensity"
                min="0"
                max="100"
                value={animationIntensity}
                onChange={(e) => setAnimationIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Adjusts the speed of subtle background animations. 0% stops them.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
