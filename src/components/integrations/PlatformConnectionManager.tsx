import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WifiOff, 
  Wifi, 
  Settings, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Shield,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  Database,
  Code
} from '@phosphor-icons/react'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { API_CONFIGS, useAPIKeys, APIKeyValidator } from '@/lib/config'
import { toast } from 'sonner'

export function PlatformConnectionManager() {
  const {
    integrations,
    connectPlatform,
    disconnectPlatform,
    syncPlatformData,
    isLoading,
    lastUpdate,
    syncErrors,
    getAPIKeyStatus,
    getRateLimitStatus
  } = useBugBountyIntegration()

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [validatingKey, setValidatingKey] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'testing' | 'connected' | 'failed' | 'idle'>>({})

  // Live connection testing
  const testConnection = async (platformId: string, testKey?: string) => {
    setConnectionStatus(prev => ({ ...prev, [platformId]: 'testing' }))
    setValidatingKey(true)

    try {
      const platform = integrations.find(int => int.id === platformId)
      const platformKey = platform?.name.toLowerCase().split(' ')[0]
      
      if (!platformKey) {
        throw new Error('Platform not found')
      }

      const keyToTest = testKey || apiKey
      if (!keyToTest) {
        throw new Error('API key required')
      }

      // Validate key format first
      if (!APIKeyValidator.validateFormat(platformKey, keyToTest)) {
        throw new Error('Invalid API key format')
      }

      // Test the actual connection
      const result = await APIKeyValidator.testConnection(platformKey, keyToTest)
      
      if (result.valid) {
        setConnectionStatus(prev => ({ ...prev, [platformId]: 'connected' }))
        toast.success(`✅ Successfully connected to ${platform?.name}`)
        
        if (testKey) {
          // If this is during the connection process, proceed to connect
          await connectPlatform(platformId, testKey)
          setShowAPIKeyDialog(false)
          setApiKey('')
        }
      } else {
        setConnectionStatus(prev => ({ ...prev, [platformId]: 'failed' }))
        toast.error(`❌ Connection failed: ${result.error}`)
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [platformId]: 'failed' }))
      toast.error(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setValidatingKey(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedPlatform || !apiKey) return
    await testConnection(selectedPlatform, apiKey)
  }

  const handleDisconnect = async (platformId: string) => {
    try {
      await disconnectPlatform(platformId)
      setConnectionStatus(prev => ({ ...prev, [platformId]: 'idle' }))
      toast.success('Platform disconnected')
    } catch (error) {
      toast.error('Failed to disconnect platform')
    }
  }

  const getStatusColor = (integration: any) => {
    if (integration.connected) {
      const status = connectionStatus[integration.id]
      switch (status) {
        case 'testing': return 'bg-yellow-500'
        case 'connected': return 'bg-green-500'
        case 'failed': return 'bg-red-500'
        default: return 'bg-green-500'
      }
    }
    return 'bg-gray-500'
  }

  const getConnectionStatusText = (integration: any) => {
    if (!integration.connected) return 'Disconnected'
    
    const status = connectionStatus[integration.id]
    switch (status) {
      case 'testing': return 'Testing...'
      case 'connected': return 'Connected'
      case 'failed': return 'Connection Failed'
      default: return 'Connected'
    }
  }

  const formatLastSync = (lastSync: string) => {
    if (!lastSync) return 'Never'
    const date = new Date(lastSync)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  // Auto-refresh connection status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      integrations.filter(int => int.connected).forEach(integration => {
        const lastTest = connectionStatus[integration.id]
        if (lastTest !== 'testing') {
          // Silently test connections without showing success messages
          testConnection(integration.id).catch(() => {}) 
        }
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [integrations, connectionStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect to bug bounty platforms and threat intelligence feeds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Activity size={14} />
            {integrations.filter(int => int.connected).length}/{integrations.length} Connected
          </Badge>
          {lastUpdate && (
            <Badge variant="secondary" className="gap-2">
              <Clock size={14} />
              Last sync: {formatLastSync(lastUpdate)}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {integrations.filter(int => int.connected).length}
                </p>
                <p className="text-xs text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {integrations.filter(int => int.type === 'bug-bounty').length}
                </p>
                <p className="text-xs text-muted-foreground">Bug Bounty Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {integrations.filter(int => int.type === 'threat-intel').length}
                </p>
                <p className="text-xs text-muted-foreground">Threat Intel Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Code size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {integrations.filter(int => int.type === 'security-tool').length}
                </p>
                <p className="text-xs text-muted-foreground">Security Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const keyStatus = getAPIKeyStatus(integration.id)
          const rateLimitStatus = getRateLimitStatus(integration.id)
          const platformConfig = Object.values(API_CONFIGS).find(
            config => config.platform.toLowerCase() === integration.name.toLowerCase().split(' ')[0]
          )
          const syncError = syncErrors[integration.name.toLowerCase().split(' ')[0]]

          return (
            <Card key={integration.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(integration)} animate-pulse`} />
                      {integration.connected && (
                        <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor(integration)} animate-ping opacity-75`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {integration.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={integration.connected ? 'default' : 'secondary'}>
                    {getConnectionStatusText(integration)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {integration.connected ? (
                      <Wifi size={16} className="text-green-500" />
                    ) : (
                      <WifiOff size={16} className="text-gray-500" />
                    )}
                    <span className={integration.connected ? 'text-green-500' : 'text-gray-500'}>
                      {integration.connected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Last Sync */}
                {integration.connected && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span className="text-foreground">
                      {formatLastSync(integration.lastSync)}
                    </span>
                  </div>
                )}

                {/* Rate Limits */}
                {integration.connected && rateLimitStatus && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API Quota</span>
                      <span className="text-foreground">
                        {rateLimitStatus.remaining} remaining
                      </span>
                    </div>
                    <Progress 
                      value={(rateLimitStatus.remaining / integration.rateLimits.requests) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Data Types */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Data Sources</span>
                  <div className="flex flex-wrap gap-1">
                    {integration.dataTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {syncError && (
                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription className="text-sm">
                      Sync error: {syncError}
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!integration.connected ? (
                    <Dialog 
                      open={showAPIKeyDialog && selectedPlatform === integration.id} 
                      onOpenChange={(open) => {
                        setShowAPIKeyDialog(open)
                        if (!open) {
                          setSelectedPlatform(null)
                          setApiKey('')
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedPlatform(integration.id)
                            setShowAPIKeyDialog(true)
                          }}
                        >
                          <Key size={16} className="mr-2" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card">
                        <DialogHeader>
                          <DialogTitle>Connect to {integration.name}</DialogTitle>
                          <DialogDescription>
                            Enter your API key to connect to {integration.name} and start syncing data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                              id="api-key"
                              type="password"
                              placeholder={`Enter your ${integration.name} API key`}
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              disabled={validatingKey}
                            />
                            {platformConfig && (
                              <p className="text-xs text-muted-foreground">
                                Get your API key from the{' '}
                                <a 
                                  href={platformConfig.docsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                                >
                                  {integration.name} developer portal
                                  <ExternalLink size={12} />
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleConnect}
                              disabled={!apiKey || validatingKey}
                              className="flex-1"
                            >
                              {validatingKey ? (
                                <>
                                  <RefreshCw size={16} className="mr-2 animate-spin" />
                                  Testing Connection...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} className="mr-2" />
                                  Connect
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAPIKeyDialog(false)
                                setApiKey('')
                                setSelectedPlatform(null)
                              }}
                              disabled={validatingKey}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncPlatformData(integration.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(integration.id)}
                        disabled={connectionStatus[integration.id] === 'testing'}
                      >
                        <Zap size={16} className="mr-2" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        <XCircle size={16} className="mr-2" />
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* API Configuration Guide */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            API Configuration Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hackerone" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hackerone">HackerOne</TabsTrigger>
              <TabsTrigger value="bugcrowd">Bugcrowd</TabsTrigger>
              <TabsTrigger value="intigriti">Intigriti</TabsTrigger>
              <TabsTrigger value="shodan">Shodan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hackerone" className="space-y-4">
              <Alert>
                <Key size={16} />
                <AlertDescription>
                  <strong>HackerOne API Setup:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to <a href="https://hackerone.com/settings/api_token" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">HackerOne API Settings</a></li>
                    <li>Create a new API token with 'program:read' and 'report:read' scopes</li>
                    <li>Copy the generated token and paste it above</li>
                    <li>Enable two-factor authentication if required</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="bugcrowd" className="space-y-4">
              <Alert>
                <Key size={16} />
                <AlertDescription>
                  <strong>Bugcrowd API Setup:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Visit <a href="https://bugcrowd.com/profile/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Bugcrowd API Profile</a></li>
                    <li>Generate a new API key with program access permissions</li>
                    <li>Copy the API key and enter it in the connection dialog</li>
                    <li>Ensure your account has researcher-level access</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="intigriti" className="space-y-4">
              <Alert>
                <Key size={16} />
                <AlertDescription>
                  <strong>Intigriti API Setup:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Navigate to <a href="https://app.intigriti.com/researcher/profile" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Intigriti Profile</a></li>
                    <li>Go to API settings and create a new token</li>
                    <li>Select 'read:programs' and 'read:submissions' scopes</li>
                    <li>Copy the OAuth token for integration</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="shodan" className="space-y-4">
              <Alert>
                <Key size={16} />
                <AlertDescription>
                  <strong>Shodan API Setup:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Register at <a href="https://account.shodan.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Shodan Account</a></li>
                    <li>Go to your account page and find the API key section</li>
                    <li>Copy your API key (starts with 32 alphanumeric characters)</li>
                    <li>Consider upgrading for higher rate limits and additional features</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}