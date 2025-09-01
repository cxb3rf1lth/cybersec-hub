export interface ThreatFeed {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  source: string
  category: 'vulnerability' | 'exploit' | 'malware' | 'incident' | 'tool' | 'bounty' | 'research'
  timestamp: string
  url?: string
  cve?: string
  cvss?: number
  tags: string[]
  author?: string
  platform?: string
  reward?: number
  isPinned?: boolean
}

export interface BugBountyProgram {
  id: string
  platform: string
  company: string
  title: string
  minReward: number
  maxReward: number
  scope: string[]
  inScope: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  lastUpdated: string
  participants: number
  description: string
  url: string
}

export interface ThreatIntelligence {
  id: string
  type: 'ioc' | 'ttp' | 'campaign' | 'actor' | 'malware'
  title: string
  description: string
  confidence: 'low' | 'medium' | 'high'
  tlpLevel: 'white' | 'green' | 'amber' | 'red'
  source: string
  timestamp: string
  indicators: {
    type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
    value: string
  }[]
  mitreAttack?: string[]
}

export interface CyberSecNews {
  id: string
  title: string
  summary: string
  content: string
  author: string
  source: string
  publishedAt: string
  category: 'breach' | 'vulnerability' | 'tool' | 'research' | 'policy' | 'industry'
  readTime: number
  url: string
  imageUrl?: string
  tags: string[]
}

export interface FeedFilter {
  categories: string[]
  severity?: string[]
  sources?: string[]
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  keywords?: string[]
}