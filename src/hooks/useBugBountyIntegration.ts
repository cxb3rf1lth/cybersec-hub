import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { bugBountyService, threatIntelService, authService } from '@/lib/production-services'
import { useAPIKeys, useSecureConfig, APIKeyValidator, quotaManager, API_CONFIGS } from '@/lib/config'
import { toast } from 'sonner'

export interface BugBountyProgram {
  id: string
  platform: 'hackerone' | 'bugcrowd' | 'intigriti' | 'yeswehack' | 'projectdiscovery' | 'shodan'
  name: string
  company: string
  bountyRange: string
  status: 'active' | 'paused' | 'closed'
  scope: string[]
  type: 'web' | 'mobile' | 'api' | 'infrastructure' | 'hardware'
  lastUpdated: string
  rewards: {
    critical: string
    high: string
    medium: string
    low: string
  }
  url: string
  description: string
  targets: string[]
  outOfScope: string[]
  disclosed: number
  verified: number
}

export interface LiveThreatFeed {
  id: string
  source: 'cve' | 'exploit-db' | 'security-advisory' | 'threat-intel' | 'vuln-disclosure'
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  cveId?: string
  description: string
  timestamp: string
  tags: string[]
  affectedProducts: string[]
  exploitation: 'in-the-wild' | 'poc-available' | 'theoretical'
  references: string[]
}

export interface TeamHunt {
  id: string
  name: string
  platform: string
  targetCompany: string
  startDate: string
  endDate: string
  teamSize: number
  currentMembers: string[]
  maxMembers: number
  skillsRequired: string[]
  bountyPool: string
  status: 'recruiting' | 'active' | 'completed'
  description: string
  progress: {
    vulnerabilities: number
    payout: string
    leaderboard: Array<{
      userId: string
      name: string
      score: number
      bounties: number
    }>
  }
}

export interface PartnerRequest {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  targetProgram: string
  platform: string
  message: string
  skillsOffered: string[]
  splitProposal: string
  status: 'pending' | 'accepted' | 'declined'
  timestamp: string
  expiresAt: string
}

export interface PlatformIntegration {
  id: string
  name: string
  type: 'bug-bounty' | 'threat-intel' | 'security-tool'
  apiKey?: string
  connected: boolean
  lastSync: string
  dataTypes: string[]
  rateLimits: {
    requests: number
    period: string
    remaining: number
  }
}

