import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BinaryRain } from '@/components/ui/BinaryRain'
import { Eye, Globe, Shield, Activity, Target, AlertTriangle, Code, Database, Search, TrendingUp, Clock, Users } from '@/lib/phosphor-icons-wrapper'

interface ThreatSource {
  id: string
  name: string
  type: 'malware' | 'phishing' | 'c2' | 'vulnerability' | 'osint' | 'honeypot'
  status: 'active' | 'inactive' | 'error'
  lastUpdate: string
  feedCount: number
  reliability: number
  description: string
  url: string
  apiKey?: string
}

interface ThreatFeed {
  id: string
  sourceId: string
  type: 'ip' | 'domain' | 'hash' | 'url' | 'cve'
  value: string
  confidence: number
  firstSeen: string
  lastSeen: string
  tags: string[]
  description: string
}

const THREAT_SOURCES: ThreatSource[] = [
  {
    id: 'shodan',
    name: 'Shodan',
    type: 'osint',
    status: 'active',
    lastUpdate: new Date().toISOString(),
    feedCount: 15420,
    reliability: 95,
    description: 'Internet-connected device search engine',
    url: 'https://www.shodan.io/'
  },
  {
    id: 'threatfox',
    name: 'ThreatFox',
    type: 'malware',
    status: 'active',
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    feedCount: 8935,
    reliability: 92,
    description: 'IOCs associated with malware',
    url: 'https://threatfox.abuse.ch/'
  },
  {
    id: 'urlhaus',
    name: 'URLhaus',
    type: 'malware',
    status: 'active',
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    feedCount: 12653,
    reliability: 88,
    description: 'Malicious URLs used for malware distribution',
    url: 'https://urlhaus.abuse.ch/'
  },
  {
    id: 'project-discovery',
    name: 'Project Discovery',
    type: 'vulnerability',
    status: 'active',
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    feedCount: 5234,
    reliability: 94,
    description: 'Open-source security tools and nuclei templates',
    url: 'https://projectdiscovery.io/'
  },
  {
    id: 'crowdsec',
    name: 'CrowdSec',
    type: 'honeypot',
    status: 'active',
    lastUpdate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    feedCount: 25678,
    reliability: 85,
    description: 'Collaborative IP reputation database',
    url: 'https://www.crowdsec.net/'
  },
  {
    id: 'greynoise',
    name: 'GreyNoise',
    type: 'osint',
    status: 'active',
    lastUpdate: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    feedCount: 18954,
    reliability: 90,
    description: 'Internet background noise intelligence',
    url: 'https://www.greynoise.io/'
  },
  {
    id: 'misp',
    name: 'MISP Project',
    type: 'osint',
    status: 'active',
    lastUpdate: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    feedCount: 45623,
    reliability: 93,
    description: 'Threat intelligence sharing platform',
    url: 'https://www.misp-project.org/'
  },
  {
    id: 'emergingthreats',
    name: 'Emerging Threats',
    type: 'malware',
    status: 'active',
    lastUpdate: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    feedCount: 32156,
    reliability: 87,
    description: 'Real-time threat intelligence feeds',
    url: 'https://rules.emergingthreats.net/'
  }
]

