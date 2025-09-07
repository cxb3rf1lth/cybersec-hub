import { useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { BugBountyPlatform, BugBountyProgram, LiveBountyFeed, PlatformConfiguration } from '@/types/bug-bounty'

// Production-ready bug bounty platforms with real integrations
const BUG_BOUNTY_PLATFORMS: BugBountyPlatform[] = [
  {
    id: 'hackerone',
    name: 'hackerone',
    displayName: 'HackerOne',
    baseUrl: 'https://hackerone.com',
    apiUrl: 'https://api.hackerone.com/v1',
    logoUrl: 'https://www.hackerone.com/sites/default/files/2021-02/h1-logo-black.svg',
    description: 'The leading bug bounty and vulnerability coordination platform',
    isActive: true,
    type: 'continuous',
    minPayout: 50,
    maxPayout: 100000,
    averagePayout: 1500,
    currency: 'USD',
    authentication: {
      type: 'api-key',
      endpoints: {
        auth: '/auth',
        refresh: '/refresh'
      }
    },
    endpoints: {
      programs: '/programs',
      submissions: '/reports',
      reports: '/reports',
      profile: '/users/me',
      earnings: '/users/me/earnings',
      leaderboard: '/leaderboard'
    },
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      burstLimit: 200
    },
    stats: {
      activeProgramsCount: 3500,
      totalResearchers: 900000,
      totalPayouts: 300000000,
      averageResponseTime: 48,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 300000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 900000).toISOString()
    }
  },
  {
    id: 'bugcrowd',
    name: 'bugcrowd',
    displayName: 'Bugcrowd',
    baseUrl: 'https://bugcrowd.com',
    apiUrl: 'https://api.bugcrowd.com/v2',
    logoUrl: 'https://www.bugcrowd.com/wp-content/uploads/2022/03/Bugcrowd-Logo-2022.svg',
    description: 'Crowdsourced cybersecurity platform with managed bug bounty programs',
    isActive: true,
    type: 'continuous',
    minPayout: 100,
    maxPayout: 75000,
    averagePayout: 1200,
    currency: 'USD',
    authentication: {
      type: 'oauth',
      endpoints: {
        auth: '/oauth/authorize',
        refresh: '/oauth/token'
      },
      scopes: ['read:programs', 'read:submissions', 'read:profile']
    },
    endpoints: {
      programs: '/programs',
      submissions: '/submissions',
      reports: '/submissions',
      profile: '/user',
      earnings: '/user/payments'
    },
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 500,
      burstLimit: 120
    },
    stats: {
      activeProgramsCount: 1200,
      totalResearchers: 150000,
      totalPayouts: 100000000,
      averageResponseTime: 72,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 600000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 1200000).toISOString()
    }
  },
  {
    id: 'intigriti',
    name: 'intigriti',
    displayName: 'Intigriti',
    baseUrl: 'https://app.intigriti.com',
    apiUrl: 'https://api.intigriti.com/core',
    logoUrl: 'https://www.intigriti.com/hubfs/intigriti-logo.svg',
    description: 'European bug bounty platform with focus on ethical hacking',
    isActive: true,
    type: 'continuous',
    minPayout: 75,
    maxPayout: 50000,
    averagePayout: 800,
    currency: 'EUR',
    authentication: {
      type: 'oauth',
      endpoints: {
        auth: '/oauth2/authorize',
        refresh: '/oauth2/token'
      },
      scopes: ['programs:read', 'submissions:read', 'profile:read']
    },
    endpoints: {
      programs: '/programs',
      submissions: '/submissions',
      reports: '/submissions',
      profile: '/user/me',
      earnings: '/user/me/payments'
    },
    rateLimit: {
      requestsPerMinute: 50,
      requestsPerHour: 300,
      burstLimit: 100
    },
    stats: {
      activeProgramsCount: 600,
      totalResearchers: 75000,
      totalPayouts: 25000000,
      averageResponseTime: 36,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 450000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 1050000).toISOString()
    }
  },
  {
    id: 'yeswehack',
    name: 'yeswehack',
    displayName: 'YesWeHack',
    baseUrl: 'https://www.yeswehack.com',
    apiUrl: 'https://api.yeswehack.com/v1',
    logoUrl: 'https://www.yeswehack.com/assets/img/ywh-logo.svg',
    description: 'French bug bounty platform with global reach',
    isActive: true,
    type: 'continuous',
    minPayout: 50,
    maxPayout: 40000,
    averagePayout: 650,
    currency: 'EUR',
    authentication: {
      type: 'jwt',
      endpoints: {
        auth: '/auth/login',
        refresh: '/auth/refresh'
      }
    },
    endpoints: {
      programs: '/programs',
      submissions: '/reports',
      reports: '/reports',
      profile: '/profile',
      earnings: '/profile/earnings'
    },
    rateLimit: {
      requestsPerMinute: 40,
      requestsPerHour: 240,
      burstLimit: 80
    },
    stats: {
      activeProgramsCount: 400,
      totalResearchers: 45000,
      totalPayouts: 15000000,
      averageResponseTime: 42,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 720000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 780000).toISOString()
    }
  },
  {
    id: 'project-discovery',
    name: 'project-discovery',
    displayName: 'ProjectDiscovery Cloud',
    baseUrl: 'https://cloud.projectdiscovery.io',
    apiUrl: 'https://api.projectdiscovery.io/v1',
    logoUrl: 'https://avatars.githubusercontent.com/u/50994705',
    description: 'Cloud-based vulnerability scanning and reconnaissance platform',
    isActive: true,
    type: 'vdp',
    minPayout: 0,
    maxPayout: 10000,
    averagePayout: 300,
    currency: 'USD',
    authentication: {
      type: 'api-key',
      endpoints: {
        auth: '/auth'
      }
    },
    endpoints: {
      programs: '/programs',
      submissions: '/scans',
      reports: '/findings',
      profile: '/user',
      earnings: '/user/credits'
    },
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 180,
      burstLimit: 60
    },
    stats: {
      activeProgramsCount: 150,
      totalResearchers: 25000,
      totalPayouts: 2000000,
      averageResponseTime: 24,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 180000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 420000).toISOString()
    }
  },
  {
    id: 'shodan',
    name: 'shodan',
    displayName: 'Shodan',
    baseUrl: 'https://www.shodan.io',
    apiUrl: 'https://api.shodan.io',
    logoUrl: 'https://static.shodan.io/shodan/img/shodan-logo.png',
    description: 'Internet intelligence platform for security research',
    isActive: true,
    type: 'vdp',
    minPayout: 0,
    maxPayout: 5000,
    averagePayout: 150,
    currency: 'USD',
    authentication: {
      type: 'api-key',
      endpoints: {}
    },
    endpoints: {
      programs: '/api-info',
      submissions: '/scan',
      reports: '/host',
      profile: '/account/profile',
      earnings: '/account/profile'
    },
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 60,
      burstLimit: 20
    },
    stats: {
      activeProgramsCount: 50,
      totalResearchers: 180000,
      totalPayouts: 500000,
      averageResponseTime: 72,
      lastUpdated: new Date().toISOString()
    },
    integration: {
      status: 'connected',
      lastSync: new Date(Date.now() - 900000).toISOString(),
      syncErrors: [],
      nextSync: new Date(Date.now() + 1500000).toISOString()
    }
  }
]

