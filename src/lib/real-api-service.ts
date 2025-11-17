/**
 * Real API Service - No Mock/Simulated Data
 * Handles all external API integrations with actual HTTP requests
 */

import { apiKeyManager } from './api-keys'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

interface ThreatFeed {
  id: string
  type: 'vulnerability' | 'exploit' | 'malware' | 'threat-intel' | 'news'
  title: string
  description: string
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
  source: string
  url: string
  publishedAt: Date
  tags: string[]
  cveId?: string
  affectedSystems?: string[]
}

interface BugBountyProgram {
  id: string
  platform: 'hackerone' | 'bugcrowd' | 'intigriti' | 'yeswehack'
  name: string
  company: string
  minBounty?: number
  maxBounty?: number
  url: string
  scopes: string[]
  status: 'active' | 'paused' | 'closed'
  lastUpdated: Date
}

class RealApiService {
  private baseHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'CyberConnect/1.0'
  }

  // Generic HTTP request handler with proper error handling
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.baseHeaders,
          ...options.headers
        }
      })

      const statusCode = response.status

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `HTTP ${statusCode}: ${errorText || response.statusText}`,
          statusCode
        }
      }

      const contentType = response.headers.get('content-type')
      let data: T

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = (await response.text()) as any
      }

      return {
        success: true,
        data,
        statusCode
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // HackerOne API Integration
  async fetchHackerOnePrograms(): Promise<ApiResponse<BugBountyProgram[]>> {
    const apiKey = apiKeyManager.getApiKey('hackerone')
    if (!apiKey) {
      return {
        success: false,
        error: 'HackerOne API key not configured'
      }
    }

    // HackerOne GraphQL API
    const query = `
      query {
        teams(first: 50, filter: {offers_bounties: true}) {
          edges {
            node {
              id
              handle
              name
              url
              submission_state
              offers_bounties
              base_bounty
              max_bounty
              currency
            }
          }
        }
      }
    `

    const response = await this.request<any>('https://api.hackerone.com/v1/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query })
    })

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const programs: BugBountyProgram[] = response.data.data.teams.edges.map((edge: any) => ({
      id: edge.node.id,
      platform: 'hackerone' as const,
      name: edge.node.name,
      company: edge.node.handle,
      minBounty: edge.node.base_bounty,
      maxBounty: edge.node.max_bounty,
      url: edge.node.url,
      scopes: [],
      status: edge.node.submission_state === 'open' ? 'active' : 'paused',
      lastUpdated: new Date()
    }))

    return { success: true, data: programs }
  }

  // Bugcrowd API Integration
  async fetchBugcrowdPrograms(): Promise<ApiResponse<BugBountyProgram[]>> {
    const apiKey = apiKeyManager.getApiKey('bugcrowd')
    if (!apiKey) {
      return {
        success: false,
        error: 'Bugcrowd API key not configured'
      }
    }

    const response = await this.request<any>('https://api.bugcrowd.com/programs', {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Accept': 'application/vnd.bugcrowd.v4+json'
      }
    })

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const programs: BugBountyProgram[] = response.data.programs.map((prog: any) => ({
      id: prog.id,
      platform: 'bugcrowd' as const,
      name: prog.title,
      company: prog.organization,
      minBounty: prog.min_payout,
      maxBounty: prog.max_payout,
      url: prog.program_url,
      scopes: prog.targets?.map((t: any) => t.name) || [],
      status: prog.state === 'active' ? 'active' : 'paused',
      lastUpdated: new Date(prog.updated_at)
    }))

    return { success: true, data: programs }
  }

  // Intigriti API Integration
  async fetchIntigritiPrograms(): Promise<ApiResponse<BugBountyProgram[]>> {
    const apiKey = apiKeyManager.getApiKey('intigriti')
    if (!apiKey) {
      return {
        success: false,
        error: 'Intigriti API key not configured'
      }
    }

    const response = await this.request<any>('https://api.intigriti.com/core/program', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const programs: BugBountyProgram[] = response.data.records.map((prog: any) => ({
      id: prog.programId,
      platform: 'intigriti' as const,
      name: prog.name,
      company: prog.companyName,
      minBounty: prog.minBounty?.value,
      maxBounty: prog.maxBounty?.value,
      url: `https://app.intigriti.com/programs/${prog.handle}/detail`,
      scopes: prog.domains || [],
      status: prog.status === 1 ? 'active' : 'paused',
      lastUpdated: new Date(prog.updatedAt)
    }))

    return { success: true, data: programs }
  }

  // YesWeHack API Integration
  async fetchYesWeHackPrograms(): Promise<ApiResponse<BugBountyProgram[]>> {
    const apiKey = apiKeyManager.getApiKey('yeswehack')
    if (!apiKey) {
      return {
        success: false,
        error: 'YesWeHack API key not configured'
      }
    }

    const response = await this.request<any>('https://api.yeswehack.com/programs', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const programs: BugBountyProgram[] = response.data.items.map((prog: any) => ({
      id: prog.id,
      platform: 'yeswehack' as const,
      name: prog.title,
      company: prog.business_unit,
      minBounty: prog.min_bounty,
      maxBounty: prog.max_bounty,
      url: prog.public_url,
      scopes: prog.scopes?.map((s: any) => s.scope) || [],
      status: prog.public ? 'active' : 'paused',
      lastUpdated: new Date(prog.updated_at)
    }))

    return { success: true, data: programs }
  }

  // MITRE CVE Database
  async fetchCVEFeeds(limit: number = 20): Promise<ApiResponse<ThreatFeed[]>> {
    const response = await this.request<any>(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=${limit}`
    )

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const feeds: ThreatFeed[] = response.data.vulnerabilities.map((vuln: any) => {
      const cve = vuln.cve
      const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0]
      const severity = metrics?.cvssData?.baseSeverity?.toLowerCase() || 'info'

      return {
        id: cve.id,
        type: 'vulnerability' as const,
        title: cve.id,
        description: cve.descriptions?.[0]?.value || 'No description available',
        severity: severity as any,
        source: 'MITRE CVE',
        url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
        publishedAt: new Date(cve.published),
        tags: cve.configurations?.nodes?.[0]?.cpeMatch?.map((m: any) => m.criteria) || [],
        cveId: cve.id,
        affectedSystems: cve.configurations?.nodes?.map((n: any) =>
          n.cpeMatch?.[0]?.criteria
        ).filter(Boolean) || []
      }
    })

    return { success: true, data: feeds }
  }

  // Exploit-DB Feed
  async fetchExploitDB(): Promise<ApiResponse<ThreatFeed[]>> {
    const response = await this.request<string>(
      'https://www.exploit-db.com/rss.xml'
    )

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    // Parse RSS XML
    const parser = new DOMParser()
    const xml = parser.parseFromString(response.data, 'text/xml')
    const items = xml.querySelectorAll('item')

    const feeds: ThreatFeed[] = Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || ''
      const link = item.querySelector('link')?.textContent || ''
      const description = item.querySelector('description')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent || ''

      return {
        id: `exploit-db-${link.split('/').pop()}`,
        type: 'exploit' as const,
        title,
        description,
        severity: 'high' as const,
        source: 'Exploit-DB',
        url: link,
        publishedAt: new Date(pubDate),
        tags: ['exploit', 'poc']
      }
    })

    return { success: true, data: feeds }
  }

  // VirusTotal API
  async fetchVirusTotalThreats(): Promise<ApiResponse<ThreatFeed[]>> {
    const apiKey = apiKeyManager.getApiKey('virustotal')
    if (!apiKey) {
      return {
        success: false,
        error: 'VirusTotal API key not configured'
      }
    }

    const response = await this.request<any>(
      'https://www.virustotal.com/api/v3/intelligence/hunting_notifications',
      {
        headers: {
          'x-apikey': apiKey
        }
      }
    )

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const feeds: ThreatFeed[] = response.data.data.map((item: any) => ({
      id: item.id,
      type: 'malware' as const,
      title: item.attributes.rule_name,
      description: item.attributes.snippet || 'Malware detection',
      severity: 'high' as const,
      source: 'VirusTotal',
      url: `https://www.virustotal.com/gui/file/${item.id}`,
      publishedAt: new Date(item.attributes.date * 1000),
      tags: item.attributes.tags || []
    }))

    return { success: true, data: feeds }
  }

  // CISA Known Exploited Vulnerabilities
  async fetchCISAVulnerabilities(): Promise<ApiResponse<ThreatFeed[]>> {
    const response = await this.request<any>(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
    )

    if (!response.success || !response.data) {
      return { success: false, error: response.error }
    }

    const feeds: ThreatFeed[] = response.data.vulnerabilities.slice(0, 50).map((vuln: any) => ({
      id: vuln.cveID,
      type: 'vulnerability' as const,
      title: vuln.vulnerabilityName,
      description: `${vuln.shortDescription} - ${vuln.requiredAction}`,
      severity: 'critical' as const,
      source: 'CISA KEV',
      url: `https://nvd.nist.gov/vuln/detail/${vuln.cveID}`,
      publishedAt: new Date(vuln.dateAdded),
      tags: ['actively-exploited', vuln.vendorProject],
      cveId: vuln.cveID,
      affectedSystems: [vuln.product]
    }))

    return { success: true, data: feeds }
  }

  // Shodan API
  async searchShodan(query: string): Promise<ApiResponse<any>> {
    const apiKey = apiKeyManager.getApiKey('shodan')
    if (!apiKey) {
      return {
        success: false,
        error: 'Shodan API key not configured'
      }
    }

    const response = await this.request<any>(
      `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}`
    )

    return response
  }

  // Aggregate all threat feeds
  async fetchAllThreatFeeds(): Promise<ApiResponse<ThreatFeed[]>> {
    const results = await Promise.allSettled([
      this.fetchCVEFeeds(10),
      this.fetchCISAVulnerabilities(),
      this.fetchExploitDB()
    ])

    const allFeeds: ThreatFeed[] = []

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        allFeeds.push(...result.value.data)
      }
    })

    if (allFeeds.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch threat feeds from all sources'
      }
    }

    // Sort by published date (newest first)
    allFeeds.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

    return {
      success: true,
      data: allFeeds
    }
  }

  // Aggregate all bug bounty programs
  async fetchAllBugBountyPrograms(): Promise<ApiResponse<BugBountyProgram[]>> {
    const results = await Promise.allSettled([
      this.fetchHackerOnePrograms(),
      this.fetchBugcrowdPrograms(),
      this.fetchIntigritiPrograms(),
      this.fetchYesWeHackPrograms()
    ])

    const allPrograms: BugBountyProgram[] = []

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        allPrograms.push(...result.value.data)
      }
    })

    if (allPrograms.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch programs from all platforms. Please check API keys.'
      }
    }

    return {
      success: true,
      data: allPrograms
    }
  }

  // Health check for API endpoints
  async checkApiHealth(platform: string): Promise<{ status: 'healthy' | 'degraded' | 'down', error?: string, responseTime?: number }> {
    const startTime = performance.now()
    let endpoint = ''
    let headers: Record<string, string> = {}

    switch (platform) {
      case 'hackerone':
        endpoint = 'https://api.hackerone.com/v1/me'
        const h1Key = apiKeyManager.getApiKey('hackerone')
        if (h1Key) headers['Authorization'] = `Bearer ${h1Key}`
        break
      case 'bugcrowd':
        endpoint = 'https://api.bugcrowd.com/programs'
        const bcKey = apiKeyManager.getApiKey('bugcrowd')
        if (bcKey) {
          headers['Authorization'] = `Token ${bcKey}`
          headers['Accept'] = 'application/vnd.bugcrowd.v4+json'
        }
        break
      case 'intigriti':
        endpoint = 'https://api.intigriti.com/core/program'
        const intKey = apiKeyManager.getApiKey('intigriti')
        if (intKey) headers['Authorization'] = `Bearer ${intKey}`
        break
      case 'yeswehack':
        endpoint = 'https://api.yeswehack.com/programs'
        const ywhKey = apiKeyManager.getApiKey('yeswehack')
        if (ywhKey) headers['Authorization'] = `Bearer ${ywhKey}`
        break
      default:
        return { status: 'down', error: 'Unknown platform' }
    }

    if (!endpoint) {
      return { status: 'down', error: 'API key not configured' }
    }

    const response = await this.request<any>(endpoint, { headers })
    const responseTime = performance.now() - startTime

    if (!response.success) {
      return { status: 'down', error: response.error, responseTime }
    }

    if (responseTime > 2000) {
      return { status: 'degraded', error: 'High response time', responseTime }
    }

    return { status: 'healthy', responseTime }
  }
}

export const realApiService = new RealApiService()
export default RealApiService
