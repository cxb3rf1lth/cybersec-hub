import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ThreatFeed, BugBountyProgram, ThreatIntelligence, CyberSecNews } from '@/types/threat-feeds'
import { useThreatSources } from './useThreatSources'

export function useThreatFeeds() {
  const [threatFeeds, setThreatFeeds] = useKV<ThreatFeed[]>('threat-feeds', [])
  const [bugBountyPrograms, setBugBountyPrograms] = useKV<BugBountyProgram[]>('bug-bounty-programs', [])
  const [threatIntel, setThreatIntel] = useKV<ThreatIntelligence[]>('threat-intelligence', [])
  const [cyberNews, setCyberNews] = useKV<CyberSecNews[]>('cyber-news', [])
  const [lastUpdate, setLastUpdate] = useKV<string>('feeds-last-update', '')
  const [isUpdating, setIsUpdating] = useState(false)

  const { sources, fetchFromSource } = useThreatSources()

  // Fetch data from active custom sources
  const fetchFromCustomSources = async () => {
    const activeSources = sources.filter(source => source.isActive)
    
    for (const source of activeSources) {
      try {
        const data = await fetchFromSource(source)
        
        // Process and categorize data based on source category
        switch (source.category) {
          case 'vulnerability':
            const newThreats = data.map(item => ({
              ...item,
              category: 'vulnerability' as const,
              tags: [...(item.tags || []), `source:${source.name}`]
            }))
            setThreatFeeds(current => [...newThreats, ...current.slice(0, 47)])
            break
            
          case 'bug-bounty':
            const newBounties = data.map(item => ({
              ...item,
              platform: source.name,
              minReward: item.minReward || 100,
              maxReward: item.maxReward || 5000,
              scope: item.scope || ['*.example.com'],
              inScope: true,
              difficulty: item.difficulty || 'intermediate',
              participants: item.participants || Math.floor(Math.random() * 500) + 50,
              lastUpdated: item.timestamp || new Date().toISOString()
            }))
            setBugBountyPrograms(current => [...newBounties, ...current.slice(0, 23)])
            break
            
          case 'threat-intel':
            const newIntel = data.map(item => ({
              ...item,
              type: item.type || 'ioc',
              confidence: item.confidence || 'medium',
              tlpLevel: item.tlpLevel || 'white',
              indicators: item.indicators || []
            }))
            setThreatIntel(current => [...newIntel, ...current.slice(0, 19)])
            break
            
          case 'news':
            const newNews = data.map(item => ({
              ...item,
              summary: item.description,
              content: item.description,
              author: item.author || 'Unknown',
              publishedAt: item.timestamp || new Date().toISOString(),
              category: item.category || 'general',
              readTime: Math.ceil((item.description?.length || 500) / 200),
              tags: [...(item.tags || []), `source:${source.name}`]
            }))
            setCyberNews(current => [...newNews, ...current.slice(0, 23)])
            break
        }
      } catch (error) {
        console.error(`Failed to fetch from source ${source.name}:`, error)
      }
    }
  }

  // Enhanced feed generation combining mock data and custom sources
  const generateMockFeeds = async () => {
    setIsUpdating(true)
    
    // Simulate realistic API delay for threat intelligence feeds (demonstrate binary rain)
    await new Promise(resolve => setTimeout(resolve, 3000))

    const currentTime = new Date().toISOString()

    // Fetch from custom sources first
    await fetchFromCustomSources()

    // Then add some mock data to supplement
    const newThreatFeeds: ThreatFeed[] = [
      {
        id: `tf-${Date.now()}-1`,
        title: 'Critical RCE in Apache Struts 2.5.30',
        description: 'Remote code execution vulnerability discovered in Apache Struts framework affecting versions 2.5.30 and below.',
        severity: 'critical',
        source: 'NVD',
        category: 'vulnerability',
        timestamp: currentTime,
        url: 'https://nvd.nist.gov/vuln',
        cve: 'CVE-2023-50164',
        cvss: 9.8,
        tags: ['apache', 'struts', 'rce', 'web'],
        isPinned: true
      },
      {
        id: `tf-${Date.now()}-2`,
        title: 'New Malware Campaign Targeting Financial Institutions',
        description: 'Advanced persistent threat group deploying custom banking trojan via phishing emails.',
        severity: 'high',
        source: 'ThreatPost',
        category: 'malware',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        tags: ['banking', 'trojan', 'apt', 'phishing'],
        author: 'Security Researcher'
      },
      {
        id: `tf-${Date.now()}-3`,
        title: 'Zero-Day Exploit Kit Updated with New Techniques',
        description: 'Popular exploit kit adds browser fingerprinting and sandbox evasion capabilities.',
        severity: 'high',
        source: 'Exploit-DB',
        category: 'exploit',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        tags: ['exploit-kit', 'zero-day', 'browser', 'evasion']
      }
    ]

    // Mock Bug Bounty Programs
    const newBugBountyPrograms: BugBountyProgram[] = [
      {
        id: `bb-${Date.now()}-1`,
        platform: 'HackerOne',
        company: 'TechCorp',
        title: 'Web Application Security Assessment',
        minReward: 500,
        maxReward: 25000,
        scope: ['*.techcorp.com', 'api.techcorp.com', 'mobile app'],
        inScope: true,
        difficulty: 'intermediate',
        lastUpdated: currentTime,
        participants: 1247,
        description: 'Looking for web application vulnerabilities including XSS, SQLi, IDOR, and authentication bypasses.',
        url: 'https://hackerone.com/techcorp'
      },
      {
        id: `bb-${Date.now()}-2`,
        platform: 'Bugcrowd',
        company: 'FinanceSecure',
        title: 'Banking Platform Security Review',
        minReward: 1000,
        maxReward: 50000,
        scope: ['bank.financesecure.com', 'mobile banking app'],
        inScope: true,
        difficulty: 'expert',
        lastUpdated: new Date(Date.now() - 180000).toISOString(),
        participants: 892,
        description: 'Critical financial application requiring extensive security testing.',
        url: 'https://bugcrowd.com/financesecure'
      }
    ]

    // Mock Threat Intelligence
    const newThreatIntel: ThreatIntelligence[] = [
      {
        id: `ti-${Date.now()}-1`,
        type: 'ioc',
        title: 'Malicious IP Addresses Associated with APT29',
        description: 'Network indicators linked to recent APT29 campaign targeting government entities.',
        confidence: 'high',
        tlpLevel: 'amber',
        source: 'CISA',
        timestamp: currentTime,
        indicators: [
          { type: 'ip', value: '192.168.1.100' },
          { type: 'domain', value: 'malicious-domain.com' },
          { type: 'hash', value: 'a1b2c3d4e5f6...' }
        ],
        mitreAttack: ['T1566.001', 'T1055.012']
      }
    ]

    // Mock Cyber Security News
    const newCyberNews: CyberSecNews[] = [
      {
        id: `cn-${Date.now()}-1`,
        title: 'Major Healthcare Provider Suffers Ransomware Attack',
        summary: 'Regional healthcare network experiences significant service disruptions following ransomware incident.',
        content: 'A major healthcare provider serving over 2 million patients has confirmed a ransomware attack that began early Tuesday morning...',
        author: 'Sarah Mitchell',
        source: 'CyberScoop',
        publishedAt: currentTime,
        category: 'breach',
        readTime: 3,
        url: 'https://cyberscoop.com/healthcare-ransomware',
        tags: ['ransomware', 'healthcare', 'incident-response'],
        imageUrl: '/api/placeholder/400/200'
      },
      {
        id: `cn-${Date.now()}-2`,
        title: 'New CISA Advisory on Critical Infrastructure Protection',
        summary: 'Federal agency releases updated guidelines for securing operational technology systems.',
        content: 'The Cybersecurity and Infrastructure Security Agency (CISA) has published new recommendations...',
        author: 'Michael Rodriguez',
        source: 'Security Week',
        publishedAt: new Date(Date.now() - 420000).toISOString(),
        category: 'policy',
        readTime: 5,
        url: 'https://securityweek.com/cisa-advisory',
        tags: ['cisa', 'critical-infrastructure', 'policy']
      }
    ]

    // Update feeds with new data while preserving existing (from custom sources)
    setThreatFeeds(current => [...newThreatFeeds, ...current.slice(0, 47)]) // Keep last 50 items
    setBugBountyPrograms(current => [...newBugBountyPrograms, ...current.slice(0, 23)]) // Keep last 25 items
    setThreatIntel(current => [...newThreatIntel, ...current.slice(0, 19)]) // Keep last 20 items
    setCyberNews(current => [...newCyberNews, ...current.slice(0, 23)]) // Keep last 25 items
    
    setLastUpdate(currentTime)
    setIsUpdating(false)
  }

  // Auto-refresh feeds
  useEffect(() => {
    // Initial load if no data
    if (threatFeeds.length === 0) {
      generateMockFeeds()
    }

    // Set up periodic updates (every 5 minutes)
    const interval = setInterval(() => {
      generateMockFeeds()
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Manual refresh function
  const refreshFeeds = () => {
    generateMockFeeds()
  }

  return {
    threatFeeds,
    bugBountyPrograms,
    threatIntel,
    cyberNews,
    lastUpdate,
    isUpdating,
    refreshFeeds
  }
}