import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { apis, validateAPIKey } from '@/lib/api'
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
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>('apiKeys', {})

  // Initialize real-time data streaming
  useEffect(() => {
    initializeIntegrations()
    startRealTimeUpdates()
    return () => {
      apis.realtime.disconnect()
    }
  }, [])

  const initializeIntegrations = async () => {
    // Initialize default integrations
    const defaultIntegrations: PlatformIntegration[] = [
      {
        id: 'hackerone-int',
        name: 'HackerOne',
        type: 'bug-bounty',
        connected: false,
        lastSync: '',
        dataTypes: ['programs', 'submissions', 'payouts'],
        rateLimits: { requests: 100, period: 'hour', remaining: 100 }
      },
      {
        id: 'bugcrowd-int',
        name: 'Bugcrowd',
        type: 'bug-bounty',
        connected: false,
        lastSync: '',
        dataTypes: ['programs', 'submissions', 'earnings'],
        rateLimits: { requests: 1000, period: 'day', remaining: 1000 }
      },
      {
        id: 'intigriti-int',
        name: 'Intigriti',
        type: 'bug-bounty',
        connected: false,
        lastSync: '',
        dataTypes: ['programs', 'submissions'],
        rateLimits: { requests: 500, period: 'hour', remaining: 500 }
      },
      {
        id: 'yeswehack-int',
        name: 'YesWeHack',
        type: 'bug-bounty',
        connected: false,
        lastSync: '',
        dataTypes: ['programs', 'submissions'],
        rateLimits: { requests: 200, period: 'hour', remaining: 200 }
      },
      {
        id: 'shodan-int',
        name: 'Shodan',
        type: 'threat-intel',
        connected: false,
        lastSync: '',
        dataTypes: ['iot-devices', 'vulnerabilities', 'network-scan'],
        rateLimits: { requests: 100, period: 'day', remaining: 100 }
      },
      {
        id: 'projectdiscovery-int',
        name: 'ProjectDiscovery',
        type: 'security-tool',
        connected: false,
        lastSync: '',
        dataTypes: ['nuclei-templates', 'scan-results', 'vulnerabilities'],
        rateLimits: { requests: 1000, period: 'hour', remaining: 1000 }
      },
      {
        id: 'cve-int',
        name: 'CVE Database',
        type: 'threat-intel',
        connected: true, // Public API, no key required
        lastSync: new Date().toISOString(),
        dataTypes: ['cve-data', 'vulnerability-feeds'],
        rateLimits: { requests: 2000, period: 'hour', remaining: 2000 }
      }
    ]

    if (integrations.length === 0) {
      setIntegrations(defaultIntegrations)
    }

    // Start loading real threat intelligence data
    await loadThreatIntelligence()
  }

  const startRealTimeUpdates = () => {
    // Connect to real-time threat intelligence feeds
    apis.realtime.connect((data) => {
      if (data.type === 'threat_update') {
        handleRealTimeThreatUpdate(data.payload)
      } else if (data.type === 'program_update') {
        handleProgramUpdate(data.payload)
      } else if (data.type === 'team_hunt_update') {
        handleTeamHuntUpdate(data.payload)
      }
    })

    // Subscribe to relevant channels
    apis.realtime.subscribe('threat-intelligence')
    apis.realtime.subscribe('bug-bounty-programs')
    apis.realtime.subscribe('team-hunts')

    // Set up periodic data refresh
    const interval = setInterval(async () => {
      await refreshAllData()
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
      
      // Load CVE data
      const cveData = await apis.threatIntel.getLatestCVEs(50)
      
      // Load ExploitDB data if available
      let exploitData: LiveThreatFeed[] = []
      try {
        exploitData = await apis.threatIntel.getExploitDBItems()
      } catch (error) {
        console.log('ExploitDB data not available:', error)
      }

      const allThreats = [...cveData, ...exploitData]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setThreatFeed(allThreats)
      setLastUpdate(new Date().toISOString())
    } catch (error) {
      console.error('Failed to load threat intelligence:', error)
      toast.error('Failed to load threat intelligence data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAllData = async () => {
    try {
      const promises = []

      // Refresh connected bug bounty platforms
      const connectedIntegrations = integrations.filter(int => int.connected)
      
      for (const integration of connectedIntegrations) {
        const apiKey = apiKeys[integration.id]
        
        if (integration.name === 'HackerOne' && apiKey) {
          promises.push(loadHackerOneData(apiKey))
        } else if (integration.name === 'Bugcrowd' && apiKey) {
          promises.push(loadBugcrowdData(apiKey))
        } else if (integration.name === 'Intigriti' && apiKey) {
          promises.push(loadIntigritiData(apiKey))
        } else if (integration.name === 'CVE Database') {
          promises.push(loadThreatIntelligence())
        }
      }

      await Promise.allSettled(promises)
      setLastUpdate(new Date().toISOString())
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const loadHackerOneData = async (apiKey: string) => {
    try {
      apis.hackerone = new (await import('@/lib/api')).HackerOneAPI(apiKey)
      const hackerOnePrograms = await apis.hackerone.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'hackerone')
        return [...filtered, ...hackerOnePrograms]
      })

      toast.success('HackerOne data updated')
    } catch (error) {
      console.error('HackerOne sync failed:', error)
      toast.error('Failed to sync HackerOne data')
    }
  }

  const loadBugcrowdData = async (apiKey: string) => {
    try {
      apis.bugcrowd = new (await import('@/lib/api')).BugcrowdAPI(apiKey)
      const bugcrowdPrograms = await apis.bugcrowd.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'bugcrowd')
        return [...filtered, ...bugcrowdPrograms]
      })

      toast.success('Bugcrowd data updated')
    } catch (error) {
      console.error('Bugcrowd sync failed:', error)
      toast.error('Failed to sync Bugcrowd data')
    }
  }

  const loadIntigritiData = async (apiKey: string) => {
    try {
      apis.intigriti = new (await import('@/lib/api')).IntigritiAPI(apiKey)
      const intigritiPrograms = await apis.intigriti.getPrograms()
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'intigriti')
        return [...filtered, ...intigritiPrograms]
      })

      toast.success('Intigriti data updated')
    } catch (error) {
      console.error('Intigriti sync failed:', error)
      toast.error('Failed to sync Intigriti data')
    }
  }

  const connectPlatform = async (platformId: string, apiKey?: string) => {
    setIsLoading(true)
    
    try {
      // Validate API key format
      const platform = integrations.find(int => int.id === platformId)
      if (!platform) {
        throw new Error('Platform not found')
      }

      if (apiKey && !validateAPIKey(platform.name.toLowerCase(), apiKey)) {
        throw new Error('Invalid API key format')
      }

      // Test connection by making a test API call
      let testSuccessful = false
      
      if (platform.name === 'HackerOne' && apiKey) {
        const hackerOneAPI = new (await import('@/lib/api')).HackerOneAPI(apiKey)
        await hackerOneAPI.getPrograms()
        testSuccessful = true
        await loadHackerOneData(apiKey)
      } else if (platform.name === 'Bugcrowd' && apiKey) {
        const bugcrowdAPI = new (await import('@/lib/api')).BugcrowdAPI(apiKey)
        await bugcrowdAPI.getPrograms()
        testSuccessful = true
        await loadBugcrowdData(apiKey)
      } else if (platform.name === 'Intigriti' && apiKey) {
        const intigritiAPI = new (await import('@/lib/api')).IntigritiAPI(apiKey)
        await intigritiAPI.getPrograms()
        testSuccessful = true
        await loadIntigritiData(apiKey)
      } else if (platform.name === 'Shodan' && apiKey) {
        const shodanAPI = new (await import('@/lib/api')).ShodanAPI(apiKey)
        await shodanAPI.searchVulnerabilities('vuln:')
        testSuccessful = true
      } else if (platform.name === 'CVE Database') {
        testSuccessful = true // Public API
      }

      if (testSuccessful) {
        // Update integration status
        setIntegrations(current => 
          current.map(integration => 
            integration.id === platformId 
              ? { 
                  ...integration, 
                  connected: true, 
                  lastSync: new Date().toISOString(),
                  ...(apiKey && { apiKey })
                }
              : integration
          )
        )

        // Store API key securely
        if (apiKey) {
          setApiKeys(current => ({
            ...current,
            [platformId]: apiKey
          }))
        }

        toast.success(`Successfully connected to ${platform.name}`)
      }
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
      const apiKey = apiKeys[platformId]
      
      if (!platform?.connected) {
        throw new Error('Platform not connected')
      }

      if (platform.name === 'HackerOne') {
        await loadHackerOneData(apiKey)
      } else if (platform.name === 'Bugcrowd') {
        await loadBugcrowdData(apiKey)
      } else if (platform.name === 'Intigriti') {
        await loadIntigritiData(apiKey)
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

      toast.success(`${platform.name} data synchronized`)
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    joinTeamHunt,
    createPartnerRequest,
    respondToPartnerRequest,
    connectPlatform,
    syncPlatformData,
    createTeamHunt,
    refreshAllData,
    loadThreatIntelligence
  }
}