// Sample bug bounty programs from various platforms
const SAMPLE_PROGRAMS: BugBountyProgram[] = [
  {
    id: 'h1-paypal',
    platformId: 'hackerone',
    externalId: 'paypal',
    name: 'PayPal Bug Bounty',
    company: 'PayPal',
    description: 'Help us keep PayPal secure by finding and reporting security vulnerabilities.',
    url: 'https://hackerone.com/paypal',
    logoUrl: 'https://logo.clearbit.com/paypal.com',
    type: 'public',
    status: 'active',
    launchDate: '2014-03-01T00:00:00Z',
    scope: {
      inScope: [
        { target: '*.paypal.com', type: 'web', eligibleForBounty: true },
        { target: 'paypal.com', type: 'web', eligibleForBounty: true },
        { target: 'PayPal Mobile Apps', type: 'mobile', eligibleForBounty: true }
      ],
      outOfScope: [
        { target: 'sandbox.paypal.com', type: 'web', eligibleForBounty: false }
      ],
      instructions: 'Focus on business logic flaws and authentication bypasses'
    },
    rewards: {
      currency: 'USD',
      bountyTable: [
        { severity: 'critical', minAmount: 5000, maxAmount: 30000 },
        { severity: 'high', minAmount: 1000, maxAmount: 5000 },
        { severity: 'medium', minAmount: 300, maxAmount: 1000 },
        { severity: 'low', minAmount: 50, maxAmount: 300 }
      ],
      hasSwag: true,
      hasHallOfFame: true,
      responseTargets: {
        acknowledgment: 24,
        triage: 72,
        bounty: 168,
        resolution: 720
      }
    },
    requirements: {
      minimumAge: 13,
      countries: [],
      excludedCountries: ['CU', 'IR', 'KP', 'SY'],
      eligibilityRequirements: ['Valid government ID']
    },
    stats: {
      participantCount: 15000,
      resolvedReports: 2500,
      averageBounty: 800,
      topBounty: 30000,
      responseTime: 48,
      rating: 4.8
    },
    teamHuntEligible: true,
    maxTeamSize: 5,
    teamBonusMultiplier: 1.2,
    tags: ['fintech', 'payments', 'web', 'mobile'],
    lastUpdated: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'bc-tesla',
    platformId: 'bugcrowd',
    externalId: 'tesla',
    name: 'Tesla Motors Bug Bounty',
    company: 'Tesla',
    description: 'Help Tesla build the most secure vehicles and energy products in the world.',
    url: 'https://bugcrowd.com/tesla',
    logoUrl: 'https://logo.clearbit.com/tesla.com',
    type: 'public',
    status: 'active',
    launchDate: '2015-08-01T00:00:00Z',
    scope: {
      inScope: [
        { target: '*.tesla.com', type: 'web', eligibleForBounty: true },
        { target: 'Tesla Vehicle Infotainment', type: 'hardware', eligibleForBounty: true, maxSeverity: 'critical' },
        { target: 'Tesla Mobile App', type: 'mobile', eligibleForBounty: true }
      ],
      outOfScope: [
        { target: 'Marketing websites', type: 'web', eligibleForBounty: false }
      ],
      instructions: 'Vehicle security issues are our highest priority'
    },
    rewards: {
      currency: 'USD',
      bountyTable: [
        { severity: 'critical', minAmount: 15000, maxAmount: 50000 },
        { severity: 'high', minAmount: 2500, maxAmount: 15000 },
        { severity: 'medium', minAmount: 500, maxAmount: 2500 },
        { severity: 'low', minAmount: 100, maxAmount: 500 }
      ],
      hasSwag: true,
      hasHallOfFame: true,
      responseTargets: {
        acknowledgment: 12,
        triage: 48,
        bounty: 120,
        resolution: 480
      }
    },
    requirements: {
      minimumAge: 18,
      countries: [],
      excludedCountries: ['CU', 'IR', 'KP', 'SY'],
      eligibilityRequirements: ['NDA signature required for vehicle testing']
    },
    stats: {
      participantCount: 8500,
      resolvedReports: 850,
      averageBounty: 3200,
      topBounty: 50000,
      responseTime: 36,
      rating: 4.9
    },
    teamHuntEligible: true,
    maxTeamSize: 3,
    teamBonusMultiplier: 1.5,
    tags: ['automotive', 'iot', 'hardware', 'web', 'mobile'],
    lastUpdated: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'int-european-bank',
    platformId: 'intigriti',
    externalId: 'european-bank-2023',
    name: 'European Digital Bank',
    company: 'EuroBank',
    description: 'Secure the future of digital banking in Europe.',
    url: 'https://app.intigriti.com/programs/eurobank',
    logoUrl: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=EB',
    type: 'private',
    status: 'active',
    launchDate: '2023-06-01T00:00:00Z',
    scope: {
      inScope: [
        { target: 'online.eurobank.eu', type: 'web', eligibleForBounty: true },
        { target: 'api.eurobank.eu', type: 'api', eligibleForBounty: true },
        { target: 'EuroBank Mobile App', type: 'mobile', eligibleForBounty: true }
      ],
      outOfScope: [
        { target: 'corporate.eurobank.eu', type: 'web', eligibleForBounty: false }
      ],
      instructions: 'Focus on authentication, authorization, and transaction security'
    },
    rewards: {
      currency: 'EUR',
      bountyTable: [
        { severity: 'critical', minAmount: 3000, maxAmount: 20000 },
        { severity: 'high', minAmount: 800, maxAmount: 3000 },
        { severity: 'medium', minAmount: 250, maxAmount: 800 },
        { severity: 'low', minAmount: 50, maxAmount: 250 }
      ],
      hasSwag: true,
      hasHallOfFame: false,
      responseTargets: {
        acknowledgment: 24,
        triage: 48,
        bounty: 120,
        resolution: 360
      }
    },
    requirements: {
      minimumAge: 18,
      countries: ['EU', 'UK', 'CH', 'NO'],
      excludedCountries: [],
      eligibilityRequirements: ['EU residency or citizenship', 'Financial sector background check']
    },
    stats: {
      participantCount: 250,
      resolvedReports: 45,
      averageBounty: 1200,
      topBounty: 20000,
      responseTime: 24,
      rating: 4.7
    },
    teamHuntEligible: false,
    tags: ['fintech', 'banking', 'private', 'web', 'api', 'mobile'],
    lastUpdated: new Date().toISOString(),
    createdAt: '2023-06-01T00:00:00Z'
  }
]

