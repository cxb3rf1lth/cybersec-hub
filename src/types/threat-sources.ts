export interface ThreatSource {
  id: string
  name: string
  description: string
  type: 'rss' | 'api' | 'webhook' | 'custom'
  url: string
  isActive: boolean
  category: 'vulnerability' | 'malware' | 'threat-intel' | 'bug-bounty' | 'news' | 'general'
  refreshInterval: number // in minutes
  lastUpdate?: string
  lastError?: string
  apiKey?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  authentication?: {
    type: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth'
    credentials?: Record<string, string>
  }
  parser?: {
    type: 'rss' | 'json' | 'xml' | 'custom'
    mapping: SourceFieldMapping
  }
  filters?: {
    includeKeywords?: string[]
    excludeKeywords?: string[]
    severityFilter?: string[]
    categoryFilter?: string[]
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  totalItems: number
  successfulFetches: number
  failedFetches: number
}

export interface SourceFieldMapping {
  title: string
  description: string
  timestamp: string
  severity?: string
  category?: string
  url?: string
  author?: string
  tags?: string
  source?: string
  customFields?: Record<string, string>
}

export interface SourceTemplate {
  id: string
  name: string
  description: string
  type: 'rss' | 'api' | 'webhook'
  category: string
  defaultUrl: string
  fields: SourceFieldMapping
  authentication?: {
    type: 'none' | 'api-key' | 'bearer' | 'basic'
    required: boolean
    instructions: string
  }
  documentation?: string
  logoUrl?: string
  isPopular: boolean
  tags: string[]
}

export interface SourceLog {
  id: string
  sourceId: string
  timestamp: string
  status: 'success' | 'error' | 'warning'
  message: string
  itemsProcessed?: number
  errorDetails?: string
  duration?: number
}

export interface SourceStats {
  sourceId: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastSuccessfulFetch: string
  lastError?: string
  itemsToday: number
  itemsThisWeek: number
  itemsThisMonth: number
}