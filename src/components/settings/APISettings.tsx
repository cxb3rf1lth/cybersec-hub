import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ExternalLink, Shield, Clock, Zap, Key, RefreshCw, BookOpen } from '@phosphor-icons/react';
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration';
import { API_CONFIGS, APIKeyValidator } from '@/lib/config';
import { APIConfigurationGuide } from './APIConfigurationGuide';
import { toast } from 'sonner';

interface APISettingsProps {
  onClose?: () => void
}

export function APISettings({ onClose }: APISettingsProps) {
  const {
    integrations,
    isLoading,
    connectPlatform,
    disconnectPlatform,
    syncPlatformData,
    getAPIKeyStatus,
    getRateLimitStatus,
    syncErrors,
    apiKeys,
    secureConfig
  } = useBugBountyIntegration();

  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleAPIKeyChange = (platform: string, value: string) => {
    setApiKeyInputs(prev => ({ ...prev, [platform]: value }));
  };

  const handleConnect = async (platformId: string) => {
    const platform = integrations.find(int => int.id === platformId);
    const platformKey = platform?.name.toLowerCase().split(' ')[0];
    const apiKey = apiKeyInputs[platformKey || ''];

    if (!apiKey && platform?.name !== 'CVE Database') {
      toast.error('Please enter an API key');
      return;
    }

    setTestingKeys(prev => ({ ...prev, [platformKey || '']: true }));

    try {
      await connectPlatform(platformId, apiKey);
      setApiKeyInputs(prev => ({ ...prev, [platformKey || '']: '' }));
    } finally {
      setTestingKeys(prev => ({ ...prev, [platformKey || '']: false }));
    }
  };

  const handleDisconnect = (platformId: string) => {
    disconnectPlatform(platformId);
  };

  const handleTestKey = async (platform: string, apiKey: string) => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    setTestingKeys(prev => ({ ...prev, [platform]: true }));

    try {
      const result = await APIKeyValidator.testConnection(platform, apiKey);
      
      if (result.valid) {
        toast.success(`API key is valid for ${API_CONFIGS[platform]?.platform}`);
      } else {
        toast.error(`Invalid API key: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to test API key');
    } finally {
      setTestingKeys(prev => ({ ...prev, [platform]: false }));
    }
  };

  const formatLastSync = (lastSync: string) => {
    if (!lastSync) {return 'Never';}
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {return 'Just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    if (diffMins < 1440) {return `${Math.floor(diffMins / 60)}h ago`;}
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Integration Settings</h2>
          <p className="text-muted-foreground">Configure your bug bounty platform API keys for live data synchronization</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Setup Guide
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map((integration) => {
              const platformKey = integration.name.toLowerCase().split(' ')[0];
              const config = API_CONFIGS[platformKey];
              const keyStatus = getAPIKeyStatus(integration.id);
              const rateLimit = getRateLimitStatus(integration.id);
              const hasError = syncErrors[platformKey] || syncErrors[integration.name];

              return (
                <Card key={integration.id} className="glass-card hover-border-flow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          integration.connected 
                            ? hasError 
                              ? 'bg-yellow-400 animate-pulse' 
                              : 'bg-green-400'
                            : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {integration.type.replace('-', ' ')} platform
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={integration.connected ? 'default' : 'secondary'}>
                        {integration.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>

                    {hasError && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-300">{hasError}</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {config && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {config.description}
                        </div>
                        
                        {config.docsUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(config.docsUrl, '_blank')}
                            className="h-8"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            API Docs
                          </Button>
                        )}
                      </div>
                    )}

                    {!integration.connected ? (
                      <div className="space-y-3">
                        {integration.name !== 'CVE Database' && (
                          <div className="space-y-2">
                            <Label htmlFor={`${platformKey}-key`} className="text-sm font-medium">
                              API Key
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`${platformKey}-key`}
                                type={showKeys[platformKey] ? 'text' : 'password'}
                                placeholder={`Enter ${integration.name} API key`}
                                value={apiKeyInputs[platformKey] || ''}
                                onChange={(e) => handleAPIKeyChange(platformKey, e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowKeys(prev => ({ ...prev, [platformKey]: !prev[platformKey] }))}
                                className="px-3"
                              >
                                {showKeys[platformKey] ? '👁️' : '👁️‍🗨️'}
                              </Button>
                            </div>
                            
                            {apiKeyInputs[platformKey] && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestKey(platformKey, apiKeyInputs[platformKey])}
                                disabled={testingKeys[platformKey]}
                                className="w-full"
                              >
                                {testingKeys[platformKey] ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                    Testing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-2" />
                                    Test Connection
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        <Button
                          onClick={() => handleConnect(integration.id)}
                          disabled={isLoading || testingKeys[platformKey]}
                          className="w-full hover-red-glow"
                        >
                          {testingKeys[platformKey] ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            'Connect Platform'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last sync:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatLastSync(integration.lastSync)}
                          </span>
                        </div>

                        {rateLimit && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Rate limit:</span>
                              <span>{rateLimit.remaining} requests remaining</span>
                            </div>
                            <Progress 
                              value={(rateLimit.remaining / 100) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncPlatformData(integration.id)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sync Now
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                            className="flex-1"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}

                    {keyStatus?.expired && (
                      <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-300">API key rotation recommended</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <APIConfigurationGuide />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and synchronization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync data from connected platforms</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt stored API keys (recommended)</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Error notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when sync fails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync interval (minutes)</Label>
                <Input type="number" defaultValue="5" min="1" max="60" />
                <p className="text-xs text-muted-foreground">
                  How often to check for new data (respects rate limits)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(API_CONFIGS).map(([key, config]) => {
              const keyStatus = apiKeys.getAllPlatformStatuses().find(ks => ks.platform === key);
              
              return (
                <Card key={key} className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{config.platform}</CardTitle>
                    <CardDescription>Usage statistics and limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {keyStatus?.hasKey ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total requests:</span>
                            <span>{keyStatus.metadata?.usage || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last used:</span>
                            <span>{keyStatus.metadata?.lastUsed ? formatLastSync(keyStatus.metadata.lastUsed) : 'Never'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Key age:</span>
                            <span>
                              {keyStatus.metadata?.created 
                                ? `${Math.floor((Date.now() - new Date(keyStatus.metadata.created).getTime()) / (1000 * 60 * 60 * 24))}d`
                                : 'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {keyStatus.expired && (
                          <Badge variant="destructive" className="w-full justify-center">
                            Key rotation recommended
                          </Badge>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No API key configured</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}