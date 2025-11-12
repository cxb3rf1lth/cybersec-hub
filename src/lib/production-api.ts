/**
 * Production API Authentication & Key Management
 * Provides secure, validated connections to bug bounty platforms
 */

import { toast } from 'sonner'
import { SecureAPIKeyManager } from '@/lib/secure-api-keys'
import { CircuitBreakerManager } from '@/lib/circuit-breaker'
import productionConfig from '@/lib/production-config'

export interface APIConnection {
  platform: string
  apiKey: string
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastTested: string
  capabilities: string[]
  rateLimit: {
    remaining: number
    reset: number
    limit: number
  }
}

export interface PlatformConfig {
  name: string
  baseUrl: string
  testEndpoint: string
  authType: 'api_key' | 'oauth' | 'basic'
  keyFormat: RegExp
  requiredScopes?: string[]
  documentation: string
  rateLimit: {
    requests: number
    period: 'minute' | 'hour' | 'day'
  }
}

// Production platform configurations
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  hackerone: {
    name: 'HackerOne',
    baseUrl: 'https://api.hackerone.com/v1',
    testEndpoint: '/programs',
    authType: 'api_key',
    keyFormat: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    requiredScopes: ['program:read', 'report:read'],
    documentation: 'https://api.hackerone.com/',
    rateLimit: { requests: 100, period: 'minute' }
  },
  bugcrowd: {
    name: 'Bugcrowd',
    baseUrl: 'https://api.bugcrowd.com/v2',
    testEndpoint: '/programs',
    authType: 'api_key',
    keyFormat: /^[A-Za-z0-9]{40,}$/,
    requiredScopes: ['read:programs', 'read:submissions'],
    documentation: 'https://docs.bugcrowd.com/api/',
    rateLimit: { requests: 1000, period: 'hour' }
  },
  intigriti: {
    name: 'Intigriti',
    baseUrl: 'https://api.intigriti.com/external',
    testEndpoint: '/researcher/programs',
    authType: 'oauth',
    keyFormat: /^[A-Za-z0-9_-]{32,}$/,
    requiredScopes: ['read:programs', 'read:submissions'],
    documentation: 'https://docs.intigriti.com/api/',
    rateLimit: { requests: 500, period: 'hour' }
  },
  yeswehack: {
    name: 'YesWeHack',
    baseUrl: 'https://api.yeswehack.com',
    testEndpoint: '/programs',
    authType: 'api_key',
    keyFormat: /^[A-Za-z0-9]{32,}$/,
    requiredScopes: ['programs:read'],
    documentation: 'https://docs.yeswehack.com/api/',
    rateLimit: { requests: 300, period: 'hour' }
  },
  shodan: {
    name: 'Shodan',
    baseUrl: 'https://api.shodan.io',
    testEndpoint: '/api-info',
    authType: 'api_key',
    keyFormat: /^[A-Za-z0-9]{32}$/,
    documentation: 'https://developer.shodan.io/api',
    rateLimit: { requests: 100, period: 'day' }
  },
  projectdiscovery: {
    name: 'ProjectDiscovery',
    baseUrl: 'https://api.projectdiscovery.io/v1',
    testEndpoint: '/nuclei/templates',
    authType: 'api_key',
    keyFormat: /^pd_[A-Za-z0-9]{40}$/,
    requiredScopes: ['templates:read', 'scans:write'],
    documentation: 'https://docs.projectdiscovery.io/api/',
    rateLimit: { requests: 200, period: 'hour' }
  },
  virustotal: {
    name: 'VirusTotal',
    baseUrl: 'https://www.virustotal.com/vtapi/v2',
    testEndpoint: '/file/report',
    authType: 'api_key',
    keyFormat: /^[a-f0-9]{64}$/,
    documentation: 'https://developers.virustotal.com/reference',
    rateLimit: { requests: 4, period: 'minute' }
  }
}

class ProductionAPIManager {
  private connections: Map<string, APIConnection> = new Map()
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map()
  private keyManager: SecureAPIKeyManager = SecureAPIKeyManager.getInstance()
  private circuitBreaker: CircuitBreakerManager = CircuitBreakerManager.getInstance()

