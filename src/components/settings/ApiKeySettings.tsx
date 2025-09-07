import { useState, useEffect } from 'react';
import { useApiKeys, API_SERVICES, type ApiServiceKey } from '@/lib/api-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Key, 
  Shield, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  AlertTriangle,
  Info
} from '@/lib/phosphor-icons-wrapper';

interface ApiKeySettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeySettings({ open, onOpenChange }: ApiKeySettingsProps) {
  const {
    saveApiKey,
    removeApiKey,
    toggleApiKey,
    getApiKey,
    getAllApiKeys,
    isServiceEnabled,
    validateApiKey,
    refreshAllKeys,
    getServiceStats,
    loadApiKeys
  } = useApiKeys();

  const [selectedService, setSelectedService] = useState<ApiServiceKey | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceStats, setServiceStats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    await loadApiKeys();
    setServiceStats(getServiceStats());
  };

  const handleSaveKey = async () => {
    if (!selectedService || !keyInput.trim()) {return;}

    setValidating(true);
    try {
      await saveApiKey(selectedService, keyInput.trim());
      setKeyInput('');
      setSelectedService(null);
      await loadData();
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveKey = async (service: ApiServiceKey) => {
    try {
      await removeApiKey(service);
      await loadData();
    } catch (error) {
      toast.error('Failed to remove API key');
    }
  };

  const handleToggleKey = async (service: ApiServiceKey, enabled: boolean) => {
    try {
      await toggleApiKey(service, enabled);
      await loadData();
    } catch (error) {
      toast.error('Failed to toggle API key');
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const result = await refreshAllKeys();
      toast.success(`Refreshed ${result.success} keys successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`);
      await loadData();
    } catch (error) {
      toast.error('Failed to refresh API keys');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (service: ApiServiceKey) => {
    const stats = serviceStats[service];
    if (!stats) {return null;}

    if (!stats.enabled) {
      return <Badge variant="secondary" className="text-xs">Disabled</Badge>;
    }

    if (stats.valid === false) {
      return <Badge variant="destructive" className="text-xs flex items-center gap-1">
        <XCircle size={12} />
        Invalid
      </Badge>;
    }

    if (stats.valid === true) {
      return <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-600/20 text-green-400 border-green-600/30">
        <CheckCircle size={12} />
        Active
      </Badge>;
    }

    return <Badge variant="outline" className="text-xs flex items-center gap-1">
      <Clock size={12} />
      Unknown
    </Badge>;
  };

  const getRateLimitInfo = (service: ApiServiceKey) => {
    const stats = serviceStats[service];
    if (!stats?.rateLimit) {return null;}

    const { remaining, requestsPerHour } = stats.rateLimit;
    const percentage = (remaining / requestsPerHour) * 100;

    return (
      <div className="text-xs text-muted-foreground">
        Rate limit: {remaining}/{requestsPerHour} remaining
        <div className="w-full bg-muted h-1 rounded-full mt-1">
          <div 
            className={`h-1 rounded-full transition-all ${
              percentage > 50 ? 'bg-green-500' : 
              percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const bugBountyServices = Object.entries(API_SERVICES).filter(([_, config]) => 
    ['HackerOne', 'Bugcrowd', 'Intigriti', 'YesWeHack'].includes(config.name)
  ) as [ApiServiceKey, typeof API_SERVICES[ApiServiceKey]][];

  const threatIntelServices = Object.entries(API_SERVICES).filter(([_, config]) => 
    ['Shodan', 'VirusTotal', 'National Vulnerability Database', 'CVE Search (CIRCL)', 'MITRE ATT&CK'].includes(config.name)
  ) as [ApiServiceKey, typeof API_SERVICES[ApiServiceKey]][];

  const projectDiscoveryServices = Object.entries(API_SERVICES).filter(([_, config]) => 
    ['Nuclei Templates', 'Chaos (Project Discovery)'].includes(config.name)
  ) as [ApiServiceKey, typeof API_SERVICES[ApiServiceKey]][];

  const securityFeedServices = Object.entries(API_SERVICES).filter(([_, config]) => 
    ['Exploit Database', 'GitHub Security Advisories'].includes(config.name)
  ) as [ApiServiceKey, typeof API_SERVICES[ApiServiceKey]][];

  const ServiceCard = ({ service, config }: { service: ApiServiceKey; config: typeof API_SERVICES[ApiServiceKey] }) => {
    const isEnabled = isServiceEnabled(service);
    const hasKey = !!getApiKey(service);
    const stats = serviceStats[service];

    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-accent/80" />
              <CardTitle className="text-sm">{config.name}</CardTitle>
            </div>
            {getStatusBadge(service)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 p-0 text-xs text-accent hover:text-accent/80"
              onClick={() => window.open(config.documentation, '_blank')}
            >
              <ExternalLink size={12} className="mr-1" />
              Documentation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {config.requiredScopes.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Required Scopes:</div>
                <div className="flex flex-wrap gap-1">
                  {config.requiredScopes.map(scope => (
                    <Badge key={scope} variant="outline" className="text-xs px-2 py-0">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {hasKey ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Status</Label>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(enabled) => handleToggleKey(service, enabled)}
                    size="sm"
                  />
                </div>
                
                {stats?.lastValidated && (
                  <div className="text-xs text-muted-foreground">
                    Last validated: {new Date(stats.lastValidated).toLocaleDateString()}
                  </div>
                )}

                {getRateLimitInfo(service)}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSelectedService(service);
                      setKeyInput('');
                    }}
                  >
                    <Key size={12} className="mr-1" />
                    Update Key
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    onClick={() => handleRemoveKey(service)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSelectedService(service);
                  setKeyInput('');
                }}
              >
                <Key size={12} className="mr-1" />
                Add API Key
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={24} className="text-accent" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Configure API keys for bug bounty platforms, threat intelligence feeds, and security tools
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-accent" />
              <span className="text-sm font-medium">
                {Object.values(serviceStats).filter(s => s.enabled).length} services enabled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm">
                {Object.values(serviceStats).filter(s => s.valid === true).length} active
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh All
          </Button>
        </div>

        <Tabs defaultValue="bug-bounty" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bug-bounty">Bug Bounty</TabsTrigger>
            <TabsTrigger value="threat-intel">Threat Intel</TabsTrigger>
            <TabsTrigger value="project-discovery">Project Discovery</TabsTrigger>
            <TabsTrigger value="security-feeds">Security Feeds</TabsTrigger>
          </TabsList>

          <div className="h-96 overflow-y-auto mt-4">
            <TabsContent value="bug-bounty" className="space-y-4">
              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Connect your bug bounty platform accounts to sync programs, submissions, and earnings data.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bugBountyServices.map(([service, config]) => (
                  <ServiceCard key={service} service={service} config={config} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="threat-intel" className="space-y-4">
              <Alert>
                <Shield size={16} />
                <AlertDescription>
                  Access threat intelligence feeds and vulnerability databases for real-time security insights.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {threatIntelServices.map(([service, config]) => (
                  <ServiceCard key={service} service={service} config={config} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="project-discovery" className="space-y-4">
              <Alert>
                <Activity size={16} />
                <AlertDescription>
                  Integrate with Project Discovery tools for nuclei templates and subdomain enumeration.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectDiscoveryServices.map(([service, config]) => (
                  <ServiceCard key={service} service={service} config={config} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security-feeds" className="space-y-4">
              <Alert>
                <AlertTriangle size={16} />
                <AlertDescription>
                  Stay updated with the latest security advisories and exploit information.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityFeedServices.map(([service, config]) => (
                  <ServiceCard key={service} service={service} config={config} />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* API Key Input Dialog */}
        {selectedService && (
          <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {API_SERVICES[selectedService].name} API Key</DialogTitle>
                <DialogDescription>
                  Enter your API key to enable integration with {API_SERVICES[selectedService].name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter your API key..."
                    className="mt-1"
                  />
                </div>

                <Alert>
                  <Shield size={16} />
                  <AlertDescription>
                    API keys are stored securely and encrypted. Visit the{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-accent"
                      onClick={() => window.open(API_SERVICES[selectedService].documentation, '_blank')}
                    >
                      official documentation
                    </Button>
                    {' '}to learn how to generate an API key.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedService(null)}
                    disabled={validating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveKey}
                    disabled={!keyInput.trim() || validating}
                    className="flex items-center gap-2"
                  >
                    {validating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Key size={14} />
                        Save Key
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}