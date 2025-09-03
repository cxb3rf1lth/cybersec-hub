/**
 * Auto-Sync Production Initialization
 * Automatically configures and starts data synchronization for production use
 */

import { bugBountySyncService } from '@/lib/real-time-sync'
import { apiManager } from '@/lib/production-api'
import { toast } from 'sonner'

export interface AutoSyncInitConfig {
  autoStart: boolean
  defaultInterval: number
  enabledPlatforms: string[]
  enabledDataTypes: ('programs' | 'reports' | 'earnings')[]
  retryConfig: {
    enabled: boolean
    maxRetries: number
    backoffMultiplier: number
  }
  notifications: boolean
}

const DEFAULT_INIT_CONFIG: AutoSyncInitConfig = {
  autoStart: true,
  defaultInterval: 300000, // 5 minutes
  enabledPlatforms: ['hackerone', 'bugcrowd', 'intigriti', 'yeswehack'],
  enabledDataTypes: ['programs', 'reports', 'earnings'],
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  notifications: true
}

class AutoSyncProductionInit {
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  /**
   * Initialize automatic sync for production environment
   */
  async initialize(config: Partial<AutoSyncInitConfig> = {}): Promise<void> {
    if (this.isInitialized) {
      console.log('Auto-sync already initialized')
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.performInitialization(config)
    return this.initPromise
  }

  private async performInitialization(config: Partial<AutoSyncInitConfig>): Promise<void> {
    const finalConfig = { ...DEFAULT_INIT_CONFIG, ...config }
    
    try {
      console.log('Initializing automatic sync for production...')

      // Step 1: Check for existing API connections
      const connections = apiManager.getAllConnections()
      const activeConnections = connections.filter(c => 
        finalConfig.enabledPlatforms.includes(c.platform) && c.status === 'connected'
      )

      if (activeConnections.length === 0) {
        console.log('No active API connections found. Auto-sync will start when connections are available.')
        this.setupConnectionListener(finalConfig)
        this.isInitialized = true
        return
      }

      // Step 2: Configure sync service
      bugBountySyncService.setSyncInterval(finalConfig.defaultInterval)

      // Step 3: Set up error handling
      if (finalConfig.retryConfig.enabled) {
        this.setupErrorRetry(finalConfig.retryConfig)
      }

      // Step 4: Initialize sync data storage
      await this.initializeSyncStorage()

      // Step 5: Start automatic sync if enabled
      if (finalConfig.autoStart) {
        await bugBountySyncService.startSync()
        
        if (finalConfig.notifications) {
          toast.success(`Auto-sync started with ${activeConnections.length} platforms`)
        }
        
        console.log(`Auto-sync started successfully with platforms: ${activeConnections.map(c => c.platform).join(', ')}`)
      }

      // Step 6: Set up monitoring
      this.setupSyncMonitoring(finalConfig)

      this.isInitialized = true
      console.log('Auto-sync initialization completed successfully')

    } catch (error) {
      console.error('Failed to initialize auto-sync:', error)
      if (finalConfig.notifications) {
        toast.error('Failed to initialize automatic sync')
      }
      throw error
    }
  }

  /**
   * Set up listener for new API connections
   */
  private setupConnectionListener(config: AutoSyncInitConfig): void {
    // Monitor for new connections
    const checkInterval = setInterval(async () => {
      const connections = apiManager.getAllConnections()
      const activeConnections = connections.filter(c => 
        config.enabledPlatforms.includes(c.platform) && c.status === 'connected'
      )

      if (activeConnections.length > 0 && !bugBountySyncService.getSyncStatus().isRunning) {
        console.log('New API connections detected, starting auto-sync...')
        
        try {
          await bugBountySyncService.startSync()
          
          if (config.notifications) {
            toast.success(`Auto-sync started with ${activeConnections.length} platforms`)
          }
          
          clearInterval(checkInterval)
        } catch (error) {
          console.error('Failed to start sync after connection:', error)
        }
      }
    }, 10000) // Check every 10 seconds

    // Clean up after 5 minutes if no connections found
    setTimeout(() => {
      clearInterval(checkInterval)
    }, 300000)
  }

  /**
   * Set up error retry mechanism
   */
  private setupErrorRetry(retryConfig: AutoSyncInitConfig['retryConfig']): void {
    let retryCount = 0
    
    bugBountySyncService.addSyncListener((data) => {
      // Reset retry count on successful sync
      retryCount = 0
    })

    // Monitor for errors and implement retry logic
    const originalPerformSync = (bugBountySyncService as any).performSync
    
    if (originalPerformSync) {
      (bugBountySyncService as any).performSync = async function() {
        try {
          await originalPerformSync.call(this)
          retryCount = 0
        } catch (error) {
          retryCount++
          
          if (retryCount <= retryConfig.maxRetries) {
            const delay = Math.pow(retryConfig.backoffMultiplier, retryCount - 1) * 1000
            console.log(`Sync failed, retrying in ${delay}ms (attempt ${retryCount}/${retryConfig.maxRetries})`)
            
            setTimeout(() => {
              this.performSync()
            }, delay)
          } else {
            console.error(`Sync failed after ${retryConfig.maxRetries} retries`)
            retryCount = 0 // Reset for next sync cycle
            throw error
          }
        }
      }
    }
  }

  /**
   * Initialize sync data storage
   */
  private async initializeSyncStorage(): Promise<void> {
    try {
      // Ensure sync storage is properly initialized
      const existingData = await bugBountySyncService.getCachedData()
      
      if (!existingData) {
        console.log('No existing sync data found, will populate on first sync')
      } else {
        console.log(`Found existing sync data: ${existingData.programs.length} programs, ${existingData.reports.length} reports`)
      }
    } catch (error) {
      console.error('Failed to initialize sync storage:', error)
    }
  }

  /**
   * Set up sync monitoring and health checks
   */
  private setupSyncMonitoring(config: AutoSyncInitConfig): void {
    // Monitor sync health
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 3

    bugBountySyncService.addSyncListener((data) => {
      consecutiveFailures = 0
      console.log(`Sync completed successfully at ${data.lastSync}`)
    })

    // Monitor for repeated failures
    const healthCheckInterval = setInterval(() => {
      const syncStatus = bugBountySyncService.getSyncStatus()
      
      if (syncStatus.isRunning) {
        // Check for stale sync data
        const cachedData = bugBountySyncService.getCachedData()
        
        cachedData.then(data => {
          if (data && data.lastSync) {
            const lastSyncTime = new Date(data.lastSync).getTime()
            const stalenessThreshold = config.defaultInterval * 3 // 3x the sync interval
            
            if (Date.now() - lastSyncTime > stalenessThreshold) {
              consecutiveFailures++
              
              if (consecutiveFailures >= maxConsecutiveFailures) {
                console.warn('Sync appears to be stale, attempting restart...')
                
                if (config.notifications) {
                  toast.warning('Sync issue detected, attempting to restart')
                }
                
                bugBountySyncService.stopSync()
                setTimeout(() => {
                  bugBountySyncService.startSync()
                }, 5000)
                
                consecutiveFailures = 0
              }
            }
          }
        }).catch(console.error)
      }
    }, 60000) // Check every minute

    // Store interval reference for cleanup
    ;(this as any).healthCheckInterval = healthCheckInterval
  }

  /**
   * Get initialization status
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Get current sync statistics
   */
  async getStats(): Promise<{
    isRunning: boolean
    platforms: number
    lastSync?: string
    programs: number
    reports: number
    earnings: number
  }> {
    const status = bugBountySyncService.getSyncStatus()
    const data = await bugBountySyncService.getCachedData()
    const connections = apiManager.getAllConnections().filter(c => c.status === 'connected')

    return {
      isRunning: status.isRunning,
      platforms: connections.length,
      lastSync: data?.lastSync,
      programs: data?.programs.length || 0,
      reports: data?.reports.length || 0,
      earnings: data?.earnings.length || 0
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if ((this as any).healthCheckInterval) {
      clearInterval((this as any).healthCheckInterval)
    }
    
    bugBountySyncService.stopSync()
    this.isInitialized = false
    this.initPromise = null
  }
}

// Export singleton instance
export const autoSyncInit = new AutoSyncProductionInit()

// Auto-initialize on module load for production
if (typeof window !== 'undefined') {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => autoSyncInit.initialize(), 2000) // 2 second delay
    })
  } else {
    setTimeout(() => autoSyncInit.initialize(), 2000)
  }
}

export default autoSyncInit