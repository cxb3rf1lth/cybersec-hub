import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ThreatSource, SourceTemplate, SourceLog, SourceStats } from '@/types/threat-sources'
import { toast } from 'sonner'

// Pre-configured source templates for popular threat intelligence feeds
const DEFAULT_SOURCE_TEMPLATES: SourceTemplate[] = [
  {
    id: 'cve-mitre',
    name: 'CVE MITRE Feed',
    description: 'Official CVE vulnerability database from MITRE',
    type: 'rss',
    category: 'vulnerability',
    defaultUrl: 'https://cve.mitre.org/data/downloads/allitems-cvrf.xml',
    fields: {
      title: 'title',
      description: 'description',
      timestamp: 'pubDate',
      severity: 'cvss',
      category: 'vulnerability',
      url: 'link'
    },
    authentication: {
      type: 'none',
      required: false,
      instructions: 'No authentication required for MITRE CVE feed'
    },
    documentation: 'https://cve.mitre.org/data/downloads/index.html',
    isPopular: true,
    tags: ['vulnerability', 'cve', 'official']
  },
  {
    id: 'cisa-alerts',
    name: 'CISA Alerts',
    description: 'US-CERT alerts and advisories from CISA',
    type: 'rss',
    category: 'threat-intel',
    defaultUrl: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    fields: {
      title: 'title',
      description: 'description',
      timestamp: 'pubDate',
      category: 'advisory',
      url: 'link',
      source: 'CISA'
    },
    authentication: {
      type: 'none',
      required: false,
      instructions: 'No authentication required for CISA feeds'
    },
    isPopular: true,
    tags: ['government', 'advisory', 'cisa']
  },
  {
    id: 'exploit-db',
    name: 'Exploit-DB',
    description: 'Latest exploits and proof-of-concept code',
    type: 'rss',
    category: 'vulnerability',
    defaultUrl: 'https://www.exploit-db.com/rss.xml',
    fields: {
      title: 'title',
      description: 'description',
      timestamp: 'pubDate',
      category: 'exploit',
      url: 'link',
      source: 'Exploit-DB'
    },
    authentication: {
      type: 'none',
      required: false,
      instructions: 'No authentication required'
    },
    isPopular: true,
    tags: ['exploit', 'poc', 'vulnerability']
  },
  {
    id: 'sans-storm',
    name: 'SANS Internet Storm Center',
    description: 'Daily network security diary and threat intelligence',
    type: 'rss',
    category: 'threat-intel',
    defaultUrl: 'https://isc.sans.edu/rssfeed.xml',
    fields: {
      title: 'title',
      description: 'description',
      timestamp: 'pubDate',
      category: 'intelligence',
      url: 'link',
      source: 'SANS ISC'
    },
    authentication: {
      type: 'none',
      required: false,
      instructions: 'No authentication required'
    },
    isPopular: true,
    tags: ['sans', 'intelligence', 'analysis']
  },
  {
    id: 'misp-feed',
    name: 'MISP Feed',
    description: 'Malware Information Sharing Platform feeds',
    type: 'api',
    category: 'threat-intel',
    defaultUrl: 'https://your-misp-instance.com/feeds',
    fields: {
      title: 'Event.info',
      description: 'Event.info',
      timestamp: 'Event.timestamp',
      category: 'Event.threat_level_id',
      tags: 'Event.Tag'
    },
    authentication: {
      type: 'api-key',
      required: true,
      instructions: 'Requires MISP API key. Generate from your MISP instance settings.'
    },
    documentation: 'https://www.misp-project.org/documentation/',
    isPopular: false,
    tags: ['misp', 'malware', 'sharing']
  },
  {
    id: 'virustotal',
    name: 'VirusTotal Intelligence',
    description: 'Latest malware samples and intelligence from VirusTotal',
    type: 'api',
    category: 'malware',
    defaultUrl: 'https://www.virustotal.com/vtapi/v2/intelligence',
    fields: {
      title: 'scan_id',
      description: 'verbose_msg',
      timestamp: 'scan_date',
      category: 'malware',
      source: 'VirusTotal'
    },
    authentication: {
      type: 'api-key',
      required: true,
      instructions: 'Requires VirusTotal API key. Register at virustotal.com'
    },
    documentation: 'https://developers.virustotal.com/reference',
    isPopular: true,
    tags: ['virustotal', 'malware', 'analysis']
  }
]

