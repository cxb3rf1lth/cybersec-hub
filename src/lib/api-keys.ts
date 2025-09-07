/**
 * Production API Key Management System
 * Secure configuration and management of external service API keys
 */

import { useKVWithFallback } from '@/lib/kv-fallback'
import { toast } from 'sonner'

// API Key Types and Interfaces
export interface ApiKeyConfig {
  key: string
  enabled: boolean
  lastValidated?: number
  rateLimit?: {
    requestsPerHour: number
    remaining: number
    resetTime: number
  }
  metadata?: {
    tier: 'free' | 'professional' | 'enterprise'
    features: string[]
    expiresAt?: number
  }
}

export interface ApiKeyValidationResult {
  valid: boolean
  error?: string
  metadata?: any
  rateLimit?: {
    requestsPerHour: number
    remaining: number
    resetTime: number
  }
}

// Service Configuration
export const API_SERVICES = {
  // Bug Bounty Platforms
  HACKERONE: {
    name: 'HackerOne',
    baseUrl: 'https://api.hackerone.com/v1',
    authType: 'bearer',
    testEndpoint: '/me',
    requiredScopes: ['program:read', 'report:read'],
    documentation: 'https://api.hackerone.com/customer-resources/'
  },
  BUGCROWD: {
    name: 'Bugcrowd',
    baseUrl: 'https://api.bugcrowd.com/v2',
    authType: 'bearer',
    testEndpoint: '/user',
    requiredScopes: ['user:read', 'program:read'],
    documentation: 'https://docs.bugcrowd.com/api/'
  },
  INTIGRITI: {
    name: 'Intigriti',
    baseUrl: 'https://api.intigriti.com/external',
    authType: 'bearer',
    testEndpoint: '/researcher/me',
    requiredScopes: ['external:researcher'],
    documentation: 'https://docs.intigriti.com/'
  },
  YESWEHACK: {
    name: 'YesWeHack',
    baseUrl: 'https://api.yeswehack.com',
    authType: 'bearer',
    testEndpoint: '/user',
    requiredScopes: ['user:read'],
    documentation: 'https://docs.yeswehack.com/'
  },
  
  // Threat Intelligence & Security Tools
  SHODAN: {
    name: 'Shodan',
    baseUrl: 'https://api.shodan.io',
    authType: 'api_key',
    testEndpoint: '/api-info',
    requiredScopes: ['search'],
    documentation: 'https://developer.shodan.io/'
  },
  VIRUSTOTAL: {
    name: 'VirusTotal',
    baseUrl: 'https://www.virustotal.com/vtapi/v2',
    authType: 'api_key',
    testEndpoint: '/file/report',
    requiredScopes: ['public_api'],
    documentation: 'https://developers.virustotal.com/'
  },
  CVE_CIRCL: {
    name: 'CVE Search (CIRCL)',
    baseUrl: 'https://cve.circl.lu/api',
    authType: 'none',
    testEndpoint: '/last',
    requiredScopes: [],
    documentation: 'https://cve.circl.lu/api/'
  },
  NVD: {
    name: 'National Vulnerability Database',
    baseUrl: 'https://services.nvd.nist.gov/rest/json',
    authType: 'api_key',
    testEndpoint: '/cves/2.0',
    requiredScopes: ['public'],
    documentation: 'https://nvd.nist.gov/developers'
  },
  MITRE_ATT_CK: {
    name: 'MITRE ATT&CK',
    baseUrl: 'https://attack.mitre.org/api',
    authType: 'none',
    testEndpoint: '/techniques',
    requiredScopes: [],
    documentation: 'https://attack.mitre.org/'
  },
  
  // Project Discovery Tools
  NUCLEI_TEMPLATES: {
    name: 'Nuclei Templates',
    baseUrl: 'https://api.github.com/repos/projectdiscovery/nuclei-templates',
    authType: 'bearer',
    testEndpoint: '/contents',
    requiredScopes: ['public_repo'],
    documentation: 'https://docs.projectdiscovery.io/'
  },
  CHAOS_API: {
    name: 'Chaos (Project Discovery)',
    baseUrl: 'https://dns.projectdiscovery.io/dns',
    authType: 'bearer',
    testEndpoint: '/api/statistics',
    requiredScopes: ['dns:read'],
    documentation: 'https://chaos.projectdiscovery.io/'
  },
  
  // Security News & Feeds
  EXPLOIT_DB: {
    name: 'Exploit Database',
    baseUrl: 'https://www.exploit-db.com/api/v1',
    authType: 'none',
    testEndpoint: '/search',
    requiredScopes: [],
    documentation: 'https://www.exploit-db.com/api'
  },
  SECURITY_ADVISORIES: {
    name: 'GitHub Security Advisories',
    baseUrl: 'https://api.github.com/advisories',
    authType: 'bearer',
    testEndpoint: '',
    requiredScopes: ['security_events'],
    documentation: 'https://docs.github.com/en/rest/security-advisories'
  }
} as const

