import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useProductionAPI, PLATFORM_CONFIGS, APIConnection } from '@/lib/production-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, Clock, Key, Shield, Zap, RefreshCw, ExternalLink, Eye, EyeOff } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LiveProgram {
  id: string
  platform: string
  name: string
  handle: string
  url: string
  bounty: boolean
  status: string
  minBounty?: number
  maxBounty?: number
  lastUpdated: string
}

interface RealTimeStats {
  totalPrograms: number
  activeBounties: number
  totalRewards: number
  recentFindings: number
  lastSync: string
}

export function LiveAPIIntegration() {
  const [connections, setConnections] = useKV<APIConnection[]>('live_api_connections', [])
  const [livePrograms, setLivePrograms] = useKV<LiveProgram[]>('live_bug_bounty_programs', [])
  const [stats, setStats] = useKV<RealTimeStats>('live_bb_stats', {
    totalPrograms: 0,
    activeBounties: 0,
    totalRewards: 0,
    recentFindings: 0,
    lastSync: new Date().toISOString()
  })
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('hackerone')
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [syncInterval, setSyncInterval] = useKV('api_sync_interval', 300000) // 5 minutes
  
  const api = useProductionAPI()

  // Auto-sync on interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (connections.length > 0) {
        syncAllData()
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [connections, syncInterval])

  // Load existing connections on mount
  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    const allConnections = api.getAllConnections()
    setConnections(allConnections)
  }

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    setIsConnecting(true)
    try {
      // Validate key format first
      if (!api.validateKeyFormat(selectedPlatform, apiKey)) {
        toast.error(`Invalid API key format for ${PLATFORM_CONFIGS[selectedPlatform].name}`)
        return
      }

      // Test connection
      const connection = await api.connectPlatform(selectedPlatform, apiKey)
      
      // Update connections list
      setConnections(prev => {
        const filtered = prev.filter(c => c.platform !== selectedPlatform)
        return [...filtered, connection]
      })

      setApiKey('')
      toast.success(`Successfully connected to ${PLATFORM_CONFIGS[selectedPlatform].name}`)
      
      // Immediately sync data from this platform
      syncPlatformData(selectedPlatform)
    } catch (error) {
      console.error('Connection failed:', error)
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (platform: string) => {
    try {
      await api.disconnectPlatform(platform)
      setConnections(prev => prev.filter(c => c.platform !== platform))
      
      // Remove programs from this platform
      setLivePrograms(prev => prev.filter(p => p.platform !== PLATFORM_CONFIGS[platform].name))
      
      toast.success(`Disconnected from ${PLATFORM_CONFIGS[platform].name}`)
    } catch (error) {
      console.error('Disconnect failed:', error)
      toast.error('Failed to disconnect')
    }
  }

  const syncPlatformData = async (platform: string) => {
    try {
      const programs = await api.fetchPrograms()
      const platformPrograms = programs.filter(p => 
        p.platform === PLATFORM_CONFIGS[platform].name
      )

      setLivePrograms(prev => {
        const filtered = prev.filter(p => p.platform !== PLATFORM_CONFIGS[platform].name)
        return [...filtered, ...platformPrograms.map(p => ({
          ...p,
          lastUpdated: new Date().toISOString()
        }))]
      })

      return platformPrograms.length
    } catch (error) {
      console.error(`Failed to sync ${platform}:`, error)
      toast.error(`Failed to sync data from ${PLATFORM_CONFIGS[platform].name}`)
      return 0
    }
  }

  const syncAllData = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    try {
      let totalSynced = 0
      const connectedPlatforms = connections.filter(c => c.status === 'connected')
      
      for (const connection of connectedPlatforms) {
        const count = await syncPlatformData(connection.platform)
        totalSynced += count
      }

      // Update stats
      const newStats: RealTimeStats = {
        totalPrograms: livePrograms.length,
        activeBounties: livePrograms.filter(p => p.bounty).length,
        totalRewards: livePrograms.reduce((sum, p) => sum + (p.maxBounty || 0), 0),
        recentFindings: Math.floor(Math.random() * 50) + 10, // Simulated for demo
        lastSync: new Date().toISOString()
      }
      
      setStats(newStats)
      
      if (totalSynced > 0) {
        toast.success(`Synced ${totalSynced} programs from ${connectedPlatforms.length} platforms`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync data')
    } finally {
      setIsSyncing(false)
    }
  }

  const testConnection = async (platform: string) => {
    const connection = connections.find(c => c.platform === platform)
    if (!connection) return

    try {
      const result = await api.testConnection(platform, connection.apiKey)
      if (result.success) {
        toast.success(`${PLATFORM_CONFIGS[platform].name} connection is healthy`)
      } else {
        toast.error(`Connection test failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Connection test failed')
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live API Integrations</h2>
          <p className="text-muted-foreground">Connect to real bug bounty platforms for live data</p>
        </div>
        <Button 
          onClick={syncAllData} 
          disabled={isSyncing || connections.length === 0}
          className="hover-red-glow"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Programs</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPrograms.toLocaleString()}</p>
              </div>
              <Shield className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bounties</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeBounties.toLocaleString()}</p>
              </div>
              <Zap className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalRewards.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium text-foreground">{formatTimeAgo(stats.lastSync)}</p>
              </div>
              <Clock className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">API Connections</TabsTrigger>
          <TabsTrigger value="programs">Live Programs</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Connect to Bug Bounty Platform
              </CardTitle>
              <CardDescription>
                Add your API credentials to sync live data from bug bounty platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <select 
                    value={selectedPlatform} 
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full p-2 bg-input border border-border rounded-md text-foreground"
                  >
                    {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter ${PLATFORM_CONFIGS[selectedPlatform].name} API key`}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !apiKey.trim()}
                  className="hover-red-glow"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(PLATFORM_CONFIGS[selectedPlatform].documentation, '_blank')}
                  className="hover-border-flow"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Docs
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>✓ Key format: {PLATFORM_CONFIGS[selectedPlatform].keyFormat.toString()}</p>
                <p>✓ Required scopes: {PLATFORM_CONFIGS[selectedPlatform].requiredScopes?.join(', ') || 'None specified'}</p>
                <p>✓ Rate limit: {PLATFORM_CONFIGS[selectedPlatform].rateLimit.requests} requests per {PLATFORM_CONFIGS[selectedPlatform].rateLimit.period}</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Connections */}
          <div className="grid grid-cols-1 gap-4">
            {connections.map((connection) => {
              const config = PLATFORM_CONFIGS[connection.platform]
              const rateLimit = api.getRateLimit(connection.platform)
              
              return (
                <Card key={connection.platform} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          connection.status === 'connected' ? 'bg-green-500' :
                          connection.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-foreground">{config.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Connected {formatTimeAgo(connection.lastTested)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {connection.capabilities.length} capabilities
                        </Badge>
                        {rateLimit && (
                          <Badge variant="outline" className="text-xs">
                            {rateLimit.remaining} requests left
                          </Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection(connection.platform)}
                        >
                          Test
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDisconnect(connection.platform)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                    
                    {connection.status === 'error' && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        Connection error - check your API key and try reconnecting
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {connections.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No API Connections</h3>
                <p className="text-muted-foreground">
                  Connect your first bug bounty platform to start syncing live data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {livePrograms.map((program) => (
              <Card key={`${program.platform}-${program.id}`} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{program.platform}</Badge>
                      <div>
                        <h3 className="font-semibold text-foreground">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">@{program.handle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {program.bounty && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Bounty Available
                        </Badge>
                      )}
                      <Badge variant="outline">{program.status}</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(program.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Updated {formatTimeAgo(program.lastUpdated)}
                    {program.maxBounty && (
                      <span className="ml-3">Max Bounty: ${program.maxBounty.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {livePrograms.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Programs Synced</h3>
                <p className="text-muted-foreground">
                  Connect to bug bounty platforms to view live program data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Configure how often data is synchronized</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sync Interval</label>
                <select 
                  value={syncInterval} 
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="w-full p-2 bg-input border border-border rounded-md text-foreground"
                >
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                </select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>⚠️ More frequent syncing may hit rate limits faster</p>
                <p>📊 Data is also synced automatically when you connect new platforms</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}