export function useThreatSources() {
  const [sources, setSources] = useKV<ThreatSource[]>('threat-sources', [])
  const [sourceTemplates] = useKV<SourceTemplate[]>('source-templates', DEFAULT_SOURCE_TEMPLATES)
  const [sourceLogs, setSourceLogs] = useKV<SourceLog[]>('source-logs', [])
  const [sourceStats, setSourceStats] = useKV<SourceStats[]>('source-stats', [])
  const [isLoading, setIsLoading] = useState(false)

  // Initialize default templates if not present
  useEffect(() => {
    if (sourceTemplates.length === 0) {
      // Templates are initialized with default value above
    }
  }, [])

  const createSource = async (sourceData: Omit<ThreatSource, 'id' | 'createdAt' | 'updatedAt' | 'totalItems' | 'successfulFetches' | 'failedFetches'>) => {
    const newSource: ThreatSource = {
      ...sourceData,
      id: `source-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalItems: 0,
      successfulFetches: 0,
      failedFetches: 0
    }

    setSources(current => [...current, newSource])
    
    // Initialize stats
    const newStats: SourceStats = {
      sourceId: newSource.id,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastSuccessfulFetch: '',
      itemsToday: 0,
      itemsThisWeek: 0,
      itemsThisMonth: 0
    }
    setSourceStats(current => [...current, newStats])

    addLog(newSource.id, 'success', 'Source created successfully')
    toast.success(`Source "${newSource.name}" created successfully`)
    
    return newSource
  }

  const updateSource = async (sourceId: string, updates: Partial<ThreatSource>) => {
    setSources(current => 
      current.map(source => 
        source.id === sourceId 
          ? { ...source, ...updates, updatedAt: new Date().toISOString() }
          : source
      )
    )
    
    addLog(sourceId, 'success', 'Source updated successfully')
    toast.success('Source updated successfully')
  }

  const deleteSource = async (sourceId: string) => {
    setSources(current => current.filter(source => source.id !== sourceId))
    setSourceLogs(current => current.filter(log => log.sourceId !== sourceId))
    setSourceStats(current => current.filter(stats => stats.sourceId !== sourceId))
    
    toast.success('Source deleted successfully')
  }

  const testSource = async (source: ThreatSource): Promise<{ success: boolean; message: string; itemsFound?: number }> => {
    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      // Simulate API call testing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful response
      const duration = Date.now() - startTime
      const mockItemsFound = Math.floor(Math.random() * 20) + 5
      
      addLog(source.id, 'success', `Test successful - ${mockItemsFound} items found`, mockItemsFound, undefined, duration)
      updateSourceStats(source.id, true, duration, mockItemsFound)
      
      setIsLoading(false)
      return { 
        success: true, 
        message: `Successfully connected to ${source.name}. Found ${mockItemsFound} recent items.`,
        itemsFound: mockItemsFound
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      addLog(source.id, 'error', `Test failed: ${errorMessage}`, 0, errorMessage, duration)
      updateSourceStats(source.id, false, duration, 0)
      
      setIsLoading(false)
      return { 
        success: false, 
        message: `Failed to connect to ${source.name}: ${errorMessage}`
      }
    }
  }

  const fetchFromSource = async (source: ThreatSource): Promise<any[]> => {
    const startTime = Date.now()
    
    try {
      // Simulate fetching data from the source
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data based on source type
      const mockData = generateMockDataForSource(source)
      const duration = Date.now() - startTime
      
      // Update source statistics
      updateSourceStats(source.id, true, duration, mockData.length)
      updateSource(source.id, { 
        lastUpdate: new Date().toISOString(),
        totalItems: (source.totalItems || 0) + mockData.length,
        successfulFetches: (source.successfulFetches || 0) + 1,
        lastError: undefined
      })
      
      addLog(source.id, 'success', `Fetched ${mockData.length} items`, mockData.length, undefined, duration)
      
      return mockData
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      updateSourceStats(source.id, false, duration, 0)
      updateSource(source.id, { 
        failedFetches: (source.failedFetches || 0) + 1,
        lastError: errorMessage
      })
      
      addLog(source.id, 'error', `Fetch failed: ${errorMessage}`, 0, errorMessage, duration)
      throw error
    }
  }

  const addLog = (sourceId: string, status: 'success' | 'error' | 'warning', message: string, itemsProcessed?: number, errorDetails?: string, duration?: number) => {
    const newLog: SourceLog = {
      id: `log-${Date.now()}`,
      sourceId,
      timestamp: new Date().toISOString(),
      status,
      message,
      itemsProcessed,
      errorDetails,
      duration
    }
    
    setSourceLogs(current => [newLog, ...current.slice(0, 999)]) // Keep last 1000 logs
  }

  const updateSourceStats = (sourceId: string, success: boolean, responseTime: number, itemsProcessed: number) => {
    setSourceStats(current => 
      current.map(stats => {
        if (stats.sourceId !== sourceId) return stats
        
        const newTotalRequests = stats.totalRequests + 1
        const newSuccessfulRequests = success ? stats.successfulRequests + 1 : stats.successfulRequests
        const newFailedRequests = success ? stats.failedRequests : stats.failedRequests + 1
        const newAverageResponseTime = ((stats.averageResponseTime * stats.totalRequests) + responseTime) / newTotalRequests
        
        return {
          ...stats,
          totalRequests: newTotalRequests,
          successfulRequests: newSuccessfulRequests,
          failedRequests: newFailedRequests,
          averageResponseTime: Math.round(newAverageResponseTime),
          lastSuccessfulFetch: success ? new Date().toISOString() : stats.lastSuccessfulFetch,
          lastError: success ? undefined : `Request failed at ${new Date().toISOString()}`,
          itemsToday: stats.itemsToday + itemsProcessed,
          itemsThisWeek: stats.itemsThisWeek + itemsProcessed,
          itemsThisMonth: stats.itemsThisMonth + itemsProcessed
        }
      })
    )
  }

  const generateMockDataForSource = (source: ThreatSource) => {
    const itemCount = Math.floor(Math.random() * 10) + 1
    const items = []
    
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: `${source.id}-item-${Date.now()}-${i}`,
        title: `${source.category === 'vulnerability' ? 'CVE' : 'Alert'} from ${source.name}`,
        description: `Sample ${source.category} data fetched from ${source.name}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: source.name,
        category: source.category,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        url: source.url,
        tags: [`source:${source.name}`, source.category]
      })
    }
    
    return items
  }

  const getSourceStats = (sourceId: string) => {
    return sourceStats.find(stats => stats.sourceId === sourceId)
  }

  const getSourceLogs = (sourceId: string, limit = 50) => {
    return sourceLogs
      .filter(log => log.sourceId === sourceId)
      .slice(0, limit)
  }

  return {
    sources,
    sourceTemplates,
    sourceLogs,
    sourceStats,
    isLoading,
    createSource,
    updateSource,
    deleteSource,
    testSource,
    fetchFromSource,
    getSourceStats,
    getSourceLogs
  }
}