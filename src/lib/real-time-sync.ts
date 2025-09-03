/**
 * Production Real-Time Bug Bounty Data Sync Service
 * Handles live data synchronization from multiple bug bounty platforms
 */

import { apiManager, PLATFORM_CONFIGS } from './production-api'
import { toast } from 'sonner'

export interface SyncedBugBountyData {
  programs: BugBountyProgram[]
  reports: BugBountyReport[]
  earnings: BugBountyEarning[]
  stats: BugBountyStats
  lastSync: string
}

export interface BugBountyProgram {
  id: string
  platform: string
  name: string
  handle: string
  url: string
  company: string
  description: string
  scopes: string[]
  rewards: {
    minimum: number
    maximum: number
    average: number
  }
  status: 'active' | 'paused' | 'closed'
  type: 'public' | 'private' | 'invite-only'
  lastUpdated: string
  metrics: {
    totalReports: number
    resolvedReports: number
    averageResponseTime: string
    averageBounty: number
  }
}

export interface BugBountyReport {
  id: string
  platform: string
  program: string
  title: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'
  category: string
  status: 'New' | 'Triaged' | 'Resolved' | 'Duplicate' | 'Informative' | 'Not Applicable'
  bounty?: number
  researcher: string
  submittedAt: string
  resolvedAt?: string
  cve?: string
  description: string
  impact: string
}

export interface BugBountyEarning {
  id: string
  platform: string
  program: string
  report: string
  amount: number
  currency: string
  paidAt: string
  taxInfo?: {
    year: number
    category: string
    reported: boolean
  }
}

export interface BugBountyStats {
  totalPrograms: number
  activePrograms: number
  totalReports: number
  totalEarnings: number
  averageBounty: number
  topCategory: string
  responseTime: string
  successRate: number
}

class RealTimeBugBountySyncService {
  private syncInterval: number = 300000 // 5 minutes
  private isRunning: boolean = false
  private syncTimer?: NodeJS.Timeout
  private listeners: Set<(data: SyncedBugBountyData) => void> = new Set()

  /**
   * Start real-time synchronization
   */
  async startSync(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Starting real-time bug bounty sync service...')

    // Initial sync
    await this.performSync()

    // Set up periodic sync
    this.syncTimer = setInterval(() => {
      this.performSync().catch(console.error)
    }, this.syncInterval)

    toast.success('Real-time sync started')
  }

  /**
   * Stop real-time synchronization
   */
  stopSync(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }

