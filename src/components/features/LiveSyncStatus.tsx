/**
 * Live Sync Status Component
 * Real-time display of synchronization activity and metrics
 */

import React, { useState, useEffect } from 'react'
import { useAutoSync } from '@/hooks/useAutoSync'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Database,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Timer,
  Shield,
  Target,
  Globe
} from '@phosphor-icons/react'

interface SyncActivity {
  id: string
  timestamp: string
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'platform_connect' | 'platform_disconnect'
  platform?: string
  message: string
  data?: {
    programs?: number
    reports?: number
    earnings?: number
    duration?: number
  }
}

export function LiveSyncStatus() {
  const {
    config,
    syncData,
    metrics,
    connectionStatus,
    isEnabled,
    isRunning,
    nextSyncFormatted,
    forceSync,
    connectedPlatforms,
    disconnectedPlatforms,
    calculateSuccessRate
  } = useAutoSync()

  const { isLoading, lastUpdate } = useBugBountyIntegration()
  
  const [syncActivity, setSyncActivity] = useState<SyncActivity[]>([])
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  // Monitor sync events and update activity log
  useEffect(() => {
    if (syncData && syncData.lastSync) {
      const activity: SyncActivity = {
        id: Date.now().toString(),
        timestamp: syncData.lastSync,
        type: 'sync_complete',
        message: `Sync completed: ${syncData.programs.length} programs, ${syncData.reports.length} reports`,
        data: {
          programs: syncData.programs.length,
          reports: syncData.reports.length,
          earnings: syncData.earnings.length
        }
      }
      
      setSyncActivity(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
    }
  }, [syncData])

  // Monitor connection status changes
  useEffect(() => {
    Object.entries(connectionStatus).forEach(([platform, status]) => {
      if (status === 'connected') {
        const activity: SyncActivity = {
          id: `${platform}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'platform_connect',
          platform,
          message: `${platform} connected successfully`
        }
        
        setSyncActivity(prev => {
          const exists = prev.some(a => 
            a.platform === platform && 
            a.type === 'platform_connect' &&
            new Date(a.timestamp).getTime() > Date.now() - 30000 // Within last 30 seconds
          )
          
          if (!exists) {
            return [activity, ...prev.slice(0, 9)]
          }
          return prev
        })
      }
    })
  }, [connectionStatus])

  const handleForceSync = async () => {
    setIsLoadingAction(true)
    
    const startActivity: SyncActivity = {
      id: `sync-start-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'sync_start',
      message: 'Manual sync initiated'
    }
    
    setSyncActivity(prev => [startActivity, ...prev.slice(0, 9)])
    
    try {
      const success = await forceSync()
      
      const endActivity: SyncActivity = {
        id: `sync-end-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: success ? 'sync_complete' : 'sync_error',
        message: success ? 'Manual sync completed successfully' : 'Manual sync failed'
      }
      
      setSyncActivity(prev => [endActivity, ...prev.slice(0, 9)])
    } finally {
      setIsLoadingAction(false)
    }
  }

  const getActivityIcon = (type: SyncActivity['type']) => {
    switch (type) {
      case 'sync_start':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'sync_complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sync_error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'platform_connect':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'platform_disconnect':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: SyncActivity['type']) => {
    switch (type) {
      case 'sync_start':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'sync_complete':
      case 'platform_connect':
        return 'border-green-500/20 bg-green-500/5'
      case 'sync_error':
      case 'platform_disconnect':
        return 'border-red-500/20 bg-red-500/5'
      default:
        return 'border-border bg-card'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const successRate = calculateSuccessRate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Live Sync Status</h2>
            <p className="text-sm text-muted-foreground">
              Real-time synchronization monitoring and control
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
            {isRunning ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {isRunning ? 'Active' : 'Inactive'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceSync}
            disabled={isLoadingAction || !isEnabled}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAction ? 'animate-spin' : ''}`} />
            Force Sync
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{metrics.programsCount}</div>
                <div className="text-xs text-muted-foreground">Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{metrics.reportsCount}</div>
                <div className="text-xs text-muted-foreground">Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{successRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Timer className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{nextSyncFormatted}</div>
                <div className="text-xs text-muted-foreground">Next Sync</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectedPlatforms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-500 mb-2">Connected ({connectedPlatforms.length})</h4>
                <div className="space-y-2">
                  {connectedPlatforms.map(platform => (
                    <div key={platform} className="flex items-center justify-between p-2 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                      <Badge variant="outline" size="sm">Online</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {disconnectedPlatforms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-500 mb-2">Disconnected ({disconnectedPlatforms.length})</h4>
                <div className="space-y-2">
                  {disconnectedPlatforms.map(platform => (
                    <div key={platform} className="flex items-center justify-between p-2 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                      <Badge variant="outline" size="sm">Offline</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connectedPlatforms.length === 0 && disconnectedPlatforms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No platforms configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {syncActivity.length > 0 ? (
              <div className="space-y-3">
                {syncActivity.map(activity => (
                  <div key={activity.id} className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.message}</p>
                        {activity.platform && (
                          <p className="text-xs text-muted-foreground capitalize">
                            Platform: {activity.platform}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                      {activity.data && (
                        <div className="text-xs text-muted-foreground text-right">
                          {activity.data.programs && <div>{activity.data.programs} programs</div>}
                          {activity.data.reports && <div>{activity.data.reports} reports</div>}
                          {activity.data.duration && <div>{activity.data.duration}ms</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Configuration Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Sync Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Sync Interval</h4>
              <p className="text-lg font-semibold">{Math.floor(config.interval / 60000)} minutes</p>
              <p className="text-xs text-muted-foreground">Between automatic syncs</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Data Types</h4>
              <div className="flex flex-wrap gap-1">
                {config.dataTypes.map(type => (
                  <Badge key={type} variant="outline" size="sm">{type}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Statistics</h4>
              <div className="space-y-1">
                <div className="text-sm">Total syncs: {config.totalSyncs}</div>
                <div className="text-sm text-red-500">Errors: {config.errors}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveSyncStatus