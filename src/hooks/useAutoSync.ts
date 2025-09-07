/**
 * Automatic Data Synchronization Hook
 * Manages real-time sync with multiple bug bounty platforms
 */

import { useState, useEffect, useCallback } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { bugBountySyncService, SyncedBugBountyData } from '@/lib/real-time-sync'
import { apiManager } from '@/lib/production-api'
import { toast } from 'sonner'

export interface AutoSyncConfig {
  enabled: boolean
  interval: number // in milliseconds
  platforms: string[]
  dataTypes: ('programs' | 'reports' | 'earnings')[]
  notifications: boolean
  errorRetry: {
    enabled: boolean
    maxRetries: number
    backoffMultiplier: number
  }
  lastSync?: string
  totalSyncs: number
  errors: number
}

export interface SyncMetrics {
  programsCount: number
  reportsCount: number
  earningsCount: number
  lastSyncDuration: number
  successRate: number
  nextSyncIn: number
}

const DEFAULT_CONFIG: AutoSyncConfig = {
  enabled: true,
  interval: 300000, // 5 minutes
  platforms: ['hackerone', 'bugcrowd', 'intigriti', 'yeswehack'],
  dataTypes: ['programs', 'reports', 'earnings'],
  notifications: true,
  errorRetry: {
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  totalSyncs: 0,
  errors: 0
}

export function useAutoSync() {
  const [config, setConfig] = useKVWithFallback<AutoSyncConfig>('auto_sync_config', DEFAULT_CONFIG)
  const [syncData, setSyncData] = useState<SyncedBugBountyData | null>(null)
  const [metrics, setMetrics] = useState<SyncMetrics>({
    programsCount: 0,
    reportsCount: 0,
    earningsCount: 0,
    lastSyncDuration: 0,
    successRate: 100,
    nextSyncIn: 0
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({})

  // Initialize sync service
  useEffect(() => {
    if (!isInitialized) {
      initializeSync()
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Monitor connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const connections = apiManager.getAllConnections()
      const status: Record<string, 'connected' | 'disconnected' | 'error'> = {}
      
      config.platforms.forEach(platform => {
        const connection = connections.find(c => c.platform === platform)
        status[platform] = connection?.status || 'disconnected'
      })
      
      setConnectionStatus(status)
    }

    updateConnectionStatus()
    const interval = setInterval(updateConnectionStatus, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [config.platforms])

  // Update next sync countdown
  useEffect(() => {
    if (!config.enabled || !config.lastSync) return

    const updateNextSync = () => {
      const lastSyncTime = new Date(config.lastSync!).getTime()
      const nextSyncTime = lastSyncTime + config.interval
      const now = Date.now()
      const timeUntilNext = Math.max(0, nextSyncTime - now)
      
      setMetrics(prev => ({
        ...prev,
        nextSyncIn: timeUntilNext
      }))
    }

    updateNextSync()
    const interval = setInterval(updateNextSync, 1000)
    
    return () => clearInterval(interval)
  }, [config.enabled, config.lastSync, config.interval])

  const initializeSync = async () => {
    try {
      // Load cached data
      const cachedData = await bugBountySyncService.getCachedData()
      if (cachedData) {
        setSyncData(cachedData)
        updateMetrics(cachedData)
      }

      // Set up sync listener
      bugBountySyncService.addSyncListener(handleSyncUpdate)

      // Configure sync service
      bugBountySyncService.setSyncInterval(config.interval)

      // Start sync if enabled and connections exist
      const connections = apiManager.getAllConnections()
      const hasActiveConnections = connections.some(c => 
        config.platforms.includes(c.platform) && c.status === 'connected'
      )

      if (config.enabled && hasActiveConnections) {
        await bugBountySyncService.startSync()
        if (config.notifications) {
          toast.success('Automatic sync enabled')
        }
      }
    } catch (error) {
      console.error('Failed to initialize auto sync:', error)
      if (config.notifications) {
        toast.error('Failed to initialize automatic sync')
      }
    }
  }

  const handleSyncUpdate = useCallback((data: SyncedBugBountyData) => {
    setSyncData(data)
    updateMetrics(data)
    
    // Update config with sync statistics
    setConfig(prev => ({
      ...prev,
      lastSync: data.lastSync,
      totalSyncs: prev.totalSyncs + 1
    }))

    if (config.notifications) {
      const totalItems = data.programs.length + data.reports.length + data.earnings.length
      toast.success(`Sync completed: ${totalItems} items updated`)
    }
  }, [config.notifications, setConfig])

  const updateMetrics = (data: SyncedBugBountyData) => {
    setMetrics(prev => {
      const newMetrics = {
        programsCount: data.programs.length,
        reportsCount: data.reports.length,
        earningsCount: data.earnings.length,
        lastSyncDuration: prev.lastSyncDuration, // Would be calculated from actual sync timing
        successRate: calculateSuccessRate(),
        nextSyncIn: prev.nextSyncIn
      }
      return newMetrics
    })
  }

  const calculateSuccessRate = (): number => {
    if (config.totalSyncs === 0) return 100
    return Math.max(0, ((config.totalSyncs - config.errors) / config.totalSyncs) * 100)
  }

  const enableSync = async () => {
    try {
      const connections = apiManager.getAllConnections()
      const hasActiveConnections = connections.some(c => 
        config.platforms.includes(c.platform) && c.status === 'connected'
      )

      if (!hasActiveConnections) {
        toast.error('No active platform connections found')
        return false
      }

      setConfig(prev => ({ ...prev, enabled: true }))
      await bugBountySyncService.startSync()
      
      if (config.notifications) {
        toast.success('Automatic sync enabled')
      }
      
      return true
    } catch (error) {
      console.error('Failed to enable sync:', error)
      if (config.notifications) {
        toast.error('Failed to enable automatic sync')
      }
      return false
    }
  }

  const disableSync = () => {
    setConfig(prev => ({ ...prev, enabled: false }))
    bugBountySyncService.stopSync()
    
    if (config.notifications) {
      toast.info('Automatic sync disabled')
    }
  }

  const updateInterval = (interval: number) => {
    setConfig(prev => ({ ...prev, interval }))
    bugBountySyncService.setSyncInterval(interval)
    
    if (config.notifications) {
      const minutes = Math.floor(interval / 60000)
      toast.success(`Sync interval updated to ${minutes} minutes`)
    }
  }

  const updatePlatforms = (platforms: string[]) => {
    setConfig(prev => ({ ...prev, platforms }))
    
    if (config.notifications) {
      toast.success(`Sync platforms updated: ${platforms.join(', ')}`)
    }
  }

  const updateDataTypes = (dataTypes: ('programs' | 'reports' | 'earnings')[]) => {
    setConfig(prev => ({ ...prev, dataTypes }))
    
    if (config.notifications) {
      toast.success(`Sync data types updated: ${dataTypes.join(', ')}`)
    }
  }

  const forceSync = async () => {
    try {
      const startTime = Date.now()
      await bugBountySyncService.forcSync()
      const duration = Date.now() - startTime
      
      setMetrics(prev => ({ ...prev, lastSyncDuration: duration }))
      
      if (config.notifications) {
        toast.success(`Manual sync completed in ${duration}ms`)
      }
      
      return true
    } catch (error) {
      console.error('Force sync failed:', error)
      setConfig(prev => ({ ...prev, errors: prev.errors + 1 }))
      
      if (config.notifications) {
        toast.error('Manual sync failed')
      }
      
      return false
    }
  }

  const getConnectedPlatforms = (): string[] => {
    return Object.entries(connectionStatus)
      .filter(([_, status]) => status === 'connected')
      .map(([platform, _]) => platform)
  }

  const getDisconnectedPlatforms = (): string[] => {
    return Object.entries(connectionStatus)
      .filter(([_, status]) => status !== 'connected')
      .map(([platform, _]) => platform)
  }

  const getNextSyncTime = (): Date | null => {
    if (!config.lastSync) return null
    return new Date(new Date(config.lastSync).getTime() + config.interval)
  }

  const formatNextSyncTime = (): string => {
    if (metrics.nextSyncIn === 0) return 'Now'
    
    const minutes = Math.floor(metrics.nextSyncIn / 60000)
    const seconds = Math.floor((metrics.nextSyncIn % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const resetStats = () => {
    setConfig(prev => ({
      ...prev,
      totalSyncs: 0,
      errors: 0
    }))
    
    if (config.notifications) {
      toast.success('Sync statistics reset')
    }
  }

  return {
    // Configuration
    config,
    updateConfig: setConfig,
    
    // Data
    syncData,
    metrics,
    connectionStatus,
    
    // Actions
    enableSync,
    disableSync,
    updateInterval,
    updatePlatforms,
    updateDataTypes,
    forceSync,
    resetStats,
    
    // Status
    isEnabled: config.enabled,
    isRunning: bugBountySyncService.getSyncStatus().isRunning,
    connectedPlatforms: getConnectedPlatforms(),
    disconnectedPlatforms: getDisconnectedPlatforms(),
    nextSyncTime: getNextSyncTime(),
    nextSyncFormatted: formatNextSyncTime(),
    
    // Utilities
    calculateSuccessRate,
  }
}

export default useAutoSync