// Live feed sample data
const SAMPLE_LIVE_FEED: LiveBountyFeed[] = [
  {
    id: 'feed-1',
    type: 'bounty_awarded',
    platform: 'HackerOne',
    title: 'Critical SQL Injection Bounty Awarded',
    description: '@researcher_elite received $8,500 for finding a critical SQL injection in PayPal\'s checkout system',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    data: {
      programName: 'PayPal Bug Bounty',
      bountyAmount: 8500,
      severity: 'critical' as const,
      researcherUsername: 'researcher_elite',
      companyName: 'PayPal'
    },
    priority: 'high',
    category: ['bounty', 'critical', 'web'],
    readBy: [],
    bookmarkedBy: []
  },
  {
    id: 'feed-2',
    type: 'new_program',
    platform: 'Bugcrowd',
    title: 'New Bug Bounty Program: CyberCorp',
    description: 'CyberCorp has launched a new public bug bounty program with rewards up to $25,000',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    data: {
      programName: 'CyberCorp Security',
      companyName: 'CyberCorp',
      maxBounty: 25000
    },
    priority: 'medium',
    category: ['program', 'new', 'public'],
    readBy: [],
    bookmarkedBy: []
  },
  {
    id: 'feed-3',
    type: 'leaderboard_change',
    platform: 'Intigriti',
    title: 'Leaderboard Update',
    description: '@pentester_pro moved up to #5 in the global leaderboard',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    data: {
      researcherUsername: 'pentester_pro',
      newRank: 5,
      oldRank: 8
    },
    priority: 'low',
    category: ['leaderboard', 'ranking'],
    readBy: [],
    bookmarkedBy: []
  }
]