export function useBugBountyIntegration() {
  const [programs, setPrograms] = useKV<BugBountyProgram[]>('bugBountyPrograms', [])
  const [threatFeed, setThreatFeed] = useKV<LiveThreatFeed[]>('liveThreatFeed', [])
  const [teamHunts, setTeamHunts] = useKV<TeamHunt[]>('teamHunts', [])
  const [partnerRequests, setPartnerRequests] = useKV<PartnerRequest[]>('partnerRequests', [])
  const [integrations, setIntegrations] = useKV<PlatformIntegration[]>('platformIntegrations', [])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [syncErrors, setSyncErrors] = useKV<Record<string, string>>('syncErrors', {})
  
  // Use secure configuration management
  const apiKeys = useAPIKeys()
  const secureConfig = useSecureConfig()

  // Initialize real-time data streaming
  useEffect(() => {
    initializeIntegrations()
    startRealTimeUpdates()
    return () => {
      apis.realtime.disconnect()
    }
  }, [])

  const initializeIntegrations = async () => {
    // Initialize default integrations based on configuration
    const defaultIntegrations: PlatformIntegration[] = Object.entries(API_CONFIGS).map(([key, config]) => ({
      id: `${key}-int`,
      name: config.platform,
      type: config.platform.toLowerCase().includes('shodan') || config.platform.toLowerCase().includes('virus') 
        ? 'threat-intel' 
        : config.platform.toLowerCase().includes('project')
        ? 'security-tool'
        : 'bug-bounty',
      connected: false,
      lastSync: '',
      dataTypes: key === 'hackerone' ? ['programs', 'submissions', 'payouts'] :
                 key === 'bugcrowd' ? ['programs', 'submissions', 'earnings'] :
                 key === 'intigriti' ? ['programs', 'submissions'] :
                 key === 'yeswehack' ? ['programs', 'submissions'] :
                 key === 'shodan' ? ['iot-devices', 'vulnerabilities', 'network-scan'] :
                 key === 'projectdiscovery' ? ['nuclei-templates', 'scan-results', 'vulnerabilities'] :
                 key === 'virustotal' ? ['malware-analysis', 'url-scan', 'file-scan'] :
                 ['threat-intelligence', 'vulnerability-feeds'],
      rateLimits: { 
        requests: key === 'shodan' ? 100 : key === 'bugcrowd' ? 1000 : 500, 
        period: key === 'shodan' ? 'day' : 'hour', 
        remaining: key === 'shodan' ? 100 : key === 'bugcrowd' ? 1000 : 500 
      }
    }))

    // Add CVE database as always-connected public API
    defaultIntegrations.push({
      id: 'cve-int',
      name: 'CVE Database',
      type: 'threat-intel',
      connected: true,
      lastSync: new Date().toISOString(),
      dataTypes: ['cve-data', 'vulnerability-feeds'],
      rateLimits: { requests: 2000, period: 'hour', remaining: 2000 }
    })

    if (integrations.length === 0) {
      setIntegrations(defaultIntegrations)
    }

    // Check for existing API keys and update connection status
    const keyStatuses = apiKeys.getAllPlatformStatuses()
    setIntegrations(current => 
      current.map(integration => {
        const keyStatus = keyStatuses.find(ks => ks.platform.toLowerCase().includes(integration.name.toLowerCase().split(' ')[0]))
        return {
          ...integration,
          connected: integration.id === 'cve-int' || (keyStatus?.hasKey && !keyStatus?.expired) || false
        }
      })
    )

    // Start loading real threat intelligence data
    await loadThreatIntelligence()
  }

  const startRealTimeUpdates = () => {
    // Use production WebSocket service for real-time updates
    const { webSocketService } = require('@/lib/production-services')
    
    webSocketService.on('threat_update', handleRealTimeThreatUpdate)
    webSocketService.on('bounty_update', handleProgramUpdate)
    webSocketService.on('team_hunt_update', handleTeamHuntUpdate)

    // Subscribe to relevant channels
    webSocketService.subscribe('threat-intelligence')
    webSocketService.subscribe('bug-bounty-programs')
    webSocketService.subscribe('team-hunts')

    // Set up periodic data refresh with production service
    const interval = setInterval(async () => {
      await refreshAllDataProduction()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }

  const handleRealTimeThreatUpdate = (threatData: any) => {
    const newThreat: LiveThreatFeed = {
      id: threatData.id || `threat-${Date.now()}`,
      source: threatData.source || 'threat-intel',
      title: threatData.title,
      severity: threatData.severity || 'medium',
      cveId: threatData.cve_id,
      description: threatData.description,
      timestamp: threatData.timestamp || new Date().toISOString(),
      tags: threatData.tags || [],
      affectedProducts: threatData.affected_products || [],
      exploitation: threatData.exploitation_status || 'theoretical',
      references: threatData.references || []
    }

    setThreatFeed(current => {
      const updated = [newThreat, ...current.slice(0, 499)] // Keep last 500 items
      return updated
    })

    // Show notification for critical threats
    if (threatData.severity === 'critical') {
      toast.error(`Critical Threat Alert: ${threatData.title}`, {
        description: 'New critical vulnerability detected',
        duration: 10000
      })
    }
  }

  const handleProgramUpdate = (programData: any) => {
    setPrograms(current => 
      current.map(program => 
        program.id === programData.id 
          ? { ...program, ...programData, lastUpdated: new Date().toISOString() }
          : program
      )
    )
  }

  const handleTeamHuntUpdate = (huntData: any) => {
    setTeamHunts(current => 
      current.map(hunt => 
        hunt.id === huntData.id 
          ? { ...hunt, ...huntData }
          : hunt
      )
    )
  }

  const loadThreatIntelligence = async () => {
    try {
      setIsLoading(true)
      
      // Use production threat intelligence service
      const allThreats = await threatIntelService.getLatestThreats()
      
      setThreatFeed(allThreats)
      setLastUpdate(new Date().toISOString())
    } catch (error) {
      console.error('Failed to load threat intelligence:', error)
      toast.error('Failed to load threat intelligence data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAllDataProduction = async () => {
    try {
      const promises = []
      setSyncErrors({}) // Clear previous errors

      // Refresh connected bug bounty platforms using production service
      const connectedIntegrations = integrations.filter(int => int.connected)
      
      for (const integration of connectedIntegrations) {
        const platformKey = integration.name.toLowerCase().split(' ')[0]
        
        // Check rate limits before making requests
        if (!quotaManager.checkQuota(platformKey)) {
          console.warn(`Rate limit exceeded for ${integration.name}`)
          continue
        }
        
        if (platformKey === 'cve') {
          promises.push(loadThreatIntelligence())
        } else {
          promises.push(loadPlatformDataProduction(platformKey))
        }
      }

      const results = await Promise.allSettled(promises)
      
      // Handle failed syncs
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const integration = connectedIntegrations[index]
          setSyncErrors(current => ({
            ...current,
            [integration.name]: result.reason?.message || 'Sync failed'
          }))
        }
      })

      setLastUpdate(new Date().toISOString())
      secureConfig.updateSyncTime('all')
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const loadPlatformDataProduction = async (platformKey: string) => {
    try {
      const programs = await bugBountyService.syncPrograms(platformKey)
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== platformKey)
        return [...filtered, ...programs]
      })

      secureConfig.updateSyncTime(platformKey)
      toast.success(`${platformKey} data updated`)
    } catch (error) {
      console.error(`${platformKey} sync failed:`, error)
      setSyncErrors(current => ({ ...current, [platformKey]: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error(`Failed to sync ${platformKey} data`)
      throw error
    }
  }

  const refreshAllData = async () => {
    try {
      const promises = []
      setSyncErrors({}) // Clear previous errors

      // Refresh connected bug bounty platforms
      const connectedIntegrations = integrations.filter(int => int.connected)
      
      for (const integration of connectedIntegrations) {
        const platformKey = integration.name.toLowerCase().split(' ')[0]
        const apiKey = apiKeys.getAPIKey(platformKey)
        
        // Check rate limits before making requests
        if (!quotaManager.checkQuota(platformKey)) {
          console.warn(`Rate limit exceeded for ${integration.name}`)
          continue
        }
        
        if (integration.name === 'HackerOne' && apiKey) {
          promises.push(loadHackerOneData(apiKey, platformKey))
        } else if (integration.name === 'Bugcrowd' && apiKey) {
          promises.push(loadBugcrowdData(apiKey, platformKey))
        } else if (integration.name === 'Intigriti' && apiKey) {
          promises.push(loadIntigritiData(apiKey, platformKey))
        } else if (integration.name === 'YesWeHack' && apiKey) {
          promises.push(loadYesWeHackData(apiKey, platformKey))
        } else if (integration.name === 'Shodan' && apiKey) {
          promises.push(loadShodanData(apiKey, platformKey))
        } else if (integration.name === 'CVE Database') {
          promises.push(loadThreatIntelligence())
        }
      }

      const results = await Promise.allSettled(promises)
      
      // Handle failed syncs
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const integration = connectedIntegrations[index]
          setSyncErrors(current => ({
            ...current,
            [integration.name]: result.reason?.message || 'Sync failed'
          }))
        }
      })

      setLastUpdate(new Date().toISOString())
      secureConfig.updateSyncTime('all')
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const loadHackerOneData = async (apiKey: string, platformKey: string) => {
    try {
      const { HackerOneAPI } = await import('@/lib/api')
      const hackerOneAPI = new HackerOneAPI(apiKey)
      const hackerOnePrograms = await hackerOneAPI.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'hackerone')
        return [...filtered, ...hackerOnePrograms]
      })

      secureConfig.updateSyncTime('hackerone')
      toast.success('HackerOne data updated')
    } catch (error) {
      console.error('HackerOne sync failed:', error)
      setSyncErrors(current => ({ ...current, hackerone: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error('Failed to sync HackerOne data')
      throw error
    }
  }

  const loadBugcrowdData = async (apiKey: string, platformKey: string) => {
    try {
      const { BugcrowdAPI } = await import('@/lib/api')
      const bugcrowdAPI = new BugcrowdAPI(apiKey)
      const bugcrowdPrograms = await bugcrowdAPI.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'bugcrowd')
        return [...filtered, ...bugcrowdPrograms]
      })

      secureConfig.updateSyncTime('bugcrowd')
      toast.success('Bugcrowd data updated')
    } catch (error) {
      console.error('Bugcrowd sync failed:', error)
      setSyncErrors(current => ({ ...current, bugcrowd: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error('Failed to sync Bugcrowd data')
      throw error
    }
  }

  const loadIntigritiData = async (apiKey: string, platformKey: string) => {
    try {
      const { IntigritiAPI } = await import('@/lib/api')
      const intigritiAPI = new IntigritiAPI(apiKey)
      const intigritiPrograms = await intigritiAPI.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'intigriti')
        return [...filtered, ...intigritiPrograms]
      })

      secureConfig.updateSyncTime('intigriti')
      toast.success('Intigriti data updated')
    } catch (error) {
      console.error('Intigriti sync failed:', error)
      setSyncErrors(current => ({ ...current, intigriti: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error('Failed to sync Intigriti data')
      throw error
    }
  }

  const loadYesWeHackData = async (apiKey: string, platformKey: string) => {
    try {
      const { YesWeHackAPI } = await import('@/lib/api')
      const yesWeHackAPI = new YesWeHackAPI(apiKey)
      const programs = await yesWeHackAPI.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'yeswehack')
        return [...filtered, ...programs]
      })

      secureConfig.updateSyncTime('yeswehack')
      toast.success('YesWeHack data updated')
    } catch (error) {
      console.error('YesWeHack sync failed:', error)
      setSyncErrors(current => ({ ...current, yeswehack: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error('Failed to sync YesWeHack data')
      throw error
    }
  }

  const loadShodanData = async (apiKey: string, platformKey: string) => {
    try {
      const { ShodanAPI } = await import('@/lib/api')
      const shodanAPI = new ShodanAPI(apiKey)
      const vulnerabilities = await shodanAPI.searchVulnerabilities('vuln:')
      
      // Convert Shodan data to threat feed format
      const threatData: LiveThreatFeed[] = vulnerabilities.slice(0, 20).map((vuln: any) => ({
        id: `shodan-${vuln.ip}-${Date.now()}`,
        source: 'threat-intel' as const,
        title: `Vulnerability found on ${vuln.ip}`,
        severity: 'medium' as const,
        description: `Shodan detected vulnerability: ${vuln.vulns?.join(', ') || 'Multiple issues'}`,
        timestamp: new Date().toISOString(),
        tags: ['shodan', 'network-scan', ...(vuln.vulns || [])],
        affectedProducts: [vuln.product || 'Unknown'],
        exploitation: 'theoretical' as const,
        references: [`https://www.shodan.io/host/${vuln.ip}`]
      }))

      setThreatFeed(current => {
        const filtered = current.filter(t => !t.id.startsWith('shodan-'))
        return [...threatData, ...filtered].slice(0, 500)
      })

      secureConfig.updateSyncTime('shodan')
      toast.success('Shodan data updated')
    } catch (error) {
      console.error('Shodan sync failed:', error)
      setSyncErrors(current => ({ ...current, shodan: error instanceof Error ? error.message : 'Sync failed' }))
      toast.error('Failed to sync Shodan data')
      throw error
    }
  }

  const connectPlatform = async (platformId: string, apiKey?: string) => {
    setIsLoading(true)
    
    try {
      const platform = integrations.find(int => int.id === platformId)
      if (!platform) {
        throw new Error('Platform not found')
      }

      const platformKey = platform.name.toLowerCase().split(' ')[0]
      
      // Validate API key format first
      if (apiKey && !APIKeyValidator.validateFormat(platformKey, apiKey)) {
        throw new Error('Invalid API key format. Please check the key and try again.')
      }

      // Test the connection using production auth service
      if (apiKey) {
        const isValid = await authService.validateAPIKey(platformKey, apiKey)
        if (!isValid) {
          throw new Error('API key validation failed')
        }
        
        // Store the validated API key using production service
        await authService.storeAPIKey(platformKey, apiKey)
        apiKeys.setAPIKey(platformKey, apiKey)
        
        // Load initial data using production service
        await loadPlatformDataProduction(platformKey)
      }

      // Update integration status
      setIntegrations(current => 
        current.map(integration => 
          integration.id === platformId 
            ? { 
                ...integration, 
                connected: true, 
                lastSync: new Date().toISOString()
              }
            : integration
        )
      )

      // Enable platform in configuration
      secureConfig.enablePlatform(platformKey)

      toast.success(`Successfully connected to ${platform.name}`)
    } catch (error) {
      console.error('Platform connection failed:', error)
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const syncPlatformData = async (platformId: string) => {
    setIsLoading(true)
    
    try {
      const platform = integrations.find(int => int.id === platformId)
      const platformKey = platform?.name.toLowerCase().split(' ')[0]
      const apiKey = platformKey ? apiKeys.getAPIKey(platformKey) : null
      
      if (!platform?.connected) {
        throw new Error('Platform not connected')
      }

      // Check rate limits
      if (platformKey && !quotaManager.checkQuota(platformKey)) {
        throw new Error('Rate limit exceeded. Please wait before syncing again.')
      }

      if (platform.name === 'HackerOne' && apiKey) {
        await loadHackerOneData(apiKey, platformKey!)
      } else if (platform.name === 'Bugcrowd' && apiKey) {
        await loadBugcrowdData(apiKey, platformKey!)
      } else if (platform.name === 'Intigriti' && apiKey) {
        await loadIntigritiData(apiKey, platformKey!)
      } else if (platform.name === 'YesWeHack' && apiKey) {
        await loadYesWeHackData(apiKey, platformKey!)
      } else if (platform.name === 'Shodan' && apiKey) {
        await loadShodanData(apiKey, platformKey!)
      } else if (platform.name === 'CVE Database') {
        await loadThreatIntelligence()
      }

      // Update last sync time
      setIntegrations(current => 
        current.map(integration => 
          integration.id === platformId 
            ? { ...integration, lastSync: new Date().toISOString() }
            : integration
        )
      )

      // Clear any previous sync errors
      setSyncErrors(current => {
        const updated = { ...current }
        delete updated[platformKey || platform.name]
        return updated
      })

      toast.success(`${platform.name} data synchronized`)
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const joinTeamHunt = async (huntId: string, userId: string) => {
    try {
      const success = await apis.collaboration.joinHunt(huntId, userId)
      
      if (success) {
        setTeamHunts(current => 
          current.map(hunt => 
            hunt.id === huntId && hunt.currentMembers.length < hunt.maxMembers
              ? { ...hunt, currentMembers: [...hunt.currentMembers, userId] }
              : hunt
          )
        )
        toast.success('Successfully joined team hunt')
      } else {
        toast.error('Failed to join team hunt')
      }
    } catch (error) {
      console.error('Join hunt failed:', error)
      toast.error('Failed to join team hunt')
    }
  }

  const createPartnerRequest = async (request: Omit<PartnerRequest, 'id' | 'timestamp'>) => {
    try {
      const newRequest = await apis.collaboration.createPartnerRequest(request)
      setPartnerRequests(current => [newRequest, ...current])
      toast.success('Partner request sent')
      return newRequest
    } catch (error) {
      console.error('Create partner request failed:', error)
      toast.error('Failed to send partner request')
      throw error
    }
  }

  const respondToPartnerRequest = (requestId: string, response: 'accepted' | 'declined') => {
    setPartnerRequests(current => 
      current.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      )
    )

    toast.success(`Partner request ${response}`)
  }

  const createTeamHunt = async (hunt: Omit<TeamHunt, 'id'>) => {
    try {
      const newHunt = await apis.collaboration.createTeamHunt(hunt)
      setTeamHunts(current => [newHunt, ...current])
      toast.success('Team hunt created successfully')
      return newHunt
    } catch (error) {
      console.error('Create team hunt failed:', error)
      toast.error('Failed to create team hunt')
      throw error
    }
  }

  return {
    programs,
    threatFeed,
    teamHunts,
    partnerRequests,
    integrations,
    isLoading,
    lastUpdate,
    syncErrors,
    joinTeamHunt,
    createPartnerRequest,
    respondToPartnerRequest,
    connectPlatform,
    disconnectPlatform,
    syncPlatformData,
    createTeamHunt,
    refreshAllData,
    loadThreatIntelligence,
    getAPIKeyStatus,
    getRateLimitStatus,
    apiKeys,
    secureConfig
  }

  // Helper functions for platform management
  function disconnectPlatform(platformId: string) {
    const platform = integrations.find(int => int.id === platformId)
    const platformKey = platform?.name.toLowerCase().split(' ')[0]
    
    if (platformKey) {
      apiKeys.removeAPIKey(platformKey)
      secureConfig.disablePlatform(platformKey)
    }

    setIntegrations(current => 
      current.map(integration => 
        integration.id === platformId 
          ? { ...integration, connected: false, lastSync: '' }
          : integration
      )
    )

    // Clear programs from disconnected platform
    if (platform) {
      setPrograms(current => 
        current.filter(p => p.platform !== platformKey)
      )
    }

    toast.success(`Disconnected from ${platform?.name}`)
  }

  function getAPIKeyStatus(platformId: string) {
    const platform = integrations.find(int => int.id === platformId)
    const platformKey = platform?.name.toLowerCase().split(' ')[0]
    
    if (!platformKey) return null
    
    const keyStatuses = apiKeys.getAllPlatformStatuses()
    return keyStatuses.find(ks => ks.platform === platformKey)
  }

  function getRateLimitStatus(platformId: string) {
    const platform = integrations.find(int => int.id === platformId)
    const platformKey = platform?.name.toLowerCase().split(' ')[0]
    
    if (!platformKey) return null
    
    return {
      remaining: quotaManager.getRemainingQuota(platformKey),
      resetTime: quotaManager.getQuotaResetTime(platformKey)
    }
  }
}