export type ApiServiceKey = keyof typeof API_SERVICES

// API Key Management Class
export class ApiKeyManager {
  private static instance: ApiKeyManager
  private keys: Map<ApiServiceKey, ApiKeyConfig> = new Map()
  private validationCache: Map<string, { result: ApiKeyValidationResult; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager()
    }
    return ApiKeyManager.instance
  }

  async loadApiKeys(): Promise<void> {
    try {
      const storedKeys = await spark.kv.get<Record<string, ApiKeyConfig>>('api_keys') || {}
      
      for (const [service, config] of Object.entries(storedKeys)) {
        this.keys.set(service as ApiServiceKey, config)
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }
  }

  async saveApiKey(service: ApiServiceKey, key: string): Promise<void> {
    const config: ApiKeyConfig = {
      key,
      enabled: true,
      lastValidated: Date.now()
    }

    this.keys.set(service, config)
    
    await this.persistKeys()
    
    // Validate the new key
    const validation = await this.validateApiKey(service, key)
    if (!validation.valid) {
      toast.error(`Invalid API key for ${API_SERVICES[service].name}: ${validation.error}`)
      return
    }

    // Update config with validation results
    config.metadata = validation.metadata
    config.rateLimit = validation.rateLimit
    this.keys.set(service, config)
    await this.persistKeys()

    toast.success(`${API_SERVICES[service].name} API key configured successfully`)
  }

  async removeApiKey(service: ApiServiceKey): Promise<void> {
    this.keys.delete(service)
    await this.persistKeys()
    toast.success(`${API_SERVICES[service].name} API key removed`)
  }

  async toggleApiKey(service: ApiServiceKey, enabled: boolean): Promise<void> {
    const config = this.keys.get(service)
    if (config) {
      config.enabled = enabled
      this.keys.set(service, config)
      await this.persistKeys()
    }
  }

  getApiKey(service: ApiServiceKey): ApiKeyConfig | null {
    return this.keys.get(service) || null
  }

  getAllApiKeys(): Map<ApiServiceKey, ApiKeyConfig> {
    return new Map(this.keys)
  }

  isServiceEnabled(service: ApiServiceKey): boolean {
    const config = this.keys.get(service)
    return config?.enabled && !!config.key || false
  }

  private async persistKeys(): Promise<void> {
    const keysObject = Object.fromEntries(this.keys.entries())
    await spark.kv.set('api_keys', keysObject)
  }

  async validateApiKey(service: ApiServiceKey, key: string): Promise<ApiKeyValidationResult> {
    const cacheKey = `${service}:${key.slice(-8)}`
    const cached = this.validationCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result
    }

    const serviceConfig = API_SERVICES[service]
    const result = await this.performValidation(service, key, serviceConfig)
    
    this.validationCache.set(cacheKey, { result, timestamp: Date.now() })
    return result
  }

  private async performValidation(
    service: ApiServiceKey, 
    key: string, 
    config: typeof API_SERVICES[ApiServiceKey]
  ): Promise<ApiKeyValidationResult> {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'CyberConnect/1.0',
        'Accept': 'application/json'
      }

      // Add authentication based on service type
      if (config.authType === 'bearer') {
        headers['Authorization'] = `Bearer ${key}`
      } else if (config.authType === 'api_key') {
        headers['X-API-Key'] = key
      }

      // Special handling for different services
      let testUrl = `${config.baseUrl}${config.testEndpoint}`
      if (service === 'SHODAN') {
        testUrl += `?key=${key}`
      } else if (service === 'VIRUSTOTAL') {
        testUrl += `?apikey=${key}&resource=44d88612fea8a8f36de82e1278abb02f`
      }

      const response = await fetch(testUrl, { 
        headers,
        method: 'GET',
        timeout: 10000
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Extract rate limit information from headers
      const rateLimit = this.extractRateLimit(response.headers)
      
      // Service-specific validation
      const validation = this.validateServiceResponse(service, data)
      
      return {
        valid: validation.valid,
        error: validation.error,
        metadata: validation.metadata,
        rateLimit
      }
      
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }
    }
  }

  private extractRateLimit(headers: Headers): ApiKeyValidationResult['rateLimit'] {
    const remaining = headers.get('X-RateLimit-Remaining') || headers.get('X-Rate-Limit-Remaining')
    const limit = headers.get('X-RateLimit-Limit') || headers.get('X-Rate-Limit-Limit')
    const reset = headers.get('X-RateLimit-Reset') || headers.get('X-Rate-Limit-Reset')

    if (remaining && limit && reset) {
      return {
        requestsPerHour: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime: parseInt(reset) * 1000 // Convert to milliseconds
      }
    }

    return undefined
  }

  private validateServiceResponse(service: ApiServiceKey, data: any): { valid: boolean; error?: string; metadata?: any } {
    switch (service) {
      case 'HACKERONE':
        return {
          valid: !!data.id,
          metadata: { username: data.attributes?.username, reputation: data.attributes?.reputation }
        }
      
      case 'BUGCROWD':
        return {
          valid: !!data.uuid,
          metadata: { email: data.email, points: data.points }
        }
      
      case 'SHODAN':
        return {
          valid: !!data.plan,
          metadata: { plan: data.plan, query_credits: data.query_credits, scan_credits: data.scan_credits }
        }
      
      case 'VIRUSTOTAL':
        return {
          valid: data.response_code !== undefined,
          metadata: { response_code: data.response_code }
        }
      
      case 'INTIGRITI':
        return {
          valid: !!data.id,
          metadata: { username: data.userName, points: data.points }
        }
      
      case 'YESWEHACK':
        return {
          valid: !!data.username,
          metadata: { username: data.username, rank: data.rank }
        }
      
      default:
        return { valid: true, metadata: data }
    }
  }

  async refreshAllKeys(): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const [service, config] of this.keys.entries()) {
      if (!config.enabled) continue

      try {
        const validation = await this.validateApiKey(service, config.key)
        if (validation.valid) {
          config.lastValidated = Date.now()
          config.metadata = validation.metadata
          config.rateLimit = validation.rateLimit
          success++
        } else {
          failed++
          console.warn(`API key validation failed for ${service}:`, validation.error)
        }
      } catch (error) {
        failed++
        console.error(`Error validating ${service}:`, error)
      }
    }

    await this.persistKeys()
    return { success, failed }
  }

  getServiceStats(): Record<ApiServiceKey, { enabled: boolean; valid?: boolean; lastValidated?: Date; rateLimit?: ApiKeyConfig['rateLimit'] }> {
    const stats: any = {}
    
    for (const service of Object.keys(API_SERVICES) as ApiServiceKey[]) {
      const config = this.keys.get(service)
      stats[service] = {
        enabled: config?.enabled || false,
        valid: config ? Date.now() - (config.lastValidated || 0) < 24 * 60 * 60 * 1000 : undefined,
        lastValidated: config?.lastValidated ? new Date(config.lastValidated) : undefined,
        rateLimit: config?.rateLimit
      }
    }
    
    return stats
  }
}