  /**
   * Validate API key format for a platform
   */
  validateKeyFormat(platform: string, apiKey: string): boolean {
    const config = PLATFORM_CONFIGS[platform]
    if (!config) {
      console.warn(`Unknown platform: ${platform}`)
      return false
    }

    return config.keyFormat.test(apiKey)
  }

  /**
   * Test API connection with real HTTP request
   */
  async testConnection(platform: string, apiKey: string): Promise<{
    success: boolean
    error?: string
    capabilities?: string[]
    userInfo?: any
  }> {
    const config = PLATFORM_CONFIGS[platform]
    if (!config) {
      return { success: false, error: 'Platform not supported' }
    }

    // Validate key format first
    if (!this.validateKeyFormat(platform, apiKey)) {
      return { success: false, error: 'Invalid API key format' }
    }

    try {
      const response = await this.makeAuthenticatedRequest(platform, apiKey, config.testEndpoint)
      
      if (!response.ok) {
        const errorText = await response.text()
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}` 
        }
      }

      const data = await response.json()
      
      // Extract capabilities and user info based on platform
      const capabilities = this.extractCapabilities(platform, data)
      const userInfo = this.extractUserInfo(platform, data)

      return {
        success: true,
        capabilities,
        userInfo
      }
    } catch (error) {
      console.error(`API test failed for ${platform}:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }

  /**
   * Make authenticated HTTP request to platform API
   */
  private async makeAuthenticatedRequest(
    platform: string, 
    apiKey: string, 
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const config = PLATFORM_CONFIGS[platform]
    const url = `${config.baseUrl}${endpoint}`

    // Check rate limits
    if (!this.checkRateLimit(platform)) {
      throw new Error('Rate limit exceeded')
    }

    const headers: Record<string, string> = {
      'User-Agent': 'CyberConnect/1.0',
      'Accept': 'application/json',
      ...options.headers as Record<string, string>
    }

    // Add authentication based on platform requirements
    switch (config.authType) {
      case 'api_key':
        if (platform === 'shodan') {
          headers['X-API-Key'] = apiKey
        } else if (platform === 'virustotal') {
          headers['apikey'] = apiKey
        } else {
          headers['Authorization'] = `Bearer ${apiKey}`
        }
        break
      case 'oauth':
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'basic':
        headers['Authorization'] = `Basic ${btoa(apiKey)}`
        break
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    // Update rate limit tracking
    this.updateRateLimit(platform, response)

    return response
  }

  /**
   * Extract platform capabilities from API response
   */
  private extractCapabilities(platform: string, data: any): string[] {
    const capabilities: string[] = []

    switch (platform) {
      case 'hackerone':
        if (data.data) capabilities.push('programs')
        capabilities.push('reports', 'bounties')
        break
      case 'bugcrowd':
        if (data.programs) capabilities.push('programs')
        capabilities.push('submissions', 'earnings')
        break
      case 'intigriti':
        if (Array.isArray(data)) capabilities.push('programs')
        capabilities.push('submissions')
        break
      case 'yeswehack':
        if (data.results) capabilities.push('programs')
        capabilities.push('submissions')
        break
      case 'shodan':
        capabilities.push('search', 'host-info', 'exploits')
        break
      case 'projectdiscovery':
        capabilities.push('nuclei-templates', 'scans')
        break
      case 'virustotal':
        capabilities.push('file-analysis', 'url-scan')
        break
    }

    return capabilities
  }

  /**
   * Extract user information from API response
   */
  private extractUserInfo(platform: string, data: any): any {
    switch (platform) {
      case 'hackerone':
        return {
          reputation: data.data?.[0]?.attributes?.reputation,
          signal: data.data?.[0]?.attributes?.signal
        }
      case 'bugcrowd':
        return {
          researcher_id: data.researcher_id,
          stats: data.stats
        }
      case 'shodan':
        return {
          plan: data.plan,
          https: data.https,
          unlocked: data.unlocked
        }
      default:
        return data
    }
  }

  /**
   * Check if rate limit allows another request
   */
  private checkRateLimit(platform: string): boolean {
    const config = PLATFORM_CONFIGS[platform]
    if (!config) return false

    const limiter = this.rateLimiters.get(platform)
    const now = Date.now()

    if (!limiter) {
      // Initialize rate limiter
      this.rateLimiters.set(platform, { count: 1, resetTime: now + this.getPeriodMs(config.rateLimit.period) })
      return true
    }

    // Reset if period has passed
    if (now > limiter.resetTime) {
      limiter.count = 1
      limiter.resetTime = now + this.getPeriodMs(config.rateLimit.period)
      return true
    }

    // Check if under limit
    if (limiter.count < config.rateLimit.requests) {
      limiter.count++
      return true
    }

    return false
  }

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimit(platform: string, response: Response) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')

    if (remaining && reset) {
      const limiter = this.rateLimiters.get(platform)
      if (limiter) {
        limiter.count = parseInt(remaining)
        limiter.resetTime = parseInt(reset) * 1000
      }
    }
  }

  /**
   * Convert period string to milliseconds
   */
  private getPeriodMs(period: 'minute' | 'hour' | 'day'): number {
    switch (period) {
      case 'minute': return 60 * 1000
      case 'hour': return 60 * 60 * 1000
      case 'day': return 24 * 60 * 60 * 1000
    }
  }

  /**
   * Connect to a platform with validated API key
   */
  async connectPlatform(platform: string, apiKey: string): Promise<APIConnection> {
    // Use circuit breaker for API calls
    const testResult = await this.circuitBreaker.execute(
      `${platform}_connect`,
      async () => this.testConnection(platform, apiKey)
    )

    if (!testResult.success) {
      throw new Error(testResult.error || 'Connection failed')
    }

    // Store key using secure key manager (proper encryption)
    await this.keyManager.storeKey(platform, apiKey)

    const connection: APIConnection = {
      platform,
      apiKey: '[ENCRYPTED]', // Don't store actual key in connection object
      status: 'connected',
      lastTested: new Date().toISOString(),
      capabilities: testResult.capabilities || [],
      rateLimit: {
        remaining: PLATFORM_CONFIGS[platform]?.rateLimit.requests || 100,
        reset: Date.now() + this.getPeriodMs(PLATFORM_CONFIGS[platform]?.rateLimit.period || 'hour'),
        limit: PLATFORM_CONFIGS[platform]?.rateLimit.requests || 100
      }
    }

    this.connections.set(platform, connection)

    // Store connection metadata only (not the key)
    await spark.kv.set(`api_connection_${platform}`, connection)

    toast.success(`Successfully connected to ${PLATFORM_CONFIGS[platform]?.name || platform}`)
    return connection
  }

  /**
   * Disconnect from a platform
   */
  async disconnectPlatform(platform: string): Promise<void> {
    this.connections.delete(platform)
    await this.keyManager.removeKey(platform)
    await spark.kv.delete(`api_connection_${platform}`)
    toast.success(`Disconnected from ${PLATFORM_CONFIGS[platform]?.name || platform}`)
  }

  /**
   * Get connection status for a platform
   */
  getConnection(platform: string): APIConnection | null {
    return this.connections.get(platform) || null
  }

  /**
   * Get all active connections
   */
  getAllConnections(): APIConnection[] {
    return Array.from(this.connections.values())
  }

  /**
   * Make API request using stored connection
   */
  async makeRequest(platform: string, endpoint: string, options: RequestInit = {}): Promise<any> {
    const connection = this.connections.get(platform)
    if (!connection || connection.status !== 'connected') {
      throw new Error(`Not connected to ${platform}`)
    }

    // Get decrypted key from secure key manager
    const decryptedKey = await this.keyManager.getKey(platform)
    if (!decryptedKey) {
      throw new Error(`API key not found for ${platform}`)
    }

    // Use circuit breaker for API calls
    return await this.circuitBreaker.execute(
      `${platform}_api`,
      async () => {
        const response = await this.makeAuthenticatedRequest(platform, decryptedKey, endpoint, options)

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        return await response.json()
      }
    )
  }

  /**
   * Fetch bug bounty programs from connected platforms
   */
  async fetchPrograms(): Promise<any[]> {
    const programs: any[] = []
    
    for (const [platform, connection] of this.connections) {
      if (connection.status !== 'connected') continue

      try {
        const data = await this.makeRequest(platform, PLATFORM_CONFIGS[platform].testEndpoint)
        const platformPrograms = this.normalizePrograms(platform, data)
        programs.push(...platformPrograms)
      } catch (error) {
        console.error(`Failed to fetch programs from ${platform}:`, error)
        // Update connection status
        connection.status = 'error'
        await spark.kv.set(`api_connection_${platform}`, connection)
      }
    }

    return programs
  }

  /**
   * Normalize program data across platforms
   */
  private normalizePrograms(platform: string, data: any): any[] {
    switch (platform) {
      case 'hackerone':
        return data.data?.map((program: any) => ({
          id: program.id,
          platform: 'HackerOne',
          name: program.attributes.name,
          handle: program.attributes.handle,
          url: `https://hackerone.com/${program.attributes.handle}`,
          bounty: program.attributes.offers_bounties,
          status: program.attributes.state
        })) || []

      case 'bugcrowd':
        return data.programs?.map((program: any) => ({
          id: program.code,
          platform: 'Bugcrowd',
          name: program.name,
          handle: program.code,
          url: `https://bugcrowd.com/${program.code}`,
          bounty: !!program.max_payout,
          status: program.state
        })) || []

      case 'intigriti':
        return data.map((program: any) => ({
          id: program.programId,
          platform: 'Intigriti',
          name: program.name,
          handle: program.handle,
          url: `https://app.intigriti.com/programs/${program.companyHandle}/${program.handle}`,
          bounty: !!program.maxBounty,
          status: program.status
        }))

      case 'yeswehack':
        return data.results?.map((program: any) => ({
          id: program.slug,
          platform: 'YesWeHack',
          name: program.title,
          handle: program.slug,
          url: `https://yeswehack.com/programs/${program.slug}`,
          bounty: program.bounty,
          status: program.public ? 'public' : 'private'
        })) || []

      default:
        return []
    }
  }

  /**
   * Load connections from storage on init
   */
  async initialize(): Promise<void> {
    for (const platform of Object.keys(PLATFORM_CONFIGS)) {
      try {
        const stored = await spark.kv.get<APIConnection>(`api_connection_${platform}`)
        if (stored) {
          this.connections.set(platform, stored)
        }
      } catch (error) {
        console.error(`Failed to load connection for ${platform}:`, error)
      }
    }
  }

  /**
   * Initialize key manager with user password
   */
  async initializeKeyManager(userPassword?: string): Promise<void> {
    await this.keyManager.initialize(userPassword)
  }

  /**
   * Get circuit breaker stats for monitoring
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker.getAllStats()
  }

  /**
   * Get remaining rate limit for platform
   */
  getRateLimit(platform: string): { remaining: number; reset: number } | null {
    const limiter = this.rateLimiters.get(platform)
    const config = PLATFORM_CONFIGS[platform]
    
    if (!limiter || !config) return null

    const now = Date.now()
    if (now > limiter.resetTime) {
      return { remaining: config.rateLimit.requests, reset: limiter.resetTime }
    }

    return { remaining: Math.max(0, config.rateLimit.requests - limiter.count), reset: limiter.resetTime }
  }
}

// Export singleton instance
export const apiManager = new ProductionAPIManager()

// Initialize on module load
apiManager.initialize().catch(console.error)

// Export for use in React components
export function useProductionAPI() {
  return {
    testConnection: apiManager.testConnection.bind(apiManager),
    connectPlatform: apiManager.connectPlatform.bind(apiManager),
    disconnectPlatform: apiManager.disconnectPlatform.bind(apiManager),
    getConnection: apiManager.getConnection.bind(apiManager),
    getAllConnections: apiManager.getAllConnections.bind(apiManager),
    makeRequest: apiManager.makeRequest.bind(apiManager),
    fetchPrograms: apiManager.fetchPrograms.bind(apiManager),
    getRateLimit: apiManager.getRateLimit.bind(apiManager),
    validateKeyFormat: apiManager.validateKeyFormat.bind(apiManager)
  }
}