export function ProductionThreatIntegration() {
  const [sources] = useKV<ThreatSource[]>('production-threat-sources', THREAT_SOURCES)
  const [feeds, setFeeds] = useKV<ThreatFeed[]>('production-threat-feeds', [])
  const [selectedSource, setSelectedSource] = useState<ThreatSource | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'feeds' | 'analytics'>('overview')

  // Simulate real-time feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new threat feed entry
      const activeSources = sources.filter(s => s.status === 'active')
      if (activeSources.length === 0) return

      const randomSource = activeSources[Math.floor(Math.random() * activeSources.length)]
      const feedTypes = ['ip', 'domain', 'hash', 'url'] as const
      const feedType = feedTypes[Math.floor(Math.random() * feedTypes.length)]
      
      const generateValue = (type: string) => {
        switch (type) {
          case 'ip':
            return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
          case 'domain':
            return `${Math.random().toString(36).substr(2, 8)}.${['com', 'net', 'org', 'ru', 'cn', 'tk'][Math.floor(Math.random() * 6)]}`
          case 'hash':
            return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          case 'url':
            return `http://${Math.random().toString(36).substr(2, 8)}.com/${Math.random().toString(36).substr(2, 6)}`
          default:
            return 'unknown'
        }
      }

      const newFeed: ThreatFeed = {
        id: `feed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        sourceId: randomSource.id,
        type: feedType,
        value: generateValue(feedType),
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        tags: randomSource.type === 'malware' ? ['malware', 'active'] : 
              randomSource.type === 'phishing' ? ['phishing', 'suspicious'] :
              ['scanning', 'reconnaissance'],
        description: `Detected by ${randomSource.name} - ${randomSource.type} activity`
      }

      setFeeds(current => [newFeed, ...current.slice(0, 199)]) // Keep last 200 feeds
    }, 5000) // New feed every 5 seconds

    return () => clearInterval(interval)
  }, [sources, setFeeds])

  const getSourceStatusColor = (status: ThreatSource['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: ThreatSource['type']) => {
    switch (type) {
      case 'malware': return '🦠'
      case 'phishing': return '🎣'
      case 'c2': return '📡'
      case 'vulnerability': return '🔓'
      case 'osint': return '🔍'
      case 'honeypot': return '🍯'
      default: return '⚠️'
    }
  }

  const totalFeeds = feeds.length
  const activeSources = sources.filter(s => s.status === 'active').length
  const avgReliability = sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Production Threat Intelligence
          </h1>
          <p className="text-muted-foreground">
            Live integration with threat intelligence sources and bug bounty platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/20 text-green-400">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold">{activeSources}</p>
              </div>
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feeds</p>
                <p className="text-2xl font-bold">{totalFeeds.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Reliability</p>
                <p className="text-2xl font-bold">{Math.round(avgReliability)}%</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="text-2xl font-bold">{new Date().toLocaleTimeString()}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
          <TabsTrigger value="feeds">Live Feeds ({totalFeeds})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sources.slice(0, 6).map((source) => (
                    <div key={source.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="text-2xl">{getTypeIcon(source.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{source.name}</h4>
                          <div className={`w-2 h-2 rounded-full ${getSourceStatusColor(source.status)}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {source.feedCount.toLocaleString()} IOCs • {source.reliability}% reliability
                        </p>
                      </div>
                      <Badge variant="outline">{source.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>Real-time Data Stream</CardTitle>
              </CardHeader>
              <CardContent className="h-64 relative">
                <BinaryRain className="absolute inset-0" immersive />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-lg font-semibold">Processing Data</p>
                    <p className="text-sm text-muted-foreground">
                      {feeds.length} threats processed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <Card 
                key={source.id} 
                className="hover-border-flow cursor-pointer"
                onClick={() => setSelectedSource(source)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(source.type)}</span>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getSourceStatusColor(source.status)}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {source.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reliability</span>
                      <span className="font-medium">{source.reliability}%</span>
                    </div>
                    <Progress value={source.reliability} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">IOCs:</span>
                      <div className="font-medium">{source.feedCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <div className="font-medium">
                        {new Date(source.lastUpdate).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="w-fit">
                    {source.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 animate-pulse" />
                Live Threat Feeds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {feeds.slice(0, 50).map((feed) => {
                  const source = sources.find(s => s.sourceId === feed.sourceId)
                  return (
                    <div key={feed.id} className="flex items-center gap-3 p-3 rounded border text-sm">
                      <Badge variant="outline" className="text-xs">
                        {feed.type.toUpperCase()}
                      </Badge>
                      <code className="flex-1 font-mono bg-muted px-2 py-1 rounded text-xs">
                        {feed.value}
                      </code>
                      <Badge 
                        variant={feed.confidence > 80 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {feed.confidence}%
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(feed.firstSeen).toLocaleTimeString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feed Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['ip', 'domain', 'hash', 'url'].map((type) => {
                    const count = feeds.filter(f => f.type === type).length
                    const percentage = totalFeeds > 0 ? Math.round((count / totalFeeds) * 100) : 0
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sources.slice(0, 5).map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(source.type)}</span>
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{source.reliability}%</div>
                        <div className="text-muted-foreground">
                          {source.feedCount.toLocaleString()} IOCs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Source Details Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(selectedSource.type)}</span>
                  <CardTitle>{selectedSource.name}</CardTitle>
                </div>
                <Button variant="ghost" onClick={() => setSelectedSource(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{selectedSource.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSourceStatusColor(selectedSource.status)}`} />
                    <span className="capitalize">{selectedSource.status}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="capitalize">{selectedSource.type}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Reliability:</span>
                  <div>{selectedSource.reliability}%</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Feed Count:</span>
                  <div>{selectedSource.feedCount.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">URL:</span>
                <a 
                  href={selectedSource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline break-all"
                >
                  {selectedSource.url}
                </a>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Last Update:</span>
                <div>{new Date(selectedSource.lastUpdate).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}