// React hook for API key management
export function useApiKeys() {
  const manager = ApiKeyManager.getInstance()
  
  return {
    saveApiKey: manager.saveApiKey.bind(manager),
    removeApiKey: manager.removeApiKey.bind(manager),
    toggleApiKey: manager.toggleApiKey.bind(manager),
    getApiKey: manager.getApiKey.bind(manager),
    getAllApiKeys: manager.getAllApiKeys.bind(manager),
    isServiceEnabled: manager.isServiceEnabled.bind(manager),
    validateApiKey: manager.validateApiKey.bind(manager),
    refreshAllKeys: manager.refreshAllKeys.bind(manager),
    getServiceStats: manager.getServiceStats.bind(manager),
    loadApiKeys: manager.loadApiKeys.bind(manager)
  }
}

// Initialize API key manager
export const apiKeyManager = ApiKeyManager.getInstance()

// Production API service wrapper with automatic authentication
export class AuthenticatedApiService {
  private keyManager = apiKeyManager

  async makeAuthenticatedRequest(
    service: ApiServiceKey,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const keyConfig = this.keyManager.getApiKey(service)
    if (!keyConfig || !keyConfig.enabled) {
      throw new Error(`API key not configured for ${service}`)
    }

    const serviceConfig = API_SERVICES[service]
    const headers = {
      'User-Agent': 'CyberConnect/1.0',
      'Accept': 'application/json',
      ...options.headers
    }

    // Add authentication
    if (serviceConfig.authType === 'bearer') {
      headers['Authorization'] = `Bearer ${keyConfig.key}`
    } else if (serviceConfig.authType === 'api_key') {
      headers['X-API-Key'] = keyConfig.key
    }

    const url = endpoint.startsWith('http') ? endpoint : `${serviceConfig.baseUrl}${endpoint}`
    
    return fetch(url, {
      ...options,
      headers
    })
  }

  async get(service: ApiServiceKey, endpoint: string): Promise<any> {
    const response = await this.makeAuthenticatedRequest(service, endpoint)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async post(service: ApiServiceKey, endpoint: string, data: any): Promise<any> {
    const response = await this.makeAuthenticatedRequest(service, endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }
}

export const authenticatedApiService = new AuthenticatedApiService()