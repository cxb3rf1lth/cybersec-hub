import { useEffect } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { ThreatSource, SourceStats } from '@/types/threat-sources';

// Initialize with sample threat intelligence sources for demonstration
const SAMPLE_SOURCES: ThreatSource[] = [
  {
    id: 'sample-cve-mitre',
    name: 'CVE MITRE Feed (Demo)',
    description: 'Simulated CVE vulnerability database from MITRE',
    type: 'rss',
    url: 'https://cve.mitre.org/data/downloads/allitems-cvrf.xml',
    isActive: true,
    category: 'vulnerability',
    refreshInterval: 60,
    lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    totalItems: 1247,
    successfulFetches: 23,
    failedFetches: 1,
    parser: {
      type: 'rss',
      mapping: {
        title: 'title',
        description: 'description',
        timestamp: 'pubDate',
        severity: 'cvss',
        category: 'vulnerability'
      }
    }
  },
  {
    id: 'sample-cisa-alerts',
    name: 'CISA Alerts (Demo)',
    description: 'Simulated US-CERT alerts and advisories from CISA',
    type: 'rss',
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    isActive: true,
    category: 'threat-intel',
    refreshInterval: 30,
    lastUpdate: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    totalItems: 892,
    successfulFetches: 67,
    failedFetches: 0,
    parser: {
      type: 'rss',
      mapping: {
        title: 'title',
        description: 'description',
        timestamp: 'pubDate',
        category: 'advisory',
        source: 'CISA'
      }
    }
  },
  {
    id: 'sample-exploit-db',
    name: 'Exploit-DB Feed (Demo)',
    description: 'Simulated exploit database and proof-of-concept code',
    type: 'rss',
    url: 'https://www.exploit-db.com/rss.xml',
    isActive: true,
    category: 'vulnerability',
    refreshInterval: 120,
    lastUpdate: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 1 month ago
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    totalItems: 2156,
    successfulFetches: 89,
    failedFetches: 2,
    parser: {
      type: 'rss',
      mapping: {
        title: 'title',
        description: 'description',
        timestamp: 'pubDate',
        category: 'exploit',
        source: 'Exploit-DB'
      }
    }
  },
  {
    id: 'sample-virustotal',
    name: 'VirusTotal Intelligence (Demo)',
    description: 'Simulated malware intelligence from VirusTotal API',
    type: 'api',
    url: 'https://www.virustotal.com/vtapi/v2/intelligence',
    isActive: false, // Disabled to show mixed status
    category: 'malware',
    refreshInterval: 60,
    lastError: 'API key authentication failed',
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    totalItems: 0,
    successfulFetches: 0,
    failedFetches: 5,
    authentication: {
      type: 'api-key',
      credentials: { apiKey: '***' }
    },
    parser: {
      type: 'json',
      mapping: {
        title: 'scan_id',
        description: 'verbose_msg',
        timestamp: 'scan_date',
        category: 'malware',
        source: 'VirusTotal'
      }
    }
  },
  {
    id: 'sample-hackerone',
    name: 'HackerOne Programs (Demo)',
    description: 'Simulated bug bounty programs from HackerOne',
    type: 'api',
    url: 'https://api.hackerone.com/v1/programs',
    isActive: true,
    category: 'bug-bounty',
    refreshInterval: 240, // 4 hours
    lastUpdate: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    totalItems: 567,
    successfulFetches: 18,
    failedFetches: 0,
    authentication: {
      type: 'api-key'
    },
    parser: {
      type: 'json',
      mapping: {
        title: 'attributes.name',
        description: 'attributes.policy',
        timestamp: 'attributes.updated_at',
        category: 'bug-bounty'
      }
    },
    filters: {
      includeKeywords: ['web', 'mobile', 'api'],
      excludeKeywords: ['closed', 'private']
    }
  }
];

const SAMPLE_STATS: SourceStats[] = [
  {
    sourceId: 'sample-cve-mitre',
    totalRequests: 24,
    successfulRequests: 23,
    failedRequests: 1,
    averageResponseTime: 1250,
    lastSuccessfulFetch: new Date(Date.now() - 300000).toISOString(),
    itemsToday: 45,
    itemsThisWeek: 312,
    itemsThisMonth: 1247
  },
  {
    sourceId: 'sample-cisa-alerts',
    totalRequests: 67,
    successfulRequests: 67,
    failedRequests: 0,
    averageResponseTime: 890,
    lastSuccessfulFetch: new Date(Date.now() - 180000).toISOString(),
    itemsToday: 23,
    itemsThisWeek: 156,
    itemsThisMonth: 892
  },
  {
    sourceId: 'sample-exploit-db',
    totalRequests: 91,
    successfulRequests: 89,
    failedRequests: 2,
    averageResponseTime: 2100,
    lastSuccessfulFetch: new Date(Date.now() - 600000).toISOString(),
    itemsToday: 67,
    itemsThisWeek: 445,
    itemsThisMonth: 2156
  },
  {
    sourceId: 'sample-virustotal',
    totalRequests: 5,
    successfulRequests: 0,
    failedRequests: 5,
    averageResponseTime: 0,
    lastSuccessfulFetch: '',
    lastError: 'API key authentication failed',
    itemsToday: 0,
    itemsThisWeek: 0,
    itemsThisMonth: 0
  },
  {
    sourceId: 'sample-hackerone',
    totalRequests: 18,
    successfulRequests: 18,
    failedRequests: 0,
    averageResponseTime: 3400,
    lastSuccessfulFetch: new Date(Date.now() - 900000).toISOString(),
    itemsToday: 12,
    itemsThisWeek: 89,
    itemsThisMonth: 567
  }
];

export function useSampleThreatSources() {
  const [sources, setSources] = useKVWithFallback<ThreatSource[]>('threat-sources', []);
  const [sourceStats, setSourceStats] = useKVWithFallback<SourceStats[]>('source-stats', []);

  useEffect(() => {
    // Initialize with sample sources if none exist
    if (sources.length === 0) {
      setSources(SAMPLE_SOURCES);
    }
  }, [sources.length, setSources]);

  useEffect(() => {
    // Initialize with sample stats if none exist
    if (sourceStats.length === 0) {
      setSourceStats(SAMPLE_STATS);
    }
  }, [sourceStats.length, setSourceStats]);

  return { initialized: sources.length > 0 && sourceStats.length > 0 };
}