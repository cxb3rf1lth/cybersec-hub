import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

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

  // Initialize sample data
  useEffect(() => {
    if (programs.length === 0) {
      initializeSampleData()
    }
    startLiveDataStream()
  }, [])

  const initializeSampleData = () => {
    const samplePrograms: BugBountyProgram[] = [
      {
        id: 'hp-1',
        platform: 'hackerone',
        name: 'Shopify Bug Bounty',
        company: 'Shopify',
        bountyRange: '$500 - $25,000',
        status: 'active',
        scope: ['*.shopify.com', 'api.shopify.com', 'partners.shopify.com'],
        type: 'web',
        lastUpdated: new Date().toISOString(),
        rewards: {
          critical: '$15,000 - $25,000',
          high: '$5,000 - $15,000',
          medium: '$1,000 - $5,000',
          low: '$500 - $1,000'
        },
        url: 'https://hackerone.com/shopify',
        description: 'Help secure the commerce platform that powers millions of businesses worldwide.',
        targets: ['shopify.com', 'shopifypartners.com', 'shopify.dev'],
        outOfScope: ['*.blog.shopify.com', 'status.shopify.com'],
        disclosed: 1247,
        verified: 892
      },
      {
        id: 'bc-1',
        platform: 'bugcrowd',
        name: 'Tesla Motors',
        company: 'Tesla',
        bountyRange: '$100 - $15,000',
        status: 'active',
        scope: ['*.tesla.com', 'owner-api.teslamotors.com'],
        type: 'web',
        lastUpdated: new Date().toISOString(),
        rewards: {
          critical: '$7,500 - $15,000',
          high: '$2,500 - $7,500',
          medium: '$500 - $2,500',
          low: '$100 - $500'
        },
        url: 'https://bugcrowd.com/tesla',
        description: 'Help us secure the future of sustainable transport.',
        targets: ['tesla.com', 'teslamotors.com'],
        outOfScope: ['*.blog.tesla.com'],
        disclosed: 623,
        verified: 456
      },
      {
        id: 'int-1',
        platform: 'intigriti',
        name: 'European Banking Corp',
        company: 'EBC',
        bountyRange: '€200 - €10,000',
        status: 'active',
        scope: ['*.ebc-bank.eu', 'mobile.ebc-bank.eu'],
        type: 'web',
        lastUpdated: new Date().toISOString(),
        rewards: {
          critical: '€5,000 - €10,000',
          high: '€1,500 - €5,000',
          medium: '€500 - €1,500',
          low: '€200 - €500'
        },
        url: 'https://app.intigriti.com/programs/ebc',
        description: 'Secure European banking infrastructure.',
        targets: ['ebc-bank.eu', 'api.ebc-bank.eu'],
        outOfScope: ['careers.ebc-bank.eu'],
        disclosed: 189,
        verified: 134
      }
    ]

    const sampleThreats: LiveThreatFeed[] = [
      {
        id: 'cve-2024-001',
        source: 'cve',
        title: 'Critical RCE in Apache Struts 2.5.x',
        severity: 'critical',
        cveId: 'CVE-2024-22234',
        description: 'Remote code execution vulnerability in Apache Struts 2.5.x allowing attackers to execute arbitrary code.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        tags: ['rce', 'apache', 'struts', 'java'],
        affectedProducts: ['Apache Struts 2.5.0-2.5.31'],
        exploitation: 'in-the-wild',
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-22234']
      },
      {
        id: 'vuln-2024-002',
        source: 'exploit-db',
        title: 'WordPress Plugin SQLi Exploit Available',
        severity: 'high',
        description: 'SQL injection vulnerability in popular WordPress contact form plugin affecting 100k+ sites.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        tags: ['sqli', 'wordpress', 'plugin', 'database'],
        affectedProducts: ['Contact Form Builder 3.1.2'],
        exploitation: 'poc-available',
        references: ['https://exploit-db.com/exploits/51234']
      }
    ]

    const sampleHunts: TeamHunt[] = [
      {
        id: 'hunt-1',
        name: 'FinTech Security Sprint',
        platform: 'hackerone',
        targetCompany: 'PayFlow Inc',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        teamSize: 5,
        currentMembers: ['user-1', 'user-2'],
        maxMembers: 5,
        skillsRequired: ['web-app-testing', 'api-security', 'mobile-security'],
        bountyPool: '$50,000',
        status: 'recruiting',
        description: 'Team hunt focusing on payment processing security. Looking for skilled researchers.',
        progress: {
          vulnerabilities: 0,
          payout: '$0',
          leaderboard: []
        }
      }
    ]

    setPrograms(samplePrograms)
    setThreatFeed(sampleThreats)
    setTeamHunts(sampleHunts)
    setIntegrations([
      {
        id: 'hackerone-int',
        name: 'HackerOne',
        type: 'bug-bounty',
        connected: true,
        lastSync: new Date().toISOString(),
        dataTypes: ['programs', 'submissions', 'payouts'],
        rateLimits: { requests: 1000, period: 'hour', remaining: 856 }
      },
      {
        id: 'shodan-int',
        name: 'Shodan',
        type: 'threat-intel',
        connected: true,
        lastSync: new Date().toISOString(),
        dataTypes: ['iot-devices', 'vulnerabilities', 'network-scan'],
        rateLimits: { requests: 100, period: 'day', remaining: 78 }
      }
    ])
  }

  const startLiveDataStream = () => {
    // Simulate live data updates
    const interval = setInterval(() => {
      updateThreatFeed()
      updateProgramStats()
      setLastUpdate(new Date().toISOString())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }

  const updateThreatFeed = () => {
    const newThreat: LiveThreatFeed = {
      id: `threat-${Date.now()}`,
      source: ['cve', 'exploit-db', 'security-advisory'][Math.floor(Math.random() * 3)] as any,
      title: generateThreatTitle(),
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
      description: 'Newly discovered security vulnerability requiring immediate attention.',
      timestamp: new Date().toISOString(),
      tags: ['zero-day', 'rce', 'privilege-escalation', 'xss', 'sqli'][Math.floor(Math.random() * 5)],
      affectedProducts: ['Various web applications'],
      exploitation: ['in-the-wild', 'poc-available', 'theoretical'][Math.floor(Math.random() * 3)] as any,
      references: ['https://security-advisory.example.com']
    }

    setThreatFeed(current => [newThreat, ...current.slice(0, 49)]) // Keep last 50
  }

  const generateThreatTitle = () => {
    const threats = [
      'Zero-day RCE discovered in popular CMS',
      'Critical authentication bypass in enterprise software',
      'New malware campaign targeting financial institutions',
      'Supply chain attack affects multiple organizations',
      'Critical vulnerability in cloud infrastructure'
    ]
    return threats[Math.floor(Math.random() * threats.length)]
  }

  const updateProgramStats = () => {
    setPrograms(current => 
      current.map(program => ({
        ...program,
        disclosed: program.disclosed + Math.floor(Math.random() * 3),
        verified: program.verified + Math.floor(Math.random() * 2),
        lastUpdated: new Date().toISOString()
      }))
    )
  }

  const joinTeamHunt = (huntId: string, userId: string) => {
    setTeamHunts(current => 
      current.map(hunt => 
        hunt.id === huntId && hunt.currentMembers.length < hunt.maxMembers
          ? { ...hunt, currentMembers: [...hunt.currentMembers, userId] }
          : hunt
      )
    )
  }

  const createPartnerRequest = (request: Omit<PartnerRequest, 'id' | 'timestamp'>) => {
    const newRequest: PartnerRequest = {
      ...request,
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    setPartnerRequests(current => [newRequest, ...current])
  }

  const respondToPartnerRequest = (requestId: string, response: 'accepted' | 'declined') => {
    setPartnerRequests(current => 
      current.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      )
    )
  }

  const connectPlatform = async (platformId: string, apiKey?: string) => {
    setIsLoading(true)
    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIntegrations(current => 
      current.map(integration => 
        integration.id === platformId 
          ? { ...integration, connected: true, apiKey, lastSync: new Date().toISOString() }
          : integration
      )
    )
    setIsLoading(false)
  }

  const syncPlatformData = async (platformId: string) => {
    setIsLoading(true)
    // Simulate data sync
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIntegrations(current => 
      current.map(integration => 
        integration.id === platformId 
          ? { ...integration, lastSync: new Date().toISOString() }
          : integration
      )
    )
    setIsLoading(false)
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
    syncPlatformData
  }
}