import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Clock, 
  Database, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Code,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Eye,
  Bug,
  Server,
  Play,
  Pause,
  Timer,
  Settings
} from '@phosphor-icons/react'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { useAutoSync } from '@/hooks/useAutoSync'
import { SyncConfiguration } from '@/components/features/SyncConfiguration'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface MetricData {
  timestamp: string
  value: number
  platform: string
  type: 'programs' | 'threats' | 'vulnerabilities' | 'requests'
}

interface ConnectionHealth {
  platform: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  lastError?: string
  dataPoints: MetricData[]
}

export function IntegrationStatusDashboard() {
  const {
    integrations,
    programs,
    threatFeed,
    isLoading,
    lastUpdate,
    syncErrors,
    refreshAllData
  } = useBugBountyIntegration()

  // Auto-sync functionality
  const {
    config: syncConfig,
    metrics: syncMetrics,
    connectionStatus,
    isEnabled: syncEnabled,
    isRunning: syncRunning,
    enableSync,
    disableSync,
    forceSync,
    nextSyncFormatted,
    connectedPlatforms,
    disconnectedPlatforms
  } = useAutoSync()

  const [healthMetrics, setHealthMetrics] = useKV<ConnectionHealth[]>('connection_health', [])
  const [realTimeData, setRealTimeData] = useKV<MetricData[]>('realtime_metrics', [])
  const [monitoringEnabled, setMonitoringEnabled] = useState(true)
  const [showSyncConfig, setShowSyncConfig] = useState(false)
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  // Initialize health monitoring
  useEffect(() => {
    if (monitoringEnabled) {
      const interval = setInterval(() => {
        updateHealthMetrics()
        collectRealTimeMetrics()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [integrations, monitoringEnabled])

  const updateHealthMetrics = async () => {
    const newHealthMetrics: ConnectionHealth[] = []

    for (const integration of integrations.filter(int => int.connected)) {
      try {
        const startTime = Date.now()
        
        // Simulate health check - in production, this would ping the actual API
        const healthResponse = await simulateHealthCheck(integration.name)
        const responseTime = Date.now() - startTime

        const existingHealth = healthMetrics.find(h => h.platform === integration.name)
        
        newHealthMetrics.push({
          platform: integration.name,
          status: healthResponse.status,
          responseTime,
          uptime: existingHealth ? existingHealth.uptime + 30 : 30, // Increment uptime
          lastError: healthResponse.error,
          dataPoints: [
            ...(existingHealth?.dataPoints || []).slice(-20), // Keep last 20 data points
            {
              timestamp: new Date().toISOString(),
              value: responseTime,
              platform: integration.name,
              type: 'requests'
            }
          ]
        })
      } catch (error) {
        console.error(`Health check failed for ${integration.name}:`, error)
        
        const existingHealth = healthMetrics.find(h => h.platform === integration.name)
        newHealthMetrics.push({
          platform: integration.name,
          status: 'down',
          responseTime: 0,
          uptime: 0,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          dataPoints: existingHealth?.dataPoints || []
        })
      }
    }

    setHealthMetrics(newHealthMetrics)
  }

  const simulateHealthCheck = async (platform: string): Promise<{ status: 'healthy' | 'degraded' | 'down', error?: string }> => {
    // Simulate API health check with random delays and occasional failures
    const delay = Math.random() * 1000 + 200 // 200ms to 1.2s
    await new Promise(resolve => setTimeout(resolve, delay))

    // 5% chance of failure for demo purposes
    if (Math.random() < 0.05) {
      throw new Error('Connection timeout')
    }

    // 10% chance of degraded performance
    if (Math.random() < 0.1) {
      return { status: 'degraded', error: 'High response time detected' }
    }

    return { status: 'healthy' }
  }

  // Auto-sync control functions
  const handleToggleSync = async () => {
    setIsLoadingAction(true)
    try {
      if (syncEnabled) {
        disableSync()
        toast.success('Automatic sync disabled')
      } else {
        const success = await enableSync()
        if (success) {
          toast.success('Automatic sync enabled')
        } else {
          toast.error('Failed to enable sync - check platform connections')
        }
      }
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handleForceSync = async () => {
    setIsLoadingAction(true)
    try {
      const success = await forceSync()
      if (success) {
        toast.success('Manual sync completed')
      } else {
        toast.error('Manual sync failed')
      }
    } finally {
      setIsLoadingAction(false)
    }
  }

  const collectRealTimeMetrics = () => {
    const now = new Date().toISOString()
    const newMetrics: MetricData[] = []

    // Collect program counts
    const programsByPlatform = programs.reduce((acc, program) => {
      acc[program.platform] = (acc[program.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(programsByPlatform).forEach(([platform, count]) => {
      newMetrics.push({
        timestamp: now,
        value: count,
        platform,
        type: 'programs'
      })
    })

    // Collect threat counts
    const threatsBySource = threatFeed.reduce((acc, threat) => {
      acc[threat.source] = (acc[threat.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(threatsBySource).forEach(([source, count]) => {
      newMetrics.push({
        timestamp: now,
        value: count,
        platform: source,
        type: 'threats'
      })
    })

    // Add to existing data and keep last 50 points
    setRealTimeData(current => [...current, ...newMetrics].slice(-50))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'down': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className="text-green-500" />
      case 'degraded': return <AlertTriangle size={16} className="text-yellow-500" />
      case 'down': return <XCircle size={16} className="text-red-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  const calculateUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // Calculate summary stats
  const totalThreats = threatFeed.length
  const activeConnections = healthMetrics.filter(h => h.status === 'healthy').length
  const degradedConnections = healthMetrics.filter(h => h.status === 'degraded').length
  const downConnections = healthMetrics.filter(h => h.status === 'down').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integration Status</h2>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of platform connections and data flow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSyncConfig(true)}
            className="gap-2"
          >
            <Settings size={16} />
            Sync Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshAllData()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Auto-Sync Control Panel */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Automatic Data Synchronization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time sync with {connectedPlatforms.length} connected platforms
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={syncRunning ? "default" : "secondary"} className="gap-1">
                {syncRunning ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {syncRunning ? 'Active' : 'Inactive'}
              </Badge>
              
              {syncRunning && (
                <Badge variant="outline" className="gap-1">
                  <Timer className="h-3 w-3" />
                  Next: {nextSyncFormatted}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{syncMetrics.programsCount}</div>
                <div className="text-xs text-muted-foreground">Programs Synced</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{syncMetrics.reportsCount}</div>
                <div className="text-xs text-muted-foreground">Reports Synced</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{syncMetrics.successRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Sync interval: {Math.floor(syncConfig.interval / 60000)} minutes
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceSync}
                disabled={isLoadingAction || !syncEnabled}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingAction ? 'animate-spin' : ''}`} />
                Force Sync
              </Button>
              
              <Button
                variant={syncEnabled ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleSync}
                disabled={isLoadingAction}
                className="gap-2"
              >
                {syncEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Enable
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeConnections}</p>
                <p className="text-xs text-muted-foreground">Healthy Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPrograms}</p>
                <p className="text-xs text-muted-foreground">Bug Bounty Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalThreats}</p>
                <p className="text-xs text-muted-foreground">Threat Intelligence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {((activeConnections / Math.max(connectedPlatforms, 1)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Uptime Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Health Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server size={20} />
            Connection Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {healthMetrics.map((health) => (
              <Card key={health.platform} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(health.status)}`} />
                      <span className="font-medium text-foreground">{health.platform}</span>
                    </div>
                    {getStatusIcon(health.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="text-foreground">{formatResponseTime(health.responseTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="text-foreground">{calculateUptime(health.uptime)}</span>
                    </div>
                    {health.lastError && (
                      <div className="mt-2">
                        <Alert>
                          <AlertTriangle size={14} />
                          <AlertDescription className="text-xs">
                            {health.lastError}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>

                  {/* Mini response time chart */}
                  <div className="mt-3">
                    <div className="h-8 flex items-end gap-1">
                      {health.dataPoints.slice(-10).map((point, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500/20 rounded-sm min-h-[2px] transition-all duration-300"
                          style={{
                            height: `${Math.min((point.value / 1000) * 24, 24)}px`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Response time trend (last 10 checks)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Metrics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Bug Bounty Programs</TabsTrigger>
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.filter(int => int.connected).map((integration) => {
                    const platformPrograms = programs.filter(p => 
                      p.platform.toLowerCase() === integration.name.toLowerCase().split(' ')[0]
                    ).length
                    const percentage = totalPrograms > 0 ? (platformPrograms / totalPrograms) * 100 : 0

                    return (
                      <div key={integration.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">
                            {integration.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {platformPrograms} programs
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastUpdate && (
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                      <CheckCircle size={16} className="text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Data Sync Complete</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lastUpdate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {Object.entries(syncErrors).map(([platform, error]) => (
                    <div key={platform} className="flex items-start gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <XCircle size={16} className="text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Sync Error - {platform}</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  ))}

                  {healthMetrics.filter(h => h.status === 'degraded').map((health) => (
                    <div key={health.platform} className="flex items-start gap-3 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Performance Issue - {health.platform}</p>
                        <p className="text-xs text-muted-foreground">High response time detected</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug size={20} />
                Bug Bounty Program Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{programs.filter(p => p.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Active Programs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{programs.filter(p => p.type === 'web').length}</p>
                  <p className="text-sm text-muted-foreground">Web Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {programs.reduce((sum, p) => sum + (p.disclosed || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Disclosed</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(
                  programs.reduce((acc, program) => {
                    acc[program.platform] = (acc[program.platform] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-foreground">{platform}</span>
                    </div>
                    <Badge variant="secondary">{count} programs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield size={20} />
                Threat Intelligence Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {['critical', 'high', 'medium', 'low'].map((severity) => {
                  const count = threatFeed.filter(t => t.severity === severity).length
                  return (
                    <div key={severity} className="text-center">
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{severity} Threats</p>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3">
                {threatFeed.slice(0, 5).map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={threat.severity === 'critical' ? 'destructive' : 
                                threat.severity === 'high' ? 'secondary' : 'outline'}
                      >
                        {threat.severity}
                      </Badge>
                      <span className="font-medium text-foreground truncate max-w-[300px]">
                        {threat.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(threat.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 size={20} />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Average Response Times</h4>
                  <div className="space-y-3">
                    {healthMetrics.map((health) => (
                      <div key={health.platform} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">{health.platform}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatResponseTime(health.responseTime)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((health.responseTime / 2000) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Connection Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">Healthy</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        <span className="text-sm text-foreground">Degraded</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{degradedConnections}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-sm text-foreground">Down</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{downConnections}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sync Configuration Modal */}
      {showSyncConfig && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SyncConfiguration onClose={() => setShowSyncConfig(false)} />
          </div>
        </div>
      )}
    </div>
  )
}