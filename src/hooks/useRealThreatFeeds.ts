/**
 * Real Threat Feeds Hook - No Mock Data
 * Fetches real threat intelligence from actual APIs
 */

import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'
import { realApiService } from '@/lib/real-api-service'

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
  cvss?: number
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
  description?: string
}

export function useRealThreatFeeds() {
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([])
  const [bugBountyPrograms, setBugBountyPrograms] = useState<BugBountyProgram[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load cached data from database on mount
  useEffect(() => {
    loadCachedData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeeds()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  async function loadCachedData() {
    try {
      const [cachedFeeds, cachedPrograms] = await Promise.all([
        db.getAll<ThreatFeed>(STORES.THREAT_FEEDS),
        db.getAll<BugBountyProgram>(STORES.VULNERABILITY_REPORTS)
      ])

      if (cachedFeeds.length > 0) {
        setThreatFeeds(cachedFeeds)
      }

      if (cachedPrograms.length > 0) {
        setBugBountyPrograms(cachedPrograms as any)
      }

      // If no cached data, fetch fresh data
      if (cachedFeeds.length === 0 || cachedPrograms.length === 0) {
        await refreshFeeds()
      }
    } catch (err) {
      console.error('Failed to load cached data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    }
  }

  async function refreshFeeds() {
    if (isUpdating) return

    setIsUpdating(true)
    setError(null)

    try {
      // Fetch real threat feeds from multiple sources
      const feedsResponse = await realApiService.fetchAllThreatFeeds()

      if (feedsResponse.success && feedsResponse.data) {
        const feeds = feedsResponse.data
        setThreatFeeds(feeds)

        // Cache to database
        await db.clear(STORES.THREAT_FEEDS)
        await db.batchAdd(STORES.THREAT_FEEDS, feeds)
      } else {
        console.warn('Failed to fetch threat feeds:', feedsResponse.error)
        setError(feedsResponse.error || 'Failed to fetch threat feeds')
      }

      // Fetch real bug bounty programs
      const programsResponse = await realApiService.fetchAllBugBountyPrograms()

      if (programsResponse.success && programsResponse.data) {
        const programs = programsResponse.data
        setBugBountyPrograms(programs)

        // Cache to database
        await db.clear(STORES.VULNERABILITY_REPORTS)
        await db.batchAdd(STORES.VULNERABILITY_REPORTS, programs as any)
      } else {
        console.warn('Failed to fetch bug bounty programs:', programsResponse.error)
        if (!error) {
          setError(programsResponse.error || 'Failed to fetch bug bounty programs')
        }
      }

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to refresh feeds:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh feeds')
    } finally {
      setIsUpdating(false)
    }
  }

  // Fetch from specific source
  async function fetchFromSource(sourceType: 'cve' | 'cisa' | 'exploitdb' | 'virustotal') {
    setIsUpdating(true)
    setError(null)

    try {
      let response

      switch (sourceType) {
        case 'cve':
          response = await realApiService.fetchCVEFeeds(50)
          break
        case 'cisa':
          response = await realApiService.fetchCISAVulnerabilities()
          break
        case 'exploitdb':
          response = await realApiService.fetchExploitDB()
          break
        case 'virustotal':
          response = await realApiService.fetchVirusTotalThreats()
          break
        default:
          throw new Error('Unknown source type')
      }

      if (response.success && response.data) {
        // Merge with existing feeds
        const updatedFeeds = [...response.data, ...threatFeeds]

        // Remove duplicates by ID
        const uniqueFeeds = Array.from(
          new Map(updatedFeeds.map(feed => [feed.id, feed])).values()
        )

        // Sort by date (newest first)
        uniqueFeeds.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

        // Keep only the 200 most recent
        const limitedFeeds = uniqueFeeds.slice(0, 200)

        setThreatFeeds(limitedFeeds)

        // Update database
        await db.clear(STORES.THREAT_FEEDS)
        await db.batchAdd(STORES.THREAT_FEEDS, limitedFeeds)
      } else {
        setError(response.error || `Failed to fetch from ${sourceType}`)
      }
    } catch (err) {
      console.error(`Failed to fetch from ${sourceType}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch from ${sourceType}`)
    } finally {
      setIsUpdating(false)
    }
  }

  // Fetch programs from specific platform
  async function fetchFromPlatform(platform: 'hackerone' | 'bugcrowd' | 'intigriti' | 'yeswehack') {
    setIsUpdating(true)
    setError(null)

    try {
      let response

      switch (platform) {
        case 'hackerone':
          response = await realApiService.fetchHackerOnePrograms()
          break
        case 'bugcrowd':
          response = await realApiService.fetchBugcrowdPrograms()
          break
        case 'intigriti':
          response = await realApiService.fetchIntigritiPrograms()
          break
        case 'yeswehack':
          response = await realApiService.fetchYesWeHackPrograms()
          break
      }

      if (response.success && response.data) {
        // Merge with existing programs
        const updatedPrograms = [...response.data, ...bugBountyPrograms]

        // Remove duplicates by ID
        const uniquePrograms = Array.from(
          new Map(updatedPrograms.map(prog => [prog.id, prog])).values()
        )

        setBugBountyPrograms(uniquePrograms)

        // Update database
        await db.clear(STORES.VULNERABILITY_REPORTS)
        await db.batchAdd(STORES.VULNERABILITY_REPORTS, uniquePrograms as any)
      } else {
        setError(response.error || `Failed to fetch from ${platform}`)
      }
    } catch (err) {
      console.error(`Failed to fetch from ${platform}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch from ${platform}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    threatFeeds,
    bugBountyPrograms,
    isUpdating,
    lastUpdate,
    error,
    refreshFeeds,
    fetchFromSource,
    fetchFromPlatform
  }
}

export default useRealThreatFeeds