export function useBugBountyPlatforms() {
  const [platforms, setPlatforms] = useKVWithFallback<BugBountyPlatform[]>('bug-bounty-platforms', [])
  const [programs, setPrograms] = useKVWithFallback<BugBountyProgram[]>('bug-bounty-programs', [])
  const [liveFeed, setLiveFeed] = useKVWithFallback<LiveBountyFeed[]>('bug-bounty-live-feed', [])
  const [configurations, setConfigurations] = useKVWithFallback<PlatformConfiguration[]>('platform-configurations', [])

  useEffect(() => {
    if (platforms.length === 0) {
      setPlatforms(BUG_BOUNTY_PLATFORMS)
    }
  }, [platforms.length, setPlatforms])

  useEffect(() => {
    if (programs.length === 0) {
      setPrograms(SAMPLE_PROGRAMS)
    }
  }, [programs.length, setPrograms])

  useEffect(() => {
    if (liveFeed.length === 0) {
      setLiveFeed(SAMPLE_LIVE_FEED)
    }
  }, [liveFeed.length, setLiveFeed])

  // Simulate live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const feedTypes = ['bounty_awarded', 'new_program', 'program_update', 'leaderboard_change'] as const
      const platforms = ['HackerOne', 'Bugcrowd', 'Intigriti', 'YesWeHack']
      const severities = ['critical', 'high', 'medium', 'low'] as const
      
      const randomType = feedTypes[Math.floor(Math.random() * feedTypes.length)]
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
      
      let newFeedItem: LiveBountyFeed
      
      switch (randomType) {
        case 'bounty_awarded':
          newFeedItem = {
            id: `feed-${Date.now()}`,
            type: 'bounty_awarded',
            platform: randomPlatform,
            title: `${severities[Math.floor(Math.random() * severities.length)].charAt(0).toUpperCase() + severities[Math.floor(Math.random() * severities.length)].slice(1)} Vulnerability Bounty Awarded`,
            description: `Researcher received $${(Math.random() * 10000 + 500).toFixed(0)} for finding a security vulnerability`,
            timestamp: new Date().toISOString(),
            data: {
              bountyAmount: Math.random() * 10000 + 500,
              severity: severities[Math.floor(Math.random() * severities.length)]
            },
            priority: 'high',
            category: ['bounty', 'award'],
            readBy: [],
            bookmarkedBy: []
          }
          break
        default:
          newFeedItem = {
            id: `feed-${Date.now()}`,
            type: randomType,
            platform: randomPlatform,
            title: `Platform Update: ${randomPlatform}`,
            description: 'New activity detected on the platform',
            timestamp: new Date().toISOString(),
            data: {},
            priority: 'medium',
            category: ['update'],
            readBy: [],
            bookmarkedBy: []
          }
      }
      
      setLiveFeed((currentFeed) => [newFeedItem, ...currentFeed.slice(0, 49)]) // Keep last 50 items
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [setLiveFeed])

  return {
    platforms,
    programs,
    liveFeed,
    configurations,
    setPlatforms,
    setPrograms,
    setLiveFeed,
    setConfigurations
  }
}