    console.log('Stopped real-time bug bounty sync service')
    toast.info('Real-time sync stopped')
  }

  /**
   * Perform a complete data synchronization
   */
  private async performSync(): Promise<void> {
    try {
      console.log('Performing bug bounty data sync...')
      
      const connections = apiManager.getAllConnections()
      const activeConnections = connections.filter(c => c.status === 'connected')

      if (activeConnections.length === 0) {
        console.log('No active connections for sync')
        return
      }

      const syncedData: SyncedBugBountyData = {
        programs: [],
        reports: [],
        earnings: [],
        stats: {
          totalPrograms: 0,
          activePrograms: 0,
          totalReports: 0,
          totalEarnings: 0,
          averageBounty: 0,
          topCategory: '',
          responseTime: '0h',
          successRate: 0
        },
        lastSync: new Date().toISOString()
      }

      // Sync data from each connected platform
      for (const connection of activeConnections) {
        try {
          await this.syncPlatformData(connection.platform, syncedData)
        } catch (error) {
          console.error(`Failed to sync ${connection.platform}:`, error)
          // Mark connection as error state
          connection.status = 'error'
          await spark.kv.set(`api_connection_${connection.platform}`, connection)
        }
      }

      // Calculate aggregated stats
      this.calculateStats(syncedData)

      // Store synced data
      await spark.kv.set('synced_bug_bounty_data', syncedData)

      // Notify listeners
      this.listeners.forEach(listener => listener(syncedData))

      console.log(`Sync completed. Programs: ${syncedData.programs.length}, Reports: ${syncedData.reports.length}`)
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Data sync failed')
    }
  }

  /**
   * Sync data from a specific platform
   */
  private async syncPlatformData(platform: string, syncedData: SyncedBugBountyData): Promise<void> {
    const config = PLATFORM_CONFIGS[platform]
    if (!config) return

    try {
      // Sync programs
      const programs = await this.syncPrograms(platform)
      syncedData.programs.push(...programs)

      // Sync reports (if supported)
      if (this.platformSupportsReports(platform)) {
        const reports = await this.syncReports(platform)
        syncedData.reports.push(...reports)
      }

      // Sync earnings (if supported)
      if (this.platformSupportsEarnings(platform)) {
        const earnings = await this.syncEarnings(platform)
        syncedData.earnings.push(...earnings)
      }
    } catch (error) {
      console.error(`Platform sync failed for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Sync programs from a platform
   */
  private async syncPrograms(platform: string): Promise<BugBountyProgram[]> {
    try {
      const endpoint = this.getProgramsEndpoint(platform)
      const data = await apiManager.makeRequest(platform, endpoint)
      return this.normalizePrograms(platform, data)
    } catch (error) {
      console.error(`Failed to sync programs from ${platform}:`, error)
      return []
    }
  }

  /**
   * Sync reports from a platform
   */
  private async syncReports(platform: string): Promise<BugBountyReport[]> {
    try {
      const endpoint = this.getReportsEndpoint(platform)
      const data = await apiManager.makeRequest(platform, endpoint)
      return this.normalizeReports(platform, data)
    } catch (error) {
      console.error(`Failed to sync reports from ${platform}:`, error)
      return []
    }
  }

  /**
   * Sync earnings from a platform
   */
  private async syncEarnings(platform: string): Promise<BugBountyEarning[]> {
    try {
      const endpoint = this.getEarningsEndpoint(platform)
      const data = await apiManager.makeRequest(platform, endpoint)
      return this.normalizeEarnings(platform, data)
    } catch (error) {
      console.error(`Failed to sync earnings from ${platform}:`, error)
      return []
    }
  }

  /**
   * Get programs endpoint for platform
   */
  private getProgramsEndpoint(platform: string): string {
    switch (platform) {
      case 'hackerone': return '/programs'
      case 'bugcrowd': return '/programs'
      case 'intigriti': return '/external/researcher/programs'
      case 'yeswehack': return '/programs'
      default: return '/programs'
    }
  }

  /**
   * Get reports endpoint for platform
   */
  private getReportsEndpoint(platform: string): string {
    switch (platform) {
      case 'hackerone': return '/reports'
      case 'bugcrowd': return '/submissions'
      case 'intigriti': return '/external/researcher/submissions'
      case 'yeswehack': return '/reports'
      default: return '/reports'
    }
  }

  /**
   * Get earnings endpoint for platform
   */
  private getEarningsEndpoint(platform: string): string {
    switch (platform) {
      case 'hackerone': return '/bounties'
      case 'bugcrowd': return '/payments'
      case 'intigriti': return '/external/researcher/payments'
      case 'yeswehack': return '/bounties'
      default: return '/earnings'
    }
  }

  /**
   * Check if platform supports reports API
   */
  private platformSupportsReports(platform: string): boolean {
    return ['hackerone', 'bugcrowd', 'intigriti', 'yeswehack'].includes(platform)
  }

  /**
   * Check if platform supports earnings API
   */
  private platformSupportsEarnings(platform: string): boolean {
    return ['hackerone', 'bugcrowd', 'intigriti', 'yeswehack'].includes(platform)
  }

  /**
   * Normalize programs data across platforms
   */
  private normalizePrograms(platform: string, data: any): BugBountyProgram[] {
    switch (platform) {
      case 'hackerone':
        return data.data?.map((program: any) => ({
          id: program.id,
          platform: 'HackerOne',
          name: program.attributes.name,
          handle: program.attributes.handle,
          url: `https://hackerone.com/${program.attributes.handle}`,
          company: program.attributes.name,
          description: program.attributes.policy || '',
          scopes: program.relationships?.structured_scopes?.data?.map((s: any) => s.attributes?.asset_identifier) || [],
          rewards: {
            minimum: program.attributes.base_bounty || 0,
            maximum: program.attributes.max_bounty || 0,
            average: (program.attributes.base_bounty + program.attributes.max_bounty) / 2 || 0
          },
          status: program.attributes.state === 'public_mode' ? 'active' : 'paused',
          type: program.attributes.submission_state === 'open' ? 'public' : 'private',
          lastUpdated: new Date().toISOString(),
          metrics: {
            totalReports: program.attributes.reports_resolved_count || 0,
            resolvedReports: program.attributes.reports_resolved_count || 0,
            averageResponseTime: program.attributes.average_time_to_first_program_response || '0h',
            averageBounty: program.attributes.average_bounty_lower_amount || 0
          }
        })) || []

      case 'bugcrowd':
        return data.programs?.map((program: any) => ({
          id: program.code,
          platform: 'Bugcrowd',
          name: program.name,
          handle: program.code,
          url: `https://bugcrowd.com/${program.code}`,
          company: program.organization?.name || program.name,
          description: program.brief_description || '',
          scopes: program.target_groups?.flatMap((tg: any) => 
            tg.targets?.map((t: any) => t.name) || []
          ) || [],
          rewards: {
            minimum: program.min_payout || 0,
            maximum: program.max_payout || 0,
            average: ((program.min_payout || 0) + (program.max_payout || 0)) / 2
          },
          status: program.state === 'live' ? 'active' : 'paused',
          type: program.open_for_submission ? 'public' : 'private',
          lastUpdated: new Date().toISOString(),
          metrics: {
            totalReports: 0, // Not available in basic API
            resolvedReports: 0,
            averageResponseTime: '0h',
            averageBounty: program.average_payout || 0
          }
        })) || []

      default:
        return []
    }
  }

  /**
   * Normalize reports data across platforms
   */
  private normalizeReports(platform: string, data: any): BugBountyReport[] {
    // Implementation would depend on actual API responses
    // This is a simplified version
    return []
  }

  /**
   * Normalize earnings data across platforms
   */
  private normalizeEarnings(platform: string, data: any): BugBountyEarning[] {
    // Implementation would depend on actual API responses
    // This is a simplified version
    return []
  }

  /**
   * Calculate aggregated statistics
   */
  private calculateStats(syncedData: SyncedBugBountyData): void {
    const { programs, reports, earnings } = syncedData

    syncedData.stats = {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.status === 'active').length,
      totalReports: reports.length,
      totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
      averageBounty: earnings.length > 0 ? earnings.reduce((sum, e) => sum + e.amount, 0) / earnings.length : 0,
      topCategory: this.getTopCategory(reports),
      responseTime: this.getAverageResponseTime(programs),
      successRate: reports.length > 0 ? (reports.filter(r => r.status === 'Resolved').length / reports.length) * 100 : 0
    }
  }

  /**
   * Get the most common vulnerability category
   */
  private getTopCategory(reports: BugBountyReport[]): string {
    if (reports.length === 0) return 'None'

    const categories = reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categories).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  }

  /**
   * Get average response time across programs
   */
  private getAverageResponseTime(programs: BugBountyProgram[]): string {
    if (programs.length === 0) return '0h'
    
    // Simple implementation - would need proper time parsing in production
    return programs[0]?.metrics.averageResponseTime || '0h'
  }

  /**
   * Add a listener for sync updates
   */
  addSyncListener(listener: (data: SyncedBugBountyData) => void): void {
    this.listeners.add(listener)
  }

  /**
   * Remove a sync listener
   */
  removeSyncListener(listener: (data: SyncedBugBountyData) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): { isRunning: boolean; interval: number; lastSync?: string } {
    return {
      isRunning: this.isRunning,
      interval: this.syncInterval,
    }
  }

  /**
   * Update sync interval
   */
  setSyncInterval(interval: number): void {
    this.syncInterval = interval
    
    if (this.isRunning) {
      // Restart with new interval
      this.stopSync()
      this.startSync()
    }
  }

  /**
   * Force an immediate sync
   */
  async forcSync(): Promise<void> {
    await this.performSync()
  }

  /**
   * Get cached sync data
   */
  async getCachedData(): Promise<SyncedBugBountyData | null> {
    try {
      return await spark.kv.get<SyncedBugBountyData>('synced_bug_bounty_data')
    } catch (error) {
      console.error('Failed to get cached sync data:', error)
      return null
    }
  }
}

// Export singleton instance
export const bugBountySyncService = new RealTimeBugBountySyncService()

// Auto-start sync when connections are available
apiManager.addSyncListener?.(() => {
  const connections = apiManager.getAllConnections()
  if (connections.length > 0 && !bugBountySyncService.getSyncStatus().isRunning) {
    bugBountySyncService.startSync()
  }
})